import React, { useState } from 'react';
import './AuthPage.css';

export default function AuthPage({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // login, register, otp_request, otp_verify
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: '',
    incomeSource: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    let endpoint = '';
    let body = {};

    if (authMode === 'login') {
      endpoint = '/login';
      body = { email: formData.email, password: formData.password };
    } else if (authMode === 'register') {
      endpoint = '/register';
      body = { username: formData.username, email: formData.email, password: formData.password };
    } else if (authMode === 'otp_request') {
      endpoint = '/request-otp';
      body = { email: formData.email };
    } else if (authMode === 'otp_verify') {
      endpoint = '/verify-otp';
      body = { email: formData.email, code: formData.otp };
    }

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();

      if (data.status === 'success') {
        if (authMode === 'otp_request') {
          setAuthMode('otp_verify');
          setMessage('Check your email (console) for the OTP!');
        } else {
          onLogin({ user_id: data.user_id, username: data.username, email: data.email });
        }
      } else {
        setError(data.message || 'Authentication error');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo/Icon Area */}
        <div className="auth-logo-area">
          <div className="brand-icon">₹</div>
          <h1>Finance AI</h1>
        </div>

        <div className="auth-header">
          <h2>
            {authMode === 'login' && 'Welcome Back'}
            {authMode === 'register' && 'Create Account'}
            {authMode === 'otp_request' && 'OTP Login'}
            {authMode === 'otp_verify' && 'Verify OTP'}
          </h2>
          <p>
            {authMode === 'login' && 'Enter your credentials to manage your wealth'}
            {authMode === 'register' && 'Start your journey to financial freedom'}
            {authMode === 'otp_request' && 'Fast access via one-time password'}
            {authMode === 'otp_verify' && `We sent a code to ${formData.email}`}
          </p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="username" type="text" placeholder="e.g. Rahul Sharma" value={formData.username} onChange={handleInputChange} required />
            </div>
          )}

          {(authMode !== 'otp_verify') && (
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleInputChange} required />
            </div>
          )}

          {(authMode === 'login' || authMode === 'register') && (
            <>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>What is your income source?</label>
                <input name="incomeSource" type="text" placeholder="e.g. Salary, Business, Crypto..." value={formData.incomeSource} onChange={handleInputChange} />
              </div>
            </>
          )}

          {authMode === 'otp_verify' && (
            <div className="form-group">
              <label>Verification Code</label>
              <input name="otp" type="text" placeholder="6-digit code" value={formData.otp} onChange={handleInputChange} required maxLength={6} />
            </div>
          )}

          <button type="submit" className="auth-btn-primary">
            {authMode === 'login' && 'Sign In'}
            {authMode === 'register' && 'Sign Up'}
            {authMode === 'otp_request' && 'Send OTP'}
            {authMode === 'otp_verify' && 'Verify & Enter'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-footer">
          {authMode === 'login' ? (
            <>
              <p>Don't want to use a password? <button onClick={() => setAuthMode('otp_request')} className="link-btn">Use OTP Login</button></p>
              <p>New here? <button onClick={() => setAuthMode('register')} className="link-btn">Create an account</button></p>
            </>
          ) : authMode === 'register' ? (
            <p>Already have an account? <button onClick={() => setAuthMode('login')} className="link-btn">Sign In</button></p>
          ) : (
            <p>Go back to <button onClick={() => setAuthMode('login')} className="link-btn">Standard Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
