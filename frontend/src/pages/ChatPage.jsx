import { useState, useRef, useEffect, useMemo } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { Sparkles, Bot, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import './ChatPage.css'

export default function ChatPage({ selectedModel: initialSelectedModel = 'gpt-4o-mini', user, onLogout, threadId, setThreadId, setActivePage }) {
  const [selectedModel, setSelectedModel] = useState(initialSelectedModel)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachedImage, setAttachedImage] = useState(null) // { base64, name, preview }
  const [uploadStatus, setUploadStatus] = useState(null) // { type: 'success'|'error'|'loading', msg }
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const docInputRef = useRef(null)
  const imgInputRef = useRef(null)

  const handleModelChange = (val) => {
    setSelectedModel(val);
    setShowModelSelector(false);
    setMessages([]);
    if (setThreadId) setThreadId(null);
  };

  
  const { 
    updateEmi, 
    updateMfFilters, 
    updateTax, 
    updateInvest, 
    updateGoals, 
    updateRetirement,
    updateAfford,
    updateOnboardingData,
    updatePersona,
    emiData,
    taxData,
    investData,
    goalsData,
    retirementData,
    affordData,
    onboardingData,
    persona
  } = useDashboard()

  const isBusiness = persona === 'business';

  const [healthScore, setHealthScore] = useState(58);
  useEffect(() => {
    const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
    const savedScore = localStorage.getItem(scoreKey);
    if (savedScore) setHealthScore(parseInt(savedScore, 10));
  }, [isBusiness]);

  const userDataPayload = useMemo(() => {
    const monthlyEmi = (emiData?.principal > 0 && emiData?.rate > 0 && emiData?.tenure > 0)
      ? Math.round((emiData.principal * (emiData.rate/12/100) * Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12)) / (Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12) - 1))
      : 0;
    
    // Build comprehensive payload with ALL app data
    const base = {
      persona: isBusiness ? 'business' : 'personal',
      score: healthScore,
      goals: goalsData?.length > 0 ? goalsData.map(g => `${g.title}: target ₹${g.target}, saved ₹${g.current || g.saved || 0}, deadline ${g.deadline || 'not set'}`).join(' | ') : 'None set',
      // EMI calculator state
      emiCalculator: emiData?.principal > 0 ? `Principal: ₹${emiData.principal}, Rate: ${emiData.rate}%, Tenure: ${emiData.tenure}yr, Monthly EMI: ₹${monthlyEmi}` : 'Not configured',
      // Tax planner state  
      taxPlanner: taxData?.income > 0 ? `Annual Income: ₹${taxData.income}, Deductions: ₹${taxData.deductions}` : 'Not configured',
      // Investment/SIP state
      investmentPlanner: investData?.monthlyAmount > 0 ? `Monthly SIP: ₹${investData.monthlyAmount}, Expected Return: ${investData.expectedReturn}%, Horizon: ${investData.timeHorizon}yr` : 'Not configured',
      // Retirement planner state
      retirementPlanner: retirementData?.currentAge > 0 ? `Age: ${retirementData.currentAge}, Retire at: ${retirementData.retirementAge}, Monthly Expense: ₹${retirementData.monthlyExpense}` : 'Not configured',
      // Affordability state
      affordability: affordData?.itemName ? `Checking: ${affordData.itemName} @ ₹${affordData.itemPrice}` : 'No item being checked',
    };

    if (isBusiness) {
      const rev = Number(onboardingData?.monthlyRevenue) || 0;
      const exp = Number(onboardingData?.operatingExpenses) || 0;
      return {
        ...base,
        monthlyRevenue: onboardingData?.monthlyRevenue || 'Not set',
        operatingExpenses: onboardingData?.operatingExpenses || 'Not set',
        profitMargin: rev > 0 ? (((rev - exp) / rev) * 100).toFixed(1) + '%' : 'Unknown',
        monthlyProfit: rev > 0 ? `₹${(rev - exp).toLocaleString('en-IN')}` : 'Unknown',
        hasBusinessLoan: onboardingData?.hasBusinessLoan || 'Unknown',
        businessLoanAmount: onboardingData?.businessLoanAmount || 'None',
        gstRegistered: onboardingData?.gstRegistered || 'Unknown',
      };
    }
    
    const sal = Number(onboardingData?.monthlySalary) || 0;
    const exp = Number(onboardingData?.monthlyExpenses) || 0;
    const sip = investData?.monthlyAmount || 0;
    const savings = sal > 0 ? sal - exp - monthlyEmi - sip : 0;
    return {
      ...base,
      salary: onboardingData?.monthlySalary || 'Not provided',
      monthlyExpenses: onboardingData?.monthlyExpenses || 'Not provided',
      emi: monthlyEmi > 0 ? `₹${monthlyEmi}` : 'No active EMI',
      sipAmount: sip > 0 ? `₹${sip}` : 'Not set',
      monthlySavings: sal > 0 ? `₹${savings}` : 'Unknown',
      hasEmergency: onboardingData?.emergencySavings || 'Unknown',
      hasHealthIns: onboardingData?.healthInsurance || 'Unknown',
      hasEmi: onboardingData?.hasEmi || 'Unknown',
    };
  }, [emiData, investData, goalsData, onboardingData, healthScore, isBusiness, taxData, retirementData, affordData]);

  const dynamicSuggestions = [
    { icon: '📊', title: 'Improve My Score', desc: `How can I improve my score from ${healthScore}?` },
    { icon: '💸', title: 'Wealth Leakage', desc: 'Where am I losing money?' },
    { icon: '🛍️', title: 'Affordability', desc: 'Can I afford a ₹50k purchase?' },
    { icon: '📈', title: 'Increase Savings', desc: 'Can I increase my SIP?' }
  ];

  // ── Document upload handler ──
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    setUploadStatus({ type: 'loading', msg: `Uploading ${file.name}...` });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      setUploadStatus({ type: 'success', msg: data.response || `Learned ${file.name}!` });
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Upload failed. Is the backend running?' });
      setTimeout(() => setUploadStatus(null), 4000);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // ── Image attach handler ──
  const handleImageAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: 'error', msg: 'Image too large (max 10 MB)' });
      setTimeout(() => setUploadStatus(null), 3000);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        base64: reader.result, // data:image/...;base64,...
        name: file.name,
        preview: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachedImage = () => {
    if (attachedImage?.preview) URL.revokeObjectURL(attachedImage.preview);
    setAttachedImage(null);
  };

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

  // Close attach menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAttachMenu && !e.target.closest('.attach-wrapper')) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  const handleSend = async (text = input) => {
    if (!text.trim() && !attachedImage) return
    const displayText = text.trim() + (attachedImage ? `\n📎 ${attachedImage.name}` : '');
    const userMsg = { role: 'user', content: displayText, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    const imageToSend = attachedImage?.base64 || null;
    removeAttachedImage();

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
          message: text.trim() || 'Analyze this image', 
          model: selectedModel,
          user_id: user?.user_id || null,
          thread_id: currentThreadId,
          user_data: userDataPayload,
          image_data: imageToSend,
        }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        console.error("API Error:", data);
        let errorMsg = data.detail ? JSON.stringify(data.detail) : "Server error";
        let reply = `❌ **Error:** Backend returned ${response.status} - ${errorMsg}`;
        const aiMsg = { role: 'ai', content: reply, time: new Date() }
        setMessages(prev => [...prev, aiMsg])
        setIsTyping(false);
        return;
      }
      
      let reply = data.response || "No response received";

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
          const shouldNavigate = action.navigate !== false;
          
          if (action.type === 'EMI_UPDATE' && action.data) {
            updateEmi(action.data);
            if (shouldNavigate) setActivePage('emi');
          } else if (action.type === 'MF_FILTER' && action.data) {
            updateMfFilters(action.data);
            if (shouldNavigate) setActivePage('mf');
          } else if (action.type === 'TAX_UPDATE' && action.data) {
            updateTax(action.data);
            if (shouldNavigate) setActivePage('tax');
          } else if (action.type === 'INVEST_UPDATE' && action.data) {
            updateInvest(action.data);
            if (shouldNavigate) setActivePage('invest');
          } else if (action.type === 'GOALS_UPDATE' && action.data) {
            updateGoals(action.data);
            if (shouldNavigate) setActivePage('goals');
          } else if (action.type === 'RETIREMENT_UPDATE' && action.data) {
            updateRetirement(action.data);
            if (shouldNavigate) setActivePage('retirement');
          } else if (action.type === 'AFFORD_UPDATE' && action.data) {
            updateAfford(action.data);
            if (shouldNavigate) setActivePage('afford');
          } else if (action.type === 'ONBOARDING_UPDATE' && action.data) {
            // AI can update any onboarding/profile field
            const updated = { ...onboardingData, ...action.data };
            updateOnboardingData(updated);
            localStorage.setItem('finance_onboarding_data', JSON.stringify(updated));
            // Clear cached health score so it recalculates
            const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
            localStorage.removeItem(scoreKey);
            if (shouldNavigate) setActivePage('dashboard');
          } else if (action.type === 'DASHBOARD_UPDATE' && action.data) {
            // AI can update multiple dashboard sections at once
            if (action.data.emi) updateEmi(action.data.emi);
            if (action.data.tax) updateTax(action.data.tax);
            if (action.data.invest) updateInvest(action.data.invest);
            if (action.data.goals) updateGoals(action.data.goals);
            if (action.data.retirement) updateRetirement(action.data.retirement);
            if (action.data.onboarding) {
              const updated = { ...onboardingData, ...action.data.onboarding };
              updateOnboardingData(updated);
              localStorage.setItem('finance_onboarding_data', JSON.stringify(updated));
            }
            if (shouldNavigate) setActivePage('dashboard');
          } else if (action.type === 'PERSONA_UPDATE' && action.data?.persona) {
            updatePersona(action.data.persona);
            if (shouldNavigate) setActivePage('dashboard');
          } else if (action.type === 'NAVIGATE' && action.page) {
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
      
      {/* Dynamic Model Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <h2>AI Adviser</h2>
          <div className="chat-status">
            <span className="status-dot"></span> Online
          </div>
        </div>
        <div className="chat-header-right">
          <span className="header-badge premium-badge">Pro</span>
        </div>
      </div>

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
              {/* Upload status toast */}
              {uploadStatus && (
                <div className={`upload-toast ${uploadStatus.type}`}>
                  {uploadStatus.type === 'loading' && <span className="toast-spinner" />}
                  {uploadStatus.msg}
                </div>
              )}
              {/* Image preview strip */}
              {attachedImage && (
                <div className="attached-preview">
                  <img src={attachedImage.preview} alt="preview" />
                  <span className="attached-name">{attachedImage.name}</span>
                  <button className="attached-remove" onClick={removeAttachedImage}><X size={14} /></button>
                </div>
              )}
              <div className="chat-input-container">
                {/* + Attach Button */}
                <div className="attach-wrapper">
                  <button className="attach-btn" title="Attach file" onClick={() => setShowAttachMenu(!showAttachMenu)}>
                    <Paperclip size={18} />
                  </button>
                  {showAttachMenu && (
                    <div className="attach-popup">
                      <div className="attach-option" onClick={() => { docInputRef.current?.click(); }}>
                        <FileText size={16} /> <span>Upload Document</span>
                        <span className="attach-hint">PDF, TXT</span>
                      </div>
                      <div className="attach-option" onClick={() => { imgInputRef.current?.click(); }}>
                        <ImageIcon size={16} /> <span>Attach Image</span>
                        <span className="attach-hint">JPG, PNG, WEBP</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="model-selector-wrapper" title="Change AI Model">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowModelSelector(!showModelSelector)}>
                    <Sparkles size={16} />
                    <span>{selectedModel === 'gpt-4o-mini' ? 'GPT 4o Mini' : 'GPT 5.5 (Pro)'}</span>
                  </div>
                  {showModelSelector && (
                    <div className="custom-model-popup">
                      <div className={`model-option ${selectedModel === 'gpt-4o-mini' ? 'active' : ''}`} onClick={() => handleModelChange('gpt-4o-mini')}>
                        GPT 4o Mini
                      </div>
                      <div className={`model-option ${selectedModel === 'gpt-5.5' ? 'active' : ''}`} onClick={() => handleModelChange('gpt-5.5')}>
                        GPT 5.5 (Pro)
                      </div>
                    </div>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Ask about tax, investments, loans, insurance..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() && !attachedImage}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              {/* Hidden file inputs */}
              <input ref={docInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleDocUpload} />
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageAttach} />
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
            {/* Upload status toast */}
            {uploadStatus && (
              <div className={`upload-toast ${uploadStatus.type}`}>
                {uploadStatus.type === 'loading' && <span className="toast-spinner" />}
                {uploadStatus.msg}
              </div>
            )}
            {/* Image preview strip */}
            {attachedImage && (
              <div className="attached-preview">
                <img src={attachedImage.preview} alt="preview" />
                <span className="attached-name">{attachedImage.name}</span>
                <button className="attached-remove" onClick={removeAttachedImage}><X size={14} /></button>
              </div>
            )}
            <div className="chat-input-container">
              {/* + Attach Button */}
              <div className="attach-wrapper">
                <button className="attach-btn" title="Attach file" onClick={() => setShowAttachMenu(!showAttachMenu)}>
                  <Paperclip size={18} />
                </button>
                {showAttachMenu && (
                  <div className="attach-popup">
                    <div className="attach-option" onClick={() => { docInputRef.current?.click(); }}>
                      <FileText size={16} /> <span>Upload Document</span>
                      <span className="attach-hint">PDF, TXT</span>
                    </div>
                    <div className="attach-option" onClick={() => { imgInputRef.current?.click(); }}>
                      <ImageIcon size={16} /> <span>Attach Image</span>
                      <span className="attach-hint">JPG, PNG, WEBP</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="model-selector-wrapper" title="Change AI Model">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowModelSelector(!showModelSelector)}>
                  <Sparkles size={16} />
                  <span>{selectedModel === 'gpt-4o-mini' ? 'GPT 4o Mini' : 'GPT 5.5 (Pro)'}</span>
                </div>
                {showModelSelector && (
                  <div className="custom-model-popup">
                    <div className={`model-option ${selectedModel === 'gpt-4o-mini' ? 'active' : ''}`} onClick={() => handleModelChange('gpt-4o-mini')}>
                      GPT 4o Mini
                    </div>
                    <div className={`model-option ${selectedModel === 'gpt-5.5' ? 'active' : ''}`} onClick={() => handleModelChange('gpt-5.5')}>
                      GPT 5.5 (Pro)
                    </div>
                  </div>
                )}
              </div>
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Ask about tax, investments, loans, insurance..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() && !attachedImage}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            {/* Hidden file inputs */}
            <input ref={docInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleDocUpload} />
            <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageAttach} />
            <p className="chat-disclaimer">AI can make mistakes. Check facts before relying.</p>
          </div>
        </>
      )}
    </div>
  )
}

function formatMarkdown(text) {
  if (!text) return '';
  text = text.replace(/\[\[ACTION:.*?\]\]/gs, '');
  text = text.replace(/\[\[ACTION:.*$/gm, '');
  
  // Headers
  text = text.replace(/^### (.*$)/gim, '<h3 style="margin-top:12px; margin-bottom:6px; font-size:1.1em;">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 style="margin-top:14px; margin-bottom:8px; font-size:1.2em;">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 style="margin-top:16px; margin-bottom:10px; font-size:1.3em;">$1</h1>');
  
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italics
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  text = text.replace(/^\s*[\-\*]\s+(.*)/gim, '<div style="display:flex; margin-bottom:4px;"><span style="margin-right:8px; color:var(--saffron);">&bull;</span><span>$1</span></div>');
  text = text.replace(/^\s*\d+\.\s+(.*)/gim, '<div style="display:flex; margin-bottom:4px;"><span style="margin-right:8px; color:var(--saffron); font-weight:bold;">#</span><span>$1</span></div>');
  
  // Line breaks
  text = text.replace(/\n\n/g, '<br/><br/>');
  text = text.replace(/\n(?!<div)/g, '<br/>'); // basic newline handling without breaking lists
  
  return text.trim();
}
