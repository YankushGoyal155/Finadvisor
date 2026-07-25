import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function MonthlyCheckinPage() {
  const { emiData, goalsData } = useDashboard();
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  
  // States to track changes
  const [netWorth, setNetWorth] = useState(500000);
  const [monthlySavings, setMonthlySavings] = useState(25000);
  const [unexpectedExpenses, setUnexpectedExpenses] = useState('');
  const [healthScore, setHealthScore] = useState(72);
  const [confetti, setConfetti] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);
  
  const handleComplete = () => {
    setCompleted(true);
    setHealthScore(healthScore + Math.floor(Math.random() * 5) + 1); // Bump score
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header" style={{ textAlign: 'center' }}>
        <h1>🗓️ <span className="gradient-text">{currentMonth} Check-in</span></h1>
        <p>Review your progress, update your goals, and build lasting financial habits.</p>
        <div className="ai-status-badge">Monthly Ritual</div>
      </div>

      {!completed ? (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#888' }}>
            <span>Step {step} of 3</span>
            <span>{Math.round((step/3)*100)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '30px' }}>
            <div style={{ width: `${(step/3)*100}%`, height: '100%', background: 'var(--color-green)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
          </div>

          {/* Stepper Content */}
          {step === 1 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💰 Income & Savings</h3>
              <p style={{ color: '#aaa', marginBottom: '20px' }}>Did you hit your savings target this month?</p>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Did you add to your Emergency fund last month?</label>
                <select className="pulse-glow" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <option value="yes" style={{ background: '#0f1729', color: 'white' }}>Yes, I added to it!</option>
                  <option value="no" style={{ background: '#0f1729', color: 'white' }}>No, not this month</option>
                  <option value="used" style={{ background: '#0f1729', color: 'white' }}>I had to use some of it</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Saved/Invested this month (₹)</label>
                <input 
                  type="number" 
                  value={monthlySavings}
                  onChange={e => setMonthlySavings(Number(e.target.value))}
                  className="pulse-glow"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleNext}>Looks Good, Next 👉</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🚨 Spends & Debts</h3>
              <p style={{ color: '#aaa', marginBottom: '20px' }}>Any unexpected expenses popped up?</p>
              
              <div className="form-group">
                <label>Unexpected Expenses (Medical, Car repair, etc.)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={unexpectedExpenses}
                  onChange={e => setUnexpectedExpenses(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Current Total Debt (₹)</label>
                <input 
                  type="number" 
                  value={emiData.principal || 0}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
                <small>Auto-synced from EMI Calculator</small>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button className="btn-secondary" onClick={handlePrev}>Back</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleNext}>Continue 👉</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🎯 Goal Tracker</h3>
              <p style={{ color: '#aaa', marginBottom: '20px' }}>Are we closer to our dreams?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {goalsData.map((g, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>{g.name}</strong>
                      <span style={{ color: 'var(--saffron)' }}>
                        {g.current || g.saved ? Math.round(((g.current || g.saved)/g.target)*100) : 0}% Complete
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                      <div style={{ width: `${g.current || g.saved ? ((g.current || g.saved)/g.target)*100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--saffron))', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={handlePrev}>Back</button>
                <button className="btn-primary pulse-glow" style={{ flex: 1, background: 'var(--green-light)' }} onClick={handleComplete}>✅ Complete {currentMonth} Check-in</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {confetti && (
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none', animation: 'pulse 2s infinite' }}></div>
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
            <h2 style={{ color: 'var(--green-light)', marginBottom: '10px' }}>Check-in Complete!</h2>
            <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>Great job logging your finances. Consistency is the secret to wealth.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.3)' }}>
                <div style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Financial Health Score</div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gold)' }}>{healthScore}<span style={{fontSize: '1rem', color: '#888'}}>/100</span></div>
                <div style={{ color: 'var(--green-light)', fontSize: '14px', marginTop: '5px' }}>↑ +3 points this month</div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>Next check-in scheduled for 1st of next month.</p>
          </div>
        </div>
      )}
    </div>
  );
}
