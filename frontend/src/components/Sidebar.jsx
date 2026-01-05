import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  History, 
  Bot, 
  Zap, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'; // <--- The Pro Icons
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Reusable Nav Item
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`nav-item ${isActive(to) ? 'active' : ''}`}
      title={isOpen ? '' : label}
    >
      <div className="icon-box">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      {isOpen && <span className="label">{label}</span>}
    </Link>
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      
      {/* 1. TOP SECTION */}
      <div className="sidebar-top">
        <button onClick={toggleSidebar} className="hamburger-btn">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="logo-container">
          {isOpen ? (
            <h2 className="full-logo">Trade<span className="green">X</span></h2>
          ) : (
            <h2 className="mini-logo">T<span className="green">X</span></h2>
          )}
        </div>
      </div>

      {/* 2. NAVIGATION */}
      <nav className="sidebar-nav">
        <NavItem to="/dashboard" label="Overview" icon={LayoutDashboard} />
        <NavItem to="/portfolio" label="Portfolio" icon={PieChart} />
        <NavItem to="/transactions" label="History" icon={History} />
        <NavItem to="/ai" label="AI Analyst" icon={Bot} />
        <NavItem to="/pro" label="Go Pro" icon={Zap} />
      </nav>

      {/* 3. LOGOUT */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn">
          <div className="icon-box">
            <LogOut size={22} />
          </div>
          {isOpen && <span className="label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;