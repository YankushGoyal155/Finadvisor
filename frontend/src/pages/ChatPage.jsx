import { useState, useRef, useEffect, useMemo } from 'react'
import { useDashboard } from '../context/DashboardContext'
import ProfileDropdown from '../components/ProfileDropdown'
import './ChatPage.css'

export default function ChatPage({ selectedModel = 'llama3:latest', user, onLogout, threadId, setThreadId, setActivePage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  
  const { 
    updateEmi, 
    updateMfFilters, 
    updateTax, 
    updateInvest, 
    updateGoals, 
    updateRetirement,
    updateAfford,
    emiData,
    taxData,
    investData,
    goalsData,
    onboardingData
  } = useDashboard()

  const [healthScore, setHealthScore] = useState(58);
  useEffect(() => {
    const savedScore = localStorage.getItem('financial_health_score');
    if (savedScore) setHealthScore(parseInt(savedScore, 10));
  }, []);

  const userDataPayload = useMemo(() => {
    const monthlyEmi = emiData?.principal ? Math.round((emiData.principal * (emiData.rate/12/100) * Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12)) / (Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12) - 1)) : 0;
    return {
      salary: onboardingData?.monthlySalary || 'Unknown',
      emi: monthlyEmi,
      goals: goalsData?.length > 0 ? goalsData.map(g => `${g.title} (${g.target})`).join(', ') : 'None',
      score: healthScore,
      hasEmergency: onboardingData?.emergencySavings || 'Unknown',
      hasHealthIns: onboardingData?.healthInsurance || 'Unknown'
    };
  }, [emiData, goalsData, onboardingData, healthScore]);

  const dynamicSuggestions = [
    { icon: '📊', title: 'Improve My Score', desc: `How can I improve my score from ${healthScore}?` },
    { icon: '💸', title: 'Wealth Leakage', desc: 'Where am I losing money?' },
    { icon: '🛍️', title: 'Affordability', desc: 'Can I afford a ₹50k purchase?' },
    { icon: '📈', title: 'Increase Savings', desc: 'Can I increase my SIP?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (threadId) {
      // Fetch messages for this specific thread
      fetch(`${import.meta.env.VITE_API_URL}/threads/${threadId}/messages`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.messages) {
            setMessages(data.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              time: new Date(msg.timestamp)
            })))
          }
        })
        .catch(err => console.error('Failed to load thread messages:', err));
    } else {
      // Clear messges for a new chat
      setMessages([])
    }
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input])

  const handleSend = async (text = input) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text.trim(), time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    let currentThreadId = threadId;

    try {
      // Step 1: Create a thread if it doesn't exist
      if (!currentThreadId && user?.user_id) {
        // Use first message as title (truncated)
        const title = text.trim().substring(0, 30) + (text.length > 30 ? '...' : '');
        const threadResp = await fetch(`${import.meta.env.VITE_API_URL}/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id, title })
        });
        const threadData = await threadResp.json();
        if (threadData.status === 'success') {
          currentThreadId = threadData.thread_id;
          setThreadId(currentThreadId); // Update parent state
        }
      }

      // Step 2: Send chat message
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text.trim(), 
          model: selectedModel,
          user_id: user?.user_id || null,
          thread_id: currentThreadId,
          user_data: userDataPayload
        }),
      })
      const data = await response.json()
      let reply = data.response;

      // Step 3: Parse Action Tags
      // Format: [[ACTION: {"type": "...", "data": {...}}]]
      const actionRegex = /\[\[ACTION:\s*({.*?})\s*\]\]/s;
      const match = reply.match(actionRegex);
      
      if (match) {
        try {
          const action = JSON.parse(match[1]);
          console.log("AI trigger action:", action);
          
          if (action.type === 'EMI_UPDATE') {
            updateEmi(action.data);
            if (action.navigate) setActivePage('emi');
          } else if (action.type === 'MF_FILTER') {
            updateMfFilters(action.data);
            if (action.navigate) setActivePage('mf');
          } else if (action.type === 'TAX_UPDATE') {
            updateTax(action.data);
            if (action.navigate) setActivePage('tax');
          } else if (action.type === 'INVEST_UPDATE') {
            updateInvest(action.data);
            if (action.navigate) setActivePage('invest');
          } else if (action.type === 'GOALS_UPDATE') {
            updateGoals(action.data);
            if (action.navigate) setActivePage('goals');
          } else if (action.type === 'RETIREMENT_UPDATE') {
            updateRetirement(action.data);
            if (action.navigate) setActivePage('retirement');
          } else if (action.type === 'AFFORD_UPDATE') {
            updateAfford(action.data);
            if (action.navigate) setActivePage('afford');
          } else if (action.type === 'NAVIGATE') {
            setActivePage(action.page);
          }
          
          // Remove the action tag from the visible reply
          reply = reply.replace(actionRegex, '').trim();
        } catch (e) {
          console.error("Failed to parse AI action:", e);
        }
      }

      const aiMsg = { role: 'ai', content: reply, time: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error(error)
      const aiMsg = { role: 'ai', content: "Backend disconnected. Please check if main.py is running.", time: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = date => {
    try {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return '--:--'
    }
  }

  return (
    <div className="chat-page">
      {/* Sticky Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-ai-avatar">
            <span className="avatar-rupee">₹</span>
            <span className="avatar-pulse"></span>
          </div>
          <div>
            <h2>Finance AI Adviser</h2>
            <div className="chat-status">
              <span className="status-dot"></span>
              <span>Online • Powered by Azure AI</span>
            </div>
          </div>
        </div>
        <div className="chat-header-right">
          <ProfileDropdown user={user} onLogout={onLogout} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-hero">
              <div className="welcome-avatar-ring">
                <div className="welcome-avatar">₹</div>
              </div>
              <h1>Namaste! 🙏</h1>
              <p className="welcome-tagline">Your AI-Powered Financial Adviser for India</p>
              <p className="welcome-sub">Ask me about tax planning, investments, mutual funds, insurance, loans, and more.</p>
            </div>

            <div className="suggestions-section">
              <div className="suggestions-label">✨ Personalized Just For You</div>
              <div className="suggestions-grid">
                {dynamicSuggestions.map((s, i) => (
                  <button key={i} className="suggestion-card" onClick={() => handleSend(s.desc)}>
                    <div className="suggestion-icon-wrap">
                      <span>{s.icon}</span>
                    </div>
                    <div className="suggestion-text">
                      <strong>{s.title}</strong>
                      <p>{s.desc}</p>
                    </div>
                    <span className="suggestion-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="welcome-features">
              <div className="feature-pill"><span className="feature-dot pink"></span>Powered by Your Data</div>
              <div className="feature-pill"><span className="feature-dot blue"></span>Hyper-Personalized</div>
              <div className="feature-pill premium-pill"><span className="feature-dot gold"></span>Premium Advisor</div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role} slide-in`}>
                {msg.role === 'ai' && (
                  <div className="msg-avatar ai-avatar">₹</div>
                )}
                <div className="message-bubble">
                  <div className="message-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  <span className="message-time">{formatTime(msg.time)}</span>
                </div>
                {msg.role === 'user' && (
                  <div className="msg-avatar user-avatar">You</div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message ai slide-in">
                <div className="msg-avatar ai-avatar">₹</div>
                <div className="message-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Ask about tax, investments, loans, insurance..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <p className="chat-disclaimer">AI can make mistakes. Check facts before relying.</p>
      </div>
    </div>
  )
}

function formatMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}
