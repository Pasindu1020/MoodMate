// const express = require("express")
// const router = express.Router()
// const { spawn } = require("child_process")
// const fetch = require("node-fetch")
// const path = require("path")

// const sessions = new Map()

// function detectIntent(text) {
//   const t = text.toLowerCase()

//   if (
//     t.includes("sad") ||
//     t.includes("lonely") ||
//     t.includes("breakup") ||
//     t.includes("depressed") ||
//     t.includes("anxious") ||
//     t.includes("cry")
//   ) return "emotion"

//   if (
//     t.includes("money") ||
//     t.includes("save") ||
//     t.includes("invest") ||
//     t.includes("expense") ||
//     t.includes("budget")
//   ) return "finance"

//   if (
//     t === "yes" ||
//     t === "yeah" ||
//     t === "ok" ||
//     t === "okay" ||
//     t === "sure"
//   ) return "affirmation"

//   return "general"
// }

// // async function callOllama(prompt) {
// //   try {
// //     const res = await fetch("http://localhost:11434/api/generate", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         model: "phi:latest",
// //         prompt,
// //         stream: false
// //       })
// //     })

// //     const data = await res.json()
// //     return data.response?.trim() || "I’m here with you."
// //   } catch (err) {
// //     console.error("OLLAMA ERROR:", err)
// //     return "I’m here with you."
// //   }
// // }
// async function callOllama(prompt) {
//   try {
//     console.log("SENDING TO OLLAMA:", prompt)

//     const res = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "phi:latest",
//         prompt,
//         stream: false
//       })
//     })

//     const data = await res.json()

//     console.log("RAW OLLAMA RESPONSE:", data)

//     return data.response?.trim() || null

//   } catch (err) {
//     console.error("OLLAMA ERROR:", err)
//     return null
//   }
// }

// router.post("/chat", async (req, res) => {
//   console.log("USER MESSAGE:", message)
//   let message = req.body.message?.trim()
//   if (!message) return res.json({ reply: "Please type a message." })


//   router.post("/chat", async (req, res) => {
//   let message = req.body.message?.trim()

//   if (!message) {
//     return res.json({ reply: "Please type a message." })
//   }

//   console.log("USER MESSAGE:", message)

//   try {
//     const reply = await callOllama(message)

//     console.log("OLLAMA FINAL REPLY:", reply)

//     return res.json({ reply })

//   } catch (err) {
//     console.error("SERVER ERROR:", err)
//     return res.json({ reply: "I’m here with you." })
//   }
// })

//   const userId = req.ip
//   const session = sessions.get(userId) || {
//     lastIntent: null,
//     lastMessage: null
//   }

//   const intent = detectIntent(message)
//   if (message.includes("recommend some activities")) {
//   const reply = await callOllama(message)
//   return res.json({ reply })
// }

//   try {
//     if (intent === "affirmation" && session.lastMessage) {
//       const contextualPrompt = `
// Conversation context:
// User previously said: ${session.lastMessage}
// User now replied: ${message}

// Respond naturally and continue the conversation appropriately.
// `
//       const reply = await callOllama(contextualPrompt)
//       return res.json({ reply })
//     }

//     session.lastIntent = intent
//     session.lastMessage = message
//     sessions.set(userId, session)

//     const scriptPath = path.join(__dirname, "../rag/rag_service.py")

//     const py = spawn("py", [scriptPath, message], {
//       windowsHide: true
//     })

//     let responded = false
//     const safeReply = (text) => {
//       if (!responded) {
//         responded = true
//         res.json({ reply: text })
//       }
//     }

//     let pyData = ""

//     py.stdout.on("data", d => {
//       pyData += d.toString()
//     })

//     py.stderr.on("data", err => {
//       console.error("PYTHON ERROR:", err.toString())
//     })

//     py.on("close", async () => {
//       clearTimeout(timeoutId)
//       console.log("PYTHON RAW OUTPUT:", pyData)

//       try {
//         const parsed = JSON.parse(pyData)

//         if (parsed.status === "FOUND") {
//           return safeReply(parsed.reply)
//         }

//         const reply = await callOllama(message)
//         return safeReply(reply)

//       } catch (err) {
//         console.error("PARSE ERROR:", err)
//         const reply = await callOllama(message)
//         return safeReply(reply)
//       }
//     })

//     const PYTHON_TIMEOUT = 350000

//     const timeoutId = setTimeout(() => {
//       if (!responded) {
//         console.warn("Python timeout fallback triggered")
//         callOllama(message).then(r => safeReply(r))
//       }
//     }, PYTHON_TIMEOUT)


//   } catch (err) {
//     console.error("SERVER ERROR:", err)
//     return res.json({ reply: "I’m here with you." })
//   }
// })

// module.exports = router


const express = require("express")
const router = express.Router()
const fetch = require("node-fetch")

async function callOllama(prompt) {
  try {
    console.log("SENDING TO OLLAMA:", prompt)

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi:latest",
        prompt,
        stream: false
      })
    })

    const data = await res.json()

    console.log("RAW OLLAMA RESPONSE:", data)

    return data.response?.trim() || null

  } catch (err) {
    console.error("OLLAMA ERROR:", err)
    return null
  }
}


router.post("/", async (req, res) => {
  let message = req.body.message?.trim()

  if (!message) {
    return res.json({ reply: "Please type a message." })
  }

  try {
    const reply = await callOllama(message)

    // Always return at least a fallback string if AI response is empty
    return res.json({
      reply: reply && reply.length > 0 ? reply : "Here are some simple activities you can try."
    })

  } catch (err) {
    console.error("SERVER ERROR:", err)
    return res.json({ reply: "I’m here with you." })
  }
})

module.exports = router