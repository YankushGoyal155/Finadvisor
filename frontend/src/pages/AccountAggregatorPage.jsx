import React, { useState } from 'react';
import './AccountAggregatorPage.css';
import { Database, ShieldCheck, FileText, CheckCircle2, AlertCircle, RefreshCw, BarChart } from 'lucide-react';

export default function AccountAggregatorPage() {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/setu/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.status === 'success') {
        setTokenData(data.data);
      } else {
        setError(data.message || 'Failed to connect. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while connecting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aa-wrapper fade-in">
      <div className="aa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="gradient-text">Account Aggregator Data Sync</h1>
          <span className="setu-badge">Powered by Setu</span>
        </div>
        <p>Securely link your Mutual Funds, Tax, GST, and Banking data for comprehensive AI financial insights.</p>
      </div>

      <div className="aa-grid">
        <div className="aa-card info-card">
          <div className="card-header">
            <ShieldCheck size={28} className="icon-blue" />
            <h2>Why connect your data?</h2>
          </div>
          <ul className="benefits-list">
            <li>
              <FileText size={20} />
              <div>
                <strong>Mutual Funds & Portfolio Tracking</strong>
                <p>Get real-time insights into your investment portfolio and get automated advice.</p>
              </div>
            </li>
            <li>
              <BarChart size={20} />
              <div>
                <strong>GST & Tax Simplification</strong>
                <p>Seamlessly integrate your tax and GST data for automated planning and optimization.</p>
              </div>
            </li>
            <li>
              <CheckCircle2 size={20} />
              <div>
                <strong>RBI Regulated & Secure</strong>
                <p>Your data is encrypted, secure and used strictly with your verified consent.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="aa-card action-card">
          <div className="data-sync-box">
            <Database size={48} className="setu-logo-icon" />
            <h2>Sync via Setu Account Aggregator</h2>
            <p className="sync-desc">Click below to generate a secure session token and begin the data linking process.</p>
            
            {tokenData ? (
              <div className="success-box">
                <CheckCircle2 className="success-icon" size={32} />
                <h3>Authentication Successful!</h3>
                <div className="token-details">
                   <p><strong>Access Token:</strong> {tokenData.token?.substring(0, 25)}...</p>
                   <p><strong>Status:</strong> Active</p>
                </div>
                <button className="primary-btn continue-btn">Proceed to Data Request</button>
              </div>
            ) : (
              <button 
                className={`primary-btn aa-connect-btn ${loading ? 'loading' : ''}`} 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? <RefreshCw className="spin" size={20}/> : <Database size={20} />}
                {loading ? 'Connecting to Setu...' : 'Connect an Account'}
              </button>
            )}

            {error && (
              <div className="error-box">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}
            
            <p className="footer-note">By proceeding, you agree to the Account Aggregator Terms & Conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
