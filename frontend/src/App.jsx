import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TaxPlannerPage from './pages/TaxPlannerPage'
import InvestmentPage from './pages/InvestmentPage'
import EMICalculatorPage from './pages/EMICalculatorPage'
import GoalsPage from './pages/GoalsPage'
import MutualFundPage from './pages/MutualFundPage'
import RetirementPage from './pages/RetirementPage'
import AffordabilityPage from './pages/AffordabilityPage'
import MonthlyCheckinPage from './pages/MonthlyCheckinPage'
import OnboardingPage from './pages/OnboardingPage'
import AccountAggregatorPage from './pages/AccountAggregatorPage'
import CorporateTaxPage from './pages/CorporateTaxPage'
import { DashboardProvider } from './context/DashboardContext'
import { NotificationProvider } from './context/NotificationContext'
import './App.css'

export default function App() {
  const [activePage, setActivePage] = useState('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
  const [user, setUser] = useState(null)
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('finance_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const onboardingStatus = localStorage.getItem(`finance_onboarding_completed_${parsedUser.user_id}`);
      if (onboardingStatus === 'true') {
        setOnboardingCompleted(true);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('finance_user', JSON.stringify(userData));
    const onboardingStatus = localStorage.getItem(`finance_onboarding_completed_${userData.user_id}`);
    setOnboardingCompleted(onboardingStatus === 'true');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('finance_user');
    setOnboardingCompleted(false);
    setActivePage('chat');
    setActiveThreadId(null);
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
    setActivePage('chat');
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'chat':      return <ChatPage selectedModel={selectedModel} user={user} onLogout={handleLogout} threadId={activeThreadId} setThreadId={setActiveThreadId} setActivePage={setActivePage} />
      case 'dashboard': return <DashboardPage setActivePage={setActivePage} user={user} onLogout={handleLogout} />
      case 'tax':       return <TaxPlannerPage />
      case 'invest':    return <InvestmentPage />
      case 'emi':       return <EMICalculatorPage />
      case 'goals':     return <GoalsPage />
      case 'mf':        return <MutualFundPage />
      case 'retirement':return <RetirementPage />
      case 'checkin':   return <MonthlyCheckinPage />
      case 'afford':    return <AffordabilityPage />
      case 'data_sync': return <AccountAggregatorPage />
      case 'corp_tax':  return <CorporateTaxPage />
      default:          return <ChatPage selectedModel={selectedModel} user={user} onLogout={handleLogout} threadId={activeThreadId} setThreadId={setActiveThreadId} setActivePage={setActivePage} />
    }
  }

  return (
    <NotificationProvider>
      <DashboardProvider>
        <div className="app-layout">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            collapsed={sidebarCollapsed} 
            setCollapsed={setSidebarCollapsed} 
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            user={user}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            onNewChat={handleNewChat}
            onLogout={handleLogout}
          />
          <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
            <TopNav 
              activePage={activePage} 
              sidebarCollapsed={sidebarCollapsed} 
              setSidebarCollapsed={setSidebarCollapsed} 
              user={user}
              onLogout={handleLogout}
            />
            <div className="page-container">
              {!onboardingCompleted ? (
                <OnboardingPage user={user} onComplete={() => {
                  setOnboardingCompleted(true);
                  localStorage.setItem(`finance_onboarding_completed_${user.user_id}`, 'true');
                  setActivePage('dashboard');
                }} />
              ) : (
                renderPage()
              )}
            </div>
          </main>
        </div>
      </DashboardProvider>
    </NotificationProvider>
  )
}

