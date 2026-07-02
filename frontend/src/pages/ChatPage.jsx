import { useState, useRef, useEffect, useMemo } from 'react'
import { useDashboard } from '../context/DashboardContext'
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

      // Step 3: Parse and strip ALL Action Tags
      // Format: [[ACTION: {"type": "...", "data": {...}}]]
      const actionRegex = /\[\[ACTION:\s*(\{.*?\})\s*\]\]/gs;
      const matches = [...reply.matchAll(actionRegex)];
      
      // Always strip action tags from visible text first
      reply = reply.replace(actionRegex, '').trim();
      // Also clean up any malformed/partial action tags the AI might have left
      reply = reply.replace(/\[\[ACTION:.*?\]\]/gs, '').trim();
      reply = reply.replace(/\[\[ACTION:.*$/gm, '').trim();
      
      for (const match of matches) {
        try {
          const action = JSON.parse(match[1]);
          console.log("AI triggered action:", action);
          
          if (action.type === 'EMI_UPDATE' && action.data) {
            updateEmi(action.data);
            setActivePage('emi');
          } else if (action.type === 'MF_FILTER' && action.data) {
            updateMfFilters(action.data);
            setActivePage('mf');
          } else if (action.type === 'TAX_UPDATE' && action.data) {
            updateTax(action.data);
            setActivePage('tax');
          } else if (action.type === 'INVEST_UPDATE' && action.data) {
            updateInvest(action.data);
            setActivePage('invest');
          } else if (action.type === 'GOALS_UPDATE' && action.data) {
            updateGoals(action.data);
            setActivePage('goals');
          } else if (action.type === 'RETIREMENT_UPDATE' && action.data) {
            updateRetirement(action.data);
            setActivePage('retirement');
          } else if (action.type === 'AFFORD_UPDATE' && action.data) {
            updateAfford(action.data);
            setActivePage('afford');
          } else if (action.type === 'NAVIGATE' && action.page) {
            // Only navigate if the user explicitly asked to go to a page
            setActivePage(action.page);
          }
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

  const isWelcome = messages.length === 0;

  return (
    <div className={`chat-page ${isWelcome ? 'chat-page-welcome' : ''}`}>
      {isWelcome ? (
        /* ── ChatGPT-Style Centered Welcome ── */
        <div className="chat-center-wrap">
          <div className="chat-center-content">
            <div className="chat-ai-avatar" style={{ margin: '0 auto', width: '56px', height: '56px', marginBottom: '16px' }}>
              <span className="avatar-rupee" style={{ fontSize: '24px' }}>₹</span>
              <span className="avatar-pulse"></span>
            </div>
            <h1 className="chat-center-heading">What can I help you with? 🙏</h1>

            {/* Input in the center */}
            <div className="chat-center-input">
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
            </div>

            {/* Suggestion Chips */}
            <div className="chat-center-chips">
              {dynamicSuggestions.map((s, i) => (
                <button key={i} className="chat-chip" onClick={() => handleSend(s.desc)}>
                  <span className="chat-chip-icon">{s.icon}</span>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          <p className="chat-disclaimer">AI can make mistakes. Check facts before relying.</p>
        </div>
      ) : (
        /* ── Chat Conversation Mode ── */
        <>
          <div className="chat-messages">
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input at bottom when chatting */}
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
        </>
      )}
    </div>
  )
}

function formatMarkdown(text) {
  // Strip any action tags that might be in historical messages
  text = text.replace(/\[\[ACTION:.*?\]\]/gs, '');
  text = text.replace(/\[\[ACTION:.*$/gm, '');
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .trim();
}
