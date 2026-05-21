import { useState, useRef, useEffect } from 'react'
import { Send, Mic, Volume2 } from 'lucide-react'
import useSpeechRecognition from 'react-speech-recognition'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Kidney Diet AI Assistant. How can I help you today? Ask me about kidney-friendly foods, meal plans, or dietary restrictions.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { transcript, listening, browserSupportsSpeechRecognition, startListening, stopListening, resetTranscript } = useSpeechRecognition()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    resetTranscript()
    setIsLoading(true)

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 500)
  }

  const generateBotResponse = (userInput: string): string => {
    const input_lower = userInput.toLowerCase()
    
    if (input_lower.includes('sodium') || input_lower.includes('salt')) {
      return 'For kidney health, it\'s important to limit sodium intake to less than 2,300mg per day. Avoid processed foods, canned goods, and add salt to minimize sodium consumption.'
    }
    if (input_lower.includes('potassium')) {
      return 'Potassium levels are important for kidney patients. High potassium foods like bananas, oranges, and tomatoes may need to be limited. Consult your doctor for your specific potassium target.'
    }
    if (input_lower.includes('protein')) {
      return 'Protein intake should be carefully monitored. Your nephrologist will recommend the right amount based on your kidney function. High-quality proteins in appropriate portions are typically advised.'
    }
    if (input_lower.includes('phosphorus')) {
      return 'Phosphorus control is crucial. Limit foods like dairy, nuts, seeds, and chocolate. Your doctor may recommend phosphate binders if needed.'
    }
    if (input_lower.includes('fluid') || input_lower.includes('water')) {
      return 'Fluid restriction varies based on kidney stage. Most patients need to limit fluid to 1-2 liters daily. Include fluids from foods like fruits and vegetables.'
    }
    
    return 'That\'s a great question about kidney health! For personalized dietary advice, please consult with your nephrologist or registered dietitian. They can provide recommendations based on your specific kidney function and medical history.'
  }

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.')
      return
    }

    if (isListening || listening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
    }
  }

  const speakMessage = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">🥗 Kidney Diet AI Assistant</h1>
        <p className="text-sm opacity-90">Get personalized kidney-friendly diet guidance</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm md:text-base">{message.text}</p>
              {message.sender === 'bot' && (
                <button
                  onClick={() => speakMessage(message.text)}
                  className="mt-2 inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                >
                  <Volume2 size={14} />
                  Speak
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        {isListening && (
          <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
            🎤 Listening... Speak now
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about kidney-friendly foods, meal plans..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleMicClick}
            className={`p-2 rounded-lg transition-colors ${
              isListening || listening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Voice input"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={20} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}