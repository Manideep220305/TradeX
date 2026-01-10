import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProPage = () => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Check Status
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.isPro) setIsPro(true);
  }, []);

  // 2. Handle Upgrade (Same logic as ChatPage)
  const handleUpgrade = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.post('http://localhost:3000/api/payment/mock-success', {}, config);

        const updatedUser = { ...userInfo, isPro: true };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        
        setIsPro(true);
        toast.success("Upgrade Successful! Welcome to Pro 🚀");
      } catch (error) {
        toast.error("Upgrade Failed");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Your Membership</h1>
      <p style={{ color: '#888', marginBottom: '40px' }}>Manage your plan and billing details.</p>

      {isPro ? (
        // --- VIEW FOR PRO USERS ---
        <div className="glass-panel" style={{ padding: '40px', border: '1px solid #00E676', background: 'rgba(0, 230, 118, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#00E676', fontSize: '2rem', marginBottom: '10px' }}>PRO PLAN ACTIVE</h2>
              <p style={{ color: '#ccc' }}>Next billing date: <b>January 10, 2027</b></p>
            </div>
            <div style={{ fontSize: '4rem' }}>💎</div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />
          <h3>Your Benefits:</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', lineHeight: '2' }}>
            <li>✅ AI Financial Analyst (Gemini 2.0)</li>
            <li>✅ Unlimited Portfolio Tracking</li>
            <li>✅ Real-time Market Data</li>
            <li>✅ Priority Support</li>
          </ul>
        </div>
      ) : (
        // --- VIEW FOR FREE USERS ---
        <div className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Free Plan</h2>
              <p style={{ color: '#888' }}>You are currently on the basic tier.</p>
            </div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
             {/* Benefit List */}
             <div style={{ flex: 1 }}>
                <h3>Why Upgrade?</h3>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', lineHeight: '2', color: '#ccc' }}>
                    <li>🚀 Unlock AI Analyst</li>
                    <li>📊 Advanced Charts</li>
                    <li>⚡ Faster Data Refresh</li>
                </ul>
             </div>

             {/* Upgrade Card */}
             <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Pro Tier</h3>
                <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#00E676' }}>$500<span style={{ fontSize: '1rem', color: '#888' }}>/mo</span></h1>
                <button 
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: '#00E676',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "Processing..." : "Upgrade Now"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProPage;