import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StockChart = ({ currentPrice, timeframe, setTimeframe }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!currentPrice) return;

    const generateChart = () => {
      let points = 0;
      let intervalType = "Day"; 

      switch (timeframe) {
        case '1D': points = 48; intervalType = 'Minute'; break;
        case '1W': points = 7; intervalType = 'Day'; break;
        case '1M': points = 30; intervalType = 'Day'; break;
        case 'YTD': points = 180; intervalType = 'Day'; break;
        case 'ALL': points = 60; intervalType = 'Month'; break; // 5 Years
        default: points = 48; intervalType = 'Minute';
      }

      const data = [];
      let simulatedPrice = currentPrice;
      const volatility = currentPrice * 0.02;

      // Loop backwards from Past -> Present
      for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.5) * volatility; 
        simulatedPrice -= change; 
        
        const date = new Date();
        let timeLabel = "";

        if (intervalType === 'Minute') {
             date.setMinutes(date.getMinutes() - (i * 30));
             timeLabel = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (intervalType === 'Month') {
             date.setMonth(date.getMonth() - i);
             // FIX 1: Show FULL YEAR so "Jan 21" becomes "Jan 2021"
             timeLabel = date.toLocaleDateString([], {month:'short', year:'numeric'});
        } else {
             date.setDate(date.getDate() - i);
             timeLabel = date.toLocaleDateString([], {month:'short', day:'numeric'});
        }

        // FIX 2: Use 'push' instead of 'unshift'.
        // 'push' adds to the end, keeping Oldest on Left, Newest on Right.
        data.push({ time: timeLabel, price: simulatedPrice });
      }
      
      // Snap the last point to the exact current price
      if (data.length > 0) data[data.length - 1].price = currentPrice;
      setChartData(data);
    };
    generateChart();
  }, [currentPrice, timeframe]);

  return (
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
  );
};

export default StockChart;