import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MarketStatus from '../components/dashboard/MarketStatus'; 
import './PortfolioPage.css'; 

// ✅ 1. NEW HELPER COMPONENT (Fixes the Input Issue)
const PortfolioRow = ({ stock, onSell }) => {
  // Each row now has its own "sellQty" variable. No more mixing up stocks!
  const [qty, setQty] = useState(''); 

  const handleSellClick = () => {
    const amount = parseInt(qty);
    if (!amount || amount <= 0) {
        return toast.error("Enter a valid amount");
    }
    if (amount > stock.quantity) {
        return toast.error(`You only have ${stock.quantity} shares`);
    }
    // Pass the typed amount to the parent
    onSell(stock.stockSymbol, amount);
    setQty(''); // Reset input after sell
  };

  return (
    <tr>
        <td className="stock-symbol">{stock.stockSymbol}</td>
        <td className="stock-qty">{stock.quantity}</td>
        <td className="stock-price">${stock.averagePrice.toFixed(2)}</td>
        <td className={stock.currentPrice >= stock.averagePrice ? 'text-green' : 'text-red'}>
            ${stock.currentPrice?.toFixed(2)}
        </td>
        <td style={{fontWeight:'600'}}>${stock.currentValue?.toFixed(2)}</td>
        <td>
            <span className={`stock-pl ${stock.profit >= 0 ? 'bg-green-dim' : 'bg-red-dim'}`}>
                {stock.profit >= 0 ? "+" : ""}{stock.profit.toFixed(2)} ({stock.profitPercent.toFixed(2)}%)
            </span>
        </td>
        <td>
            <div className="action-group">
                <input 
                    type="number" 
                    className="sell-input"
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                />
                <button 
                    className="sell-btn"
                    onClick={handleSellClick} // ✅ FIXED: Uses the local 'qty' state
                >
                    SELL
                </button>
            </div>
        </td>
    </tr>
  );
};

// --- MAIN PAGE ---
const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ invested: 0, current: 0, profit: 0 }); 
  const [balance, setBalance] = useState(0);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // 1. Fetch & Calculate Logic
  const fetchPortfolioData = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.get('http://localhost:3000/api/trade/portfolio', config);
      const userRes = await axios.get('http://localhost:3000/api/users/profile', config);
      setBalance(userRes.data.walletBalance);

      let totalInvested = 0;
      let totalCurrent = 0;

      const enrichedData = await Promise.all(data.map(async (item) => {
          try {
              const res = await axios.get(`http://localhost:3000/api/stocks/${item.stockSymbol}`, config);
              const currentPrice = res.data.price;
              
              const currentValue = currentPrice * item.quantity;
              const investedValue = item.averagePrice * item.quantity;
              const profit = currentValue - investedValue;
              const profitPercent = investedValue > 0 ? (profit / investedValue) * 100 : 0;

              totalInvested += investedValue;
              totalCurrent += currentValue;

              return { ...item, currentPrice, currentValue, profit, profitPercent };
          } catch (err) {
              return { ...item, currentPrice: 0, currentValue: 0, profit: 0, profitPercent: 0 };
          }
      }));

      setPortfolio(enrichedData);
      setTotals({
          invested: totalInvested,
          current: totalCurrent,
          profit: totalCurrent - totalInvested
      });
      setLoading(false);
    } catch (error) {
      console.error("Portfolio Load Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 5000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Handle Sell Logic
  const handleSell = async (symbol, quantityToSell) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let currentPrice = 150; 
      try {
          const priceRes = await axios.get(`http://localhost:3000/api/stocks/${symbol}`, config);
          currentPrice = priceRes.data.price;
      } catch (err) {
          console.log("Using stored price for sell");
      }

      await axios.post('http://localhost:3000/api/trade/sell', {
        stockSymbol: symbol,
        quantity: parseInt(quantityToSell),
        price: currentPrice
      }, config);

      toast.success(`Sold ${quantityToSell} shares of ${symbol}`, {
        icon: '💰',
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #00E676' },
        duration: 3000,
      });

      // Refresh without crashing if it fails
      try { await fetchPortfolioData(); } catch (e) {}

    } catch (error) {
      toast.error(error.response?.data?.message || "Could not sell stock", {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #FF5252' }
      });
    }
  };

  return (
    <div className="portfolio-container">
      
      {/* HEADER SECTION */}
      <header className="portfolio-header">
        <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, lineHeight: '1' }}>My Portfolio</h1>
                <MarketStatus /> 
            </div>
            <p>Track your assets, performance, and realized gains.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
            <div className="summary-card">
                <div className="summary-label">Buying Power</div>
                <div className="summary-value" style={{ color: 'white' }}>
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="summary-sub" style={{ color: '#888' }}>Available Cash</div>
            </div>

            <div className="summary-card">
                <div className="summary-label">Total Profit / Loss</div>
                <div className={`summary-value ${totals.profit >= 0 ? 'text-green' : 'text-red'}`}>
                    {totals.profit >= 0 ? "+" : ""}${totals.profit.toFixed(2)}
                </div>
                <div className="summary-sub">Current Value: ${totals.current.toFixed(2)}</div>
            </div>
        </div>
      </header>

      {/* TABLE SECTION */}
      {loading ? <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>Loading Financial Data...</div> : (
        <div className="table-panel">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>LTP</th>
                <th>Current Value</th>
                <th>P&L</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color:'#666'}}>No stocks in portfolio.</td></tr>
              ) : (
                // ✅ RENDERING THE NEW COMPONENT
                portfolio.map((stock) => (
                  <PortfolioRow 
                    key={stock.stockSymbol} 
                    stock={stock} 
                    onSell={handleSell} // Passing the function down
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;