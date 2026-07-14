import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Building2, User, Briefcase, Calculator, TrendingUp, AlertCircle, CheckCircle2, IndianRupee, BarChart3, Receipt } from 'lucide-react';
import './ToolPage.css';

export default function TaxPlannerPage() {
  const { taxData, persona, onboardingData } = useDashboard();
  const isBusiness = persona === 'business';

  // ── PERSONAL STATE ──
  const [income, setIncome] = useState(taxData.income || 1200000);
  const [sec80C, setSec80C] = useState(taxData.deductions || 150000);
  const [sec80D, setSec80D] = useState(0);
  const [sec80CCD1B, setSec80CCD1B] = useState(0);
  const [hra, setHra] = useState(0);
  const [other, setOther] = useState(0);

  // ── BUSINESS STATE ──
  const [entityType, setEntityType] = useState('business'); // business, professional, corporate
  const [annualTurnover, setAnnualTurnover] = useState(5000000);
  const [businessExpenses, setBusinessExpenses] = useState(3000000);
  const [gstRate, setGstRate] = useState(18);
  const [gstRegistered, setGstRegistered] = useState(false);

  // Sync personal tax data
  useEffect(() => {
    if (taxData) {
      setIncome(taxData.income);
      setSec80C(taxData.deductions);
    }
  }, [taxData]);

  // ★ Sync onboarding business data into tax planner
  useEffect(() => {
    if (isBusiness && onboardingData) {
      if (onboardingData.monthlyRevenue) {
        setAnnualTurnover(Number(onboardingData.monthlyRevenue) * 12);
      }
      if (onboardingData.operatingExpenses) {
        setBusinessExpenses(Number(onboardingData.operatingExpenses) * 12);
      }
      if (onboardingData.gstRegistered === 'yes') {
        setGstRegistered(true);
      }
    }
  }, [isBusiness, onboardingData]);

  // ══════════════════════════════════════════════
  //  PERSONAL TAX CALCULATIONS (untouched)
  // ══════════════════════════════════════════════
  const calcOldRegime = (inc, c80, d80, nps, hraDed, otherDed) => {
    const val = (num) => isNaN(num) ? 0 : Number(num);
    let totalDed = 50000;
    totalDed += Math.min(150000, val(c80));
    totalDed += Math.min(100000, val(d80));
    totalDed += Math.min(50000, val(nps));
    totalDed += val(hraDed);
    totalDed += val(otherDed);
    const taxable = Math.max(0, inc - totalDed);
    let tax = 0;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30 + 112500;
    else if (taxable > 500000) tax += (taxable - 500000) * 0.20 + 12500;
    else if (taxable > 250000) tax += (taxable - 250000) * 0.05;
    if (taxable <= 500000) tax = 0;
    const cess = tax * 0.04;
    return Math.round(tax + cess);
  };

  const calcNewRegime = (inc) => {
    const taxable = Math.max(0, inc - 75000);
    const slabs = [
      [400000, 0.00], [400000, 0.05], [400000, 0.10],
      [400000, 0.15], [400000, 0.20], [400000, 0.25], [Infinity, 0.30]
    ];
    let tax = 0, rem = taxable;
    for (const [lim, rat] of slabs) {
      const amt = Math.min(rem, lim);
      tax += amt * rat;
      rem -= amt;
      if (rem <= 0) break;
    }
    if (taxable <= 1200000) tax = 0;
    return Math.round(tax + (tax * 0.04));
  };

  const oldTax = calcOldRegime(income, sec80C, sec80D, sec80CCD1B, hra, other);
  const newTax = calcNewRegime(income);
  const winner = oldTax < newTax ? 'Old' : 'New';
  const savings = Math.abs(oldTax - newTax);

  const formatDed = () => {
    let v = 50000 + Math.min(150000, (sec80C || 0)) + Math.min(100000, (sec80D || 0)) + Math.min(50000, (sec80CCD1B || 0)) + (hra || 0) + (other || 0);
    return v;
  };

  // ══════════════════════════════════════════════
  //  BUSINESS TAX CALCULATIONS (enhanced)
  // ══════════════════════════════════════════════
  const netProfit = Math.max(0, annualTurnover - businessExpenses);

  // Individual slab for Proprietors / Freelancers (New Regime)
  const calculateIndividualTax = (taxableIncome) => {
    if (taxableIncome <= 700000) return 0;
    let tax = 0;
    if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
    if (taxableIncome > 700000) tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
    if (taxableIncome > 1000000) tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
    if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
    if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
    return Math.round(tax + (tax * 0.04));
  };

  const calculateBusinessTaxes = () => {
    let result = {
      netProfit,
      regime1Name: '',
      regime1Tax: 0,
      regime2Name: '',
      regime2Tax: 0,
      recommendation: '',
      presumptiveEligible: false,
    };

    if (entityType === 'business') {
      // Sole Proprietorship — compare Normal vs Sec 44AD (6% presumptive)
      const normalTax = calculateIndividualTax(netProfit);
      const presumptiveProfit = annualTurnover * 0.06;
      const presumptiveTax = calculateIndividualTax(presumptiveProfit);

      result.regime1Name = "Normal Tax (Audit-based)";
      result.regime1Tax = normalTax;
      result.regime2Name = "Presumptive (Sec 44AD @ 6%)";
      result.regime2Tax = presumptiveTax;
      result.presumptiveEligible = annualTurnover <= 30000000;

      if (presumptiveTax < normalTax && annualTurnover <= 30000000) {
        result.recommendation = `Opt for Presumptive Taxation (Sec 44AD). You save ₹${(normalTax - presumptiveTax).toLocaleString('en-IN')} and avoid audit books!`;
      } else if (annualTurnover > 30000000) {
        result.recommendation = "Turnover exceeds ₹3 Cr limit. Presumptive taxation under Sec 44AD isn't available. Normal audit-based filing applies.";
      } else {
        result.recommendation = "Normal taxation works out better since your actual expenses are very high, resulting in lower taxable profit than the 6% deemed profit.";
      }
    } else if (entityType === 'professional') {
      // Freelancers / Professionals — compare Normal vs Sec 44ADA (50% presumptive)
      const normalTax = calculateIndividualTax(netProfit);
      const presumptiveProfit = annualTurnover * 0.50;
      const presumptiveTax = calculateIndividualTax(presumptiveProfit);

      result.regime1Name = "Normal Tax (Audit-based)";
      result.regime1Tax = normalTax;
      result.regime2Name = "Presumptive (Sec 44ADA @ 50%)";
      result.regime2Tax = presumptiveTax;
      result.presumptiveEligible = annualTurnover <= 7500000;

      if (presumptiveTax < normalTax && annualTurnover <= 7500000) {
        result.recommendation = `Opt for Presumptive Taxation (Sec 44ADA). Save ₹${(normalTax - presumptiveTax).toLocaleString('en-IN')} without bookkeeping hassle.`;
      } else if (annualTurnover > 7500000) {
        result.recommendation = "Turnover exceeds ₹75 Lakh limit. Presumptive tax under Sec 44ADA isn't available. Audit-based filing required.";
      } else {
        result.recommendation = "Normal taxation is better. Your actual profit margin is lower than 50% due to high expenses.";
      }
    } else if (entityType === 'corporate') {
      // Private Limited — compare Standard (~26%) vs Concessional Sec 115BAA (~25.17%)
      const standardTax = Math.round(netProfit * 0.26);
      const concessionalTax = Math.round(netProfit * 0.25168);

      result.regime1Name = "Standard Corporate (~26%)";
      result.regime1Tax = standardTax;
      result.regime2Name = "Concessional (Sec 115BAA ~25.17%)";
      result.regime2Tax = concessionalTax;
      result.presumptiveEligible = false;

      result.recommendation = "As a Private Company, Section 115BAA is generally better unless you have heavy carried-forward losses or specific old-regime deductions.";
    }

    return result;
  };

  const bizTax = calculateBusinessTaxes();
  const gstAmount = gstRegistered ? Math.round(annualTurnover * (gstRate / 100)) : 0;
  const bestTax = Math.min(bizTax.regime1Tax, bizTax.regime2Tax);
  const retainedProfit = Math.max(0, netProfit - bestTax);

  // Entity type styling
  const entityStyles = {
    business: { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#f59e0b' },
    professional: { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#a78bfa' },
    corporate: { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#60a5fa' },
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>{isBusiness ? 'Business' : 'Indian'} <span className="gradient-text">{isBusiness ? 'Tax & GST Planner' : 'Tax Planner'}</span> {isBusiness ? '🏢' : '⚖️'}</h1>
        <p>{isBusiness ? 'Smart tax comparisons for Proprietors, Freelancers & Private Companies — synced with your profile.' : 'Compare Old vs New Tax Regime (FY 2024-25 / 2025-26)'}</p>
        {isBusiness && <div className="ai-status-badge" style={{background: 'rgba(245,158,11,0.15)', color: '#f59e0b'}}>🏢 Business Mode</div>}
      </div>

      {/* ═══ BUSINESS: Entity Type Selector ═══ */}
      {isBusiness && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'business', label: 'Proprietor (Trading/Biz)', icon: <User size={18} /> },
            { key: 'professional', label: 'Freelancer / Professional', icon: <Briefcase size={18} /> },
            { key: 'corporate', label: 'Private Limited Company', icon: <Building2 size={18} /> },
          ].map(e => (
            <button
              key={e.key}
              onClick={() => setEntityType(e.key)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: entityType === e.key ? entityStyles[e.key].gradient : 'transparent',
                color: entityType === e.key ? '#fff' : '#94a3b8',
                border: entityType === e.key ? 'none' : '1px solid transparent',
                fontWeight: entityType === e.key ? 700 : 500,
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                boxShadow: entityType === e.key ? `0 6px 20px ${entityStyles[e.key].color}33` : 'none',
              }}
            >
              {e.icon}
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="tool-grid">
        {!isBusiness ? (
          <>
            {/* ── PERSONAL TAX (unchanged UI) ── */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 className="card-title">⌨️ Income & Deductions</h3>
              
              <div className="input-group">
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Annual Salary Income</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{color: 'var(--text-muted)'}}>₹</span>
                    <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value) || 0)} style={{width: '120px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white'}} />
                  </div>
                </div>
                <input type="range" min="300000" max="10000000" step="10000" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Old Regime Deductions</p>
              
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Section 80C (PPF, ELSS, etc.)</span>
                  <input type="number" value={sec80C} onChange={(e) => setSec80C(Number(e.target.value) || 0)} style={{width: '90px', padding: '4px', borderRadius: '4px'}} className="number-input" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>* Max ₹1,50,000</p>
              </div>

              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Section 80D (Health Ins.)</span>
                  <input type="number" value={sec80D} onChange={(e) => setSec80D(Number(e.target.value) || 0)} style={{width: '90px', padding: '4px', borderRadius: '4px'}} className="number-input" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>* Max ~₹75,000 to ₹1,00,000</p>
              </div>

              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Section 80CCD(1B) (NPS)</span>
                  <input type="number" value={sec80CCD1B} onChange={(e) => setSec80CCD1B(Number(e.target.value) || 0)} style={{width: '90px', padding: '4px', borderRadius: '4px'}} className="number-input" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>* Max ₹50,000</p>
              </div>

              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Exempt HRA</span>
                  <input type="number" value={hra} onChange={(e) => setHra(Number(e.target.value) || 0)} style={{width: '90px', padding: '4px', borderRadius: '4px'}} className="number-input" />
                </div>
              </div>
              
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Other (80E, 80G, LTA, etc)</span>
                  <input type="number" value={other} onChange={(e) => setOther(Number(e.target.value) || 0)} style={{width: '90px', padding: '4px', borderRadius: '4px'}} className="number-input" />
                </div>
              </div>
            </div>

            <div className="results-card">
              <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                {winner === 'New' && <div className="badge badge-green" style={{ position: 'absolute', top: '16px', right: '16px' }}>✅ Recommended</div>}
                <div className="result-label">New Tax Regime</div>
                <div className="result-value" style={{ fontSize: '40px' }}>₹{newTax.toLocaleString('en-IN')}</div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Standard Deduction: ₹75,000 applied.</div>
              </div>

              <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                {winner === 'Old' && <div className="badge badge-green" style={{ position: 'absolute', top: '16px', right: '16px' }}>✅ Recommended</div>}
                <div className="result-label">Old Tax Regime</div>
                <div className="result-value" style={{ fontSize: '40px' }}>₹{oldTax.toLocaleString('en-IN')}</div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Includes ₹50k Std. Ded. + ₹{(formatDed() - 50000).toLocaleString('en-IN')} deductions.</div>
              </div>

              <div className="result-main" style={{ border: '1px dashed rgba(0,200,98,0.3)', background: 'rgba(0,200,98,0.04)' }}>
                <div className="result-label">Potential Annual Savings</div>
                <div className="result-value" style={{ color: 'var(--green-light)', fontSize: '42px' }}>₹{savings.toLocaleString('en-IN')}</div>
                <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Switch to the <strong style={{ color: 'var(--text-primary)' }}>{winner} Regime</strong> to save more!
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ══════════════════════════════════════════ */}
            {/* ══  BUSINESS TAX — FULL FEATURED VIEW  ══ */}
            {/* ══════════════════════════════════════════ */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calculator size={20} style={{ color: entityStyles[entityType].color }} />
                Financial Details
              </h3>

              {/* Synced from onboarding indicator */}
              {onboardingData?.monthlyRevenue && (
                <div style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#34d399' }}>Auto-synced from your onboarding profile. Adjust values below as needed.</span>
                </div>
              )}

              <div className="input-group">
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Annual Gross Turnover</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{color: 'var(--text-muted)'}}>₹</span>
                    <input type="number" value={annualTurnover} onChange={(e) => setAnnualTurnover(Number(e.target.value) || 0)} style={{width: '140px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white'}} />
                  </div>
                </div>
                <input type="range" min="100000" max="100000000" step="100000" value={annualTurnover} onChange={(e) => setAnnualTurnover(Number(e.target.value))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>₹1 Lakh</span>
                  <span style={{ fontWeight: 700, color: entityStyles[entityType].color }}>₹{(annualTurnover / 100000).toFixed(1)} Lakhs</span>
                  <span>₹10 Cr</span>
                </div>
              </div>

              <div className="input-group">
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Total Business Expenses</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{color: 'var(--text-muted)'}}>₹</span>
                    <input type="number" value={businessExpenses} onChange={(e) => setBusinessExpenses(Number(e.target.value) || 0)} style={{width: '140px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white'}} />
                  </div>
                </div>
                <input type="range" min="0" max="100000000" step="100000" value={businessExpenses} onChange={(e) => setBusinessExpenses(Number(e.target.value))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>₹0</span>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{(businessExpenses / 100000).toFixed(1)} Lakhs</span>
                  <span>₹10 Cr</span>
                </div>
              </div>

              {/* Net Profit Summary */}
              <div style={{ background: netProfit > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${netProfit > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Net Taxable Profit</span>
                <strong style={{ color: netProfit > 0 ? '#10b981' : '#ef4444', fontSize: '1.3rem' }}>₹{netProfit.toLocaleString('en-IN')}</strong>
              </div>

              {/* GST Section */}
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>GST Configuration</p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div className="input-label" style={{alignItems: 'center', marginBottom: '8px'}}>
                    <span>GST Registered?</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setGstRegistered(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', background: gstRegistered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)', color: gstRegistered ? '#10b981' : '#94a3b8', border: gstRegistered ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)', fontWeight: gstRegistered ? 700 : 400, fontSize: '13px', fontFamily: 'inherit' }}>Yes</button>
                    <button onClick={() => setGstRegistered(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', background: !gstRegistered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', color: !gstRegistered ? '#ef4444' : '#94a3b8', border: !gstRegistered ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.08)', fontWeight: !gstRegistered ? 700 : 400, fontSize: '13px', fontFamily: 'inherit' }}>No</button>
                  </div>
                </div>
                {gstRegistered && (
                  <div style={{ flex: 1 }}>
                    <div className="input-label" style={{alignItems: 'center', marginBottom: '8px'}}>
                      <span>GST Slab</span>
                    </div>
                    <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--navy-dark)', color: '#fff', border: '1px solid var(--navy-border)', fontSize: '14px', fontFamily: 'inherit'}}>
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Presumptive eligibility hint */}
              {bizTax.presumptiveEligible && (
                <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#60a5fa', margin: 0 }}>
                    💡 Eligible for Presumptive Taxation ({entityType === 'business' ? 'Sec 44AD' : 'Sec 44ADA'}) — simplified filing with no audit required!
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Tax Comparison Output ── */}
            <div className="results-card">
              {/* Head-to-Head Comparison */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <BarChart3 size={20} style={{ color: entityStyles[entityType].color }} />
                  Tax Regime Comparison
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {/* Regime 1 */}
                  <div style={{ flex: 1, background: bizTax.regime1Tax <= bizTax.regime2Tax ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)' : 'rgba(0,0,0,0.2)', border: `1px solid ${bizTax.regime1Tax <= bizTax.regime2Tax ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.08)'}`, padding: '20px', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                    {bizTax.regime1Tax <= bizTax.regime2Tax && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px' }}>BEST OPTION</div>
                    )}
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '36px', marginBottom: '10px' }}>{bizTax.regime1Name}</h4>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>₹{bizTax.regime1Tax.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Payable</span>
                  </div>

                  {/* VS */}
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>VS</div>

                  {/* Regime 2 */}
                  <div style={{ flex: 1, background: bizTax.regime2Tax < bizTax.regime1Tax ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)' : 'rgba(0,0,0,0.2)', border: `1px solid ${bizTax.regime2Tax < bizTax.regime1Tax ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.08)'}`, padding: '20px', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                    {bizTax.regime2Tax < bizTax.regime1Tax && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px' }}>BEST OPTION</div>
                    )}
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '36px', marginBottom: '10px' }}>{bizTax.regime2Name}</h4>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>₹{bizTax.regime2Tax.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Payable</span>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', background: bizTax.recommendation.includes('Opt') || bizTax.recommendation.includes('better') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', border: `1px solid ${bizTax.recommendation.includes('Opt') || bizTax.recommendation.includes('better') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}>
                  {bizTax.recommendation.includes('Opt') ? <CheckCircle2 size={22} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={22} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />}
                  <p style={{ fontSize: '13px', color: bizTax.recommendation.includes('Opt') ? '#34d399' : '#fbbf24', margin: 0, lineHeight: 1.6 }}>{bizTax.recommendation}</p>
                </div>
              </div>

              {/* Tax Savings */}
              <div className="result-main" style={{ border: '1px dashed rgba(0,200,98,0.3)', background: 'rgba(0,200,98,0.04)' }}>
                <div className="result-label">Potential Tax Savings</div>
                <div className="result-value" style={{ color: 'var(--green-light)', fontSize: '42px' }}>₹{Math.abs(bizTax.regime1Tax - bizTax.regime2Tax).toLocaleString('en-IN')}</div>
                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  by choosing <strong style={{ color: 'var(--text-primary)' }}>{bizTax.regime1Tax <= bizTax.regime2Tax ? bizTax.regime1Name : bizTax.regime2Name}</strong>
                </p>
              </div>

              {/* GST + Retained Profit Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="glass-card" style={{ padding: '20px', margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Receipt size={16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Outflow</span>
                  </div>
                  <div className="result-value" style={{ fontSize: '24px', color: gstRegistered ? '#f59e0b' : '#64748b' }}>
                    {gstRegistered ? `₹${gstAmount.toLocaleString('en-IN')}` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{gstRegistered ? `@ ${gstRate}% on turnover` : 'Not GST registered'}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px', margin: 0, border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <IndianRupee size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Retained Profit</span>
                  </div>
                  <div className="result-value" style={{ fontSize: '24px', color: '#10b981' }}>₹{retainedProfit.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>After best-case income tax</div>
                </div>
              </div>

              <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                *Calculations are estimates based on Indian taxation rules for FY 2024-25. Professional advice recommended.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
