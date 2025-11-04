import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import ProblemInput from './components/ProblemInput'

function App() {
  const [currentProblem, setCurrentProblem] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [problemImage, setProblemImage] = useState(null)

  const handleProblemSubmit = (problem, image = null) => {
    setCurrentProblem(problem)
    setConversationHistory([])
    setProblemImage(image)
  }

  const handleNewProblem = () => {
    setCurrentProblem(null)
    setConversationHistory([])
    setProblemImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-2 inline-block">
            <span className="sketch-border bg-white px-6 py-3 inline-block sketch-shadow-sm">
              🧮 AI Math Tutor
            </span>
          </h1>
          <p className="text-xl text-gray-700 mt-3 font-medium">
            Your Socratic learning assistant
          </p>
        </header>

        {!currentProblem ? (
          <ProblemInput onProblemSubmit={handleProblemSubmit} />
        ) : (
          <ChatInterface
            problem={currentProblem}
            problemImage={problemImage}
            conversationHistory={conversationHistory}
            setConversationHistory={setConversationHistory}
            onNewProblem={handleNewProblem}
          />
        )}
      </div>
    </div>
  )
}

export default App

