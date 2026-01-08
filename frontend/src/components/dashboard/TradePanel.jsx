import { useState } from 'react';

const TradePanel = ({ currentPrice, selectedSymbol, walletBalance, onBuy, loading }) => {
  const [quantity, setQuantity] = useState(10);

  return (
    <div className="glass-panel action-panel">
      <div className="wallet-info">
        <span style={{color:'#888', fontSize:'0.85rem', display:'block', marginBottom:'5px'}}>Buying Power</span>
        <strong style={{color:'white', fontSize: '1.2rem'}}>
            ${walletBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </strong>
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
      
      <button 
        className="buy-btn" 
        onClick={() => onBuy(quantity)} // Pass quantity back to parent
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'PROCESSING...' : `BUY ${selectedSymbol}`}
      </button>
    </div>
  );
};

export default TradePanel;