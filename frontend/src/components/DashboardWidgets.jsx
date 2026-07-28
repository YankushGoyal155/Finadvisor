import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { IndianRupee, Plus, Target, Wallet, AlertCircle, TrendingUp, PiggyBank, HeartPulse, ShieldCheck, Briefcase, Calendar, Calculator as CalculatorIcon, ArrowRight, ArrowUpRight, Flame, Hourglass } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import '../pages/ToolPage.css'; // Inheriting dashboard styling

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
const EXPENSE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];

// ─── 1. Income Overview Widget ───
export function IncomeOverviewWidget() {
  const { onboardingData } = useDashboard();
  
  // Base salary from context or default to 100000 per user request
  const defaultSalary = parseInt(onboardingData?.monthlySalary || '100000', 10);
  
  const [sources, setSources] = useState([
    { id: 1, name: 'Monthly Salary', amount: defaultSalary, type: 'fixed' }
  ]);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAddSource = () => {
    if (newName && newAmount) {
      setSources([...sources, { id: Date.now(), name: newName, amount: Number(newAmount), type: 'extra' }]);
      setNewName('');
      setNewAmount('');
    }
  };

  const removeSource = (id) => {
    setSources(sources.filter(s => s.id !== id));
  }

  const totalMonthlyIncome = sources.reduce((sum, item) => sum + item.amount, 0);
  const totalAnnualIncome = totalMonthlyIncome * 12;

  // Chart data
  const pieData = sources.map(s => ({ name: s.name, value: s.amount }));

  return (
    <div id="income-overview" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <IndianRupee size={24} color="#10b981" />
        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Income Overview</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Summary & Actions */}
        <div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px' }}>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>Total Monthly Income</p>
            <h3 style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>₹{totalMonthlyIncome.toLocaleString('en-IN')}</h3>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              Projected Annual Income: <strong style={{ color: '#fff' }}>₹{totalAnnualIncome.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <h4 style={{ color: '#e2e8f0', marginBottom: '12px' }}>Income Sources</h4>
          {sources.map(source => (
            <div key={source.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px' }}>
              <span>{source.name}</span>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <span style={{ fontWeight: 'bold' }}>₹{source.amount.toLocaleString('en-IN')}</span>
                {source.type !== 'fixed' && (
                  <button onClick={() => removeSource(source.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <input 
              type="text" 
              placeholder="e.g. Rental, Bonus" 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              className="chat-input"
              style={{ flex: 1, padding: '10px', borderRadius: '8px' }}
            />
            <input 
              type="number" 
              placeholder="Amount (₹)" 
              value={newAmount} 
              onChange={e => setNewAmount(e.target.value)}
              className="chat-input"
              style={{ width: '120px', padding: '10px', borderRadius: '8px' }}
            />
            <button onClick={handleAddSource} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Right Side: Pie Chart */}
        <div style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Expense Tracker Widget ───
export function ExpenseTrackerWidget() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Utilities', budget: 5000, actual: 0 },
    { id: 2, name: 'Groceries', budget: 12000, actual: 0 },
    { id: 3, name: 'Transportation', budget: 4000, actual: 0 },
    { id: 4, name: 'Entertainment', budget: 6000, actual: 0 },
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');

  const totalBudget = categories.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  const totalActual = categories.reduce((s, c) => s + (Number(c.actual) || 0), 0);

  const handleUpdate = (id, field, value) => {
    let num = value === '' ? '' : Number(value);
    if (num > 999999999) num = 999999999; // Cap at 99.9 Cr to prevent layout break
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: num } : c));
  };

  const addCategory = () => {
    if (newCatName && newCatBudget) {
      setCategories([...categories, { id: Date.now(), name: newCatName, budget: Number(newCatBudget), actual: 0 }]);
      setNewCatName('');
      setNewCatBudget('');
    }
  };

  const removeCategory = (id) => setCategories(categories.filter(c => c.id !== id));

  return (
    <div id="expense-tracker" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Wallet size={24} color="#f59e0b" />
        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Expense Tracker & Budgeting</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Controls */}
        <div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#94a3b8' }}>Total Budget</p>
              <h4 style={{ margin: 0, fontSize: '1.4rem', wordBreak: 'break-all' }}>₹{totalBudget.toLocaleString('en-IN')}</h4>
            </div>
            <div style={{ flex: 1, background: totalActual > totalBudget ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '10px', border: totalActual > totalBudget ? '1px solid rgba(239, 68, 68, 0.3)' : 'none', minWidth: 0 }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: totalActual > totalBudget ? '#ef4444' : '#3b82f6' }}>Actual Spending</p>
              <h4 style={{ margin: 0, fontSize: '1.4rem', color: totalActual > totalBudget ? '#ef4444' : '#fff', wordBreak: 'break-all' }}>₹{totalActual.toLocaleString('en-IN')}</h4>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1.8fr) 1fr 1fr auto', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', padding: '0 5px' }}>
              <span>Category</span>
              <span>Budget (₹)</span>
              <span>Actual (₹)</span>
              <span style={{width: '20px'}}></span>
            </div>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1.8fr) 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, wordBreak: 'break-word', fontSize: '0.9rem' }}>{cat.name}</span>
                <input 
                  type="number" 
                  value={cat.budget} 
                  onChange={e => handleUpdate(cat.id, 'budget', e.target.value)}
                  className="chat-input"
                  style={{ padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}
                />
                <input 
                  type="number" 
                  value={cat.actual} 
                  onChange={e => handleUpdate(cat.id, 'actual', e.target.value)}
                  className="chat-input"
                  style={{ padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box', border: cat.actual > cat.budget ? '1px solid #ef4444' : 'none' }}
                />
                <button onClick={() => removeCategory(cat.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 5px', fontSize: '18px', fontWeight: 'bold' }}>×</button>
              </div>
            ))}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="New Category"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="chat-input"
                style={{ flex: 1, padding: '10px', borderRadius: '8px', minWidth: '0' }}
              />
              <input 
                type="number" 
                placeholder="Budget (₹)" 
                value={newCatBudget}
                onChange={e => setNewCatBudget(e.target.value)}
                className="chat-input"
                style={{ width: '90px', padding: '10px', borderRadius: '8px' }}
              />
              <button onClick={addCategory} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', flexShrink: 0 }}>
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
              <YAxis stroke="#cbd5e1" fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f1729', border: '1px solid #1e293b' }} />
              <Legend />
              <Bar dataKey="budget" name="Budget Limit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Savings & Investments Widget ───
export function SavingsInvestmentsWidget() {
  const { onboardingData, goalsData } = useDashboard();
  
  const monthlyExpenses = Number(onboardingData?.monthlyExpenses) || 40000;
  const targetEmergency = monthlyExpenses * 6;
  const emergencyVal = onboardingData?.emergencySavings;
  const hasEmergency = emergencyVal && emergencyVal !== 'no';
  
  let currentEmergency = 0;
  if (emergencyVal === 'yes') {
    currentEmergency = targetEmergency * 0.85; // Simulated fallback
  } else if (!isNaN(Number(emergencyVal)) && Number(emergencyVal) > 0) {
    currentEmergency = Number(emergencyVal);
  }



  return (
    <div id="savings-investments" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <PiggyBank size={24} color="#ec4899" />
        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Savings and Investments</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Emergency Fund & Goals (from Context) */}
        <div>
          {/* Emergency Fund Block */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#3b82f6" /> Emergency Fund Status
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Current: <strong style={{color:'#fff'}}>₹{currentEmergency.toLocaleString('en-IN')}</strong></span>
              <span style={{color:'#94a3b8'}}>Target (6mo): ₹{targetEmergency.toLocaleString('en-IN')}</span>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (currentEmergency/targetEmergency)*100 || 0)}%`, height: '100%', background: currentEmergency >= targetEmergency ? '#10b981' : '#3b82f6' }}></div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: currentEmergency >= targetEmergency ? '#10b981' : '#f59e0b' }}>
              {currentEmergency >= targetEmergency ? 'Adequately funded! 🎉' : 'Needs attention to cover 6 months expenses.'}
            </p>
          </div>

          {/* Investment Goals */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="#ec4899" /> Active Investment Goals
            </h4>
            {goalsData && goalsData.length > 0 ? (
              goalsData.map(goal => {
                const pct = Math.min(100, Math.round(((goal.current || goal.saved || 0) / goal.target) * 100));
                return (
                  <div key={goal.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>{goal.title}</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#ec4899' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No goals set. Visit Goal Planner to add some!</p>
            )}
          </div>
        </div>

        {/* Right Side: Monthly Savings */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#8b5cf6" /> Monthly Savings Rate
          </h4>
          
          <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 5px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Target Monthly Savings</p>
            <h3 style={{ fontSize: '2.4rem', color: '#8b5cf6', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              ₹{Number(onboardingData?.monthlySavings || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          
          <div style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5' }}>
            <p style={{ marginBottom: '10px' }}>This metric tells the AI how much liquid cash you aim to save each month apart from your fixed investments (SIPs).</p>
            <p style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <strong>💡 Tip:</strong> Try asking the AI Advisor:<br/> <i>"Set my monthly savings to 50000"</i>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 4. Financial Goals Widget ───
export function FinancialGoalsWidget() {
  const [goals, setGoals] = useState([
    { id: 1, title: 'House Downpayment', target: 2000000, current: 500000, deadline: '2028-12-31', priority: 'High' },
    { id: 2, title: 'Dream Vacation', target: 300000, current: 150000, deadline: '2027-06-15', priority: 'Medium' }
  ]);
  
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  const addGoal = () => {
    if (newTitle && newTarget && newDeadline) {
      setGoals([...goals, {
        id: Date.now(),
        title: newTitle,
        target: Number(newTarget),
        current: Number(newCurrent) || 0,
        deadline: newDeadline,
        priority: newPriority
      }]);
      setNewTitle('');
      setNewTarget('');
      setNewCurrent('');
      setNewDeadline('');
    }
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const priorityColors = { 'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#10b981' };

  // Sort by priority (High, Medium, Low)
  const sortedGoals = [...goals].sort((a, b) => {
    const p = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return p[a.priority] - p[b.priority];
  });

  return (
    <div id="financial-goals" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Target size={24} color="#ec4899" />
        <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#fdfdfd' }}>Financial Goals (Advanced)</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Active Goals tracking */}
        <div>
          <h4 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Flame size={18} color="#f59e0b"/> My Priorities</h4>
          {sortedGoals.length === 0 ? (
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
              No goals set. Create one to start tracking your dreams!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedGoals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={g.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: priorityColors[g.priority] }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ marginLeft: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc' }}>{g.title}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: `${priorityColors[g.priority]}20`, color: priorityColors[g.priority], fontWeight: 'bold' }}>{g.priority}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Calendar size={12}/> Target: {g.deadline}</span>
                      </div>
                      <button onClick={() => removeGoal(g.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}>×</button>
                    </div>
                    
                    <div style={{ margin: '0 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1' }}>₹{g.current.toLocaleString('en-IN')} / ₹{g.target.toLocaleString('en-IN')}</span>
                        <span style={{ fontWeight: 'bold', color: '#ec4899' }}>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #db2777, #ec4899)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                      </div>
                      {pct >= 100 && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Goal Achieved! 🏆</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goal Creation Form */}
        <div style={{ background: 'rgba(236, 72, 153, 0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#ec4899" /> Create New Goal
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Goal Name</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. New Car" className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Target Amount (₹)</label>
                <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="1000000" className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Currently Saved (₹)</label>
                <input type="number" value={newCurrent} onChange={e => setNewCurrent(e.target.value)} placeholder="0" className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Target Date</label>
                <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                  <option value="High" style={{ background: '#0f1729' }}>High</option>
                  <option value="Medium" style={{ background: '#0f1729' }}>Medium</option>
                  <option value="Low" style={{ background: '#0f1729' }}>Low</option>
                </select>
              </div>
            </div>

            <button onClick={addGoal} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ec4899, #be185d)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)', transition: 'all 0.2s' }} className="pulse-glow">
              Add Financial Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Insurance Overview Widget ───
export function InsuranceOverviewWidget() {
  const [policies, setPolicies] = useState([
    { id: 1, name: 'Family Health Cover', provider: 'HDFC Ergo', type: 'Health', sumInsured: 1000000, premium: 15000, renewalDate: '2027-02-14' },
    { id: 2, name: 'Term Life Insurance', provider: 'LIC India', type: 'Life', sumInsured: 10000000, premium: 12000, renewalDate: '2027-08-20' }
  ]);

  // Needs Assessment Calculator State
  const [annIncome, setAnnIncome] = useState(1200000);
  const [liab, setLiab] = useState(2000000); 
  const [existingLife, setExistingLife] = useState(0);
  
  // Basic Human Life Value (HLV) calculation approximation
  const calcLifeNeed = () => {
    const val = (Number(annIncome) * 15) + Number(liab) - Number(existingLife);
    return val > 0 ? val : 0;
  };

  return (
    <div id="insurance-overview" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '150px', background: 'linear-gradient(0deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <ShieldCheck size={24} color="#3b82f6" />
        <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#fdfdfd' }}>Insurance Overview</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Active Policies Tracker */}
        <div>
          <h4 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><HeartPulse size={18} color="#10b981"/> My Policies</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {policies.map(p => {
              const daysToRenew = Math.ceil((new Date(p.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysToRenew <= 30 && daysToRenew > 0;
              return (
                <div key={p.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: p.type === 'Health' ? '#10b981' : '#3b82f6' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc', marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.provider} • {p.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>₹{(p.sumInsured / 100000).toFixed(0)}L Cover</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prem: ₹{p.premium.toLocaleString('en-IN')}/yr</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}><Hourglass size={14} color={isUrgent ? '#ef4444' : '#cbd5e1'}/> Renewal: {p.renewalDate}</span>
                    {isUrgent && <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Due Soon!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Life Insurance Needs Calculator */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalculatorIcon size={18} color="#3b82f6" /> Needs Assessment
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>Calculate recommended life cover based on Human Life Value (HLV).</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Annual Income (₹)</label>
              <input type="number" value={annIncome} onChange={e => setAnnIncome(e.target.value)} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Total Liabilities (₹)</label>
              <input type="number" value={liab} onChange={e => setLiab(e.target.value)} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>Existing Cover (₹)</label>
              <input type="number" value={existingLife} onChange={e => setExistingLife(e.target.value)} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Recommended Life Cover:</span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6', margin: '4px 0' }}>₹{(calcLifeNeed() / 10000000).toFixed(2)} Cr</div>
            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Provides ~15x income replacement.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Retirement Planning Widget ───
export function RetirementPlanningWidget() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);

  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const futureMonthlyExpenses = currentMonthlyExpenses * Math.pow(1 + (inflation / 100), yearsToRetire);
  const futureAnnualExpenses = futureMonthlyExpenses * 12;
  const requiredCorpus = futureAnnualExpenses * 25; 
  
  const rate = 12 / 100;
  const annualSavingsNeeded = requiredCorpus > 0 && yearsToRetire > 0 
    ? (requiredCorpus * rate) / (Math.pow(1 + rate, yearsToRetire) - 1) 
    : 0;

  const projData = [];
  if (yearsToRetire > 0) {
    for(let i=0; i<=yearsToRetire; i+= Math.max(1, Math.floor(yearsToRetire/5))) {
      const acc = annualSavingsNeeded * ((Math.pow(1 + rate, i) - 1) / rate);
      projData.push({ age: currentAge + i, value: Math.round(acc) });
    }
    if (projData[projData.length - 1].age !== retireAge) {
      projData.push({ age: retireAge, value: Math.round(requiredCorpus) });
    }
  }

  return (
    <div id="retirement-planning" className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Briefcase size={24} color="#10b981" />
        <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#fdfdfd' }}>Retirement Planning</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Current Age</label>
              <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#10b981', marginBottom: '6px' }}>Retirement Age</label>
              <input type="number" value={retireAge} onChange={e => setRetireAge(Number(e.target.value))} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Monthly Expenses Today (₹)</label>
            <input type="number" value={currentMonthlyExpenses} onChange={e => setCurrentMonthlyExpenses(Number(e.target.value))} className="chat-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>Future Lifestyle at Age {retireAge} (@{inflation}% inflation):</div>
             <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f59e0b' }}>₹{Math.round(futureMonthlyExpenses).toLocaleString('en-IN')}<span style={{fontSize:'0.9rem', color:'#94a3b8', fontWeight:400}}>/mo</span></div>
          </div>
          
          <div style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 95, 70, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '4px' }}>Target Retirement Corpus (25x):</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ₹{(requiredCorpus / 10000000).toFixed(2)} 
              <span style={{ fontSize: '1rem', color: '#a7f3d0', fontWeight: 500, alignSelf:'flex-end', marginBottom:'6px' }}>Cr</span>
            </div>
            
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>Required SIP:</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>₹{Math.round(annualSavingsNeeded / 12).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--navy-dark)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '320px' }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '0.95rem' }}>Projected Corpus (12% CAGR)</h4>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="age" stroke="#cbd5e1" fontSize={11} tickFormatter={(val) => `Age ${val}`} />
                <YAxis stroke="#cbd5e1" fontSize={11} tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} width={45} />
                <Tooltip 
                  contentStyle={{ background: '#0f1729', border: '1px solid #1e293b', borderRadius: '8px' }} 
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(val) => `₹${(val / 10000000).toFixed(2)} Cr`}
                  labelFormatter={(val) => `Age: ${val}`}
                />
                <Bar dataKey="value" fill="url(#colorValue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

