import React, { useState, useRef, useEffect } from "react"
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline"

export default function Chatbot({ fixedHeight }) {
  const initialMessage = {
    from: "bot",
    text: "Hi! I’m MoodMate. Ask me anything about your mood or money!"
  }

  const [open, setOpen] = useState(fixedHeight ? true : false)
  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setMessages([initialMessage])
  }, [])

  useEffect(() => {
  if (!loading) {
    inputRef.current?.focus()
  }
}, [loading])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, loading])

  const getAIResponse = async (question) => {
    const res = await fetch("http://localhost:5000/api/chatbot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question })
    })

    const text = await res.text()

    try {
      const data = JSON.parse(text)
      if (data && data.reply) return data.reply
      return "I’m here with you. Could you explain a little more?"
    } catch {
      return text
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input
    setMessages(prev => [...prev, { from: "user", text: userText }])
    setInput("")
    setLoading(true)

    try {
      const botReply = await getAIResponse(userText)
      setMessages(prev => [...prev, { from: "bot", text: botReply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "The AI is temporarily unavailable. Please try again." }
      ])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  if (fixedHeight) {
    return (
      <div className="flex flex-col h-full">
        <div ref={chatRef} className="flex-1 p-4 overflow-y-auto text-sm space-y-2 bg-dark-bg">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.from === "user" ? "text-right" : "text-left"}>
              <span className={msg.from === "user"
                ? "bg-neon-teal text-dark-bg rounded-lg px-3 py-1 inline-block"
                : "bg-neon-coral text-white rounded-lg px-3 py-1 inline-block"}>
                {msg.text}
              </span>
            </div>
          ))}
          {loading && <div className="text-gray-400 italic">Typing…</div>}
        </div>
        <form className="flex p-2 border-t border-neon-teal bg-dark-bg" onSubmit={handleSend}>
          <input
            ref={inputRef}
            className="flex-1 px-2 py-1 bg-transparent outline-none text-white"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus={fixedHeight}
          />
          <button
            className="ml-2 px-3 py-1 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition"
            type="submit"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 right-8 z-50 bg-neon-teal p-4 rounded-full shadow-xl border-2 border-neon-purple hover:scale-110 transition"
        aria-label="Open Chatbot"
        style={{ boxShadow: "0 0 16px #4ECDC4, 0 0 8px #9D50BB" }}
      >
        <ChatBubbleLeftEllipsisIcon className="h-7 w-7 text-white" />
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-8 z-50 w-80 max-h-[500px] flex flex-col rounded-2xl shadow-2xl bg-gradient-to-tr from-dark-bg via-panel-bg to-dark-bg border-2 border-neon-teal"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <div className="p-4 border-b border-neon-teal text-neon-coral font-bold text-lg">
            MoodMate Chatbot
          </div>
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto text-sm space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.from === "user" ? "text-right" : "text-left"}>
                <span className={msg.from === "user"
                  ? "bg-neon-teal text-dark-bg rounded-lg px-3 py-1 inline-block"
                  : "bg-neon-coral text-white rounded-lg px-3 py-1 inline-block"}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400 italic">Typing…</div>}
          </div>
          <form className="flex p-2 border-t border-neon-teal" onSubmit={handleSend}>
            <input
              ref={inputRef}
              className="flex-1 px-2 py-1 bg-transparent outline-none text-white"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              className="ml-2 px-3 py-1 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition"
              type="submit"
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
