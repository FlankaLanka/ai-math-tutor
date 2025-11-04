import { useState, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api.js';

function ImageUpload({ onImageExtracted, onError, storeImage = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);

  const handleFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('Image file is too large. Please use an image smaller than 10MB.');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;

        try {
          // Send to backend for OCR
          const response = await fetch(API_ENDPOINTS.vision, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image
            })
          });

          const data = await response.json();

          if (response.ok) {
            // If storeImage is true, pass both extracted text and original image
            if (storeImage) {
              setCurrentImage(base64Image);
              onImageExtracted?.(data.extractedText, base64Image);
            } else {
              onImageExtracted?.(data.extractedText);
            }
          } else {
            onError?.(data.error || 'Failed to extract text from image');
          }
        } catch (error) {
          onError?.('Failed to connect to server. Please check your connection.');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        onError?.('Failed to read image file');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      onError?.('An error occurred while processing the image');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors sketch-box
          ${isDragging 
            ? 'bg-blue-100 border-blue-400' 
            : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-gray-600 font-medium">Processing image...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-16 h-16 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag & drop an image here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supports PNG, JPG, and other image formats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;

