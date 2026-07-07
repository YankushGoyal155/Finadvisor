import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function EMICalculatorPage() {
  const { emiData, updateEmi, onboardingData } = useDashboard();
  const isBusiness = onboardingData?.persona === 'business';
  
  const [principal, setPrincipal] = useState(emiData.principal);
  const [rate, setRate] = useState(emiData.rate);
  const [tenure, setTenure] = useState(emiData.tenure);

  // Sync with AI updates from context
  useEffect(() => {
    setPrincipal(emiData.principal);
    setRate(emiData.rate);
    setTenure(emiData.tenure);
  }, [emiData]);

  const calcEMI = (p, r, t) => {
    const mr = r / 12 / 100;
    const n = t * 12;
    if (mr === 0) return p / n;
    return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  };

  const emi = calcEMI(principal, rate, tenure);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - principal;
  const interestPct = Math.round((totalInterest / totalPayment) * 100);

  const presets = isBusiness ? [
    { name: 'Working Capital', p: 5000000, r: 11.5, t: 5, icon: '🏢' },
    { name: 'Equipment Financing', p: 1500000, r: 10.5, t: 7, icon: '⚙️' },
    { name: 'Commercial Real Estate', p: 15000000, r: 9.0, t: 15, icon: '🏗️' },
    { name: 'Business Overdraft', p: 800000, r: 12.0, t: 2, icon: '💳' },
  ] : [
    { name: 'Home Loan', p: 5000000, r: 8.5, t: 20, icon: '🏠' },
    { name: 'Car Loan', p: 800000, r: 9.5, t: 7, icon: '🚗' },
    { name: 'Education', p: 1500000, r: 10.5, t: 10, icon: '🎓' },
    { name: 'Personal', p: 500000, r: 12.0, t: 5, icon: '💳' },
  ];

  const handleManualChange = (setter, key, value) => {
    setter(value);
    // updateEmi({ [key]: value }); // Optional: sync back to context
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>{isBusiness ? 'Business EMI' : 'Loan EMI'} <span className="gradient-text">Calculator</span> 🏦</h1>
        <p>{isBusiness ? 'Estimate monthly payments for Working Capital, Machinery, and Business Term Loans.' : 'Estimate your monthly payments for home, car, or personal loans.'}</p>
        <div className="ai-status-badge">✨ AI-Controlled</div>
      </div>

      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">✍️ Loan Details</h3>
          
          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Loan Amount (Principal)</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{color: 'var(--text-muted)'}}>₹</span>
                <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value) || 0)} style={{width: '120px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
              </div>
            </div>
            <input type="range" min="100000" max="20000000" step="50000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Interest Rate (%)</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} style={{width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
                <span style={{color: 'var(--text-muted)'}}>%</span>
              </div>
            </div>
            <input type="range" min="1" max="25" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Tenure (Years)</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value) || 0)} style={{width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
                <span style={{color: 'var(--text-muted)'}}>y</span>
              </div>
            </div>
            <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
          </div>
...

          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Loan Presets</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {presets.map((p, i) => (
                <button key={i} onClick={() => { setPrincipal(p.p); setRate(p.r); setTenure(p.t); }} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{p.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>{p.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>₹{(p.p/100000).toFixed(0)}L @ {p.r}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="results-card">
          <div className="result-main" style={{ border: '1px dashed rgba(255, 77, 77, 0.3)', background: 'rgba(255, 77, 77, 0.04)' }}>
            <div className="result-label">Monthly EMI</div>
            <div className="result-value" style={{ color: 'var(--red-accent)' }}>₹{Math.round(emi).toLocaleString('en-IN')}</div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="label">Total Principal</div>
              <div className="value">₹{principal.toLocaleString('en-IN')}</div>
            </div>
            <div className="stat-item">
              <div className="label">Total Interest</div>
              <div className="value" style={{ color: 'var(--red-accent)' }}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>💰 Total Amount Payable</div>
            <div className="result-value" style={{ fontSize: '30px', marginBottom: '14px' }}>₹{Math.round(totalPayment).toLocaleString('en-IN')}</div>
            <div style={{ height: '12px', background: 'var(--navy-border)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${100 - interestPct}%`, background: 'var(--text-secondary)', height: '100%', borderRadius: '6px 0 0 6px' }}></div>
              <div style={{ flex: 1, background: 'var(--red-accent)', height: '100%', borderRadius: '0 6px 6px 0' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Principal: {100 - interestPct}%</span>
              <span style={{ color: 'var(--red-accent)' }}>Interest: {interestPct}%</span>
            </div>
          </div>

          {isBusiness && (
            <div className="glass-card fade-in" style={{ padding: '16px', marginTop: '16px', background: 'rgba(255, 179, 71, 0.08)', border: '1px solid rgba(255, 179, 71, 0.3)' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px', color: '#ffb347' }}>💡 Business Tax Write-Off</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                You can potentially claim the total interest of <strong>₹{Math.round(totalInterest).toLocaleString('en-IN')}</strong> as a business expense against your corporate revenue, effectively reducing your corporate tax liability!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
