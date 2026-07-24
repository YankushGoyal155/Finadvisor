import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { IndianRupee, Plus, Target, Wallet, AlertCircle, TrendingUp, PiggyBank } from 'lucide-react';
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

  const totalBudget = categories.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  const totalActual = categories.reduce((s, c) => s + (Number(c.actual) || 0), 0);

  const handleUpdate = (id, field, value) => {
    let num = value === '' ? '' : Number(value);
    if (num > 999999999) num = 999999999; // Cap at 99.9 Cr to prevent layout break
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: num } : c));
  };

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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', padding: '0 5px' }}>
              <span>Category</span>
              <span>Budget (₹)</span>
              <span>Actual (₹)</span>
            </div>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{cat.name}</span>
                <input 
                  type="number" 
                  value={cat.budget} 
                  onChange={e => handleUpdate(cat.id, 'budget', e.target.value)}
                  className="chat-input"
                  style={{ padding: '8px', borderRadius: '6px' }}
                />
                <input 
                  type="number" 
                  value={cat.actual} 
                  onChange={e => handleUpdate(cat.id, 'actual', e.target.value)}
                  className="chat-input"
                  style={{ padding: '8px', borderRadius: '6px', border: cat.actual > cat.budget ? '1px solid #ef4444' : 'none' }}
                />
              </div>
            ))}
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
  const hasEmergency = onboardingData?.emergencySavings === 'yes';
  // Simulate an emergency fund value based on onboarding context
  const currentEmergency = hasEmergency ? targetEmergency * 0.85 : 0; 

  const [portfolio, setPortfolio] = useState([]);
  const [newAsset, setNewAsset] = useState('');
  const [newValue, setNewValue] = useState('');

  const addAsset = () => {
    if (newAsset && newValue) {
      setPortfolio([...portfolio, { id: Date.now(), name: newAsset, value: Number(newValue) }]);
      setNewAsset('');
      setNewValue('');
    }
  };

  const removeAsset = (id) => setPortfolio(portfolio.filter(a => a.id !== id));

  const totalPortfolio = portfolio.reduce((sum, item) => sum + item.value, 0);

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

        {/* Right Side: Portfolio Tracker */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#8b5cf6" /> Portfolio Overview
          </h4>
          <h3 style={{ fontSize: '1.8rem', color: '#8b5cf6', margin: '0 0 20px 0' }}>₹{totalPortfolio.toLocaleString('en-IN')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {portfolio.map(asset => (
              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', alignItems: 'center' }}>
                <span>{asset.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>₹{asset.value.toLocaleString('en-IN')}</span>
                  <button onClick={() => removeAsset(asset.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Asset (e.g. Stocks)" 
              value={newAsset} 
              onChange={e => setNewAsset(e.target.value)}
              className="chat-input"
              style={{ flex: 1, padding: '10px', borderRadius: '8px' }}
            />
            <input 
              type="number" 
              placeholder="Value (₹)" 
              value={newValue} 
              onChange={e => setNewValue(e.target.value)}
              className="chat-input"
              style={{ width: '100px', padding: '10px', borderRadius: '8px' }}
            />
            <button onClick={addAsset} style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
              <Plus size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
