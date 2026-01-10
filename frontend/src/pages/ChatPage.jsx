import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Chat.css'; 

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your TradeX AI Analyst. Ask me about your portfolio risks or opportunities." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // 1. Check Pro Status on Load
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.isPro) {
        setIsPro(true);
    }
  }, []);

  // 2. The "Real-Feeling" Payment Logic
  const handleConfirmPayment = async () => {
    setProcessing(true);
    
    // Simulate Bank Delay (2.5 seconds)
    setTimeout(async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Call Backend
            await axios.post('http://localhost:3000/api/payment/mock-success', {}, config);

            // Update Local Storage
            const updatedUser = { ...userInfo, isPro: true };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            
            // Success!
            setProcessing(false);
            setShowModal(false);
            setIsPro(true);
            toast.success("Transaction Approved! Welcome to Pro 🚀", {
                duration: 5000,
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid #00E676' }
            });

        } catch (error) {
            toast.error("Transaction Failed");
            setProcessing(false);
        }
    }, 2500); 
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await axios.post(
            'http://localhost:3000/api/ai/chat', 
            { message: userMessage }, 
            config
        );
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
        setMessages(prev => [...prev, { sender: 'ai', text: "⚠️ Error connecting to AI." }]);
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER: LOCKED STATE ---
  if (!isPro) {
    return (
        <div className="chat-container" style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '80vh' }}>
            
            {/* The Background "Lock" Card */}
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</h1>
                <h2 style={{ marginBottom: '10px' }}>AI Analyst is Locked</h2>
                <p style={{ color: '#aaa', marginBottom: '30px', lineHeight: '1.6' }}>
                    Upgrade to <b>TradeX Pro</b> to unlock real-time portfolio analysis powered by Gemini 2.0.
                </p>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '15px 40px',
                        background: '#00E676',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Unlock for $500
                </button>
            </div>

            {/* --- THE FAKE CHECKOUT MODAL --- */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#1e1e1e', padding: '30px', borderRadius: '16px', width: '400px',
                        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                            <h3 style={{margin:0}}>TradeX Secure Checkout</h3>
                            <button onClick={() => !processing && setShowModal(false)} style={{background:'none', border:'none', color:'#666', fontSize:'1.5rem', cursor:'pointer'}}>&times;</button>
                        </div>
                        
                        <div style={{background:'#111', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', color:'#888', fontSize:'0.9rem', marginBottom:'5px'}}>
                                <span>Item</span>
                                <span>Price</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', color:'#fff', fontWeight:'bold'}}>
                                <span>Pro Membership (Lifetime)</span>
                                <span>₹500.00</span>
                            </div>
                        </div>

                        <div style={{marginBottom:'25px'}}>
                            <label style={{display:'block', color:'#888', fontSize:'0.8rem', marginBottom:'5px'}}>Payment Method</label>
                            <div style={{
                                padding:'12px', background:'#111', border:'1px solid #333', borderRadius:'6px', 
                                display:'flex', alignItems:'center', gap:'10px', color:'#fff'
                            }}>
                                💳 <span>Test Card **** 4242</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleConfirmPayment}
                            disabled={processing}
                            style={{
                                width: '100%', padding: '15px',
                                background: processing ? '#333' : '#00E676',
                                color: processing ? '#888' : '#000',
                                border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', fontSize: '1rem', cursor: processing ? 'wait' : 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            {processing ? (
                                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                                    Processing...
                                </span>
                            ) : "Confirm Payment ₹500"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // --- RENDER: UNLOCKED CHAT ---
  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>🤖 AI Analyst <span style={{fontSize:'0.8rem', color:'#00E676', border:'1px solid #00E676', padding:'2px 8px', borderRadius:'10px'}}>PRO</span></h1>
      </header>
      <div className="messages-box">
        {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                {msg.text}
            </div>
        ))}
        {loading && <div className="message msg-ai" style={{fontStyle:'italic'}}>Thinking...</div>}
      </div>
      <div className="input-area">
        <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask about your stocks..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-btn" onClick={handleSend}>SEND</button>
      </div>
    </div>
  );
};

export default ChatPage;