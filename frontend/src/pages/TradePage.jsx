import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './Trade.css'; 

const TradePage = () => {
  // --- STATE ---
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [currentPrice, setCurrentPrice] = useState(0); 
  const [priceChange, setPriceChange] = useState(0);   
  const [percentChange, setPercentChange] = useState(0); 
  const [chartData, setChartData] = useState([]); 
  const [timeframe, setTimeframe] = useState("1D");
  const [quantity, setQuantity] = useState(10);
  
  // SEARCH & WATCHLIST STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); 
  const [isSearching, setIsSearching] = useState(false); 
  
  const [watchlist, setWatchlist] = useState([
    { symbol: 'AAPL', name: 'Apple Inc', price: 0, change: 0 }, 
    { symbol: 'TSLA', name: 'Tesla Inc', price: 0, change: 0 },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: 0, change: 0 }, 
    { symbol: 'NVDA', name: 'Nvidia Corp', price: 0, change: 0 },
    { symbol: 'AMZN', name: 'Amazon.com', price: 0, change: 0 }, 
    { symbol: 'MSFT', name: 'Microsoft', price: 0, change: 0 },
  ]);

  const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  // --- 1. INITIAL LOAD: FETCH PRICES ---
  useEffect(() => {
    const fetchWatchlistPrices = async () => {
        const updatedList = await Promise.all(watchlist.map(async (stock) => {
            if (stock.price > 0) return stock; 
            try {
                const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
                return { ...stock, price: res.data.c || 0, change: res.data.dp || 0 };
            } catch (err) { return stock; }
        }));
        setWatchlist(updatedList);
    };
    fetchWatchlistPrices();
  }, []); 

  // --- 2. LIVE SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery) {
          setSearchResults([]);
          setIsSearching(false);
          return;
      }
      setIsSearching(true);
      try {
        const res = await axios.get(`https://finnhub.io/api/v1/search?q=${searchQuery}&token=${API_KEY}`);
        const stocks = res.data.result.filter(item => !item.symbol.includes('.'));
        setSearchResults(stocks.slice(0, 5)); 
      } catch (err) {
        console.error("Search failed");
      } finally {
        setIsSearching(false); 
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  // --- 3. ADD STOCK LOGIC ---
  const handleAddStock = async (result) => {
    if (watchlist.some(s => s.symbol === result.symbol)) {
        setSelectedSymbol(result.symbol);
        setSearchQuery("");
        setSearchResults([]);
        return;
    }

    try {
        const res = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${result.symbol}&token=${API_KEY}`);
        const newStock = { 
            symbol: result.symbol, 
            name: result.description || result.symbol, 
            price: res.data.c || 0, 
            change: res.data.dp || 0 
        };
        setWatchlist(prev => [newStock, ...prev]);
        setSelectedSymbol(result.symbol);
        setSearchQuery("");
        setSearchResults([]); 
    } catch (err) { 
        alert("Error adding stock"); 
    }
  };

  // --- 4. REMOVE STOCK LOGIC ---
  const handleRemoveStock = (e, symbolToRemove) => {
    e.stopPropagation(); 
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbolToRemove));
  };

  // --- 5. MAIN DATA FETCHING ---
  useEffect(() => {
    const fetchRealPrice = async () => {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${selectedSymbol}&token=${API_KEY}`);
        if (response.data.c) {
          setCurrentPrice(response.data.c);
          setPriceChange(response.data.d);
          setPercentChange(response.data.dp);
        }
      } catch (error) { setCurrentPrice(150.00); }
    };
    fetchRealPrice();
  }, [selectedSymbol]);

  // --- 6. CHART SIMULATION (RESTORED TO RANDOM WALK) ---
  useEffect(() => {
    const generateChart = () => {
      if (!currentPrice) return;
      let points = 0;
      let intervalLabel = "";
      switch (timeframe) {
        case '1D': points = 48; intervalLabel = '30m'; break;
        case '1W': points = 7; intervalLabel = 'Day'; break;
        case '1M': points = 30; intervalLabel = 'Day'; break;
        case 'YTD': points = 90; intervalLabel = 'Day'; break;
        case 'ALL': points = 100; intervalLabel = 'Month'; break;
        default: points = 48;
      }
      const data = [];
      let simulatedPrice = currentPrice;
      
      // RESTORED: This is the Random Walk logic (Jagged line)
      for (let i = points; i >= 0; i--) {
        const volatility = currentPrice * 0.02; 
        const change = (Math.random() - 0.5) * volatility; // RANDOM, NOT SINE
        simulatedPrice -= change; 
        
        let timeLabel = "";
        const date = new Date();
        if (intervalLabel === '30m') {
             date.setMinutes(date.getMinutes() - (i * 30));
             timeLabel = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
             date.setDate(date.getDate() - i);
             timeLabel = date.toLocaleDateString([], {month:'short', day:'numeric'});
        }
        data.unshift({ time: timeLabel, price: simulatedPrice });
      }
      
      if (data.length > 0) data[data.length - 1].price = currentPrice;
      setChartData(data);
    };
    generateChart();
  }, [currentPrice, timeframe]); // removed selectedSymbol to prevent reset


  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="watchlist-sidebar">
        <div className="sidebar-header">
          <h3 style={{marginBottom:'15px', fontWeight: '800'}}>My Watchlist</h3>
          <div className="mini-search">
            <input 
              type="text" 
              placeholder="Search (e.g. Apple)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="stock-list">
          {searchQuery ? (
              isSearching ? (
                  <div style={{padding:'20px', color:'#666', textAlign:'center'}}>Searching...</div>
              ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                      <div 
                        key={result.symbol} 
                        className="watchlist-item" 
                        style={{borderLeft: '3px solid #00E676', background:'rgba(255,255,255,0.05)'}}
                        onClick={() => handleAddStock(result)}
                      >
                          <div className="item-info">
                              <span className="item-symbol">{result.symbol}</span>
                              <span style={{fontSize:'0.75rem', color:'#aaa'}}>{result.description}</span>
                          </div>
                          <div style={{color:'#00E676', fontSize:'0.8rem', fontWeight:'700'}}>+ ADD</div>
                      </div>
                  ))
              ) : (
                  <div style={{padding:'20px', color:'#888', textAlign:'center', fontSize:'0.9rem'}}>
                      No stocks found for "{searchQuery}"
                  </div>
              )
          ) : (
            // NORMAL WATCHLIST (PRO UI)
            watchlist.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className={`watchlist-item ${selectedSymbol === stock.symbol ? 'active' : ''}`}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                >
                  {/* LEFT: Symbol + Name */}
                  <div className="item-left">
                    <span className="item-symbol">{stock.symbol}</span>
                    <span className="item-name" style={{
                        fontSize:'0.7rem', color:'#888', display:'block', marginTop:'2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' 
                    }}>
                        {stock.name}
                    </span>
                  </div>
                  
                  {/* RIGHT: Price + Delete */}
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <div style={{textAlign:'right'}}>
                        <div className="item-price" style={{color: '#eee', fontWeight:'600', fontSize:'0.9rem'}}>
                            {stock.price > 0 ? `$${stock.price.toFixed(2)}` : "..."}
                        </div>
                        <span style={{fontSize:'0.75rem', color: stock.change >= 0 ? '#00E676' : '#FF5252'}}>
                            {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}%
                        </span>
                      </div>
                      <button className="delete-btn" onClick={(e) => handleRemoveStock(e, stock.symbol)} title="Remove">×</button>
                  </div>
                </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="main-view">
        <div className="glass-panel stock-header-panel">
          <div className="stock-info">
            <h1>{selectedSymbol}</h1>
            <span style={{color:'#888', fontSize:'1rem', fontWeight:'400', marginLeft:'10px'}}>
                {watchlist.find(s => s.symbol === selectedSymbol)?.name || "NASDAQ"}
            </span>
          </div>
          <div className="stock-price-right">
            <span className="current-price">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."}
            </span>
            <span className={priceChange >= 0 ? "price-change green" : "price-change red"}>
              {priceChange > 0 ? "+" : ""}{priceChange?.toFixed(2)} ({percentChange?.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h4 className="panel-title">Price Performance</h4>
            <div className="timeframe-selector">
              {['1D', '1W', '1M', 'YTD', 'ALL'].map((tf) => (
                 <button key={tf} className={timeframe === tf ? 'tf-btn active' : 'tf-btn'} onClick={() => setTimeframe(tf)}>{tf}</button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: '350px' }}> 
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 11}} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} width={50} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#00E676' }} />
                <Area type="monotone" dataKey="price" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel action-panel">
          <div className="wallet-info">
            <span style={{color:'#888', fontSize:'0.85rem', display:'block', marginBottom:'5px'}}>Buying Power</span>
            <strong style={{color:'white', fontSize: '1.2rem'}}>$50,000.00</strong>
          </div>
          <div className="trade-inputs">
             <div className="input-group">
                <label>Quantity</label>
                <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
             </div>
             <div className="input-group">
                <label>Est. Cost</label>
                <div className="cost-display">
                  ${(quantity * currentPrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
             </div>
          </div>
          <button className="buy-btn">BUY {selectedSymbol}</button>
        </div>
      </main>
    </div>
  );
};

export default TradePage;