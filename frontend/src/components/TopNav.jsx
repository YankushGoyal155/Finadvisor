import React from 'react';
import './TopNav.css';

export default function TopNav({ activePage, sidebarCollapsed, setSidebarCollapsed, user, onLogout }) {
  const pageTitles = {
    chat: 'AI Adviser Chat',
    dashboard: 'Financial Dashboard',
    tax: 'Tax Planner',
    invest: 'Investment Planner',
    emi: 'EMI Calculator',
    goals: 'Goals Tracker',
    mf: 'Mutual Funds',
    retirement: 'FIRE Planner'
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 className="top-nav-title">{pageTitles[activePage] || 'Finance AI'}</h2>
      </div>

      <div className="top-nav-right">
        <button className="icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notif-badge"></span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">{user?.username ? user.username.substring(0, 2).toUpperCase() : 'FP'}</div>
          <span className="user-name">{user?.username || 'Finance Pro'}</span>
        </div>
        <button onClick={onLogout} className="logout-btn" title="Logout" style={{marginLeft: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>
          Logout
        </button>
      </div>
    </header>
  );
}
