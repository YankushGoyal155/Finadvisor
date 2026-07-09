import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNotification } from '../context/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CalendarDays,
  Wallet,
  Target,
  TrendingUp,
  ReceiptIndianRupee,
  PieChart as PieChartIcon,
  Calculator
} from "lucide-react";
import './ToolPage.css';

export default function DashboardPage({ setActivePage, user, onLogout }) {
  const { emiData, taxData, investData, goalsData, onboardingData } = useDashboard();
  const { showToast, showModal } = useNotification();
  
  
  // Health Score calculation (Habit builder)
  const [healthScore, setHealthScore] = useState(58);
  const [allocationLoss, setAllocationLoss] = useState(2500);

  
  useEffect(() => {
    let score = 58;
    if (onboardingData) {
      score = 40;
      if (onboardingData.emergencySavings === 'yes') score += 15;
      if (onboardingData.healthInsurance === 'yes') score += 20;
      if (onboardingData.hasEmi === 'no') score += 10;
      if (onboardingData.monthlySalary) {
        const salary = parseInt(onboardingData.monthlySalary, 10);
        if (salary > 0) {
           setAllocationLoss(Math.floor(salary * 0.05)); // 5% loss estimate
        }
      }
    }
    
    // Merge persistence
    const savedScore = localStorage.getItem('financial_health_score');
    if (savedScore) {
      setHealthScore(parseInt(savedScore, 10));
    } else {
      setHealthScore(score);
      localStorage.setItem('financial_health_score', score);
    }
  }, [goalsData, onboardingData]);

  // Show welcome toast once on load
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('finance_welcome_toast');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        showToast('Welcome back! Your dashboard is up to date based on the latest market data.', 'success');
        sessionStorage.setItem('finance_welcome_toast', 'true');
      }, 1000);
    }
  }, [showToast]);

  const hasHealthIns = onboardingData?.healthInsurance === 'yes';
  const hasEmergency = onboardingData?.emergencySavings === 'yes';
  const hasHighEmi = onboardingData?.hasEmi === 'yes';

  // Derive stats from Context
  const monthlyEmi = Math.round((emiData.principal * (emiData.rate/12/100) * Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12)) / (Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12) - 1)) || 0;
  const monthlySip = investData.monthlyAmount || 0;
  const estimatedTax = Math.round((taxData.income || 0) * 0.15 / 12);
  const totalGoalsTarget = goalsData.reduce((s, g) => s + g.target, 0);
  const totalSaved = goalsData.reduce((s, g) => s + (g.current || g.saved || 0), 0);
  const goalPct = totalGoalsTarget > 0 ? Math.round((totalSaved / totalGoalsTarget) * 100) : 0;

  const stats = [
    { label: 'Estimated Tax (Monthly)', value: `₹${estimatedTax.toLocaleString('en-IN')}`, color: 'saffron', icon: <ReceiptIndianRupee size={22} />, trend: 'Optimize in planner', trendDir: 'down' },
    { label: 'Monthly SIPs', value: `₹${monthlySip.toLocaleString('en-IN')}`, color: 'green', icon: <PieChartIcon size={22} />, trend: '+5% step-up soon', trendDir: 'up' },
    { label: 'Active Loans EMI', value: `₹${monthlyEmi.toLocaleString('en-IN')}`, color: 'red', icon: <Calculator size={22} />, trend: 'Stable', trendDir: 'neutral' },
  ];

  const quickActions = [
    { title: 'Log check-in', icon: <CalendarDays size={22} />, desc: 'Update details', event: 'checkin' },
    { title: 'Affordability', icon: <Wallet size={22} />, desc: 'Can I buy it?', event: 'afford' },
    { title: 'Fund Picker', icon: <TrendingUp size={22} />, desc: 'Find mutual funds', event: 'mf' },
    { title: 'Goal Planner', icon: <Target size={22} />, desc: 'Track milestones', event: 'goals' },
  ];

  const smartAlerts = [
    { type: 'warning', badgeClass: 'badge-red', title: 'Overspending Risk', desc: `Your EMI (₹${monthlyEmi.toLocaleString('en-IN')}) is 40% of standard income. Avoid new debts this month.`, hasPopup: true, actionText: 'View Details' },
    { type: 'opportunity', badgeClass: 'badge-green', title: 'Saving Opportunity', desc: 'You haven\'t maximized your 80C deductions yet. Adding ₹2,500 more to ELSS saves tax.', action: 'tax', actionText: 'View Tax Planner' },
    { type: 'habit', badgeClass: 'badge-gold', title: 'Check-in Due', desc: 'Your monthly financial check-in is pending for 2 days. Complete it to boost your Health Score!', action: 'checkin', actionText: 'Do Check-in Now' },
  ];

  const handleAlertAction = (alert) => {
    if (alert.hasPopup) {
      showModal({
        title: alert.title,
        content: (
          <div>
            <p style={{ marginBottom: '16px' }}>{alert.desc}</p>
            <p><strong>Recommendation:</strong> Consider paying off high-interest personal loans first, and try to keep your total EMI obligations under 30% of your take-home pay to avoid financial stress.</p>
          </div>
        ),
        confirmText: 'Understand',
        onConfirm: () => showToast('Alert acknowledged and dismissed.', 'success')
      });
    } else if (alert.action && setActivePage) {
      setActivePage(alert.action);
    }
  };

  // Pie chart data and logic
  const chartData = [
    { name: 'Emergency', value: hasEmergency ? 25 : 5, fill: 'url(#3DGradient1)' },
    { name: 'Insurance', value: hasHealthIns ? 25 : 5, fill: 'url(#3DGradient2)' },
    { name: 'Investments', value: 15, fill: 'url(#3DGradient3)' },
    { name: 'EMI Load', value: hasHighEmi ? 35 : 10, fill: 'url(#3DGradient4)' }
  ];

  const getAIChartSuggestion = () => {
    const expand = [];
    if (!hasHealthIns) expand.push("Insurance slice");
    if (!hasEmergency) expand.push("Emergency slice");
    
    let msg = "";
    if (expand.length > 0) {
      msg += `Expand your ${expand.join(" and ")}`;
    }
    
    if (hasHighEmi) {
      if (msg) msg += " while shrinking your EMI Load slice";
      else msg += "Shrink your EMI Load slice";
    }
    
    if (msg) {
      return msg + " for a healthier financial ratio.";
    }
    
    return "Your pie chart is perfectly balanced! Focus on growing your Investments slice.";
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    if (percent < 0.1) return null; // Don't show labels for tiny slices
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.9)' }}>
        {name} {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Your Active <span className="gradient-text">Financial Companion</span> 👋</h1>
          <p>Navigating your wealth journey, step by step.</p>
          <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid var(--color-red)', borderRadius: '6px', display: 'inline-block' }}>
            <span style={{ color: 'var(--color-red)', fontWeight: 'bold' }}>⚠️ Warning:</span> You are currently losing approx ₹{allocationLoss.toLocaleString('en-IN')}/month due to poor allocation.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ai-status-badge">Habit Builder Active</div>
          <span className="badge badge-gold" style={{ padding: '8px 16px', fontSize: '12px' }}>🎯 {goalPct}% Goal Progress</span>
        </div>
      </div>

      {/* Hero Section Grid (Scoreboard + Smart Alerts) */}
      <div className="tool-grid" style={{ marginTop: '24px', marginBottom: '24px' }}>
        {/* Financial Health Score (Left Half) */}
        <div className="glass-card" style={{ padding: '24px', margin: 0, border: 'none', background: 'var(--navy-mid)', borderLeft: '4px solid var(--gold)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(var(--gold) ${healthScore}%, rgba(255,255,255,0.1) 0)` }}>
                <div style={{ position: 'absolute', width: '77px', height: '77px', background: 'var(--navy-mid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '1.6rem', color: 'var(--gold)' }}>{healthScore}</strong><span style={{ fontSize: '0.6rem', color: '#888' }}>/100</span>
                </div>
              </div>
              <div>
                <h2 style={{ marginBottom: '4px', fontSize: '1.4rem' }}>Overall Score</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0 0 8px 0' }}>Financial Health: <strong>{healthScore}/100</strong></p>
                
                {!hasHealthIns ? (
                  <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                    🚨 Missing health insurance risk.
                  </p>
                ) : (
                  <p style={{ color: 'var(--color-green)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                    🌟 Better than 65% of peers.
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '220px', height: '180px', margin: '0 auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <radialGradient id="3DGradient1" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#00E676" />
                      <stop offset="100%" stopColor="#00A550" />
                    </radialGradient>
                    <radialGradient id="3DGradient2" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#00C862" />
                      <stop offset="100%" stopColor="#008A44" />
                    </radialGradient>
                    <radialGradient id="3DGradient3" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#FFE066" />
                      <stop offset="100%" stopColor="#FFC300" />
                    </radialGradient>
                    <radialGradient id="3DGradient4" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#FF7A7A" />
                      <stop offset="100%" stopColor="#E63946" />
                    </radialGradient>
                    <filter id="pieShadow">
                      <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
                    </filter>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 22, 41, 0.95)', border: '1px solid #1E2A40', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#F0F4FF' }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={25}
                    dataKey="value"
                    stroke="#141B2D"
                    strokeWidth={2}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    filter="url(#pieShadow)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255, 215, 0, 0.08)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)', flex: '1 1 200px' }}>
              <span style={{ fontSize: '16px', marginTop: '1px' }}>✨</span>
              <p style={{ color: 'var(--gold)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                <strong>AI Pie Chart Suggestion:</strong> {getAIChartSuggestion()}
              </p>
            </div>

            <button className="btn-primary pulse-glow" style={{ background: 'var(--gold)', color: '#000', whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '13px' }} onClick={() => setActivePage && setActivePage('checkin')}>
              Update Check-in 📅
            </button>
          </div>
        </div>

        {/* Smart Alerts (Right Half) */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="dash-news-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', background: 'var(--navy-mid)' }}>
            <h3 className="card-title" style={{ margin: 0 }}>🚨 Smart Alerts for You</h3>
          </div>
          <div className="dash-news-list" style={{ padding: '20px', overflowY: 'auto' }}>
            {smartAlerts.map((alert, i) => (
              <div key={i} className="dash-news-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', marginBottom: '12px', borderLeft: `3px solid var(--color-${alert.badgeClass.split('-')[1]})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`badge ${alert.badgeClass}`} style={{ fontSize: '11px', padding: '4px 8px' }}>{alert.title}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.4', margin: '8px 0', color: 'var(--text-secondary)' }}>{alert.desc}</p>
                {alert.actionText && (
                  <button onClick={() => handleAlertAction(alert)} style={{ background: 'transparent', border: 'none', color: alert.badgeClass.includes('gold') ? 'var(--gold)' : 'var(--saffron)', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                    {alert.actionText} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div key={i} className="glass-card dash-stat-card">
            <div className="dash-stat-top">
              <span className="dash-stat-icon">{s.icon}</span>
              <span className={`badge badge-${s.color}`}>{s.trend}</span>
            </div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-value">{s.value}</div>
            <div className={`dash-stat-bar ${s.color}`}></div>
          </div>
        ))}
      </div>

      {/* Bottom Grid for Actions */}
      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">🚀 Action Center</h3>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>Daily tools to keep you on track.</p>
          <div className="dash-actions-grid">
            {quickActions.map((a, i) => (
              <button key={i} className="dash-action-btn" onClick={() => setActivePage && setActivePage(a.event)}>
                <span className="dash-action-icon">{a.icon}</span>
                <strong>{a.title}</strong>
                <span className="dash-action-desc">{a.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,215,0,0.1))', borderRadius: '12px', border: '1px solid rgba(255,107,0,0.3)', margin: 0 }}>
            <h4 style={{ color: 'var(--gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              💎 Ask AI about your finances
            </h4>
            <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '18px', lineHeight: '1.5' }}>
              Your personalized advisor knows your salary, expenses, and goals. Ask anything to stay ahead.
            </p>
            <button className="btn-primary pulse-glow" style={{ width: '100%', background: 'var(--gradient-saffron)' }} onClick={() => setActivePage && setActivePage('chat')}>
              Talk to AI Advisor ✨
            </button>
          </div>
          
          <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,153,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,153,51,0.1)', margin: 0 }}>
            <h4 style={{ color: 'var(--saffron)', marginBottom: '10px', fontSize: '15px' }}>Got a new expense?</h4>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '18px', lineHeight: '1.5' }}>Before buying that new phone or car, ask the AI if you can truly afford it.</p>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActivePage && setActivePage('afford')}>Check Affordability</button>
          </div>
        </div>
      </div>
    </div>
  );
}
