const express = require("express")
const cors = require("cors")
const chatbotRoutes = require("./routes/chatbot")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/chatbot", chatbotRoutes)

app.listen(5000, () => {
  console.log("Server running on port 5000")
})
