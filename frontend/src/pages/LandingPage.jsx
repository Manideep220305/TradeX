import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Trade<span className="highlight">X</span></div>
        <div className="nav-links">
          <Link to="/login" className="nav-item">Login</Link>
          <Link to="/register" className="nav-btn">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Master the Markets with <br /> <span className="highlight">AI-Powered Logic</span></h1>
          <p>
            Experience the next generation of algorithmic trading. 
            Real-time data, portfolio tracking, and AI insights all in one place.
          </p>
          
          <div className="cta-group">
            <Link to="/register">
              <button className="btn primary-btn" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
                Start Trading Now
              </button>
            </Link>
          </div>
        </div>

        {/* Improved Floating Visuals (Frosted Glass) */}
        <div className="hero-visual">
          
          {/* Card 1: Nvidia */}
          <div className="floating-card card-1">
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span>NVDA</span>
               <span style={{fontSize: '0.8rem', color: '#888'}}>Nvidia Corp</span>
            </div>
            <span className="green">+3.45%</span>
          </div>

          {/* Card 2: Meta */}
          <div className="floating-card card-2">
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span>META</span>
               <span style={{fontSize: '0.8rem', color: '#888'}}>Meta Platforms</span>
            </div>
            <span className="red">-0.12%</span>
          </div>

          {/* Card 3: Google */}
          <div className="floating-card card-3">
             <div style={{display: 'flex', flexDirection: 'column'}}>
               <span>GOOGL</span>
               <span style={{fontSize: '0.8rem', color: '#888'}}>Alphabet Inc</span>
            </div>
            <span className="green">+1.20%</span>
          </div>

          <div className="floating-card card-4">
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span>TESLA</span>
               <span style={{fontSize: '0.8rem', color: '#888'}}>Tesla Inc</span>
            </div>
            <span className="green">+1.54%</span>
          </div>

        </div>
      </header>

      {/* Features Grid */}
      <section className="features-section">
        <h2>Why Choose TradeX?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🚀 Real-Time Execution</h3>
            <p>Execute trades instantly with our low-latency engine connected to global markets.</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Insights</h3>
            <p>Get predictive analysis on stock trends using our proprietary machine learning models.</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Bank-Grade Security</h3>
            <p>Your data and assets are protected with industry-standard encryption and security protocols.</p>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <p>&copy; 2026 TradeX Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;