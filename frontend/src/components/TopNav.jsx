import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import './TopNav.css';

export default function TopNav({ activePage, sidebarCollapsed, setSidebarCollapsed, user, onLogout }) {
  const { inboxNotifications, markAllRead } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
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
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'FP';
  const displayName = user?.username || 'Finance Pro';
  const displayEmail = user?.email || '';

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
              setDropdownOpen(false);
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
        <div className="profile-menu-wrap" ref={dropdownRef}>
          <button
            className="profile-trigger"
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            title="Profile"
          >
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{displayName}</span>
            <svg
              className={`chevron-icon ${dropdownOpen ? 'open' : ''}`}
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown">
              {/* User Info Header */}
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initials}</div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{displayName}</span>
                  {displayEmail && <span className="dropdown-email">{displayEmail}</span>}
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* Menu Items */}
              <div className="dropdown-items">
                <button className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  My Profile
                </button>

                <button className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </button>
              </div>

              <div className="dropdown-divider"></div>

              {/* Logout */}
              <button
                className="dropdown-item logout-item"
                onClick={() => { setDropdownOpen(false); onLogout(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
