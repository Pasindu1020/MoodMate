import React, { useState, useEffect, useRef } from "react"
import Spline from "@splinetool/react-spline"
import { db } from "../firebase"
import { useAuth } from "../AuthContext"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useTheme } from "../theme/useTheme";


const GREETINGS = ["hi", "hello", "hey", "greetings"]

function isGreeting(text) {
  return GREETINGS.some(g => text.toLowerCase().trim().startsWith(g))
}

async function getAIResponse(prompt) {
  const res = await fetch("http://localhost:5000/api/chatbot/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt })
  })
  const text = await res.text()
  try {
    const data = JSON.parse(text)
    return data.reply || "I’m here with you."
  } catch {
    return "I’m here with you."
  }
}

export default function AIChat() {
  const { user, userData, loading } = useAuth()
  const name = userData?.displayName || "User"
  const theme = useTheme();

  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I’m MoodMate. Ask me anything,I'm here for your support" }
  ])
  const [input, setInput] = useState("")
  const [waiting, setWaiting] = useState(false)

  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, waiting])

  useEffect(() => {
  if (!waiting) {
    inputRef.current?.focus()
  }
}, [waiting])


  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || waiting) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { from: "user", text: userMsg }])
    setInput("")
    setWaiting(true)
    inputRef.current?.focus()

    let botMsg
    if (isGreeting(userMsg)) {
      botMsg = `Hi ${name}, how may I help you today?`
    } else {
      botMsg = await getAIResponse(userMsg)
    }

    setMessages(prev => [...prev, { from: "bot", text: botMsg }])

    if (user) {
      await addDoc(collection(db, "chats", user.uid, "messages"), {
        user: userMsg,
        bot: botMsg,
        timestamp: serverTimestamp()
      })
    }

    setWaiting(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-neon-teal">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <h1 className="text-neon-teal text-3xl font-bold">
          Please log in to use the chatbot
        </h1>
      </div>
    )
  }

return (
  <div
    className="min-h-screen flex items-center justify-center px-6"
    style={{
      backgroundColor: theme.bg,
      color: theme.text,
      transition: "background-color 1.5s ease, color 1.5s ease"
    }}
  >
    <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

      <div className="hidden lg:flex justify-start relative h-[75vh] -ml-48">
        <Spline
          scene="https://prod.spline.design/aaSRjd9IbEczPQ37/scene.splinecode"
          className="w-full h-full"
        />
        <div
          className="absolute bottom-2 right-2 w-36 h-12"
          style={{ backgroundColor: theme.bg }}
        ></div>
      </div>

      <div className="flex justify-center">
        <div
          className="w-full max-w-4xl rounded-2xl shadow-2xl p-6 border-2 border-neon-teal flex flex-col h-[78vh]"
          style={{
            backgroundColor: theme.surface,
            transition: "background-color 1.5s ease"
          }}
        >
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-bold text-neon-teal mb-1">
              MoodMate Chatbot
            </h2>
            <p className="text-neon-coral">
              Friendly AI for Your Assistance
            </p>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-3 py-4 rounded-lg mb-4 shadow-inner"
            style={{
              backgroundColor: theme.bg,
              color: theme.text
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className="px-4 py-2 rounded-2xl max-w-md break-words shadow"
                  style={{
                    backgroundColor: msg.from === "user" ? "#29fff7" : "#ff6b6b",
                    color: msg.from === "user" ? "#020617" : theme.text
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {waiting && (
              <div style={{ color: theme.text }} className="italic">
                Typing…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-3">
            <input
              ref={inputRef}
              className="flex-1 rounded-xl px-4 py-3 border-2 border-neon-teal focus:outline-none"
              style={{
                backgroundColor: theme.bg,
                color: theme.text
              }}
              placeholder="Type your message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={waiting}
              autoFocus
            />
            <button
              type="submit"
              disabled={waiting}
              className="px-6 py-3 rounded-xl bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>

    </div>
  </div>
);


}
