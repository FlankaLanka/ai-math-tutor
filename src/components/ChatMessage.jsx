import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import Avatar from './Avatar'
import { TutorIcon, UserIcon, CameraIcon } from './Icons'

function ChatMessage({ role, content, animation, audioLevel = 0, isMostRecent = false }) {
  const isTutor = role === 'assistant'
  
  // Handle mixed content (text + image)
  const hasImage = typeof content === 'object' && content?.image
  const displayText = hasImage ? content.text || '' : content
  const imageUrl = hasImage ? content.image : null
  
  // Parse LaTeX math expressions in text
  // Supports: $$...$$ (block), $...$ (inline), \[...\] (block), \(...\) (inline)
  const parseMath = (text) => {
    const parts = []
    let lastIndex = 0
    let i = 0
    
    // Process text character by character to find math expressions
    while (i < text.length) {
      // Check for block math: $$...$$
      if (text.slice(i, i + 2) === '$$') {
        const endIndex = text.indexOf('$$', i + 2)
        if (endIndex !== -1) {
          // Add text before math
          if (i > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, i) })
          }
          // Add block math
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
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }
    
    // If no math found, return whole text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text })
    }
    
    return parts
  }

  const parts = parseMath(displayText)

  return (
    <div className={`flex ${isTutor ? 'justify-start' : 'justify-end'} mb-4 items-start gap-3`}>
      {/* Avatar for tutor messages - only show on most recent */}
      {isTutor && isMostRecent && (
        <Avatar animation={animation || 'idle'} audioLevel={audioLevel} size={60} />
      )}
      {/* Spacer for alignment when avatar not shown */}
      {isTutor && !isMostRecent && (
        <div className="w-[60px]" />
      )}
      <div
        className={`max-w-md p-5 sketch-box ${
          isTutor
            ? 'bg-blue-100'
            : 'bg-green-100'
        }`}
      >
        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
          {isTutor ? (
            <>
              <TutorIcon className="w-5 h-5" />
              <span>Tutor</span>
            </>
          ) : (
            <>
              <UserIcon className="w-5 h-5" />
              <span>You</span>
            </>
          )}
          {imageUrl && !isTutor && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <CameraIcon className="w-3 h-3" />
              Image attached
            </span>
          )}
        </div>
        {imageUrl && (
          <div className="mb-3">
            <img 
              src={imageUrl} 
              alt="User uploaded" 
              className="max-w-full max-h-64 object-contain sketch-box"
            />
            {!isTutor && (
              <p className="text-xs text-gray-600 mt-1 italic">
                The tutor can see this image
              </p>
            )}
          </div>
        )}
        <div className="text-gray-800 text-base leading-relaxed break-words">
          {parts.map((part, index) => {
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
    </div>
  )
}

export default ChatMessage

