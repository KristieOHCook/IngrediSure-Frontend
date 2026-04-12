import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed?.username) navigate('/dashboard');
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      // Store the full user object from the backend
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fcfaf9', fontFamily: "'Quicksand', sans-serif" }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '60px', borderRadius: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', textAlign: 'center', width: '450px' }}>
        
        {/* BIG PROMINENT LOGO */}
        <img 
          src="/logo.jpg" 
          alt="IngrediSure Logo" 
          style={{ width: '220px', marginBottom: '30px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} 
        />
        
        <h1 style={{ color: '#a5a58d', margin: '0 0 10px 0', fontSize: '32px', fontWeight: 800 }}>
          Ingredi<span style={{color: '#cb997e', fontWeight: 300 }}>Sure</span>
        </h1>
        <p style={{ color: '#b7b7a4', marginBottom: '35px', fontSize: '16px' }}>Your Personalized Health Intelligence Hub</p>
        
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <label style={{ color: '#a5a58d', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>Username</label>
          <input 
            type="text" 
            placeholder="Enter your username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ width: '100%', padding: '18px', marginTop: '5px', borderRadius: '20px', border: '1px solid #f0f0f0', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }} 
            required 
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          <label style={{ color: '#a5a58d', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '18px', marginTop: '5px', borderRadius: '20px', border: '1px solid #f0f0f0', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }} 
            required 
          />
        </div>

        {/* FORGOT PASSWORD LINK */}
        <div style={{ textAlign: 'right', marginBottom: '30px' }}>
          <Link to="/forgot-password" style={{ color: '#cb997e', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
            Forgot Password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          className="login-btn"
          style={{ width: '100%', padding: '18px', background: '#cb997e', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(203, 153, 126, 0.3)', transition: '0.3s' }}
        >
          Log In
        </button>
        
        <div style={{ marginTop: '30px', borderTop: '1px solid #fcfaf9', paddingTop: '20px' }}>
          <p style={{ fontSize: '15px', color: '#b7b7a4' }}>
            New to the hub? <Link to="/register" style={{ color: '#cb997e', textDecoration: 'none', fontWeight: 'bold' }}>Create an Account</Link>
          </p>
        </div>
      </form>

      <style>{`
        .login-btn:hover {
          background-color: #b07d62 !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default Login;