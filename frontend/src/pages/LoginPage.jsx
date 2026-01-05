import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      alert('Invalid Email or Password');
    }
  };

  return (
    // Uses the new wrapper for centering and background glow
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            required 
          />
          <button type="submit">Log In</button>
        </form>

        <p className="auth-footer">
          New to TradeX? <Link to="/register" style={{ color: '#00E676', textDecoration: 'none', fontWeight: 'bold' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;