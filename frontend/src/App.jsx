import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import ChatPage from './pages/ChatPage';
import ProPage from './pages/proPage';

// Components
import Sidebar from './components/Sidebar';
import './App.css'; 

// 1. The Layout Wrapper
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

// (Deleted the unused Placeholder component to fix the error)

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
          },
          success: {
            iconTheme: {
              primary: '#00E676',
              secondary: 'black',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF5252',
              secondary: 'black',
            },
          },
        }} 
      />

      <Routes>
        {/* PUBLIC ROUTES */}
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
        
        {/* PORTFOLIO ROUTE */}
        <Route 
          path="/portfolio" 
          element={
            <AppLayout>
              <PortfolioPage /> 
            </AppLayout>
          } 
        />
        
        {/* TRANSACTIONS ROUTE */}
        <Route path="/transactions" 
          element={
            <AppLayout>
              <TransactionsPage/>
            </AppLayout>
          } 
        />
        
        {/* AI & PRO ROUTES */}
        <Route path="/ai" element={<AppLayout><ChatPage /></AppLayout>} />
        <Route path="/pro" element={<AppLayout><ProPage /></AppLayout>} />

        {/* Catch-all */}
        <Route path="/trade" element={<AppLayout><TradePage /></AppLayout>} />

      </Routes>
    </Router>
  );
}

export default App;