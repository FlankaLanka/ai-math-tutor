import { useState, useRef, useEffect } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import VoiceInterface from './VoiceInterface'
import Avatar from './Avatar'
import Whiteboard from './Whiteboard'
import { API_ENDPOINTS } from '../config/api.js'
import { CameraIcon } from './Icons'

function ChatInterface({ problem, problemImage, conversationHistory, setConversationHistory, onNewProblem }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedImage, setAttachedImage] = useState(null)
  const [referenceImage, setReferenceImage] = useState(problemImage) // Use problemImage if provided
  const [latestTutorMessage, setLatestTutorMessage] = useState('')
  const [avatarAnimation, setAvatarAnimation] = useState('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0) // Audio level for animation
  const [whiteboardCaptureEnabled, setWhiteboardCaptureEnabled] = useState(true) // Default to enabled
  const [stuckInfo, setStuckInfo] = useState({ isStuck: false, stuckCount: 0, reason: 'Student is progressing normally' })
  const [previousStuckState, setPreviousStuckState] = useState(false)

  const [showYay, setShowYay] = useState(false)

  // Sync avatar animation - show yay briefly, then speaking/idle
  useEffect(() => {
    if (showYay) {
      setAvatarAnimation('yay')
      // After 1.5 seconds, return to normal state
      const timer = setTimeout(() => {
        setShowYay(false)
        if (isSpeaking) {
          setAvatarAnimation('speaking')
        } else {
          setAvatarAnimation('idle')
        }
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isSpeaking) {
      setAvatarAnimation('speaking')
    } else {
      setAvatarAnimation('idle')
    }
  }, [isSpeaking, showYay])

  // Parse LaTeX math expressions in text (same as ChatMessage)
  const parseMath = (text) => {
    if (!text) return [{ type: 'text', content: '' }]
    
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
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const whiteboardRef = useRef(null)

  // Auto-scroll the messages container (not the whole page) when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      // Scroll only the messages container, not the entire page
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [conversationHistory])

  // Send initial tutor greeting
  useEffect(() => {
    if (conversationHistory.length === 0 && problem) {
      sendInitialMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  // Update reference image when problemImage prop changes
  useEffect(() => {
    if (problemImage) {
      setReferenceImage(problemImage)
    }
  }, [problemImage])
  
  // Clear reference image when problem changes (but keep if problemImage prop is set)
  useEffect(() => {
    if (!problemImage) {
      setReferenceImage(null)
    }
  }, [problem, problemImage])

  const sendInitialMessage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `I need help with this problem: ${problem}. Can you guide me through it?`,
          image: referenceImage || null, // Include reference image if available
          conversationHistory: [],
          problem: problem
        })
      })

      const data = await response.json()
      if (response.ok) {
        setConversationHistory(data.conversationHistory)
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageAttach = (image) => {
    setAttachedImage(image)
    // If this is the first image in the conversation, save it as reference
    if (image && !referenceImage) {
      setReferenceImage(image)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !attachedImage) || isLoading) return

    const userMessage = input.trim()
    const imageToSend = attachedImage
    setInput('')
    setAttachedImage(null)
    setIsLoading(true)
    setLatestTutorMessage('') // Clear previous message to prevent speaking old content
    setAvatarAnimation('idle') // Static while waiting for response

    // Capture whiteboard snapshot if available and enabled
      let whiteboardSnapshot = null
      if (whiteboardCaptureEnabled && whiteboardRef.current) {
        const snapshot = await whiteboardRef.current.getSnapshot()
        if (snapshot) {
          whiteboardSnapshot = snapshot
        }
      }

    // Save image as reference if this is the first image in conversation
    if (imageToSend && !referenceImage) {
      setReferenceImage(imageToSend)
    }

    // Add user message to history immediately for better UX
    // Include image in history if present
    const userContent = attachedImage 
      ? { type: 'mixed', text: userMessage, image: attachedImage }
      : userMessage
    const userHistoryEntry = { role: 'user', content: userContent }
    const tempHistory = [...conversationHistory, userHistoryEntry]
    setConversationHistory(tempHistory)

    try {
      // Only send image if user explicitly attached a new one
      // Reference image will be handled by backend from conversation history
      const imageToInclude = imageToSend || null; // Only send new images, not reference
      
      // Send whiteboard snapshot if available (prefer whiteboard over newly attached image for context)
      const imageForContext = whiteboardSnapshot || imageToInclude;
      
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          image: imageForContext, // Whiteboard snapshot or new image
          whiteboard: whiteboardSnapshot ? true : false, // Flag to indicate this is a whiteboard snapshot
          conversationHistory: conversationHistory,
          problem: problem
        })
      })

      const data = await response.json()
      if (response.ok) {
        setConversationHistory(data.conversationHistory)
        
        // Update stuck info from backend
        const newStuckInfo = data.stuckInfo || { isStuck: false, stuckCount: 0, reason: 'Student is progressing normally' }
        // Save previous state before updating (check if transitioning from stuck to unstuck)
        const wasStuck = stuckInfo.isStuck
        setPreviousStuckState(wasStuck)
        setStuckInfo(newStuckInfo)
        
        console.log('🔍 ChatInterface: Stuck info received:', newStuckInfo)
        
        // Update latest tutor message for TTS
        const tutorMessages = data.conversationHistory.filter(msg => msg.role === 'assistant')
        let tutorText = ''
        if (tutorMessages.length > 0) {
          const lastTutorMsg = tutorMessages[tutorMessages.length - 1]
          tutorText = typeof lastTutorMsg.content === 'string' 
            ? lastTutorMsg.content 
            : lastTutorMsg.content?.text || ''
          
          console.log('🔍 ChatInterface: Tutor message extracted:', {
            tutorText: tutorText.substring(0, 100),
            length: tutorText.length,
            hasContent: !!tutorText.trim()
          });
          
          setLatestTutorMessage(tutorText)
          
          // Check for encouraging words to trigger yay animation
          const encouragingWords = ['great', 'excellent', 'correct', 'right', 'perfect', 'yes', 'exactly', 'well done', 'good', 'nice', 'good job', 'that\'s right', 'you got it', 'precisely', 'absolutely', 'that\'s correct', 'perfect answer']
          const tutorResponse = tutorText.toLowerCase()
          if (encouragingWords.some(word => tutorResponse.includes(word))) {
            // Trigger yay animation
            setShowYay(true)
          }
          // Animation state will be managed by the useEffect based on isSpeaking and showYay
        }
      } else {
        console.error('Error:', data.error)
        // Remove the user message if request failed
        setConversationHistory(conversationHistory)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove the user message if request failed
      setConversationHistory(conversationHistory)
    } finally {
      setIsLoading(false)
      // Don't reset animation here - let it be controlled by speaking state
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px+500px)] w-full max-w-7xl mx-auto">
      {/* New Problem Button - Above problem display */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={onNewProblem}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold sketch-border-sm sketch-shadow-sm transition-colors text-gray-600"
        >
          New Problem
        </button>
      </div>

      {/* Problem Display with Reference Image - 50/50 split */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex gap-4 items-stretch">
          {/* Problem Text Box - 50% width */}
          <div className="flex-1 sketch-box bg-yellow-100 p-4 flex flex-col">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 mb-2">Current Problem:</p>
              <div className="text-base font-bold break-words leading-relaxed">
                {parseMath(problem).map((part, index) => {
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

          {/* Reference Image - 50% width */}
          {referenceImage && (
            <div className="flex-1 sketch-box bg-blue-50 p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                    <CameraIcon className="w-4 h-4" />
                    Problem Image
                  </span>
                </div>
                <button
                  onClick={() => setReferenceImage(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-1 py-0.5"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <img 
                  src={referenceImage} 
                  alt="Problem reference" 
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center italic">
                Tutor can see this
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages - Larger chat container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-8 bg-white sketch-box min-h-[600px]"
      >
        {conversationHistory.map((msg, index) => {
          const isMostRecent = index === conversationHistory.length - 1 && msg.role === 'assistant'
          return (
            <ChatMessage
              key={index}
              role={msg.role}
              content={msg.content}
              animation={isMostRecent ? avatarAnimation : 'idle'}
              audioLevel={isMostRecent ? audioLevel : 0}
              isMostRecent={isMostRecent}
            />
          )
        })}
        {isLoading && (
          <div className="flex justify-start items-start gap-3">
            <Avatar animation="idle" size={60} />
            <div className="sketch-box bg-blue-100 p-4 max-w-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Interface */}
      <div className="mb-2">
        <VoiceInterface
          tutorMessage={latestTutorMessage}
          onTranscript={(transcript) => {
            setInput(transcript)
            // Optionally auto-send, or let user review first
          }}
          onSpeakingChange={setIsSpeaking}
        />
      </div>

      {/* Input */}
      <MessageInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onImageAttach={handleImageAttach}
        attachedImage={attachedImage}
        whiteboardCaptureEnabled={whiteboardCaptureEnabled}
        onWhiteboardCaptureToggle={() => setWhiteboardCaptureEnabled(!whiteboardCaptureEnabled)}
      />

      {/* Whiteboard - Underneath chat */}
      <div className="mt-4">
        <Whiteboard
          ref={whiteboardRef}
          problemImage={referenceImage}
        />
      </div>
    </div>
  )
}

export default ChatInterface

