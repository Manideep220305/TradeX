import { useState, useEffect } from 'react';

const MarketStatus = () => {
  const getStatus = () => {
    const now = new Date();
    // Convert to New York Time (ET)
    const options = { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'long' };
    const formatter = new Intl.DateTimeFormat([], options);
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;
    
    const day = getPart('weekday');
    const hour = parseInt(getPart('hour'));
    const minute = parseInt(getPart('minute'));
    const timeInMinutes = (hour * 60) + minute;

    // Market Hours: 9:30 AM (570) - 4:00 PM (960)
    const marketOpen = 570; 
    const marketClose = 960;
    const isWeekend = day === 'Saturday' || day === 'Sunday';

    if (isWeekend || timeInMinutes < marketOpen || timeInMinutes >= marketClose) {
        return { text: "Closed", color: "#FF5252", bg: "rgba(255, 82, 82, 0.1)" };
    } else {
        return { text: "Open", color: "#00E676", bg: "rgba(0, 230, 118, 0.1)" };
    }
  };

  const [status, setStatus] = useState(getStatus());

  useEffect(() => {
    const interval = setInterval(() => setStatus(getStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
        fontSize: '11px', 
        fontWeight: '800', 
        color: status.color,
        background: status.bg,
        border: `1px solid ${status.color}`,
        padding: '2px 8px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        textTransform: 'uppercase',
        height: 'fit-content',
        marginTop: '6px' // Aligns better with large text
    }}>
        <span style={{ fontSize: '8px' }}>●</span> {status.text}
    </div>
  );
};

export default MarketStatus;