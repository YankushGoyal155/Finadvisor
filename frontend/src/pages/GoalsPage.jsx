import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

// Stable color palette — no random generation on re-render
const GOAL_COLORS = [
  'hsl(25, 90%, 55%)',   // Saffron
  'hsl(145, 70%, 45%)',  // Green
  'hsl(210, 80%, 55%)',  // Blue
  'hsl(340, 75%, 55%)',  // Rose
  'hsl(280, 70%, 55%)',  // Purple
  'hsl(45, 90%, 55%)',   // Gold
  'hsl(190, 80%, 45%)',  // Teal
  'hsl(0, 75%, 55%)',    // Red
];

const GOAL_ICONS = ['🎯', '🏠', '🚗', '🎓', '💍', '✈️', '👶', '💎'];

export default function GoalsPage() {
  const { goalsData, updateGoals } = useDashboard();
  const [goals, setGoals] = useState([]);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  // Sync with context goals
  useEffect(() => {
    if (goalsData && goalsData.length > 0) {
      const mapped = goalsData.map((g, idx) => ({
        id: g.id || `goal-${idx}-${g.title || g.name}`,
        name: g.title || g.name,
        target: Number(g.target) || 0,
        saved: Number(g.current || g.saved) || 0,
        deadline: g.deadline || '',
        icon: GOAL_ICONS[idx % GOAL_ICONS.length],
        color: GOAL_COLORS[idx % GOAL_COLORS.length],
      }));
      setGoals(mapped);
    }
  }, [goalsData]);

  // Sync local goals back to context
  const syncToContext = useCallback((updatedGoals) => {
    const contextFormat = updatedGoals.map(g => ({
      title: g.name,
      target: g.target,
      current: g.saved,
      deadline: g.deadline || '',
    }));
    updateGoals(contextFormat);
  }, [updateGoals]);

  const addGoal = () => {
    if (!newName || !newTarget) return;
    const idx = goals.length;
    const goal = {
      id: `goal-${Date.now()}`,
      name: newName,
      target: Number(newTarget),
      saved: Number(newCurrent) || 0,
      deadline: newDeadline,
      icon: GOAL_ICONS[idx % GOAL_ICONS.length],
      color: GOAL_COLORS[idx % GOAL_COLORS.length],
    };
    const updated = [...goals, goal];
    setGoals(updated);
    syncToContext(updated);
    setNewName('');
    setNewTarget('');
    setNewCurrent('');
    setNewDeadline('');
  };

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    syncToContext(updated);
  };

  const updateSaved = (id, newAmount) => {
    const updated = goals.map(g => g.id === id ? { ...g, saved: Math.max(0, Number(newAmount) || 0) } : g);
    setGoals(updated);
    syncToContext(updated);
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

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Goals Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Add your first financial goal below, or ask the AI: <strong style={{ color: 'var(--saffron)' }}>"Set a goal to save 10 lakh for a car by Dec 2026"</strong>
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const remaining = g.target - g.saved;
          return (
            <div key={g.id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
              {/* Remove button */}
              <button 
                onClick={() => removeGoal(g.id)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff5050', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                title="Remove goal"
              >✕</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{g.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{g.name}</h3>
                </div>
                <span className={`badge ${pct >= 100 ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '10px' }}>
                  {pct >= 100 ? '✅ Done' : `${pct}%`}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>₹{g.saved.toLocaleString('en-IN')}</span>
                  <span>₹{g.target.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--navy-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: g.color, height: '100%', boxShadow: `0 0 10px ${g.color}66`, transition: 'width 1s ease-out', borderRadius: '4px' }}></div>
                </div>
              </div>

              {g.deadline && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  📅 Deadline: <strong style={{ color: 'var(--text-secondary)' }}>{g.deadline}</strong>
                </div>
              )}

              <div className="stat-item" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="label">REMAINING</div>
                <div className="value" style={{ fontSize: '15px' }}>₹{remaining.toLocaleString('en-IN')}</div>
              </div>

              {/* Quick update saved amount */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input 
                  type="number" 
                  placeholder="Update saved ₹" 
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--navy-border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateSaved(g.id, e.target.value); e.target.value = ''; } }}
                />
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input?.value) { updateSaved(g.id, input.value); input.value = ''; }
                  }}
                >Update</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input 
              className="btn-secondary" 
              style={{ textAlign: 'left', background: 'var(--navy-mid)', cursor: 'text', fontSize: '13px' }} 
              placeholder="Target Amount (₹)" 
              type="number"
              min="0"
              value={newTarget} 
              onChange={(e) => setNewTarget(e.target.value)} 
            />
            <input 
              className="btn-secondary" 
              style={{ textAlign: 'left', background: 'var(--navy-mid)', cursor: 'text', fontSize: '13px' }} 
              placeholder="Already Saved (₹)" 
              type="number"
              min="0"
              value={newCurrent} 
              onChange={(e) => setNewCurrent(e.target.value)} 
            />
          </div>
          <input 
            className="btn-secondary" 
            style={{ textAlign: 'left', background: 'var(--navy-mid)', cursor: 'text', fontSize: '13px' }} 
            placeholder="Deadline (e.g. 2026-12)" 
            value={newDeadline} 
            onChange={(e) => setNewDeadline(e.target.value)} 
          />
          <button className="btn-primary" onClick={addGoal} style={{ fontSize: '13px' }}>+ Add Goal</button>
        </div>
      </div>
    </div>
  );
}
