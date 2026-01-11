import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Chat.css'; 

const ChatPage = () => {
  // 1. Get User ID to create a UNIQUE storage key
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userId = userInfo ? userInfo._id : 'guest';
  const storageKey = `tradeX_chat_history_${userId}`; // ✅ Unique Key per User

  // 2. Load Chat specifically for THIS user
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem(storageKey);
    return savedChat ? JSON.parse(savedChat) : [
      { sender: 'ai', text: `Hello ${userInfo?.name || ''}! I'm your TradeX AI Analyst.` }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const messagesEndRef = useRef(null);
  
  // Check Pro Status
  useEffect(() => {
    if (userInfo?.isPro) {
        setIsPro(true);
    }
  }, []);

  // 3. Save Chat specifically for THIS user
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages)); 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, storageKey]);

  // Payment Logic
  const handleConfirmPayment = async () => {
    setProcessing(true);
    setTimeout(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            await axios.post('http://localhost:3000/api/payment/mock-success', {}, config);
            
            const updatedUser = { ...userInfo, isPro: true };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            
            setProcessing(false);
            setShowModal(false);
            setIsPro(true);
            toast.success("Welcome to Pro! 🚀");
        } catch (error) {
            toast.error("Transaction Failed");
            setProcessing(false);
        }
    }, 2500); 
  };

  // ✅ UPDATED: FETCHES REAL DATA BEFORE SENDING
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // --- STEP 1: GET PORTFOLIO SNAPSHOT ---
        // Fetch raw quantities
        const portfolioRes = await axios.get('http://localhost:3000/api/trade/portfolio', config);
        const rawPortfolio = portfolioRes.data; // This has symbol & quantity

        // --- STEP 2: ENRICH WITH LIVE PRICES ---
        // We fetch the CURRENT price for each stock so the AI doesn't guess.
        const enrichedPortfolio = await Promise.all(rawPortfolio.map(async (item) => {
            try {
                // Fetch live price for this specific stock
                const priceRes = await axios.get(`http://localhost:3000/api/stocks/${item.stockSymbol}`, config);
                return { 
                    symbol: item.stockSymbol, 
                    qty: item.quantity, 
                    avgPrice: item.averagePrice, 
                    currentPrice: priceRes.data.price // <--- THE TRUTH
                };
            } catch (err) {
                // If price fetch fails, send what we have
                return { 
                    symbol: item.stockSymbol, 
                    qty: item.quantity, 
                    avgPrice: item.averagePrice,
                    currentPrice: null 
                };
            }
        }));

        // --- STEP 3: SEND MESSAGE + DATA TO AI ---
        const { data } = await axios.post(
            'http://localhost:3000/api/ai/chat', 
            { 
              message: userMessage, 
              portfolioContext: enrichedPortfolio // <--- Sending the context
            }, 
            config
        );
        
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);

    } catch (error) {
        console.error("AI Error:", error);
        setMessages(prev => [...prev, { sender: 'ai', text: "⚠️ I'm having trouble accessing the market data right now." }]);
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER: LOCKED STATE ---
  if (!isPro) {
    return (
        <div className="chat-container" style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '80vh' }}>
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
                    Unlock for ₹500
                </button>
            </div>

            {/* FAKE CHECKOUT MODAL */}
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
                            {processing ? "Processing..." : "Confirm Payment ₹500"}
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
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
            {/* ✅ CHANGED: SVG Sparkle Icon + "Gemini Insights" */}
            <h1>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.39 9.61L22 12L14.39 14.39L12 22L9.61 14.39L2 12L9.61 9.61L12 2Z" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Gemini Insights 
                <span style={{fontSize:'0.8rem', color:'#00E676', border:'1px solid #00E676', padding:'2px 8px', borderRadius:'10px'}}>PRO</span>
            </h1>
            
            {/* Clear Chat Button */}
            <button 
                onClick={() => {
                    if(confirm("Clear chat history?")) {
                        setMessages([]);
                        localStorage.removeItem(storageKey); 
                    }
                }}
                style={{background:'none', border:'none', color:'#666', fontSize:'0.8rem', cursor:'pointer'}}
            >
                Clear Chat
            </button>
        </div>
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