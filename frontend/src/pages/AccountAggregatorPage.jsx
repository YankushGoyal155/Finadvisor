import React, { useState } from 'react';
import './AccountAggregatorPage.css';
import { Database, ShieldCheck, FileText, CheckCircle2, AlertCircle, RefreshCw, BarChart, ExternalLink, Clock, ArrowRight, Phone } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AccountAggregatorPage() {
  const [step, setStep] = useState('start'); // start | loading | consent_created | checking | approved | data_ready | error
  const [mobile, setMobile] = useState('');
  const [consentId, setConsentId] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [error, setError] = useState('');

  // Step 1: Create consent request
  const handleCreateConsent = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep('loading');
    setError('');
    try {
      const res = await fetch(`${API}/setu/create-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setConsentId(data.consent_id);
        setRedirectUrl(data.redirect_url);
        setStep('consent_created');
      } else {
        setError(data.message || 'Failed to create consent request.');
        setStep('error');
      }
    } catch (err) {
      setError(err.message || 'Connection error.');
      setStep('error');
    }
  };

  // Step 2: Check consent status
  const handleCheckStatus = async () => {
    if (!consentId) return;
    setStep('checking');
    setError('');
    try {
      const res = await fetch(`${API}/setu/consent-status/${consentId}`);
      const data = await res.json();
      if (data.status === 'success') {
        const consentStatus = data.data?.status;
        if (consentStatus === 'APPROVED' || consentStatus === 'ACTIVE') {
          setStep('approved');
        } else if (consentStatus === 'REJECTED') {
          setError('Consent was rejected. Please try again.');
          setStep('error');
        } else {
          setError(`Consent is still ${consentStatus || 'PENDING'}. Please approve the request on the Setu page first, then check again.`);
          setStep('consent_created');
        }
      } else {
        setError(data.message || 'Failed to check consent status.');
        setStep('consent_created');
      }
    } catch (err) {
      setError(err.message);
      setStep('consent_created');
    }
  };

  // Step 3: Fetch financial data
  const handleFetchData = async () => {
    if (!consentId) return;
    setStep('checking');
    setError('');
    try {
      const res = await fetch(`${API}/setu/fetch-data/${consentId}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setFinancialData(data.data);
        setStep('data_ready');
      } else {
        setError(data.message || 'Failed to fetch financial data.');
        setStep('approved');
      }
    } catch (err) {
      setError(err.message);
      setStep('approved');
    }
  };

  const handleRestart = () => {
    setStep('start');
    setMobile('');
    setConsentId(null);
    setRedirectUrl(null);
    setFinancialData(null);
    setError('');
  };

  return (
    <div className="aa-wrapper fade-in">
      <div className="aa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="gradient-text">Account Aggregator</h1>
          <span className="setu-badge">Powered by Setu</span>
        </div>
        <p>Securely link your Mutual Funds, Tax, GST, and Banking data for comprehensive AI financial insights.</p>
      </div>

      {/* Stepper */}
      <div className="aa-stepper">
        <div className={`stepper-step ${step === 'start' || step === 'loading' ? 'active' : (step !== 'start' ? 'done' : '')}`}>
          <div className="step-circle">1</div>
          <span>Enter Mobile</span>
        </div>
        <div className="stepper-line"></div>
        <div className={`stepper-step ${step === 'consent_created' ? 'active' : (['approved','checking','data_ready'].includes(step) ? 'done' : '')}`}>
          <div className="step-circle">2</div>
          <span>Approve Consent</span>
        </div>
        <div className="stepper-line"></div>
        <div className={`stepper-step ${step === 'approved' ? 'active' : (step === 'data_ready' ? 'done' : '')}`}>
          <div className="step-circle">3</div>
          <span>Fetch Data</span>
        </div>
      </div>

      <div className="aa-grid">
        {/* Left: Info card */}
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

          <div className="aa-how-it-works">
            <h3>How it works</h3>
            <div className="flow-steps">
              <div className="flow-step">
                <Phone size={18} />
                <span>Enter your mobile number linked to your bank</span>
              </div>
              <ArrowRight size={14} className="flow-arrow" />
              <div className="flow-step">
                <ExternalLink size={18} />
                <span>Approve consent on Setu's secure page</span>
              </div>
              <ArrowRight size={14} className="flow-arrow" />
              <div className="flow-step">
                <Database size={18} />
                <span>Your data syncs to your Finance AI dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action card */}
        <div className="aa-card action-card">
          <div className="data-sync-box">

            {/* STEP: START — Enter mobile */}
            {step === 'start' && (
              <>
                <Database size={48} className="setu-logo-icon" />
                <h2>Link Your Financial Data</h2>
                <p className="sync-desc">Enter the mobile number that is linked to your bank accounts, mutual funds, or GST profile.</p>
                <div className="mobile-input-group">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="mobile-input"
                    maxLength={10}
                  />
                </div>
                <button className="primary-btn aa-connect-btn" onClick={handleCreateConsent}>
                  <Database size={20} /> Create Consent Request
                </button>
              </>
            )}

            {/* STEP: LOADING */}
            {step === 'loading' && (
              <div className="loading-state">
                <RefreshCw className="spin" size={48} />
                <h2>Creating Consent Request...</h2>
                <p>Communicating securely with Setu Account Aggregator</p>
              </div>
            )}

            {/* STEP: CONSENT CREATED — redirect user */}
            {step === 'consent_created' && (
              <div className="consent-created-state">
                <CheckCircle2 size={48} className="success-icon-lg" />
                <h2>Consent Request Created!</h2>
                <div className="consent-info-box">
                  <p><strong>Consent ID:</strong> <code>{consentId}</code></p>
                  <p><strong>Status:</strong> <span className="status-pending">PENDING APPROVAL</span></p>
                </div>
                <p className="sync-desc">Click below to open Setu's secure consent approval page. Approve the request there, then come back and check the status.</p>
                <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="primary-btn redirect-btn">
                  <ExternalLink size={20} /> Open Consent Page
                </a>
                <button className="secondary-btn status-btn" onClick={handleCheckStatus}>
                  <Clock size={18} /> Check Consent Status
                </button>
              </div>
            )}

            {/* STEP: CHECKING */}
            {step === 'checking' && (
              <div className="loading-state">
                <RefreshCw className="spin" size={48} />
                <h2>Checking...</h2>
                <p>Verifying consent status with Setu</p>
              </div>
            )}

            {/* STEP: APPROVED */}
            {step === 'approved' && (
              <div className="approved-state">
                <CheckCircle2 size={48} className="success-icon-lg" />
                <h2>Consent Approved! ✅</h2>
                <p className="sync-desc">Your consent has been approved. Now fetch your financial data.</p>
                <button className="primary-btn fetch-btn" onClick={handleFetchData}>
                  <Database size={20} /> Fetch My Financial Data
                </button>
              </div>
            )}

            {/* STEP: DATA READY */}
            {step === 'data_ready' && (
              <div className="data-ready-state">
                <CheckCircle2 size={48} className="success-icon-lg" />
                <h2>Data Synced Successfully! 🎉</h2>
                <div className="data-preview-box">
                  <pre>{JSON.stringify(financialData, null, 2)}</pre>
                </div>
                <button className="secondary-btn" onClick={handleRestart}>
                  <RefreshCw size={18} /> Start New Sync
                </button>
              </div>
            )}

            {/* STEP: ERROR */}
            {step === 'error' && (
              <div className="error-state">
                <AlertCircle size={48} className="error-icon-lg" />
                <h2>Something Went Wrong</h2>
                <p className="error-msg">{error}</p>
                <button className="primary-btn" onClick={handleRestart}>
                  <RefreshCw size={18} /> Try Again
                </button>
              </div>
            )}

            {/* Inline error */}
            {error && step !== 'error' && (
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
