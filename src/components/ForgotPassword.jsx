import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [formData, setFormData] = useState({ username: '', email: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8080/api/users/reset-password', formData);
      setIsError(false);
      setMessage(res.data);
      setTimeout(() => navigate('/'), 2000); // Redirect to login after success
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data || "Error resetting password.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fcfaf9', fontFamily: 'Quicksand' }}>
      <form onSubmit={handleReset} style={{ background: 'white', padding: '50px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', width: '400px' }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: '150px', marginBottom: '20px', borderRadius: '15px' }} />
        <h2 style={{ color: '#a5a58d' }}>Reset Password</h2>
        <p style={{ color: '#b7b7a4', marginBottom: '25px', fontSize: '14px' }}>Verify your account details to set a new password.</p>

        {message && (
          <div style={{ color: isError ? 'red' : 'green', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px' }}>
            {message}
          </div>
        )}

        <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        <input type="password" placeholder="New Password" onChange={(e) => setFormData({...formData, newPassword: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '15px', border: '1px solid #eee', boxSizing: 'border-box' }} required />
        
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#cb997e', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Update Password</button>
        
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          <Link to="/" style={{ color: '#cb997e', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;