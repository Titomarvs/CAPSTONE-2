import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Government Financial Management System</h1>
          <p>Secure Access Portal - Sign in to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Official Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your government email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Secure Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your secure password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access System'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Need system access? <Link to="/register">Request Account</Link></p>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#0369a1'
        }}>
          <strong>Security Notice:</strong> This is a secure government system. All activities are monitored and logged for security purposes.
        </div>
      </div>
    </div>
  );
};

export default Login;

