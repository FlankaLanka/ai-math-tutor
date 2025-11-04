import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function OCRConfirmation({ extractedText, onConfirm, onEdit, onCancel, imageUrl }) {
  const [editedText, setEditedText] = useState(extractedText);

  // Parse LaTeX math expressions in text (same as ChatMessage)
  const parseMath = (text) => {
    const parts = []
    let lastIndex = 0
    let i = 0
    
    while (i < text.length) {
      // Check for block math: $$...$$
      if (text.slice(i, i + 2) === '$$') {
        const endIndex = text.indexOf('$$', i + 2)
        if (endIndex !== -1) {
          if (i > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, i) })
          }
          const mathContent = text.slice(i + 2, endIndex).trim()
          parts.push({ type: 'math', content: mathContent, isBlock: true })
          i = endIndex + 2
          lastIndex = i
          continue
        }
      }
      
      // Check for block math LaTeX style: \[...\]
      if (text.slice(i, i + 2) === '\\[') {
        const endIndex = text.indexOf('\\]', i + 2)
        if (endIndex !== -1) {
          if (i > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, i) })
          }
          const mathContent = text.slice(i + 2, endIndex).trim()
          parts.push({ type: 'math', content: mathContent, isBlock: true })
          i = endIndex + 2
          lastIndex = i
          continue
        }
      }
      
      // Check for inline math: $...$ (but not $$...$$)
      if (text[i] === '$' && text.slice(i, i + 2) !== '$$') {
        const endIndex = text.indexOf('$', i + 1)
        if (endIndex !== -1 && (endIndex === text.length - 1 || text[endIndex + 1] !== '$')) {
          if (i > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, i) })
          }
          const mathContent = text.slice(i + 1, endIndex).trim()
          parts.push({ type: 'math', content: mathContent, isBlock: false })
          i = endIndex + 1
          lastIndex = i
          continue
        }
      }
      
      // Check for inline math LaTeX style: \(...\)
      if (text.slice(i, i + 2) === '\\(') {
        const endIndex = text.indexOf('\\)', i + 2)
        if (endIndex !== -1) {
          if (i > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, i) })
          }
          const mathContent = text.slice(i + 2, endIndex).trim()
          parts.push({ type: 'math', content: mathContent, isBlock: false })
          i = endIndex + 2
          lastIndex = i
          continue
        }
      }
      
      i++
    }
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }
    
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text })
    }
    
    return parts
  }

  const renderedParts = parseMath(editedText);

  return (
    <div className="sketch-box bg-white p-6 space-y-4">
      {/* Problem Image */}
      {imageUrl && (
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3">Problem Image:</h3>
          <div className="sketch-box bg-gray-50 p-3 flex justify-center">
            <img 
              src={imageUrl} 
              alt="Problem reference" 
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-3">Extracted Problem:</h3>
        
        {/* LaTeX Rendered Preview */}
        <div className="mb-3 p-4 bg-gray-50 sketch-box min-h-[60px]">
          <div className="text-base leading-relaxed">
            {renderedParts.map((part, index) => {
              if (part.type === 'math') {
                return part.isBlock ? (
                  <BlockMath key={index} math={part.content} />
                ) : (
                  <InlineMath key={index} math={part.content} />
                )
              }
              return <span key={index}>{part.content}</span>
            })}
          </div>
        </div>

        {/* Editable Textarea */}
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-4 sketch-box resize-none text-base"
          rows="4"
          placeholder="Edit the extracted problem if needed..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onEdit?.(editedText)}
          className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
        >
          Edit & Continue
        </button>
        <button
          onClick={() => onConfirm?.(editedText)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold sketch-border-sm sketch-shadow-sm transition-colors"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}

export default OCRConfirmation;

