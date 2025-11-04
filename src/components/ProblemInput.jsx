import { useState } from 'react'
import ImageUpload from './ImageUpload'
import OCRConfirmation from './OCRConfirmation'

function ProblemInput({ onProblemSubmit }) {
  const [problem, setProblem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrImage, setOcrImage] = useState(null) // Store original image from OCR
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!problem.trim()) return

    setIsSubmitting(true)
    // Simulate a brief delay for better UX
    setTimeout(() => {
      onProblemSubmit(problem.trim(), null) // No image from text input
      setIsSubmitting(false)
    }, 300)
  }

  const handleImageExtracted = (extractedText, imageData) => {
    setOcrResult(extractedText)
    setOcrImage(imageData) // Store the original image
    setProblem(extractedText)
    setShowImageUpload(false)
    setIsSubmitting(false)
  }

  const handleOCRConfirm = (confirmedText) => {
    // Include the original OCR image so it can be displayed and sent to AI
    onProblemSubmit(confirmedText.trim(), ocrImage)
    setOcrResult(null)
    setOcrImage(null)
  }

  const handleOCREdit = (editedText) => {
    setProblem(editedText)
    setOcrResult(null)
  }

  const handleOCRCancel = () => {
    setOcrResult(null)
    setProblem('')
    setShowImageUpload(false)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setIsSubmitting(false)
    setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sketch-box bg-white p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          What problem would you like help with?
        </h2>

        {/* OCR Confirmation */}
        {ocrResult && (
          <div className="mb-4">
            <OCRConfirmation
              extractedText={ocrResult}
              imageUrl={ocrImage}
              onConfirm={handleOCRConfirm}
              onEdit={handleOCREdit}
              onCancel={handleOCRCancel}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-red-300 sketch-box text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Image Upload Option */}
        {!ocrResult && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {!showImageUpload ? (
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Upload Problem Image
              </button>
            ) : (
              <div className="space-y-3">
                <ImageUpload
                  onImageExtracted={handleImageExtracted}
                  onError={handleError}
                  storeImage={true}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowImageUpload(false)
                    setError(null)
                  }}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        {!ocrResult && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Enter a math problem (e.g., 'Solve for x: 2x + 5 = 13')"
              className="w-full p-4 focus:outline-none focus:border-blue-500 resize-none sketch-border-sm text-base"
              rows="4"
              disabled={isSubmitting}
            />
            
            <button
              type="submit"
              disabled={!problem.trim() || isSubmitting}
              className="w-full py-2.5 px-6 bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed sketch-border-sm sketch-shadow-sm transition-colors"
            >
              {isSubmitting ? 'Starting...' : 'Start Learning'}
            </button>
          </form>
        )}

        {/* Example Problems */}
        {!ocrResult && (
          <div className="mt-5 text-sm text-gray-700">
            <p className="font-semibold mb-2">Example problems:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Solve for x: 2x + 5 = 13</li>
              <li>37 + 48</li>
              <li>A rectangle has length 8 cm and width 3 cm. What is its area?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemInput

