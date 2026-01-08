import { useState, useEffect } from 'react';
import axios from 'axios';
import './Trade.css'; 

// Import Components
import Watchlist from '../components/dashboard/Watchlist';
import StockChart from '../components/dashboard/StockChart';
import TradePanel from '../components/dashboard/TradePanel';
import MarketStatus from '../components/dashboard/MarketStatus'; 

const TradePage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [currentPrice, setCurrentPrice] = useState(0); 
  const [priceChange, setPriceChange] = useState(0);   
  const [percentChange, setPercentChange] = useState(0); 
  const [timeframe, setTimeframe] = useState("1D");
  const [watchlist, setWatchlist] = useState([]);
  const [walletBalance, setWalletBalance] = useState(50000); 
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo')); 

  // 1. Initial Load
  useEffect(() => {
    const loadDashboardData = async () => {
        if (!userInfo) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:3000/api/users/profile', config);
            setWalletBalance(data.walletBalance);

            let initialList = data.watchlist || [];

            const pricedList = await Promise.all(initialList.map(async (stock) => {
                try {
                    const res = await axios.get(`http://localhost:3000/api/stocks/${stock.symbol}`, config);
                    return { ...stock, price: res.data.price, change: res.data.change };
                } catch (err) { 
                    return { ...stock, price: 0, change: 0 }; 
                }
            }));
            setWatchlist(pricedList);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    };
    loadDashboardData();
  }, [userInfo]); 

  // 2. Fetch Selected Stock
  useEffect(() => {
    const fetchRealPrice = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const response = await axios.get(`http://localhost:3000/api/stocks/${selectedSymbol}`, config);
        
        if (response.data && response.data.price) {
          setCurrentPrice(response.data.price);
          setPriceChange(response.data.change);
          setPercentChange(response.data.change); 
        } else {
            setCurrentPrice(150.00); 
        }
      } catch (error) { 
          setCurrentPrice(150.00); 
      }
    };
    fetchRealPrice();
  }, [selectedSymbol]);

  // 3. Handle Buy
  const handleBuy = async (quantity) => {
    if (!userInfo) { alert('Please Login'); return; }
    setLoading(true);
    try {
        const config = {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.post(
            'http://localhost:3000/api/trade/buy', 
            { stockSymbol: selectedSymbol, quantity: Number(quantity) },
            config
        );
        alert(`SUCCESS: Bought ${quantity} shares of ${selectedSymbol}`);
        setWalletBalance(prev => prev - data.order.totalAmount);
    } catch (error) {
        alert(error.response?.data?.message || 'Trade Failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Watchlist 
        watchlist={watchlist}
        setWatchlist={setWatchlist}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        userInfo={userInfo}
      />

      <main className="main-view">
        <div className="glass-panel stock-header-panel">
          
          {/* --- HEADER SECTION --- */}
          <div className="stock-info">
            {/* Row 1: Symbol + Badge */}
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <h1 style={{margin: 0, lineHeight: '1'}}>{selectedSymbol}</h1>
                <MarketStatus /> 
            </div>
            {/* Row 2: Name (Just once) */}
            <span style={{color:'#888', fontSize:'1rem', marginTop:'5px', display:'block'}}>
                {watchlist.find(s => s.symbol === selectedSymbol)?.name || "MARKET"}
            </span>
          </div>
          {/* ---------------------- */}

          <div className="stock-price-right">
            <span className="current-price">${currentPrice.toFixed(2)}</span>
            <span className={priceChange >= 0 ? "price-change green" : "price-change red"}>
              {priceChange > 0 ? "+" : ""}{priceChange?.toFixed(2)}
            </span>
          </div>
        </div>

        <StockChart 
            currentPrice={currentPrice}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
        />

        <TradePanel 
            currentPrice={currentPrice}
            selectedSymbol={selectedSymbol}
            walletBalance={walletBalance}
            onBuy={handleBuy}
            loading={loading}
        />
      </main>
    </div>
  );
};

export default TradePage;