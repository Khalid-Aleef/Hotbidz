const express = require("express");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");  

dotenv.config();
const router = express.Router();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: "You are a helpful assistant for Hot Wheels car auctions." },
        { role: "user", content: message }
      ],
    });

   
    res.json({ reply: response.choices[0]?.message?.content || "No response from AI." });
  } catch (error) {
    console.error("Error during OpenAI request:", error);  
    res.status(500).json({ error: "Something went wrong with the chatbot" });
  }
});

module.exports = router;
