import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await axios.post('http://localhost:8080/api/users/register', formData);
      alert("Registration Successful! Please log in.");
      navigate('/');
    } catch (err) {
      const serverResponse = err.response?.data;
      const message = typeof serverResponse === 'object' ? serverResponse.message : serverResponse;
      setErrorMessage(message || "Registration failed.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fcfaf9', fontFamily: "'Quicksand', sans-serif" }}>
      <form onSubmit={handleRegister} style={{ background: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', width: '400px' }}>
        
        {/* PROMINENT LOGO */}
        <img src="/logo.jpg" alt="IngrediSure Logo" style={{ width: '150px', marginBottom: '15px', borderRadius: '12px' }} />
        
        <h2 style={{ color: '#a5a58d', marginBottom: '5px' }}>Join Ingredi<span style={{color: '#cb997e', fontWeight: 300 }}>Sure</span></h2>
        
        <div style={{ background: '#fdf3e7', padding: '15px', borderRadius: '20px', marginBottom: '20px', textAlign: 'left', fontSize: '12px', color: '#8d8d7a', border: '1px solid #f0e4de' }}>
          <strong style={{ color: '#cb997e' }}>📝 Account Rules:</strong>
          <ul style={{ margin: '5px 0 0 15px', padding: 0 }}>
            <li>Username: At least 3 letters</li>
            <li>Password: At least 6 characters</li>
          </ul>
        </div>

        {errorMessage && <div style={{ color: 'red', marginBottom: '10px', fontSize: '13px' }}>⚠️ {errorMessage}</div>}

        <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#cb997e', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
        
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#b7b7a4' }}>
          Already have an account? <Link to="/" style={{ color: '#cb997e', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;