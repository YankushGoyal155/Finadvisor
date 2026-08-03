import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function InvestmentPage() {
  const { investData } = useDashboard();
  const [monthly, setMonthly] = useState(investData.monthlyAmount);
  const [rate, setRate] = useState(investData.expectedReturn);
  const [years, setYears] = useState(investData.timeHorizon);

  useEffect(() => {
    setMonthly(investData.monthlyAmount);
    setRate(investData.expectedReturn);
    setYears(investData.timeHorizon);
  }, [investData]);

  const calcSIP = (p, r, n) => {
    const mr = r / 12 / 100;
    const months = n * 12;
    if (mr === 0) return p * months;
    return Math.round(p * (((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr)));
  };

  const totalInvested = monthly * years * 12;
  const futureValue = (monthly > 0 && rate > 0 && years > 0) ? calcSIP(monthly, rate, years) : totalInvested;
  const wealthGained = futureValue - totalInvested;
  const gainPct = futureValue > 0 ? Math.round((wealthGained / futureValue) * 100) : 0;



  const presets = [
    { name: 'Fixed Deposit (FD)', rate: 7.0, risk: 'Zero', icon: '🏦' },
    { name: 'Recurring Deposit (RD)', rate: 6.5, risk: 'Zero', icon: '🔄' },
    { name: 'PPF (Govt)', rate: 7.1, risk: 'Zero', icon: '🏛️' },
    { name: 'EPF (Provident Fund)', rate: 8.25, risk: 'Zero', icon: '🏢' },
  ];

  const riskColor = (risk) => {
    if (risk === 'Zero') return 'var(--green-light)';
    if (risk === 'Low') return 'var(--green-light)';
    if (risk === 'Medium') return 'var(--gold)';
    return 'var(--red-accent)';
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>SIP & Wealth <span className="gradient-text">Calculator</span> 📈</h1>
        <p>Plan your long-term wealth creation through the power of compounding.</p>
        <div className="ai-status-badge">✨ AI-Controlled</div>
      </div>

      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">⚙️ Investment Parameters</h3>
          
          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Monthly SIP Amount</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{color: 'var(--text-muted)'}}>₹</span>
                <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value) || 0)} style={{width: '120px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
              </div>
            </div>
            <input type="range" min="500" max="200000" step="500" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Expected Return (Annual)</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="number" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} style={{width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
                <span style={{color: 'var(--text-muted)'}}>%</span>
              </div>
            </div>
            <input type="range" min="1" max="30" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label" style={{alignItems: 'center'}}>
              <span>Time Horizon (Years)</span>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 0)} style={{width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white', fontSize: '14px'}} />
                <span style={{color: 'var(--text-muted)'}}>y</span>
              </div>
            </div>
            <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Fixed Income Presets</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {presets.map((p, i) => (
                <button key={i} onClick={() => setRate(p.rate)} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{p.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'white' }}>{p.name}</strong>
                    <span style={{ fontSize: '10px', color: riskColor(p.risk) }}>{p.rate}% Return</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="results-card">
          <div className="result-main">
            <div className="result-label">Estimated Wealth in {years} Years</div>
            <div className="result-value">₹{futureValue.toLocaleString('en-IN')}</div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="label">Total Invested</div>
              <div className="value">₹{totalInvested.toLocaleString('en-IN')}</div>
            </div>
            <div className="stat-item">
              <div className="label">Wealth Gained</div>
              <div className="value" style={{ color: 'var(--green-light)' }}>+₹{wealthGained.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>📊 Wealth Breakdown</div>
            <div style={{ height: '20px', background: 'var(--navy-border)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${100 - gainPct}%`, background: 'var(--navy-mid)', height: '100%' }}></div>
              <div style={{ flex: 1, background: 'var(--gradient-saffron)', height: '100%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Invested: {100 - gainPct}%</span>
              <span style={{ color: 'var(--saffron)' }}>Gains: {gainPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
