import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { useNotification } from '../context/NotificationContext'
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
  const skipFetchRef = useRef(false)

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
    savedMutualFunds,
    updateSavedMutualFunds,
    emiData,
    taxData,
    investData,
    goalsData,
    retirementData,
    affordData,
    onboardingData,
    persona
  } = useDashboard()

  const { showToast } = useNotification();

  const isBusiness = persona === 'business';

  const [healthScore, setHealthScore] = useState(58);
  const [typingPhase, setTypingPhase] = useState(0);
  useEffect(() => {
    const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
    const savedScore = localStorage.getItem(scoreKey);
    if (savedScore) setHealthScore(parseInt(savedScore, 10));
  }, [isBusiness]);

  // ── Typing phase animation (cycle through phases while AI is thinking) ──
  useEffect(() => {
    if (!isTyping) { setTypingPhase(0); return; }
    const phases = ['Searching knowledge base...', 'Analyzing your financial data...', 'Generating personalized advice...'];
    let idx = 0;
    setTypingPhase(0);
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setTypingPhase(idx);
    }, 2500);
    return () => clearInterval(interval);
  }, [isTyping]);

  // ── Derived Financial Metrics (for dashboard) ──
  const financialMetrics = useMemo(() => {
    const sal = Number(onboardingData?.monthlySalary) || 0;
    const exp = Number(onboardingData?.monthlyExpenses) || 0;
    const sipAmt = Number(investData?.monthlyAmount) || 0;
    const emiP = Number(emiData?.principal) || 0;
    const emiR = Number(emiData?.rate) || 0;
    const emiT = Number(emiData?.tenure) || 0;
    const monthlyEmi = (emiP > 0 && emiR > 0 && emiT > 0)
      ? Math.round((emiP * (emiR/12/100) * Math.pow(1 + (emiR/12/100), emiT*12)) / (Math.pow(1 + (emiR/12/100), emiT*12) - 1))
      : 0;
    const savings = sal > 0 ? sal - exp - monthlyEmi - sipAmt : 0;
    const savingsRatio = sal > 0 ? Math.round((savings / sal) * 100) : 0;
    const emergencyMonths = (exp > 0 && onboardingData?.emergencySavings && onboardingData.emergencySavings !== 'no' && onboardingData.emergencySavings !== 'yes')
      ? (Number(onboardingData.emergencySavings) / exp).toFixed(1)
      : (onboardingData?.emergencySavings === 'yes' ? '3+' : '0');
    const totalGoals = goalsData?.length || 0;
    const goalsWithProgress = goalsData?.filter(g => g.current > 0 || g.saved > 0) || [];
    const avgGoalProgress = goalsWithProgress.length > 0
      ? Math.round(goalsWithProgress.reduce((sum, g) => sum + ((g.current || g.saved || 0) / (g.target || 1)) * 100, 0) / goalsWithProgress.length)
      : 0;
    const mfCount = savedMutualFunds?.length || 0;
    const totalSipFromMf = savedMutualFunds?.reduce((s, f) => s + (Number(f.sipAmount) || 0), 0) || 0;
    const debtRatio = sal > 0 ? Math.round(((monthlyEmi) / sal) * 100) : 0;
    const hasInsurance = onboardingData?.healthInsurance === 'yes';
    const hasTaxPlan = taxData?.income > 0;
    const retireAge = retirementData?.retirementAge || 60;
    const currentAge = retirementData?.currentAge || 25;

    // Health score breakdown
    const incomeScore = sal > 0 ? 90 : 10;
    const savingsScore = savingsRatio >= 20 ? 85 : savingsRatio >= 10 ? 60 : savingsRatio > 0 ? 35 : 10;
    const emergencyScore = emergencyMonths === '0' ? 15 : (parseFloat(emergencyMonths) >= 6 ? 90 : parseFloat(emergencyMonths) >= 3 ? 60 : 35);
    const insuranceScore = hasInsurance ? 80 : 15;
    const debtScore = debtRatio === 0 ? 95 : debtRatio <= 30 ? 80 : debtRatio <= 50 ? 50 : 20;
    const investScore = (sipAmt + totalSipFromMf) > 0 ? 75 : 10;
    const taxScore = hasTaxPlan ? 70 : 15;
    const retireScore = retirementData?.currentAge > 0 ? 65 : 10;
    const budgetScore = exp > 0 ? 70 : 10;
    const goalScore = totalGoals > 0 ? (avgGoalProgress > 50 ? 80 : 50) : 10;

    return {
      salary: sal, expenses: exp, savings, savingsRatio, monthlyEmi,
      sipAmt, totalSipFromMf, emergencyMonths, totalGoals, avgGoalProgress,
      mfCount, debtRatio, hasInsurance, hasTaxPlan, retireAge, currentAge,
      scores: {
        income: incomeScore, savings: savingsScore, emergency: emergencyScore,
        insurance: insuranceScore, debt: debtScore, invest: investScore,
        tax: taxScore, retire: retireScore, budget: budgetScore, goals: goalScore
      }
    };
  }, [onboardingData, investData, emiData, goalsData, savedMutualFunds, taxData, retirementData]);

  // ── Top Recommendation Generator ──
  const topRecommendation = useMemo(() => {
    const m = financialMetrics;
    if (m.emergencyMonths === '0') return { icon: '🛡️', text: 'Build your emergency fund first — aim for at least 3 months of expenses before increasing investments.' };
    if (!m.hasInsurance) return { icon: '🏥', text: 'You don\'t have health insurance. A medical emergency can wipe out years of savings. Get covered ASAP.' };
    if (m.debtRatio > 40) return { icon: '⚠️', text: `Your EMI-to-income ratio is ${m.debtRatio}%, which is above the safe limit. Focus on reducing debt before new investments.` };
    if (m.savingsRatio < 10 && m.salary > 0) return { icon: '💡', text: 'Your savings ratio is below 10%. Try the 50-30-20 rule to bring your savings up.' };
    if (m.sipAmt === 0 && m.totalSipFromMf === 0) return { icon: '📈', text: 'You haven\'t started any SIP yet. Even ₹500/month can grow significantly with compounding.' };
    if (m.totalGoals === 0) return { icon: '🎯', text: 'Set at least one financial goal (house, car, retirement) — goals give direction to your investments.' };
    if (parseFloat(m.emergencyMonths) < 6 && m.emergencyMonths !== '0') return { icon: '🛡️', text: `Your emergency fund covers only ${m.emergencyMonths} months. Target 6 months of expenses.` };
    if (!m.hasTaxPlan) return { icon: '💰', text: 'Set up your tax planner to discover potential savings under Section 80C, 80D, and more.' };
    return { icon: '🌟', text: 'You\'re on a great track! Consider reviewing your portfolio allocation for better diversification.' };
  }, [financialMetrics]);

  // ── Proactive Insights Generator ──
  const proactiveInsights = useMemo(() => {
    const m = financialMetrics;
    const insights = [];
    if (m.debtRatio > 30 && m.salary > 0) insights.push({ type: 'warning', icon: '⚠️', text: `Your EMI is ${m.debtRatio}% of income — recommended is below 30%.` });
    if (m.emergencyMonths === '0') insights.push({ type: 'danger', icon: '🚨', text: 'No emergency fund detected. This is your #1 financial priority.' });
    if (m.savingsRatio > 30 && m.salary > 0) insights.push({ type: 'success', icon: '✨', text: `Excellent! You\'re saving ${m.savingsRatio}% of your income.` });
    if (m.mfCount > 0) insights.push({ type: 'info', icon: '📊', text: `${m.mfCount} mutual fund(s) tracked with ₹${(m.totalSipFromMf).toLocaleString('en-IN')}/month total SIP.` });
    if (m.avgGoalProgress > 0) insights.push({ type: 'success', icon: '🎯', text: `Your goals are ${m.avgGoalProgress}% complete on average.` });
    if (!m.hasInsurance) insights.push({ type: 'danger', icon: '🏥', text: 'Missing health insurance — high-risk gap in your financial safety net.' });
    if (m.salary > 0 && !m.hasTaxPlan) insights.push({ type: 'warning', icon: '💸', text: 'Tax planner not configured. You might be paying more tax than necessary.' });
    return insights.slice(0, 4); // Show max 4
  }, [financialMetrics]);

  // ── Greeting based on time of day ──
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  // ── Score color helper ──
  const getScoreColor = (score) => {
    if (score >= 70) return '#00c862';
    if (score >= 40) return '#f59e0b';
    return '#ff4d4d';
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  };

  const userDataPayload = useMemo(() => {
    const monthlyEmi = (emiData?.principal > 0 && emiData?.rate > 0 && emiData?.tenure > 0)
      ? Math.round((emiData.principal * (emiData.rate/12/100) * Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12)) / (Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12) - 1))
      : 0;
    
    // Build mutual fund portfolio summary for AI context
    let mfPortfolioStr = 'No mutual funds saved';
    if (savedMutualFunds && savedMutualFunds.length > 0) {
      mfPortfolioStr = savedMutualFunds.map((f, i) => 
        `${i+1}. ${f.name} (Code: ${f.code || 'N/A'}, SIP: ₹${f.sipAmount || 0}/month, Start: ${f.sipStartDate || f.startDate || 'N/A'})`
      ).join(' | ');
    }

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
      // Mutual Fund Portfolio
      mutualFundPortfolio: mfPortfolioStr,
      mutualFundCount: savedMutualFunds?.length || 0,
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
  }, [emiData, investData, goalsData, onboardingData, healthScore, isBusiness, taxData, retirementData, affordData, savedMutualFunds]);

  const dynamicSuggestions = [
    { icon: '📊', title: 'Improve My Score', desc: `How can I improve my score from ${healthScore}?` },
    { icon: '💸', title: 'Wealth Leakage', desc: 'Where am I losing money?' },
    { icon: '💹', title: 'Analyze Portfolio', desc: 'Analyze my mutual fund portfolio and suggest changes' },
    { icon: '📈', title: 'Increase Savings', desc: 'Can I increase my SIP?' }
  ];

  // ── Suggested Actions (clickable cards) ──
  const suggestedActions = useMemo(() => {
    const m = financialMetrics;
    const actions = [];
    if (m.sipAmt === 0 && m.totalSipFromMf === 0) actions.push({ icon: '📈', label: 'Start SIP', query: 'Help me start my first SIP investment' });
    else actions.push({ icon: '📈', label: 'Increase SIP', query: 'Can I increase my SIP amount? Analyze my capacity.' });
    if (m.debtRatio > 30) actions.push({ icon: '🏦', label: 'Reduce EMI', query: 'How can I reduce my EMI burden?' });
    if (!m.hasInsurance) actions.push({ icon: '🛡️', label: 'Get Insured', query: 'I need health insurance. What should I look for?' });
    if (m.emergencyMonths === '0') actions.push({ icon: '💰', label: 'Emergency Fund', query: 'Help me build an emergency fund' });
    if (!m.hasTaxPlan && m.salary > 0) actions.push({ icon: '💸', label: 'Save Tax', query: 'How can I save tax under Section 80C and 80D?' });
    actions.push({ icon: '🔍', label: 'Review Portfolio', query: 'Review and analyze my complete investment portfolio' });
    actions.push({ icon: '🏖️', label: 'Plan Retirement', query: 'Plan my retirement and calculate how much I need' });
    actions.push({ icon: '⭐', label: 'Boost Score', query: `How can I improve my financial health score from ${healthScore}?` });
    return actions.slice(0, 8);
  }, [financialMetrics, healthScore]);

  // ── Quick Suggested Questions (shown above input during conversation) ──
  const quickQuestions = [
    'Can I afford a car?',
    'How can I save tax?',
    'Review my investments',
    'Analyze my expenses',
    'How much should I invest monthly?',
    'Plan my retirement',
    'Increase my financial score',
  ];

  // ── Typing Phase Labels ──
  const typingPhases = ['Searching knowledge base...', 'Analyzing your financial data...', 'Generating personalized advice...'];

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
      if (skipFetchRef.current) {
        skipFetchRef.current = false;
        return;
      }
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

  // Close attach menu & model selector on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAttachMenu && !e.target.closest('.attach-wrapper')) {
        setShowAttachMenu(false);
      }
      if (showModelSelector && !e.target.closest('.model-selector-wrapper')) {
        setShowModelSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu, showModelSelector]);

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
          skipFetchRef.current = true;
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
      const actionRegex = /\[\[ACTION:\s*(\{[\s\S]*?\})\s*\]\]/g;
      const matches = [...reply.matchAll(actionRegex)];
      
      // Always strip action tags from visible text first
      reply = reply.replace(actionRegex, '').trim();
      // Also clean up any malformed/partial action tags the AI might have left
      reply = reply.replace(/\[\[ACTION:[\s\S]*?\]\]/g, '').trim();
      reply = reply.replace(/\[\[ACTION:[\s\S]*$/gm, '').trim();
      
      for (const match of matches) {
        try {
          // Robust JSON parsing with fallback for common AI formatting issues
          let action;
          try {
            action = JSON.parse(match[1]);
          } catch (jsonErr) {
            // Try fixing common issues: trailing commas, unescaped quotes
            const cleaned = match[1]
              .replace(/,\s*}/g, '}')
              .replace(/,\s*]/g, ']')
              .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
            action = JSON.parse(cleaned);
          }
          console.log("AI triggered action:", action);
          const shouldNavigate = action.navigate !== false;
          
          if (action.type === 'EMI_UPDATE' && action.data) {
            updateEmi(action.data);
            showToast(`✅ EMI updated: ₹${Number(action.data.principal).toLocaleString('en-IN')} @ ${action.data.rate}% for ${action.data.tenure}yr`, 'success');
            if (shouldNavigate) setActivePage('emi');
          } else if (action.type === 'MF_FILTER' && action.data) {
            updateMfFilters(action.data);
            showToast(`🔍 Searching: ${action.data.search}`, 'success');
            if (shouldNavigate) setActivePage('mf');
          } else if (action.type === 'TAX_UPDATE' && action.data) {
            updateTax(action.data);
            showToast('✅ Tax planner updated!', 'success');
            if (shouldNavigate) setActivePage('tax');
          } else if (action.type === 'INVEST_UPDATE' && action.data) {
            updateInvest(action.data);
            showToast(`✅ SIP updated to ₹${Number(action.data.monthlyAmount).toLocaleString('en-IN')}/month!`, 'success');
            if (shouldNavigate) setActivePage('invest');
          } else if (action.type === 'GOALS_UPDATE' && action.data) {
            updateGoals(action.data);
            showToast('✅ Financial goals updated!', 'success');
            if (shouldNavigate) setActivePage('goals');
          } else if (action.type === 'RETIREMENT_UPDATE' && action.data) {
            updateRetirement(action.data);
            showToast('✅ Retirement plan updated!', 'success');
            if (shouldNavigate) setActivePage('retirement');
          } else if (action.type === 'AFFORD_UPDATE' && action.data) {
            updateAfford(action.data);
            showToast(`✅ Checking affordability: ${action.data.itemName}`, 'success');
            if (shouldNavigate) setActivePage('afford');
          } else if (action.type === 'ONBOARDING_UPDATE' && action.data) {
            // AI can update any onboarding/profile field
            const updated = { ...onboardingData, ...action.data };
            updateOnboardingData(updated);
            // Context auto-persists to localStorage
            // Clear cached health score so it recalculates
            const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
            localStorage.removeItem(scoreKey);
            // Build descriptive toast
            const changes = [];
            if (action.data.monthlySalary) changes.push(`Salary: ₹${Number(action.data.monthlySalary).toLocaleString('en-IN')}`);
            if (action.data.monthlyExpenses) changes.push(`Expenses: ₹${Number(action.data.monthlyExpenses).toLocaleString('en-IN')}`);
            if (action.data.emergencySavings) changes.push(`Emergency Fund: ${action.data.emergencySavings}`);
            if (action.data.healthInsurance) changes.push(`Health Insurance: ${action.data.healthInsurance}`);
            if (action.data.hasEmi) changes.push(`EMI: ${action.data.hasEmi}`);
            if (action.data.monthlyRevenue) changes.push(`Revenue: ₹${Number(action.data.monthlyRevenue).toLocaleString('en-IN')}`);
            showToast(`✅ Profile updated! ${changes.join(', ')}`, 'success');
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
            }
            showToast('✅ Dashboard updated with multiple changes!', 'success');
            if (shouldNavigate) setActivePage('dashboard');
          } else if (action.type === 'PERSONA_UPDATE' && action.data?.persona) {
            updatePersona(action.data.persona);
            showToast(`✅ Switched to ${action.data.persona} mode!`, 'success');
            if (shouldNavigate) setActivePage('dashboard');
          } else if (action.type === 'MF_ADD_PORTFOLIO' && action.data) {
            // AI adds a mutual fund to portfolio
            const fundName = action.data.fundName || action.data.name || '';
            let schemeCode = action.data.schemeCode || action.data.code || '';
            let officialName = fundName;
            
            // Fuzzy match helper — scores funds by word overlap with the query
            const fuzzyMatchFund = (funds, query) => {
              const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1);
              if (queryWords.length === 0) return null;
              let bestMatch = null;
              let bestScore = 0;
              for (const f of funds) {
                const schemeLower = f.schemeName.toLowerCase();
                // Count how many query words appear in the scheme name
                let score = 0;
                for (const word of queryWords) {
                  if (schemeLower.includes(word)) score++;
                }
                // Bonus for "direct" plan preference
                if (schemeLower.includes('direct') && schemeLower.includes('growth')) score += 0.5;
                // Must match at least 60% of query words
                if (score > bestScore && score >= queryWords.length * 0.6) {
                  bestScore = score;
                  bestMatch = f;
                }
              }
              return bestMatch;
            };
            
            // Auto-fetch schemeCode using fuzzy matching if AI did not provide it
            if (fundName) {
              try {
                // First try the search API for faster results
                const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(fundName)}`);
                if (searchRes.ok) {
                  const searchResults = await searchRes.json();
                  if (searchResults && searchResults.length > 0) {
                    // Use fuzzy matching on search results
                    const match = fuzzyMatchFund(searchResults, fundName);
                    if (match) {
                      schemeCode = String(match.schemeCode);
                      officialName = match.schemeName;
                    } else {
                      // Fallback to first Direct Growth result
                      const directGrowth = searchResults.find(f => 
                        f.schemeName.toLowerCase().includes('direct') && 
                        f.schemeName.toLowerCase().includes('growth')
                      );
                      if (directGrowth) {
                        schemeCode = String(directGrowth.schemeCode);
                        officialName = directGrowth.schemeName;
                      } else {
                        schemeCode = String(searchResults[0].schemeCode);
                        officialName = searchResults[0].schemeName;
                      }
                    }
                  }
                }
                
                // If search API didn't work, fall back to full list
                if (!schemeCode) {
                  const res = await fetch('https://api.mfapi.in/mf');
                  if (res.ok) {
                    const allFunds = await res.json();
                    const match = fuzzyMatchFund(allFunds, fundName);
                    if (match) {
                      schemeCode = String(match.schemeCode);
                      officialName = match.schemeName;
                    }
                  }
                }
              } catch(e) {
                console.error("Failed to fetch MF scheme code", e);
              }
            }

            let startD = action.data.startDate || new Date().toISOString().split('T')[0];
            let sipD = action.data.sipStartDate || startD;

            // Handle invalid dates gracefully
            const d1 = new Date(startD);
            if (isNaN(d1.getTime())) startD = new Date().toISOString().split('T')[0];
            else startD = d1.toISOString().split('T')[0];

            const d2 = new Date(sipD);
            if (isNaN(d2.getTime())) sipD = new Date().toISOString().split('T')[0];
            else sipD = d2.toISOString().split('T')[0];

            // Fetch starting NAV for proper P&L calculation
            let startNav = null;
            if (schemeCode) {
              try {
                const navRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
                if (navRes.ok) {
                  const navData = await navRes.json();
                  if (navData.data && navData.data.length > 0) {
                    const startDate = new Date(startD);
                    const sorted = [...navData.data].reverse(); // oldest first
                    let minDiff = Infinity;
                    for (const entry of sorted) {
                      const parts = entry.date.split('-');
                      const entryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                      const diff = Math.abs(entryDate - startDate);
                      if (diff < minDiff) { minDiff = diff; startNav = parseFloat(entry.nav); }
                    }
                  }
                }
              } catch(e) {
                console.error("Failed to fetch starting NAV", e);
              }
            }

            const newFund = {
              name: officialName,
              code: schemeCode,
              sipAmount: String(action.data.sipAmount || '0'),
              startDate: startD,
              sipStartDate: sipD,
              startNav: startNav
            };
            const currentFunds = savedMutualFunds || [];
            updateSavedMutualFunds([...currentFunds, newFund]);
            showToast(`✅ Added ${newFund.name} to portfolio!`, 'success');
            if (shouldNavigate) setActivePage('mf');
          } else if (action.type === 'MF_REMOVE_PORTFOLIO' && action.data) {
            // AI removes a mutual fund from portfolio by name or code match
            const currentFunds = savedMutualFunds || [];
            const nameToRemove = (action.data.fundName || action.data.name || '').toLowerCase();
            const codeToRemove = action.data.schemeCode || action.data.code || '';
            const updated = currentFunds.filter(f => {
              const nameMatch = nameToRemove && f.name.toLowerCase().includes(nameToRemove);
              const codeMatch = codeToRemove && f.code === codeToRemove;
              return !(nameMatch || codeMatch);
            });
            if (updated.length < currentFunds.length) {
              updateSavedMutualFunds(updated);
              showToast(`🗑️ Removed ${action.data.fundName || action.data.name} from your portfolio`, 'success');
            } else {
              showToast(`⚠️ Fund "${action.data.fundName || action.data.name}" not found in portfolio`, 'warning');
            }
            if (shouldNavigate) setActivePage('mf');
          } else if (action.type === 'MF_ANALYZE_PORTFOLIO') {
            // Navigate to MF page for portfolio view
            if (shouldNavigate) setActivePage('mf');
          } else if (action.type === 'NAVIGATE') {
            // Support both action.data.page and action.page (AI sends either)
            const targetPage = action.data?.page || action.data || action.page;
            if (typeof targetPage === 'string') {
              setActivePage(targetPage);
              showToast(`📄 Navigated to ${targetPage}`, 'info');
            }
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
        /* ── Personalized Financial Dashboard Welcome ── */
        <div className="chat-center-wrap">
          <div className="chat-center-content">
            {/* ── Personalized Dashboard ── */}
            <div className="welcome-dashboard">
              {/* Greeting */}
              <div className="welcome-greeting">
                <div className="greeting-text">
                  <h1>{getGreeting()}, {user?.username || 'there'} 👋</h1>
                  <p>Here's your financial snapshot — let's make smart decisions today.</p>
                </div>
                <span className="greeting-time">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>

              {/* Health Score Card */}
              <div className={`health-score-card ${getScoreClass(healthScore)}`}>
                <div className="health-score-ring">
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke={getScoreColor(healthScore)} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(healthScore / 100) * 238.76} 238.76`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                  </svg>
                  <div className="score-value">
                    <span className="score-number" style={{ color: getScoreColor(healthScore) }}>{healthScore}</span>
                    <span className="score-label">/ 100</span>
                  </div>
                </div>
                <div className="health-score-info">
                  <h3>Financial Health Score</h3>
                  <div className="health-score-categories">
                    {[
                      { name: 'Income', score: financialMetrics.scores.income },
                      { name: 'Savings', score: financialMetrics.scores.savings },
                      { name: 'Emergency', score: financialMetrics.scores.emergency },
                      { name: 'Insurance', score: financialMetrics.scores.insurance },
                      { name: 'Debt', score: financialMetrics.scores.debt },
                      { name: 'Investments', score: financialMetrics.scores.invest },
                      { name: 'Tax', score: financialMetrics.scores.tax },
                      { name: 'Goals', score: financialMetrics.scores.goals },
                    ].map((cat, i) => (
                      <div key={i} className="score-category">
                        <span style={{ minWidth: '68px' }}>{cat.name}</span>
                        <div className="cat-bar">
                          <div className="cat-bar-fill" style={{ width: `${cat.score}%`, background: getScoreColor(cat.score) }} />
                        </div>
                        <span style={{ fontSize: '10px', color: getScoreColor(cat.score), fontWeight: 700, minWidth: '20px' }}>{cat.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">💰</span>
                  <span className="stat-value">{financialMetrics.salary > 0 ? formatCurrency(financialMetrics.savings) : '—'}</span>
                  <span className="stat-label">Monthly Savings</span>
                  {financialMetrics.savingsRatio > 0 && <span className={`stat-change ${financialMetrics.savingsRatio >= 20 ? 'positive' : 'negative'}`}>{financialMetrics.savingsRatio}% of income</span>}
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📈</span>
                  <span className="stat-value">{(financialMetrics.sipAmt + financialMetrics.totalSipFromMf) > 0 ? formatCurrency(financialMetrics.sipAmt + financialMetrics.totalSipFromMf) : '—'}</span>
                  <span className="stat-label">Total SIP</span>
                  {financialMetrics.mfCount > 0 && <span className="stat-change positive">{financialMetrics.mfCount} fund(s)</span>}
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🛡️</span>
                  <span className="stat-value">{financialMetrics.emergencyMonths !== '0' ? `${financialMetrics.emergencyMonths} mo` : '—'}</span>
                  <span className="stat-label">Emergency Fund</span>
                  <span className={`stat-change ${parseFloat(financialMetrics.emergencyMonths) >= 6 ? 'positive' : parseFloat(financialMetrics.emergencyMonths) >= 3 ? 'neutral' : 'negative'}`}>
                    {parseFloat(financialMetrics.emergencyMonths) >= 6 ? 'Healthy' : parseFloat(financialMetrics.emergencyMonths) >= 3 ? 'Moderate' : 'Low'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🏦</span>
                  <span className="stat-value">{financialMetrics.monthlyEmi > 0 ? formatCurrency(financialMetrics.monthlyEmi) : '—'}</span>
                  <span className="stat-label">Monthly EMI</span>
                  {financialMetrics.debtRatio > 0 && <span className={`stat-change ${financialMetrics.debtRatio <= 30 ? 'positive' : 'negative'}`}>{financialMetrics.debtRatio}% of income</span>}
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-value">{financialMetrics.totalGoals > 0 ? `${financialMetrics.avgGoalProgress}%` : '—'}</span>
                  <span className="stat-label">Goals Progress</span>
                  {financialMetrics.totalGoals > 0 && <span className="stat-change neutral">{financialMetrics.totalGoals} goal(s)</span>}
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🏥</span>
                  <span className="stat-value">{financialMetrics.hasInsurance ? 'Active' : 'None'}</span>
                  <span className="stat-label">Health Insurance</span>
                  <span className={`stat-change ${financialMetrics.hasInsurance ? 'positive' : 'negative'}`}>{financialMetrics.hasInsurance ? '✓ Covered' : '✕ Not Covered'}</span>
                </div>
              </div>

              {/* Top Recommendation */}
              <div className="top-recommendation">
                <span className="rec-icon">{topRecommendation.icon}</span>
                <div className="rec-content">
                  <h4>Top Recommendation</h4>
                  <p>{topRecommendation.text}</p>
                </div>
              </div>

              {/* Proactive Insights */}
              {proactiveInsights.length > 0 && (
                <div className="proactive-insights">
                  <h4>Smart Insights</h4>
                  {proactiveInsights.map((insight, i) => (
                    <div key={i} className={`insight-item ${insight.type}`} onClick={() => handleSend(`Tell me more about: ${insight.text}`)}>
                      <span className="insight-icon">{insight.icon}</span>
                      <span>{insight.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Actions */}
              <div className="suggested-actions">
                <h4>Quick Actions</h4>
                <div className="actions-grid">
                  {suggestedActions.map((a, i) => (
                    <button key={i} className="action-card" onClick={() => handleSend(a.query)}>
                      <span className="action-icon">{a.icon}</span>
                      <span className="action-label">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

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

            {/* Quick Questions */}
            <div className="quick-questions">
              {quickQuestions.map((q, i) => (
                <button key={i} className="quick-q-btn" onClick={() => handleSend(q)}>{q}</button>
              ))}
            </div>
          </div>
          <p className="chat-disclaimer">AI can make mistakes. Verify important financial decisions with a certified advisor.</p>
        </div>
      ) : (
        /* ── Chat Conversation Mode ── */
        <>
          {/* Sticky Financial Summary Bar */}
          <div className="sticky-summary-bar">
            <div className="summary-pill highlight">
              <span className="pill-icon">💳</span>
              <span>Score:</span>
              <span className="pill-value" style={{ color: getScoreColor(healthScore) }}>{healthScore}/100</span>
            </div>
            {financialMetrics.salary > 0 && (
              <div className="summary-pill">
                <span className="pill-icon">💰</span>
                <span>Savings:</span>
                <span className="pill-value">{formatCurrency(financialMetrics.savings)}/mo</span>
              </div>
            )}
            {(financialMetrics.sipAmt + financialMetrics.totalSipFromMf) > 0 && (
              <div className="summary-pill">
                <span className="pill-icon">📈</span>
                <span>SIP:</span>
                <span className="pill-value">{formatCurrency(financialMetrics.sipAmt + financialMetrics.totalSipFromMf)}</span>
              </div>
            )}
            {financialMetrics.monthlyEmi > 0 && (
              <div className="summary-pill">
                <span className="pill-icon">🏦</span>
                <span>EMI:</span>
                <span className="pill-value">{formatCurrency(financialMetrics.monthlyEmi)}</span>
              </div>
            )}
            <div className="summary-pill">
              <span className="pill-icon">🛡️</span>
              <span>Emergency:</span>
              <span className="pill-value">{financialMetrics.emergencyMonths !== '0' ? `${financialMetrics.emergencyMonths}mo` : 'None'}</span>
            </div>
          </div>

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
                  <div className="typing-phase-text">{typingPhases[typingPhase]}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input at bottom when chatting */}
          <div className="chat-input-area">
            {/* Suggested Questions Row */}
            {!isTyping && messages.length >= 2 && (
              <div className="chat-suggestions-row">
                {quickQuestions.slice(0, 5).map((q, i) => (
                  <button key={i} className="chat-suggest-btn" onClick={() => handleSend(q)}>{q}</button>
                ))}
              </div>
            )}
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
  
  // 1. Strip Action Tags immediately (so they aren't parsed as text)
  text = text.replace(/\[\[ACTION:[\s\S]*?\]\]/g, '');
  text = text.replace(/\[\[ACTION:[\s\S]*$/gm, '');

  // 2. Parse Structured Recommendation Cards
  // Format from backend: **📌 Recommendation**: [Text] \n **📝 Reason**: [Text] etc.
  const cardRegex = /\*\*(📌 Recommendation|📝 Reason|📊 Impact|✅ Next Steps)\*\*\s*:\s*([^\n]+(\n(?!\*\*).*)*)/g;
  text = text.replace(cardRegex, (match, title, content) => {
    return `<div class="ai-structured-card">
      <h4>${title}</h4>
      <p>${content.trim()}</p>
    </div>`;
  });

  // 3. Parse Source Citations (Source: Income Tax Act, etc.)
  const sourceRegex = /\(Source:\s*([^)]+)\)/gi;
  text = text.replace(sourceRegex, '<span class="source-citation">📚 Source: $1</span>');

  // 4. Parse Calculation Details (Formula blocks)
  // E.g., [Calculation: `Principal * Rate`] or [Formula: ...] (If AI uses them, or we can just style code blocks specially if they have formulas)
  // For now, let's just make sure code blocks are parsed nicely
  text = text.replace(/```([\s\S]*?)```/g, '<div class="calc-detail-block">$1</div>');
  
  // Inline code (`...`)
  text = text.replace(/`([^`]+)`/g, '<code style="background:rgba(255,107,0,0.12); padding:2px 6px; border-radius:4px; font-size:0.9em; font-family:monospace; color:var(--saffron-light);">$1</code>');
  
  // Headers
  text = text.replace(/^### (.*$)/gim, '<h3 style="margin-top:12px; margin-bottom:6px; font-size:1.1em;">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 style="margin-top:14px; margin-bottom:8px; font-size:1.2em;">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 style="margin-top:16px; margin-bottom:10px; font-size:1.3em;">$1</h1>');
  
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italics (avoid matching inside multiply/math)
  text = text.replace(/(?<![\w*])\*([^*]+)\*(?![\w*])/g, '<em>$1</em>');
  
  // Horizontal rule
  text = text.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:12px 0;"/>');
  
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--saffron-light); text-decoration:underline;">$1</a>');
  
  // Ordered lists (numbered)
  text = text.replace(/^\s*\d+\.\s+(.*)/gim, '<div style="display:flex; margin-bottom:4px; padding-left:4px;"><span style="margin-right:8px; color:var(--saffron); font-weight:bold; min-width:16px;">•</span><span>$1</span></div>');
  
  // Unordered lists
  text = text.replace(/^\s*[\-\*]\s+(.*)/gim, '<div style="display:flex; margin-bottom:4px; padding-left:4px;"><span style="margin-right:8px; color:var(--saffron);">•</span><span>$1</span></div>');
  
  // Disclaimer/Note blocks (> blockquote)
  text = text.replace(/^>\s?(.*)/gim, '<div style="border-left:3px solid var(--saffron); padding:8px 14px; margin:8px 0; background:rgba(255,107,0,0.05); border-radius:0 8px 8px 0; font-size:0.9em; color:var(--text-secondary);">$1</div>');
  
  // Line breaks
  text = text.replace(/\n\n/g, '<br/><br/>');
  // Avoid inserting <br/> inside structured cards or block elements
  text = text.replace(/\n(?!<div|<h[1-3]|<hr|<\/div>|<br)/g, '<br/>');
  
  return text.trim();
}
