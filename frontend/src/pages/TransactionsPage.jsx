import { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css'; 

const TransactionsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('https://tradex-ts78.onrender.com/api/trade/history', config);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };

    if (userInfo) fetchHistory();
  }, []);

  // Helper to format date nicely (e.g., "Oct 24, 2025")
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Transaction History</h1>
        <p>A complete record of your trading activity.</p>
      </header>

      {loading ? <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>Loading Records...</div> : (
        <div className="history-panel">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Asset</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#666'}}>No transactions found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    {/* Date */}
                    <td style={{color:'#888', fontSize:'0.9rem'}}>{formatDate(order.createdAt)}</td>
                    
                    {/* Type Badge */}
                    <td>
                        <span className={`type-badge ${order.transactionType === 'BUY' ? 'type-buy' : 'type-sell'}`}>
                            {order.transactionType}
                        </span>
                    </td>

                    {/* Asset */}
                    <td style={{fontWeight:'700', color:'white'}}>{order.stockSymbol}</td>

                    {/* Qty */}
                    <td>{order.quantity}</td>

                    {/* Price */}
                    <td>${order.price.toFixed(2)}</td>

                    {/* Total */}
                    <td style={{fontWeight:'600'}}>${order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;