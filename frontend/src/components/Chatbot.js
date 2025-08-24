import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input) return;

    // Add user message
    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);

    try {
      const res = await axios.post("http://localhost:5000/api/chatbot/chat", {
        message: input,
      });

      const botReply = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
    }

    setInput("");
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Handle "Enter" key press to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Scroll to the bottom of the messages container when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Only run this effect when messages change

  return (
    <div>
      {/* Button to toggle chatbot visibility */}
      <button
        className={`chatbot-toggle-btn ${isOpen ? "close" : "open"}`}
        onClick={toggleChatbot}
      >
        {isOpen ? (
          <img
            src="/cross.png" // Replace with your close icon path
            alt="Close Chatbot"
            className="chatbot-toggle-img"
          />
        ) : (
          <img
            src="/chatbot.png" // Replace with your open icon path
            alt="Open Chatbot"
            className="chatbot-toggle-img"
          />
        )}
      </button>

      {/* Chatbot container */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.sender === "user" ? "chat-user" : "chat-bot"}
              >
                {msg.sender === "user" ? (
                  `You: ${msg.text}`
                ) : (
                  <>
                    <strong>HotBidz Ai</strong>: {msg.text}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} // Listen for the "Enter" key press
              placeholder="Ask about Hot Wheels..."
              className="chatbot-input"
            />
            <button onClick={sendMessage} className="chatbot-btn">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
