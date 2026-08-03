import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import ProfileDropdown from './ProfileDropdown';
import './TopNav.css';

export default function TopNav({ activePage, sidebarCollapsed, setSidebarCollapsed, user, onLogout }) {
  const { inboxNotifications, markAllRead } = useNotification();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unreadCount = inboxNotifications?.filter(n => !n.read).length || 0;

  const pageTitles = {
    chat: 'AI Adviser Chat',
    dashboard: 'Financial Dashboard',
    tax: 'Tax Planner',
    invest: 'Investment Planner',
    emi: 'EMI Calculator',
    goals: 'Goals Tracker',
    mf: 'Mutual Funds',
    retirement: 'FIRE Planner',
    afford: 'Can I Afford It?',
    checkin: 'Monthly Check-in',
    data_sync: 'Data Sync (Setu AA)',
    corp_tax: 'Corporate Tax Planner',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {/* Notification Bell */}
        <div className="profile-menu-wrap" ref={notifRef}>
          <button 
            className="icon-btn" 
            title="Notifications"
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen && unreadCount > 0) markAllRead();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && <span className="notif-badge" style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>}
          </button>

          {notifOpen && (
            <div className="profile-dropdown" style={{ right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto', padding: 0 }}>
              <div className="dropdown-header" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ fontSize: '1rem', color: '#fff' }}>Notifications</strong>
              </div>
              
              <div style={{ padding: '8px' }}>
                {inboxNotifications?.length > 0 ? (
                  inboxNotifications.map(n => (
                    <div key={n.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff', fontSize: '0.9rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.85rem', lineHeight: '1.4', color: '#cbd5e1' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '8px' }}>{new Date(n.date).toLocaleDateString()} at {new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <ProfileDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
