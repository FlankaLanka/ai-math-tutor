import { useRef, useState } from 'react'
import { CameraIcon, WhiteboardIcon, CheckIcon } from './Icons'

function MessageInput({ input, setInput, onSendMessage, isLoading, onImageAttach, attachedImage: externalAttachedImage = null, whiteboardCaptureEnabled, onWhiteboardCaptureToggle }) {
  const fileInputRef = useRef(null)
  const [attachedImage, setAttachedImage] = useState(null)
  
  // Use external attachedImage if provided, otherwise use internal state
  const displayImage = externalAttachedImage !== null ? externalAttachedImage : attachedImage

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please use an image smaller than 10MB.')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Image = e.target.result
      setAttachedImage(base64Image)
      onImageAttach?.(base64Image)
    }
    reader.onerror = () => {
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setAttachedImage(null)
    onImageAttach?.(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Clear local image state when sending
    if (attachedImage) {
      setAttachedImage(null)
    }
    onSendMessage(e)
  }

  return (
    <div className="space-y-2">
      {displayImage && (
        <div className="relative inline-block">
          <div className="sketch-box bg-blue-50 p-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                <CameraIcon className="w-4 h-4" />
                Image attached
              </span>
              <span className="text-xs text-gray-600">(Tutor will see this)</span>
            </div>
            <div className="relative">
              <img 
                src={displayImage} 
                alt="Attached" 
                className="max-w-xs max-h-32 object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-4 py-4 bg-gray-200 hover:bg-gray-300 font-semibold sketch-border-sm sketch-shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Attach image"
        >
          <CameraIcon className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or question..."
          className="flex-1 p-4 focus:outline-none focus:border-blue-500 sketch-box text-base"
          disabled={isLoading}
        />
        {/* Whiteboard capture toggle */}
        {onWhiteboardCaptureToggle && (
          <button
            type="button"
            onClick={onWhiteboardCaptureToggle}
            disabled={isLoading}
            className={`px-4 py-4 font-semibold sketch-border-sm sketch-shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              whiteboardCaptureEnabled
                ? 'bg-green-200 hover:bg-green-300 text-green-800'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={whiteboardCaptureEnabled ? "Whiteboard capture enabled - click to disable" : "Whiteboard capture disabled - click to enable"}
          >
            <WhiteboardIcon className="w-5 h-5" />
            {whiteboardCaptureEnabled && (
              <CheckIcon className="w-3 h-3 ml-1" />
            )}
          </button>
        )}
        <button
          type="submit"
          disabled={(!input.trim() && !displayImage) || isLoading}
          className="px-6 py-4 bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed sketch-border-sm sketch-shadow-sm transition-colors"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default MessageInput

