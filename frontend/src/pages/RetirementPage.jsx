import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function RetirementPage() {
  const { retirementData } = useDashboard();
  const [age, setAge] = useState(retirementData.currentAge);
  const [retireAge, setRetireAge] = useState(retirementData.retirementAge);
  const [expenses, setExpenses] = useState(retirementData.monthlyExpense);
  const [inflation, setInflation] = useState(retirementData.inflationRate);
  const [portfolioReturn, setPortfolioReturn] = useState(retirementData.expectedReturn);

  useEffect(() => {
    setAge(retirementData.currentAge);
    setRetireAge(retirementData.retirementAge);
    setExpenses(retirementData.monthlyExpense);
    setInflation(retirementData.inflationRate);
    setPortfolioReturn(retirementData.expectedReturn);
  }, [retirementData]);

  const yearsToRetire = retireAge - age;
  const futureMonthlyExpenses = Math.round(expenses * Math.pow(1 + inflation/100, yearsToRetire));
  
  // Rule of 25 for Corpus
  const fireCorpus = futureMonthlyExpenses * 12 * 25;
  
  // SIP needed to reach corpus
  const r = portfolioReturn / 12 / 100;
  const n = yearsToRetire * 12;
  const sipNeeded = Math.round(fireCorpus / (((Math.pow(1 + r, n) - 1) / r) * (1 + r)));

  const sipAffordable = sipNeeded < expenses * 0.5;

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>Retirement & <span className="gradient-text">FIRE Planner</span> 🏝️</h1>
        <p>Calculate your Financial Independence, Retire Early (FIRE) target.</p>
        <div className="ai-status-badge">✨ AI-Controlled</div>
      </div>

      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">🕒 Your Timeline</h3>
          
          <div className="input-group">
            <div className="input-label"><span>Current Age</span><span>{age} years</span></div>
            <input type="range" min="18" max="70" step="1" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label"><span>Retirement Age</span><span>{retireAge} years</span></div>
            <input type="range" min={age + 1} max="80" step="1" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label"><span>Current Monthly Expenses</span><span>₹{expenses.toLocaleString('en-IN')}</span></div>
            <input type="range" min="10000" max="1000000" step="5000" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} />
          </div>

          <div className="stats-grid" style={{ marginTop: '20px' }}>
            <div className="stat-item">
              <div className="label">Inflation (%)</div>
              <input type="number" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--saffron)', fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-main)', outline: 'none' }} />
            </div>
            <div className="stat-item">
              <div className="label">Return (%)</div>
              <input type="number" value={portfolioReturn} onChange={(e) => setPortfolioReturn(Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--green-light)', fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-main)', outline: 'none' }} />
            </div>
          </div>

          {/* Timeline visual */}
          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--navy-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--navy-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>Now ({age}y)</span>
              <span>{yearsToRetire} years to go</span>
              <span>Retire ({retireAge}y)</span>
            </div>
            <div style={{ height: '6px', background: 'var(--navy-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (age / retireAge) * 100)}%`, background: 'var(--gradient-saffron)', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        </div>

        <div className="results-card">
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="result-label">Monthly Expense at Retirement</div>
            <div className="result-value" style={{ fontSize: '32px' }}>₹{futureMonthlyExpenses.toLocaleString('en-IN')}</div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Adjusted for {inflation}% inflation over {yearsToRetire} years.
            </p>
          </div>

          <div className="result-main">
            <div className="result-label">Target FIRE Corpus</div>
            <div className="result-value" style={{ fontSize: '44px' }}>₹{(fireCorpus / 10000000).toFixed(2)} Cr</div>
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              ≈ <strong style={{ color: 'var(--text-primary)' }}>₹{fireCorpus.toLocaleString('en-IN')}</strong> needed
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
            <div className={`badge ${sipAffordable ? 'badge-green' : 'badge-saffron'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
              {sipAffordable ? '✅ Achievable' : '⚡ Stretch Goal'}
            </div>
            <div className="result-label">Required Monthly SIP</div>
            <div className="result-value" style={{ fontSize: '36px' }}>₹{sipNeeded.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              To reach target in {yearsToRetire} years at {portfolioReturn}% returns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
