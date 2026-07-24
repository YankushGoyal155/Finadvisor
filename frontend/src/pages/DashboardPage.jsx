import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNotification } from '../context/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CalendarDays,
  Wallet,
  Target,
  TrendingUp,
  ReceiptIndianRupee,
  PieChart as PieChartIcon,
  Calculator,
  Building2,
  IndianRupee,
  BarChart3,
  AlertTriangle,
  Landmark,
  Receipt,
  Pencil,
  X,
  Save,
  RotateCcw,
  MoreVertical
} from "lucide-react";
import './ToolPage.css';
import { IncomeOverviewWidget, ExpenseTrackerWidget, SavingsInvestmentsWidget } from '../components/DashboardWidgets';

export default function DashboardPage({ setActivePage, user, onLogout }) {
  const { emiData, updateEmi, taxData, updateTax, investData, updateInvest, goalsData, onboardingData, updateOnboardingData, persona } = useDashboard();
  const { showToast, showModal } = useNotification();
  const isBusiness = persona === 'business';
  
  // Health Score calculation (Habit builder)
  const [healthScore, setHealthScore] = useState(58);
  const [allocationLoss, setAllocationLoss] = useState(0);

  // Widget Navigation Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(new Set());

  const toggleWidget = (id) => {
    setActiveWidgets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyWidgets = () => {
    setShowMenu(false);
    // Scroll to first active widget
    setTimeout(() => {
      const order = ['income-overview', 'expense-tracker', 'savings-investments'];
      for (const id of order) {
        if (activeWidgets.has(id)) {
          const el = document.getElementById(id);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          break;
        }
      }
    }, 50);
  };


  // ══════════════════════════════════════════
  //  MANUAL EDIT MODAL STATE
  // ══════════════════════════════════════════
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const openEditModal = () => {
    if (isBusiness) {
      setEditForm({
        monthlyRevenue: onboardingData?.monthlyRevenue || '',
        operatingExpenses: onboardingData?.operatingExpenses || '',
        businessLoanAmount: onboardingData?.businessLoanAmount || '',
        hasBusinessLoan: onboardingData?.hasBusinessLoan || 'no',
        gstRegistered: onboardingData?.gstRegistered || 'no',
      });
    } else {
      setEditForm({
        monthlySalary: onboardingData?.monthlySalary || '',
        monthlyExpenses: onboardingData?.monthlyExpenses || '',
        hasEmi: onboardingData?.hasEmi || 'no',
        emiAmount: onboardingData?.emiAmount || '',
        emergencySavings: onboardingData?.emergencySavings || 'no',
        healthInsurance: onboardingData?.healthInsurance || 'no',
        // Extra calculator values
        loanPrincipal: emiData?.principal || '',
        loanRate: emiData?.rate || '',
        loanTenure: emiData?.tenure || '',
        sipAmount: investData?.monthlyAmount || '',
        sipReturn: investData?.expectedReturn || '',
        sipYears: investData?.timeHorizon || '',
        taxIncome: taxData?.income || '',
        taxDeductions: taxData?.deductions || '',
      });
    }
    setShowEditModal(true);
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const saveEdits = () => {
    if (isBusiness) {
      const updatedOnboarding = {
        ...onboardingData,
        monthlyRevenue: editForm.monthlyRevenue,
        operatingExpenses: editForm.operatingExpenses,
        businessLoanAmount: editForm.businessLoanAmount,
        hasBusinessLoan: editForm.hasBusinessLoan,
        gstRegistered: editForm.gstRegistered,
      };
      updateOnboardingData(updatedOnboarding);
      localStorage.setItem('finance_onboarding_data', JSON.stringify(updatedOnboarding));
    } else {
      const updatedOnboarding = {
        ...onboardingData,
        monthlySalary: editForm.monthlySalary,
        monthlyExpenses: editForm.monthlyExpenses,
        hasEmi: editForm.hasEmi,
        emiAmount: editForm.emiAmount,
        emergencySavings: editForm.emergencySavings,
        healthInsurance: editForm.healthInsurance,
      };
      updateOnboardingData(updatedOnboarding);
      localStorage.setItem('finance_onboarding_data', JSON.stringify(updatedOnboarding));

      // Update calculator states
      if (editForm.loanPrincipal || editForm.loanRate || editForm.loanTenure) {
        updateEmi({
          principal: Number(editForm.loanPrincipal) || 0,
          rate: Number(editForm.loanRate) || 0,
          tenure: Number(editForm.loanTenure) || 0,
        });
      }
      if (editForm.sipAmount || editForm.sipReturn || editForm.sipYears) {
        updateInvest({
          monthlyAmount: Number(editForm.sipAmount) || 0,
          expectedReturn: Number(editForm.sipReturn) || 0,
          timeHorizon: Number(editForm.sipYears) || 0,
        });
      }
      if (editForm.taxIncome || editForm.taxDeductions) {
        updateTax({
          income: Number(editForm.taxIncome) || 0,
          deductions: Number(editForm.taxDeductions) || 0,
        });
      }
    }

    // Clear cached health score so it recalculates
    const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
    localStorage.removeItem(scoreKey);

    setShowEditModal(false);
    showToast('Dashboard updated successfully! ✅', 'success');
  };

  
  useEffect(() => {
    let score = 58;
    if (onboardingData) {
      if (isBusiness) {
        // Business health score logic
        score = 45;
        const revenue = Number(onboardingData.monthlyRevenue) || 0;
        const expenses = Number(onboardingData.operatingExpenses) || 0;
        const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
        
        if (profitMargin > 20) score += 20;
        else if (profitMargin > 10) score += 10;
        
        if (onboardingData.gstRegistered === 'yes') score += 15;
        if (onboardingData.hasBusinessLoan === 'no') score += 15;
        
        if (revenue > 0) {
          setAllocationLoss(Math.floor(revenue * 0.03)); // 3% inefficiency estimate
        }
      } else {
        // Personal health score logic (original)
        score = 40;
        if (onboardingData.emergencySavings === 'yes') score += 15;
        if (onboardingData.healthInsurance === 'yes') score += 20;
        if (onboardingData.hasEmi === 'no') score += 10;
        if (onboardingData.monthlySalary) {
          const salary = parseInt(onboardingData.monthlySalary, 10);
          if (salary > 0) {
             setAllocationLoss(Math.floor(salary * 0.05));
          }
        }
      }
    }
    
    // Merge persistence
    const scoreKey = isBusiness ? 'business_health_score' : 'financial_health_score';
    const savedScore = localStorage.getItem(scoreKey);
    if (savedScore) {
      setHealthScore(parseInt(savedScore, 10));
    } else {
      setHealthScore(score);
      localStorage.setItem(scoreKey, score);
    }
  }, [goalsData, onboardingData, isBusiness]);

  // Show welcome toast once on load
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('finance_welcome_toast');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        showToast(isBusiness 
          ? 'Welcome back! Your business dashboard is synced with the latest data.' 
          : 'Welcome back! Your dashboard is up to date based on the latest market data.', 'success');
        sessionStorage.setItem('finance_welcome_toast', 'true');
      }, 1000);
    }
  }, [showToast, isBusiness]);

  // ══════════════════════════════════════════
  //  PERSONAL MODE (original logic) — now handles zero/empty gracefully
  // ══════════════════════════════════════════
  const hasHealthIns = onboardingData?.healthInsurance === 'yes';
  const hasEmergency = onboardingData?.emergencySavings === 'yes';
  const hasHighEmi = onboardingData?.hasEmi === 'yes';

  let fallbackEmiTotal = 0;
  if (onboardingData?.emis?.length) {
    fallbackEmiTotal = onboardingData.emis.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else if (onboardingData?.emiAmount) {
    fallbackEmiTotal = Number(onboardingData.emiAmount) || 0;
  }

  const monthlyEmi = (emiData.principal > 0 && emiData.rate > 0 && emiData.tenure > 0)
    ? Math.round((emiData.principal * (emiData.rate/12/100) * Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12)) / (Math.pow(1 + (emiData.rate/12/100), emiData.tenure*12) - 1))
    : fallbackEmiTotal;
  const monthlySip = investData.monthlyAmount || 0;
  const estimatedTax = (taxData.income > 0) ? Math.round((taxData.income) * 0.15 / 12) : 0;
  const totalGoalsTarget = goalsData.reduce((s, g) => s + g.target, 0);
  const totalSaved = goalsData.reduce((s, g) => s + (g.current || g.saved || 0), 0);
  const goalPct = totalGoalsTarget > 0 ? Math.round((totalSaved / totalGoalsTarget) * 100) : 0;

  // Check if data is populated
  const hasPersonalData = monthlySip > 0 || monthlyEmi > 0 || estimatedTax > 0;
  const hasSalaryData = onboardingData?.monthlySalary && Number(onboardingData.monthlySalary) > 0;

  // ══════════════════════════════════════════
  //  BUSINESS MODE — derived metrics
  // ══════════════════════════════════════════
  const bizRevenue = Number(onboardingData?.monthlyRevenue) || 0;
  const bizExpenses = Number(onboardingData?.operatingExpenses) || 0;
  const bizProfit = bizRevenue - bizExpenses;
  const bizProfitMargin = bizRevenue > 0 ? ((bizProfit / bizRevenue) * 100).toFixed(1) : 0;
  
  let bizLoanEmi = 0;
  if (onboardingData?.businessLoans?.length) {
    bizLoanEmi = onboardingData.businessLoans.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else if (onboardingData?.businessLoanAmount) {
    bizLoanEmi = Number(onboardingData.businessLoanAmount) || 0;
  }

  const bizGstRegistered = onboardingData?.gstRegistered === 'yes';
  const bizHasLoan = onboardingData?.hasBusinessLoan === 'yes';

  const hasBusinessData = bizRevenue > 0;

  // ── Personal stats — show "Not Set" if no data ──
  const personalStats = [
    { 
      label: 'Estimated Tax (Monthly)', 
      value: estimatedTax > 0 ? `₹${estimatedTax.toLocaleString('en-IN')}` : 'Not set', 
      color: estimatedTax > 0 ? 'saffron' : 'neutral', 
      icon: <ReceiptIndianRupee size={22} />, 
      trend: estimatedTax > 0 ? 'Optimize in planner' : 'Set in Tax Planner', 
      trendDir: estimatedTax > 0 ? 'down' : 'neutral',
      isEmpty: estimatedTax === 0
    },
    { 
      label: 'Monthly SIPs', 
      value: monthlySip > 0 ? `₹${monthlySip.toLocaleString('en-IN')}` : 'Not set', 
      color: monthlySip > 0 ? 'green' : 'neutral', 
      icon: <PieChartIcon size={22} />, 
      trend: monthlySip > 0 ? '+5% step-up soon' : 'Set up SIP',
      trendDir: monthlySip > 0 ? 'up' : 'neutral',
      isEmpty: monthlySip === 0
    },
    { 
      label: 'Active Loans EMI', 
      value: monthlyEmi > 0 ? `₹${monthlyEmi.toLocaleString('en-IN')}` : hasHighEmi ? 'Set details' : 'None', 
      color: monthlyEmi > 0 ? 'red' : 'green', 
      icon: <Calculator size={22} />, 
      trend: monthlyEmi > 0 ? 'Stable' : (hasHighEmi ? 'Configure EMI' : 'Debt-free ✨'), 
      trendDir: monthlyEmi > 0 ? 'neutral' : 'up',
      isEmpty: monthlyEmi === 0 && hasHighEmi
    },
  ];

  // ── Business stats ──
  const businessStats = [
    { label: 'Monthly Revenue', value: bizRevenue > 0 ? `₹${bizRevenue.toLocaleString('en-IN')}` : 'Not set', color: bizRevenue > 0 ? 'green' : 'neutral', icon: <IndianRupee size={22} />, trend: bizRevenue > 0 ? 'From profile' : 'Set revenue', trendDir: bizRevenue > 0 ? 'up' : 'neutral', isEmpty: bizRevenue === 0 },
    { label: 'Profit Margin', value: bizRevenue > 0 ? `${bizProfitMargin}%` : 'N/A', color: Number(bizProfitMargin) > 15 ? 'green' : 'saffron', icon: <BarChart3 size={22} />, trend: Number(bizProfitMargin) > 20 ? 'Healthy' : (bizRevenue > 0 ? 'Needs improvement' : 'Set revenue first'), trendDir: Number(bizProfitMargin) > 20 ? 'up' : 'down', isEmpty: bizRevenue === 0 },
    { label: 'Business Loan EMI', value: bizHasLoan ? (bizLoanEmi > 0 ? `₹${bizLoanEmi.toLocaleString('en-IN')}` : 'Set details') : 'None', color: bizHasLoan ? 'red' : 'green', icon: <Landmark size={22} />, trend: bizHasLoan ? 'Active' : 'Debt-free ✨', trendDir: bizHasLoan ? 'neutral' : 'up', isEmpty: false },
  ];

  const stats = isBusiness ? businessStats : personalStats;

  // ── Personal quick actions ──
  const personalActions = [
    { title: 'Log check-in', icon: <CalendarDays size={22} />, desc: 'Update details', event: 'checkin' },
    { title: 'Affordability', icon: <Wallet size={22} />, desc: 'Can I buy it?', event: 'afford' },
    { title: 'Fund Picker', icon: <TrendingUp size={22} />, desc: 'Find mutual funds', event: 'mf' },
    { title: 'Goal Planner', icon: <Target size={22} />, desc: 'Track milestones', event: 'goals' },
  ];

  // ── Business quick actions ──
  const businessActions = [
    { title: 'Tax Planner', icon: <ReceiptIndianRupee size={22} />, desc: 'Compare regimes', event: 'tax' },
    { title: 'Corporate Tax', icon: <Building2 size={22} />, desc: 'Detailed analysis', event: 'corp_tax' },
    { title: 'Affordability', icon: <Wallet size={22} />, desc: 'Equipment / Hire', event: 'afford' },
    { title: 'Goal Planner', icon: <Target size={22} />, desc: 'Business targets', event: 'goals' },
  ];

  const quickActions = isBusiness ? businessActions : personalActions;

  // ── Personal alerts ──
  const personalAlerts = [];

  // Only show data-driven alerts if data exists
  if (hasSalaryData && monthlyEmi > 0) {
    const salary = Number(onboardingData.monthlySalary);
    const emiRatio = (monthlyEmi / salary) * 100;
    if (emiRatio > 40) {
      personalAlerts.push({ 
        type: 'warning', badgeClass: 'badge-red', title: 'Overspending Risk', 
        desc: `Your EMI (₹${monthlyEmi.toLocaleString('en-IN')}) is ${emiRatio.toFixed(0)}% of your salary. Keep it below 40%.`, 
        hasPopup: true, actionText: 'View Details' 
      });
    }
  }

  if (estimatedTax > 0) {
    personalAlerts.push({ 
      type: 'opportunity', badgeClass: 'badge-green', title: 'Saving Opportunity', 
      desc: 'You haven\'t maximized your 80C deductions yet. Adding ₹2,500 more to ELSS saves tax.', 
      action: 'tax', actionText: 'View Tax Planner' 
    });
  }

  // Always show check-in reminder
  personalAlerts.push({ 
    type: 'habit', badgeClass: 'badge-gold', title: 'Check-in Due', 
    desc: 'Your monthly financial check-in is pending. Complete it to boost your Health Score!', 
    action: 'checkin', actionText: 'Do Check-in Now' 
  });

  // Show setup prompts for missing data
  if (!hasPersonalData && !isBusiness) {
    personalAlerts.unshift({
      type: 'setup', badgeClass: 'badge-saffron', title: '📝 Complete Your Profile',
      desc: 'Your dashboard cards show "Not set" because you haven\'t configured your financial tools yet. Use the edit button (✏️) above or visit each tool to set your values.',
      action: null, actionText: 'Edit Dashboard ✏️',
      customAction: () => openEditModal()
    });
  }

  // ── Business alerts ──
  const businessAlerts = [];
  
  // Dynamic business alerts based on actual data
  if (bizHasLoan && bizRevenue > 0 && (bizLoanEmi / bizRevenue) > 0.3) {
    businessAlerts.push({
      type: 'warning', badgeClass: 'badge-red', title: 'Over-leveraged Warning',
      desc: `Your loan EMI (₹${bizLoanEmi.toLocaleString('en-IN')}) is ${((bizLoanEmi / bizRevenue) * 100).toFixed(0)}% of monthly revenue. Keep it below 30% for safety.`,
      hasPopup: true, actionText: 'View Details'
    });
  }
  
  if (Number(bizProfitMargin) < 15 && bizRevenue > 0) {
    businessAlerts.push({
      type: 'opportunity', badgeClass: 'badge-saffron', title: 'Low Profit Margin',
      desc: `Your profit margin is ${bizProfitMargin}%. Industry standard is 15-25%. Consider reviewing operating expenses.`,
      action: 'tax', actionText: 'Analyze Expenses'
    });
  }
  
  if (bizRevenue * 12 <= 30000000 && bizRevenue > 0) {
    businessAlerts.push({
      type: 'opportunity', badgeClass: 'badge-green', title: 'Presumptive Tax Eligible',
      desc: `Annual turnover under ₹3 Cr. Choose Sec 44AD presumptive taxation to simplify filing and potentially save tax.`,
      action: 'tax', actionText: 'Open Tax Planner'
    });
  }

  if (!bizGstRegistered && bizRevenue * 12 > 4000000) {
    businessAlerts.push({
      type: 'warning', badgeClass: 'badge-gold', title: 'GST Registration Advisory',
      desc: `Your annual turnover exceeds ₹40 Lakhs. GST registration may be mandatory. Consult your CA.`,
      action: 'tax', actionText: 'View Tax Details'
    });
  }

  if (!hasBusinessData && isBusiness) {
    businessAlerts.unshift({
      type: 'setup', badgeClass: 'badge-saffron', title: '📝 Complete Your Profile',
      desc: 'Your business metrics are showing defaults. Use the edit button (✏️) to add your real revenue, expenses, and loan data.',
      action: null, actionText: 'Edit Dashboard ✏️',
      customAction: () => openEditModal()
    });
  }
  
  if (businessAlerts.length === 0) {
    businessAlerts.push({
      type: 'habit', badgeClass: 'badge-green', title: 'Business Health: Good',
      desc: 'Your business metrics look healthy! Keep monitoring profit margins and loan obligations regularly.',
      action: 'tax', actionText: 'Review Tax Planner'
    });
  }

  const smartAlerts = isBusiness ? businessAlerts : personalAlerts;

  const handleAlertAction = (alert) => {
    if (alert.customAction) {
      alert.customAction();
      return;
    }
    if (alert.hasPopup) {
      showModal({
        title: alert.title,
        content: (
          <div>
            <p style={{ marginBottom: '16px' }}>{alert.desc}</p>
            <p><strong>Recommendation:</strong> {isBusiness 
              ? 'Focus on reducing operating costs, consider refinancing loans at lower rates, and optimize your tax strategy using our Tax Planner.' 
              : 'Consider paying off high-interest personal loans first, and try to keep your total EMI obligations under 30% of your take-home pay to avoid financial stress.'}</p>
          </div>
        ),
        confirmText: 'Understand',
        onConfirm: () => showToast('Alert acknowledged and dismissed.', 'success')
      });
    } else if (alert.action && setActivePage) {
      setActivePage(alert.action);
    }
  };

  // ══════════════════════════════════════════
  //  PIE CHART — Uses REAL ₹ values from user data
  // ══════════════════════════════════════════
  const salary = Number(onboardingData?.monthlySalary) || 0;
  const expenses = Number(onboardingData?.monthlyExpenses) || 0;
  const emergencyAmt = hasEmergency ? Math.round(salary * 0.10) : 0; // 10% of salary if fund exists
  const insuranceAmt = hasHealthIns ? Math.round(salary * 0.05) : 0; // 5% of salary if insured
  const savingsAmt = Math.max(0, salary - expenses - monthlySip - monthlyEmi - estimatedTax);

  // Build personal chart with actual ₹ values — show 0 explicitly
  const personalChartRaw = [
    { name: 'SIP/Invest', realValue: monthlySip, fill: 'url(#3DGradient3)' },
    { name: 'EMI/Loans', realValue: monthlyEmi, fill: 'url(#3DGradient4)' },
    { name: 'Tax', realValue: estimatedTax, fill: 'url(#BizGradient1)' },
    { name: 'Expenses', realValue: expenses, fill: 'url(#3DGradient2)' },
    { name: 'Savings', realValue: savingsAmt > 0 ? savingsAmt : 0, fill: 'url(#3DGradient1)' },
  ];

  // If no salary data at all, show placeholder slices so the empty chart is meaningful
  const personalChartData = salary > 0
    ? personalChartRaw.map(d => ({ ...d, value: d.realValue > 0 ? d.realValue : 1 })) // tiny sliver for 0-value items
    : personalChartRaw.map(d => ({ ...d, value: 1 })); // equal empty slices

  // Business chart uses actual ₹ amounts
  const businessChartRaw = [
    { name: 'Revenue', realValue: bizRevenue, fill: 'url(#3DGradient1)' },
    { name: 'Expenses', realValue: bizExpenses, fill: 'url(#3DGradient4)' },
    { name: 'Profit', realValue: bizProfit > 0 ? bizProfit : 0, fill: 'url(#3DGradient3)' },
    { name: 'Loan EMI', realValue: bizLoanEmi, fill: 'url(#BizGradient1)' },
  ];

  const businessChartData = bizRevenue > 0
    ? businessChartRaw.map(d => ({ ...d, value: d.realValue > 0 ? d.realValue : 1 }))
    : businessChartRaw.map(d => ({ ...d, value: 1 }));

  const chartData = isBusiness ? businessChartData : personalChartData;

  // Custom tooltip showing actual ₹ values
  const PieTooltipContent = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    const realVal = d.realValue;
    return (
      <div style={{ background: 'rgba(15, 22, 41, 0.95)', border: '1px solid #1E2A40', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', color: '#fff', fontSize: '12px' }}>
        <strong>{d.name}</strong><br/>
        {realVal !== undefined && realVal > 0 ? `₹${realVal.toLocaleString('en-IN')}` : 'Not set (₹0)'}
      </div>
    );
  };

  const getAIChartSuggestion = () => {
    if (isBusiness) {
      if (!hasBusinessData) {
        return "Add your revenue & expenses using the ✏️ Edit button to get personalized AI insights.";
      }
      const parts = [];
      if (bizRevenue > 0 && Number(bizProfitMargin) < 15) {
        parts.push("increase your Profit slice by reducing operational overhead");
      }
      if (bizHasLoan) {
        parts.push("shrink the Debt slice by accelerating loan repayment");
      }
      if (parts.length > 0) {
        return parts.join(" and ") + " for a healthier business ratio.";
      }
      return "Your business financial pie looks balanced! Focus on scaling Revenue while maintaining margins.";
    }

    // Personal
    if (!hasPersonalData && !hasSalaryData) {
      return "Click the ✏️ Edit button to add your income, SIP, EMI, and tax details for a real breakdown.";
    }
    const tips = [];
    if (monthlySip === 0) tips.push("start a SIP to grow your Investments slice");
    if (!hasHealthIns) tips.push("get health insurance coverage");
    if (!hasEmergency) tips.push("build an emergency fund");
    if (monthlyEmi > 0 && salary > 0 && (monthlyEmi / salary) > 0.4) tips.push("reduce EMI to below 40% of salary");
    if (tips.length > 0) return `Suggestion: ${tips.join(", ")} for a healthier financial ratio.`;
    return "Your allocation looks balanced! Consider stepping up your SIP by 5% annually.";
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, payload }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    if (percent < 0.08) return null;
    const realVal = payload?.realValue;
    const label = realVal !== undefined && realVal > 0
      ? `₹${(realVal / 1000).toFixed(0)}K`
      : '₹0';
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.9)' }}>
        {name} {label}
      </text>
    );
  };

  // ══════════════════════════════════════════
  //  EDIT MODAL — Inline editing of dashboard data
  // ══════════════════════════════════════════
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '6px',
    fontWeight: 600,
  };

  const toggleBtnStyle = (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: active ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
    color: active ? '#10b981' : '#94a3b8',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 0.2s',
  });

  const renderEditModal = () => {
    if (!showEditModal) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: '20px',
      }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
      >
        <div style={{
          background: 'linear-gradient(180deg, #141b2d 0%, #0f1729 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          maxWidth: '560px', width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}>
              <Pencil size={20} color={isBusiness ? '#f59e0b' : '#3b82f6'} />
              Edit Dashboard Data
            </h2>
            <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>

          {isBusiness ? (
            /* ═══ BUSINESS EDIT FORM ═══ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '14px', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>🏢 Business Profile</span>
              </div>
              
              <div>
                <label style={labelStyle}>Monthly Revenue (₹)</label>
                <input type="number" value={editForm.monthlyRevenue} onChange={(e) => handleEditChange('monthlyRevenue', e.target.value)} placeholder="e.g. 500000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Operating Expenses (₹)</label>
                <input type="number" value={editForm.operatingExpenses} onChange={(e) => handleEditChange('operatingExpenses', e.target.value)} placeholder="e.g. 300000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Has Business Loan?</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleEditChange('hasBusinessLoan', 'yes')} style={toggleBtnStyle(editForm.hasBusinessLoan === 'yes')}>Yes</button>
                  <button type="button" onClick={() => handleEditChange('hasBusinessLoan', 'no')} style={toggleBtnStyle(editForm.hasBusinessLoan === 'no')}>No</button>
                </div>
              </div>
              {editForm.hasBusinessLoan === 'yes' && (
                <div>
                  <label style={labelStyle}>Monthly Loan EMI (₹)</label>
                  <input type="number" value={editForm.businessLoanAmount} onChange={(e) => handleEditChange('businessLoanAmount', e.target.value)} placeholder="e.g. 50000" style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>GST Registered?</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleEditChange('gstRegistered', 'yes')} style={toggleBtnStyle(editForm.gstRegistered === 'yes')}>Yes</button>
                  <button type="button" onClick={() => handleEditChange('gstRegistered', 'no')} style={toggleBtnStyle(editForm.gstRegistered === 'no')}>No</button>
                </div>
              </div>
            </div>
          ) : (
            /* ═══ PERSONAL EDIT FORM ═══ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile Section */}
              <div style={{ padding: '14px', background: 'rgba(59,130,246,0.08)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '13px' }}>👤 Profile Data</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Monthly Salary (₹)</label>
                  <input type="number" value={editForm.monthlySalary} onChange={(e) => handleEditChange('monthlySalary', e.target.value)} placeholder="e.g. 80000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Living Expenses (₹)</label>
                  <input type="number" value={editForm.monthlyExpenses} onChange={(e) => handleEditChange('monthlyExpenses', e.target.value)} placeholder="e.g. 40000" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Emergency Fund?</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditChange('emergencySavings', 'yes')} style={toggleBtnStyle(editForm.emergencySavings === 'yes')}>Yes</button>
                    <button type="button" onClick={() => handleEditChange('emergencySavings', 'no')} style={toggleBtnStyle(editForm.emergencySavings === 'no')}>No</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Health Insurance?</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditChange('healthInsurance', 'yes')} style={toggleBtnStyle(editForm.healthInsurance === 'yes')}>Yes</button>
                    <button type="button" onClick={() => handleEditChange('healthInsurance', 'no')} style={toggleBtnStyle(editForm.healthInsurance === 'no')}>No</button>
                  </div>
                </div>
              </div>

              {/* Calculators Section */}
              <div style={{ padding: '14px', background: 'rgba(255,215,0,0.06)', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.15)', marginTop: '8px' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '13px' }}>📊 Calculator Values</span>
              </div>

              {/* EMI */}
              <div>
                <label style={{ ...labelStyle, color: '#f87171' }}>🏦 Loan / EMI</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => handleEditChange('hasEmi', 'yes')} style={toggleBtnStyle(editForm.hasEmi === 'yes')}>Has EMI</button>
                  <button type="button" onClick={() => handleEditChange('hasEmi', 'no')} style={toggleBtnStyle(editForm.hasEmi === 'no')}>No EMI</button>
                </div>
              </div>
              {editForm.hasEmi === 'yes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Principal (₹)</label>
                    <input type="number" value={editForm.loanPrincipal} onChange={(e) => handleEditChange('loanPrincipal', e.target.value)} placeholder="50L" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Rate (%)</label>
                    <input type="number" step="0.1" value={editForm.loanRate} onChange={(e) => handleEditChange('loanRate', e.target.value)} placeholder="8.5" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tenure (yr)</label>
                    <input type="number" value={editForm.loanTenure} onChange={(e) => handleEditChange('loanTenure', e.target.value)} placeholder="20" style={inputStyle} />
                  </div>
                </div>
              )}

              {/* SIP */}
              <div>
                <label style={{ ...labelStyle, color: '#34d399' }}>📈 SIP / Investment</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Monthly (₹)</label>
                    <input type="number" value={editForm.sipAmount} onChange={(e) => handleEditChange('sipAmount', e.target.value)} placeholder="20000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Return (%)</label>
                    <input type="number" step="0.5" value={editForm.sipReturn} onChange={(e) => handleEditChange('sipReturn', e.target.value)} placeholder="12" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Years</label>
                    <input type="number" value={editForm.sipYears} onChange={(e) => handleEditChange('sipYears', e.target.value)} placeholder="10" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Tax */}
              <div>
                <label style={{ ...labelStyle, color: '#fbbf24' }}>💰 Tax Details</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Annual Income (₹)</label>
                    <input type="number" value={editForm.taxIncome} onChange={(e) => handleEditChange('taxIncome', e.target.value)} placeholder="1200000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Deductions (₹)</label>
                    <input type="number" value={editForm.taxDeductions} onChange={(e) => handleEditChange('taxDeductions', e.target.value)} placeholder="150000" style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button onClick={() => setShowEditModal(false)} 
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={saveEdits}
              style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: isBusiness ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tool-page fade-in">
      {renderEditModal()}

      <div className="tool-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>{isBusiness ? 'Your ' : 'Your Active '}<span className="gradient-text">{isBusiness ? 'Business Command Center' : 'Financial Companion'}</span> {isBusiness ? '🏢' : '👋'}</h1>
          <p>{isBusiness ? 'Monitor revenue, margins, and tax strategy — all in one place.' : 'Navigating your wealth journey, step by step.'}</p>
          {(allocationLoss > 0) && (
            <div style={{ marginTop: '10px', padding: '8px 12px', background: isBusiness ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 68, 68, 0.1)', border: `1px solid ${isBusiness ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-red)'}`, borderRadius: '6px', display: 'inline-block' }}>
              <span style={{ color: isBusiness ? '#f59e0b' : 'var(--color-red)', fontWeight: 'bold' }}>{isBusiness ? '📊 Insight:' : '⚠️ Warning:'}</span>
              {isBusiness 
                ? ` Your monthly operating expenses are ₹${bizExpenses.toLocaleString('en-IN')} — optimize to improve margin.`
                : ` You are currently losing approx ₹${allocationLoss.toLocaleString('en-IN')}/month due to poor allocation.`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* ═══ MANUAL EDIT BUTTON ═══ */}
          <button 
            onClick={openEditModal}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontWeight: 600, transition: 'all 0.2s' }}
            title="Manually edit dashboard values"
          >
            <Pencil size={16} /> Edit Dashboard
          </button>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', padding: 0, borderRadius: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', transition: 'all 0.2s' }}
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'linear-gradient(180deg, #141b2d 0%, #0f1729 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  minWidth: '280px',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {!isBusiness ? (
                  <>
                    {/* Header */}
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Add to your Dashboard</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Select one or more trackers to view below</p>
                    </div>

                    {/* Options */}
                    {[
                      {
                        id: 'expense-tracker',
                        icon: '💳',
                        title: 'Expense Tracker',
                        desc: 'Log & categorise your daily spending',
                      },
                      {
                        id: 'income-overview',
                        icon: '💰',
                        title: 'Income Overview',
                        desc: 'See salary, side income & net flow',
                      },
                      {
                        id: 'savings-investments',
                        icon: '📈',
                        title: 'Savings & Investments',
                        desc: 'Track SIPs, goals & portfolio growth',
                      },
                    ].map(item => {
                      const isActive = activeWidgets.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleWidget(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: isActive ? 'rgba(255,107,0,0.08)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Emoji icon */}
                          <div style={{ fontSize: '22px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'rgba(255,107,0,0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '10px', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          {/* Text */}
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: isActive ? '#ff6b00' : '#e2e8f0' }}>{item.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>{item.desc}</p>
                          </div>
                          {/* Checkbox */}
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                            border: isActive ? 'none' : '2px solid rgba(255,255,255,0.2)',
                            background: isActive ? '#ff6b00' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}>
                            {isActive && <svg width="11" height="9" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer Action Button */}
                    <div style={{ padding: '10px 12px' }}>
                      <button
                        onClick={applyWidgets}
                        disabled={activeWidgets.size === 0}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                          background: activeWidgets.size > 0 ? 'linear-gradient(135deg, #ff6b00, #ff8c00)' : 'rgba(255,255,255,0.05)',
                          color: activeWidgets.size > 0 ? '#fff' : '#475569',
                          fontWeight: 700, fontSize: '13px', cursor: activeWidgets.size > 0 ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        {activeWidgets.size > 0 ? `Show ${activeWidgets.size} Widget${activeWidgets.size > 1 ? 's' : ''} on Dashboard ↓` : 'Select a tracker above'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '16px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                    Personal trackers are hidden in Business mode
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section Grid (Scoreboard + Smart Alerts) */}
      <div className="tool-grid" style={{ marginTop: '24px', marginBottom: '24px' }}>
        {/* Health / Business Score (Left Half) */}
        <div className="glass-card" style={{ padding: '24px', margin: 0, border: 'none', background: 'var(--navy-mid)', borderLeft: `4px solid ${isBusiness ? '#f59e0b' : 'var(--gold)'}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(${isBusiness ? '#f59e0b' : 'var(--gold)'} ${healthScore}%, rgba(255,255,255,0.1) 0)` }}>
                <div style={{ position: 'absolute', width: '77px', height: '77px', background: 'var(--navy-mid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '1.6rem', color: isBusiness ? '#f59e0b' : 'var(--gold)' }}>{healthScore}</strong><span style={{ fontSize: '0.6rem', color: '#888' }}>/100</span>
                </div>
              </div>
              <div>
                <h2 style={{ marginBottom: '4px', fontSize: '1.4rem' }}>{isBusiness ? 'Business Score' : 'Overall Score'}</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0 0 8px 0' }}>{isBusiness ? 'Business' : 'Financial'} Health: <strong>{healthScore}/100</strong></p>
                
                {isBusiness ? (
                  Number(bizProfitMargin) < 15 ? (
                    <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                      🚨 {bizRevenue > 0 ? 'Profit margin below 15% threshold.' : 'Add revenue data to track margins.'}
                    </p>
                  ) : (
                    <p style={{ color: 'var(--color-green)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                      🌟 Healthy margins — above industry avg.
                    </p>
                  )
                ) : (
                  !hasHealthIns ? (
                    <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                      🚨 Missing health insurance risk.
                    </p>
                  ) : (
                    <p style={{ color: 'var(--color-green)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>
                      🌟 Better than 65% of peers.
                    </p>
                  )
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '220px', height: '180px', margin: '0 auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <radialGradient id="3DGradient1" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#00E676" />
                      <stop offset="100%" stopColor="#00A550" />
                    </radialGradient>
                    <radialGradient id="3DGradient2" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#00C862" />
                      <stop offset="100%" stopColor="#008A44" />
                    </radialGradient>
                    <radialGradient id="3DGradient3" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#FFE066" />
                      <stop offset="100%" stopColor="#FFC300" />
                    </radialGradient>
                    <radialGradient id="3DGradient4" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#FF7A7A" />
                      <stop offset="100%" stopColor="#E63946" />
                    </radialGradient>
                    <radialGradient id="BizGradient1" cx="30%" cy="30%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </radialGradient>
                    <filter id="pieShadow">
                      <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
                    </filter>
                  </defs>
                  <Tooltip content={<PieTooltipContent />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={25}
                    dataKey="value"
                    stroke="#141B2D"
                    strokeWidth={2}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    filter="url(#pieShadow)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: isBusiness ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 215, 0, 0.08)', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${isBusiness ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 215, 0, 0.2)'}`, flex: '1 1 200px' }}>
              <span style={{ fontSize: '16px', marginTop: '1px' }}>✨</span>
              <p style={{ color: isBusiness ? '#f59e0b' : 'var(--gold)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                <strong>AI {isBusiness ? 'Business' : 'Pie Chart'} Suggestion:</strong> {getAIChartSuggestion()}
              </p>
            </div>

            <button className="btn-primary pulse-glow" style={{ background: isBusiness ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--gold)', color: '#000', whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '13px' }} onClick={() => setActivePage && setActivePage(isBusiness ? 'tax' : 'checkin')}>
              {isBusiness ? 'Open Tax Planner 📊' : 'Update Check-in 📅'}
            </button>
          </div>
        </div>

        {/* Smart Alerts (Right Half) */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="dash-news-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', background: 'var(--navy-mid)' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{isBusiness ? '📊 Business Insights' : '🚨 Smart Alerts for You'}</h3>
          </div>
          <div className="dash-news-list" style={{ padding: '20px', overflowY: 'auto' }}>
            {smartAlerts.map((alert, i) => (
              <div key={i} className="dash-news-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', marginBottom: '12px', borderLeft: `3px solid var(--color-${alert.badgeClass.split('-')[1]})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`badge ${alert.badgeClass}`} style={{ fontSize: '11px', padding: '4px 8px' }}>{alert.title}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.4', margin: '8px 0', color: 'var(--text-secondary)' }}>{alert.desc}</p>
                {alert.actionText && (
                  <button onClick={() => handleAlertAction(alert)} style={{ background: 'transparent', border: 'none', color: alert.badgeClass.includes('gold') || alert.badgeClass.includes('saffron') ? 'var(--gold)' : 'var(--saffron)', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                    {alert.actionText} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div key={i} className={`glass-card dash-stat-card ${s.isEmpty ? 'dash-stat-empty' : ''}`} style={s.isEmpty ? { borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)', opacity: 0.75 } : {}}>
            <div className="dash-stat-top">
              <span className="dash-stat-icon">{s.icon}</span>
              <span className={`badge badge-${s.color}`}>{s.trend}</span>
            </div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-value" style={s.isEmpty ? { color: '#64748b', fontSize: '1.2rem' } : {}}>{s.value}</div>
            {s.isEmpty ? (
              <button onClick={openEditModal} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                <Pencil size={10} style={{ marginRight: '4px' }} /> Set Value
              </button>
            ) : (
              <div className={`dash-stat-bar ${s.color}`}></div>
            )}
          </div>
        ))}
      </div>

      {!isBusiness && activeWidgets.size > 0 && (
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeWidgets.has('income-overview') && (
            <div id="income-overview" style={{ position: 'relative' }}>
              <button onClick={() => { setActiveWidgets(prev => { const n = new Set(prev); n.delete('income-overview'); return n; }); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}><X size={16} /></button>
              <IncomeOverviewWidget />
            </div>
          )}
          {activeWidgets.has('expense-tracker') && (
            <div id="expense-tracker" style={{ position: 'relative' }}>
              <button onClick={() => { setActiveWidgets(prev => { const n = new Set(prev); n.delete('expense-tracker'); return n; }); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}><X size={16} /></button>
              <ExpenseTrackerWidget />
            </div>
          )}
          {activeWidgets.has('savings-investments') && (
            <div id="savings-investments" style={{ position: 'relative' }}>
              <button onClick={() => { setActiveWidgets(prev => { const n = new Set(prev); n.delete('savings-investments'); return n; }); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}><X size={16} /></button>
              <SavingsInvestmentsWidget />
            </div>
          )}
        </div>
      )}

      {/* Bottom Grid for Actions */}
      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">{isBusiness ? '⚡ Business Action Center' : '🚀 Action Center'}</h3>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>{isBusiness ? 'Quick access to your key business tools.' : 'Daily tools to keep you on track.'}</p>
          <div className="dash-actions-grid">
            {quickActions.map((a, i) => (
              <button key={i} className="dash-action-btn" onClick={() => setActivePage && setActivePage(a.event)}>
                <span className="dash-action-icon">{a.icon}</span>
                <strong>{a.title}</strong>
                <span className="dash-action-desc">{a.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', background: isBusiness ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))' : 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,215,0,0.1))', borderRadius: '12px', border: `1px solid ${isBusiness ? 'rgba(245,158,11,0.3)' : 'rgba(255,107,0,0.3)'}`, margin: 0 }}>
            <h4 style={{ color: isBusiness ? '#f59e0b' : 'var(--gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              💎 {isBusiness ? 'Ask AI about your business' : 'Ask AI about your finances'}
            </h4>
            <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '18px', lineHeight: '1.5' }}>
              {isBusiness 
                ? 'Your AI advisor knows your revenue, expenses, and tax status. Ask about GST strategy, cash flow, or growth.' 
                : 'Your personalized advisor knows your salary, expenses, and goals. Ask anything to stay ahead.'}
            </p>
            <button className="btn-primary pulse-glow" style={{ width: '100%', background: isBusiness ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--gradient-saffron)' }} onClick={() => setActivePage && setActivePage('chat')}>
              {isBusiness ? 'Talk to Business AI ✨' : 'Talk to AI Advisor ✨'}
            </button>
          </div>
          
          <div className="glass-card" style={{ padding: '24px', background: 'rgba(255,153,51,0.05)', borderRadius: '12px', border: '1px solid rgba(255,153,51,0.1)', margin: 0 }}>
            <h4 style={{ color: 'var(--saffron)', marginBottom: '10px', fontSize: '15px' }}>{isBusiness ? 'Planning a purchase?' : 'Got a new expense?'}</h4>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '18px', lineHeight: '1.5' }}>
              {isBusiness 
                ? 'Before buying equipment, hiring staff, or expanding — check if your business cash flow can handle it.' 
                : 'Before buying that new phone or car, ask the AI if you can truly afford it.'}
            </p>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActivePage && setActivePage('afford')}>Check Affordability</button>
          </div>
        </div>
      </div>
    </div>
  );
}
