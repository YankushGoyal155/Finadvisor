import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ProfileDropdown.css';

export default function ProfileDropdown({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Settings state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsAlerts, setNotificationsAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || 'Finance Pro',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '+91 9876543210'
  });

  const dropdownRef = useRef(null);
  
  const { persona, onboardingData } = useDashboard();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = profileData.username ? profileData.username.substring(0, 2).toUpperCase() : 'FP';
  const displayName = profileData.username || 'Finance Pro';
  const displayEmail = profileData.email || 'user@example.com';
  const joinDate = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <>
      <div className="profile-menu-wrap" ref={dropdownRef}>
        <button
          className="profile-trigger"
          onClick={() => setDropdownOpen(prev => !prev)}
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
              <button 
                className="dropdown-item" 
                onClick={() => { setDropdownOpen(false); setShowProfileModal(true); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                My Profile
              </button>

              <button 
                className="dropdown-item"
                onClick={() => { setDropdownOpen(false); setShowSettingsModal(true); }}
              >
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
              onClick={() => { setDropdownOpen(false); if(onLogout) onLogout(); }}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>My Profile</h3>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-card-large">
                <div className="avatar-large">{initials}</div>
                <div className="profile-details-large" style={{ width: '100%' }}>
                  {isEditingProfile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        value={profileData.username} 
                        onChange={e => setProfileData({...profileData, username: e.target.value})}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--navy-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        placeholder="Name"
                      />
                      <input 
                        type="email" 
                        value={profileData.email} 
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--navy-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        placeholder="Email"
                      />
                      <input 
                        type="text" 
                        value={profileData.phone} 
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--navy-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        placeholder="Phone"
                      />
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        style={{ padding: '8px', borderRadius: '6px', background: 'var(--saffron)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Save Details
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{displayName}</h2>
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          style={{ background: 'transparent', border: '1px solid var(--saffron)', color: 'var(--saffron)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                      </div>
                      <p className="email-lbl" style={{ margin: '5px 0' }}>{displayEmail}</p>
                      <p className="email-lbl" style={{ margin: '0 0 10px' }}>{profileData.phone}</p>
                      <span className="join-badge">Member since {joinDate}</span>
                    </>
                  )}
                </div>
              </div>

              {!isEditingProfile && (
                <div className="profile-stats-mock" style={{ flexWrap: 'wrap' }}>
                  <div className="stat-box" style={{ minWidth: '45%' }}>
                    <strong>Mode</strong>
                    <span>{persona === 'business' ? '🏢 Business' : '👤 Personal'}</span>
                  </div>
                  {onboardingData?.incomeSource && (
                    <div className="stat-box" style={{ minWidth: '45%' }}>
                      <strong>Primary Source</strong>
                      <span>{onboardingData.incomeSource}</span>
                    </div>
                  )}
                  <div className="stat-box" style={{ minWidth: '45%' }}>
                    <strong>Status</strong>
                    <span style={{color:'var(--saffron)'}}>Active User</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="profile-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>App Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="setting-row">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={isDarkMode} 
                    onChange={(e) => setIsDarkMode(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--saffron)' }}
                  />
                  Dark Mode
                </label>
              </div>
              <div className="setting-row">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={notificationsAlerts} 
                    onChange={(e) => setNotificationsAlerts(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--saffron)' }}
                  />
                  Push Notifications
                </label>
              </div>
              <div className="setting-row">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={weeklyReports} 
                    onChange={(e) => setWeeklyReports(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--saffron)' }}
                  />
                  Weekly Email Reports
                </label>
              </div>
              <p className="settings-note">Your preferences are saved automatically.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
