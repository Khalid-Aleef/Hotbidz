const express = require("express");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");  // Use destructuring to directly import OpenAI

dotenv.config();
const router = express.Router();

// Initialize OpenAI instance with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the /chat POST route to handle messages
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Request OpenAI chat completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Ensure using the correct, available model
      messages: [
        { role: "system", content: "You are a helpful assistant for Hot Wheels car auctions." },
        { role: "user", content: message }
      ],
    });

    // Send the AI's reply as JSON response
    res.json({ reply: response.choices[0]?.message?.content || "No response from AI." });
  } catch (error) {
    console.error("Error during OpenAI request:", error);  // Log more detailed error for debugging
    res.status(500).json({ error: "Something went wrong with the chatbot" });
  }
});

module.exports = router;
