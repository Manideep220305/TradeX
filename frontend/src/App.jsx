import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage'; // <--- ADDED THIS IMPORT
import TransactionsPage from './pages/TransactionsPage';
import ChatPage from './pages/ChatPage';

// Components
import Sidebar from './components/Sidebar';
import './App.css'; // Global Styles

// 1. The Layout Wrapper (This holds the Sidebar)
const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

// 2. Placeholder Component (So the app doesn't crash on empty pages)
const Placeholder = ({ title }) => (
  <div style={{ padding: '50px', color: 'white', textAlign: 'center' }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚧</h1>
    <h2>{title}</h2>
    <p style={{ color: '#888', marginTop: '10px' }}>Coming Soon</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No Sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* MAIN DASHBOARD ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <AppLayout>
              <TradePage /> 
            </AppLayout>
          } 
        />
        
        {/* PORTFOLIO ROUTE (The Real Page) */}
        <Route 
          path="/portfolio" 
          element={
            <AppLayout>
              <PortfolioPage /> 
            </AppLayout>
          } 
        />
        
        {/* SAFETY ROUTES (Placeholders for Sidebar Links) */}
        <Route path="/transactions" 
          element={<AppLayout>
             <TransactionsPage/>
            </AppLayout>} />
        
        
        <Route path="/ai" element={<AppLayout><ChatPage /></AppLayout>} />
        <Route path="/pro" element={<AppLayout><Placeholder title="Pro Upgrade" /></AppLayout>} />

        {/* Catch-all: Redirect /trade to /dashboard if needed */}
        <Route path="/trade" element={<AppLayout><TradePage /></AppLayout>} />

      </Routes>
    </Router>
  );
}

export default App;