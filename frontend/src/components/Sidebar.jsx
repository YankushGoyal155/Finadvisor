import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './Sidebar.css';

import {
  MessageSquarePlus,
  Bot,
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Target,
  TrendingUp,
  ReceiptIndianRupee,
  PieChart,
  Calculator,
  Flame,
  Database,
  Building2
} from "lucide-react";

const navItems = [
  { id: 'chat',      label: 'AI Adviser',    icon: <Bot size={20} />, badge: 'AI',   badgeType: 'saffron' },
  { id: 'dashboard', label: 'Dashboard',     icon: <LayoutDashboard size={20} />                                      },
  { id: 'checkin',   label: 'Monthly Check-in', icon: <CalendarDays size={20} />, badge: 'New',  badgeType: 'gold' },
  { id: 'afford',    label: 'Can I Afford It?', icon: <Wallet size={20} /> },
  { id: 'goals',     label: 'Goals',         icon: <Target size={20} />                                      },
  { id: 'mf',        label: 'Mutual Funds',  icon: <TrendingUp size={20} />                                      },
  { id: 'tax',       label: 'Personal Tax',  icon: <ReceiptIndianRupee size={20} />                                      },
  { id: 'corp_tax',  label: 'Corporate Tax', icon: <Building2 size={20} /> },
  { id: 'invest',    label: 'Investments',   icon: <PieChart size={20} />                                      },
  { id: 'emi',       label: 'EMI Calculator', icon: <Calculator size={20} />                                     },
  { id: 'retirement',label: 'FIRE Planner',  icon: <Flame size={20} />                                      },
  { id: 'data_sync', label: 'Data Sync (Setu)', icon: <Database size={20} />, badge: 'API', badgeType: 'blue' },
];

export default function Sidebar({ 
  activePage, setActivePage, collapsed, setCollapsed, 
  selectedModel, setSelectedModel, user, activeThreadId, setActiveThreadId, onNewChat, onLogout
}) {
  const { persona } = useDashboard();
  const [threads, setThreads] = useState([]);

  // Dynamically filter links based on personal vs business persona
  const filteredNavItems = navItems.filter(item => {
    if (persona === 'business') return true; // Business gets BOTH personal & corporate taxes
    return !['corp_tax', 'data_sync'].includes(item.id); // Personal hides corporate & setu
  });

  useEffect(() => {
    if (user?.user_id) {
      fetch(`${import.meta.env.VITE_API_URL}/threads/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setThreads(data.threads);
          }
        })
        .catch(err => console.error("Error fetching threads:", err));
    }
  }, [user, activeThreadId]);

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Are you sure you want to delete this chat history?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/threads/${threadId}`, { method: 'DELETE' });
      if (res.ok) {
        setThreads(threads.filter(t => t.id !== threadId));
        if (activeThreadId === threadId) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Delete ALL your chat history? This cannot be undone.")) return;
    try {
      if (user?.user_id) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/history/${user.user_id}`, { method: 'DELETE' });
        if (res.ok) {
          setThreads([]);
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo" onClick={() => setCollapsed(!collapsed)}>
        <div className="logo-icon">₹</div>
        {!collapsed && (
          <div className="logo-text fade-in">
            <h1 className="gradient-text">Finance AI</h1>
            <span>Smart Indian Adviser</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="sidebar-actions fade-in">
          <button className="new-chat-btn" onClick={onNewChat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <MessageSquarePlus size={18} /> New Chat
          </button>
        </div>
      )}

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <div className="nav-section-label">{collapsed ? '•' : 'Main Menu'}</div>
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id && !activeThreadId ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                if (item.id === 'chat') setActiveThreadId(null);
              }}
              title={collapsed ? item.label : ''}
            >
              <div className="nav-icon-wrapper">
                <span className="nav-icon">{item.icon}</span>
              </div>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && threads.length > 0 && (
          <div className="sidebar-history fade-in">
            <div className="nav-section-header">
              <div className="nav-section-label">Chat History</div>
              <button 
                className="clear-history-btn" 
                onClick={handleClearHistory} 
                title="Clear all history"
              >
                🗑️
              </button>
            </div>
            <div className="history-list">
              {threads.map(thread => (
                <div 
                  key={thread.id} 
                  className={`history-item-wrapper ${activeThreadId === thread.id ? 'active' : ''}`}
                >
                  <button 
                    className="history-item"
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setActivePage('chat');
                    }}
                  >
                    <span className="history-icon" style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}><MessageSquarePlus size={16} /></span>
                    <span className="history-title">{thread.title}</span>
                  </button>
                  <button 
                    className="delete-thread-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThread(thread.id);
                    }}
                    title="Delete chat"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="sidebar-footer fade-in">
          <div className="sidebar-info" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="flag"></span>
                <div>
                  <strong>Made for India</strong>
                  <p>Tailored financial advice.</p>
                </div>
              </div>
              <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
