import { useState, useEffect } from 'react';
import axios from 'axios';

const Watchlist = ({ watchlist, setWatchlist, selectedSymbol, setSelectedSymbol, userInfo }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  // 1. Live Search Logic
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
        
        if (res.data && res.data.result) {
            const stocks = res.data.result.filter(item => !item.symbol.includes('.'));
            setSearchResults(stocks.slice(0, 5)); 
        } else {
            setSearchResults([]);
        }
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setIsSearching(false); 
      }
    }, 1000); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. Add Stock Logic
  const handleAddStock = async (result) => {
    if (watchlist.some(s => s.symbol === result.symbol)) {
        setSelectedSymbol(result.symbol);
        setSearchQuery("");
        setSearchResults([]);
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // Save to Database
        await axios.post('https://tradex-ts78.onrender.com/api/users/watchlist', {
            symbol: result.symbol,
            name: result.description
        }, config);

        // Fetch Price from Backend
        const res = await axios.get(`https://tradex-ts78.onrender.com/api/stocks/${result.symbol}`, config);

        const newStock = { 
            symbol: result.symbol, 
            name: result.description || result.symbol, 
            price: res.data.price || 0, 
            change: res.data.change || 0 
        };
        
        setWatchlist(prev => [newStock, ...prev]);
        setSelectedSymbol(result.symbol);
        setSearchQuery("");
        setSearchResults([]); 

    } catch (err) { 
        console.error("Add Error:", err);
        alert("Failed to add stock."); 
    }
  };

  // 3. Remove Stock Logic
  const handleRemoveStock = async (e, symbolToRemove) => {
    e.stopPropagation(); 
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // Call the new Delete Route
        await axios.delete(`https://tradex-ts78.onrender.com/api/users/watchlist/${symbolToRemove}`, config);
        
        setWatchlist(prev => prev.filter(stock => stock.symbol !== symbolToRemove));
    } catch (err) {
        console.error("Remove Error:", err);
        alert("Failed to remove stock.");
    }
  };

  return (
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
                    <div key={result.symbol} className="watchlist-item" style={{borderLeft: '3px solid #00E676', background:'rgba(255,255,255,0.05)'}} onClick={() => handleAddStock(result)}>
                        <div className="item-info">
                            <span className="item-symbol">{result.symbol}</span>
                            <span style={{fontSize:'0.75rem', color:'#aaa'}}>{result.description}</span>
                        </div>
                        <div style={{color:'#00E676', fontSize:'0.8rem', fontWeight:'700'}}>+ ADD</div>
                    </div>
                ))
            ) : (
                <div style={{padding:'20px', color:'#888', textAlign:'center', fontSize:'0.9rem'}}>
                    {searchQuery.length > 0 ? `No stocks found for "${searchQuery}"` : "Start typing to search..."}
                </div>
            )
        ) : (
          watchlist.map((stock) => (
              <div key={stock.symbol} className={`watchlist-item ${selectedSymbol === stock.symbol ? 'active' : ''}`} onClick={() => setSelectedSymbol(stock.symbol)}>
                <div className="item-left">
                  <span className="item-symbol">{stock.symbol}</span>
                  <span className="item-name" style={{fontSize:'0.7rem', color:'#888', display:'block', marginTop:'2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px'}}>
                      {stock.name}
                  </span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{textAlign:'right'}}>
                      <div className="item-price" style={{color: '#eee', fontWeight:'600', fontSize:'0.9rem'}}>
                          {stock.price > 0 ? `$${stock.price.toFixed(2)}` : "..."}
                      </div>
                      <span style={{fontSize:'0.75rem', color: (stock.change || 0) >= 0 ? '#00E676' : '#FF5252'}}>
                          {(stock.change || 0) > 0 ? "+" : ""}{(stock.change || 0).toFixed(2)}%
                      </span>
                    </div>
                    <button className="delete-btn" onClick={(e) => handleRemoveStock(e, stock.symbol)} title="Remove">×</button>
                </div>
              </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Watchlist;