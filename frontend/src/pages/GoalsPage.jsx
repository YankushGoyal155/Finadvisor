import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function GoalsPage() {
  const { goalsData } = useDashboard();
  const [goals, setGoals] = useState([]);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Sync with AI goals
  useEffect(() => {
    if (goalsData) {
      // Map context keys to local component keys
      const mapped = goalsData.map(g => ({
        id: g.id || Date.now() + Math.random(),
        name: g.title || g.name,
        target: g.target,
        saved: g.current || g.saved || 0,
        icon: '🎯',
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }));
      setGoals(mapped);
    }
  }, [goalsData]);

  const addGoal = () => {
    if (!newName || !newTarget) return;
    const goal = {
      id: Date.now(),
      name: newName,
      target: Number(newTarget),
      saved: 0,
      icon: '🎯',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    setGoals([...goals, goal]);
    setNewName('');
    setNewTarget('');
  };

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="tool-page fade-in">
      <div className="tool-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Financial <span className="gradient-text">Goals</span> 🎯</h1>
          <p>Track your progress towards life's milestones.</p>
          <div className="ai-status-badge">✨ AI-Controlled</div>
        </div>
        <div className="badge badge-gold" style={{ padding: '8px 16px', fontSize: '12px' }}>
          📊 Overall: {overallPct}% complete
        </div>
      </div>

      {/* Overall Progress */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Total Saved: <strong style={{ color: 'var(--green-light)' }}>₹{totalSaved.toLocaleString('en-IN')}</strong></span>
          <span>Total Target: <strong style={{ color: 'var(--text-primary)' }}>₹{totalTarget.toLocaleString('en-IN')}</strong></span>
        </div>
        <div style={{ height: '8px', background: 'var(--navy-border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${overallPct}%`, background: 'var(--gradient-saffron)', height: '100%', transition: 'width 1s ease-out', borderRadius: '4px' }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return (
            <div key={g.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{g.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{g.name}</h3>
                </div>
                <span className="badge badge-gold" style={{ fontSize: '10px' }}>{pct}%</span>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>₹{g.saved.toLocaleString('en-IN')}</span>
                  <span>₹{g.target.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--navy-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: g.color, height: '100%', boxShadow: `0 0 10px ${g.color}66`, transition: 'width 1s ease-out', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div className="stat-item" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="label">REMAINING</div>
                <div className="value" style={{ fontSize: '15px' }}>₹{(g.target - g.saved).toLocaleString('en-IN')}</div>
              </div>
            </div>
          );
        })}

        {/* Add Goal Card */}
        <div className="glass-card" style={{ padding: '24px', border: '2px dashed var(--navy-border)', background: 'transparent', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '4px', textAlign: 'center' }}>✨ Add New Goal</h3>
          <input 
            className="btn-secondary" 
            style={{ textAlign: 'left', background: 'var(--navy-mid)', cursor: 'text', fontSize: '13px' }} 
            placeholder="Goal Name (e.g. Wedding)" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <input 
            className="btn-secondary" 
            style={{ textAlign: 'left', background: 'var(--navy-mid)', cursor: 'text', fontSize: '13px' }} 
            placeholder="Target Amount (₹)" 
            type="number"
            value={newTarget} 
            onChange={(e) => setNewTarget(e.target.value)} 
          />
          <button className="btn-primary" onClick={addGoal} style={{ fontSize: '13px' }}>+ Add Goal</button>
        </div>
      </div>
    </div>
  );
}
