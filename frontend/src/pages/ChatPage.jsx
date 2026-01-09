import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css'; 

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your TradeX AI Analyst. I have access to your portfolio. Ask me about risks, opportunities, or general market advice." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // Call your new Backend Route
        const { data } = await axios.post(
            'http://localhost:3000/api/ai/chat', 
            { message: userMessage }, 
            config
        );

        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
        setMessages(prev => [...prev, { sender: 'ai', text: "⚠️ Error: I couldn't reach the server. Please try again." }]);
    } finally {
        setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>🤖 AI Analyst <span style={{fontSize:'0.8rem', color:'#00E676', border:'1px solid #00E676', padding:'2px 8px', borderRadius:'10px'}}>GEMINI 2.0</span></h1>
        <p style={{color:'#888', margin:0}}>Powered by Google's latest model. Context-aware.</p>
      </header>

      <div className="messages-box">
        {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                {msg.text}
            </div>
        ))}
        {loading && <div className="message msg-ai" style={{fontStyle:'italic'}}>Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask about your portfolio..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
        />
        <button className="send-btn" onClick={handleSend} disabled={loading}>
            {loading ? "..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;