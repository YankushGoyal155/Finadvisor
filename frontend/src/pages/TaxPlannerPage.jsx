import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function TaxPlannerPage() {
  const { taxData, persona } = useDashboard();
  const isBusiness = persona === 'business';
  const [income, setIncome] = useState(taxData.income || 1200000);
  
  // Personal Deductions
  const [sec80C, setSec80C] = useState(taxData.deductions || 150000);
  const [sec80D, setSec80D] = useState(0);
  const [sec80CCD1B, setSec80CCD1B] = useState(0);
  const [hra, setHra] = useState(0);
  const [other, setOther] = useState(0);

  // Business fields
  const [annualTurnover, setAnnualTurnover] = useState(5000000);
  const [businessExpenses, setBusinessExpenses] = useState(3000000);
  const [gstRate, setGstRate] = useState(18);

  useEffect(() => {
    if (taxData) {
      setIncome(taxData.income);
      setSec80C(taxData.deductions);
    }
  }, [taxData]);

  const calcOldRegime = (inc, c80, d80, nps, hraDed, otherDed) => {
    const val = (num) => isNaN(num) ? 0 : Number(num);
    
    let totalDed = 50000; // standard deduction
    totalDed += Math.min(150000, val(c80)); // Max 1.5L
    totalDed += Math.min(100000, val(d80)); // Max ~1L (Self + Parents)
    totalDed += Math.min(50000, val(nps)); // Max 50k
    totalDed += val(hraDed);
    totalDed += val(otherDed);
    
    const taxable = Math.max(0, inc - totalDed);
    
    let tax = 0;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30 + 112500;
    else if (taxable > 500000) tax += (taxable - 500000) * 0.20 + 12500;
    else if (taxable > 250000) tax += (taxable - 250000) * 0.05;

    // Rebate 87A
    if (taxable <= 500000) tax = 0;
    
    const cess = tax * 0.04;
    return Math.round(tax + cess);
  };

  const calcNewRegime = (inc) => {
    const taxable = Math.max(0, inc - 75000); // Standard deduction 75k new regime
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
    // Rebate up to 12L
    if (taxable <= 1200000) tax = 0;
    return Math.round(tax + (tax * 0.04));
  };

  const oldTax = calcOldRegime(income, sec80C, sec80D, sec80CCD1B, hra, other);
  const newTax = calcNewRegime(income);
  const winner = oldTax < newTax ? 'Old' : 'New';
  const savings = Math.abs(oldTax - newTax);

  const formatDed = (d) => {
     let v = 50000 + Math.min(150000, (sec80C || 0)) + Math.min(100000, (sec80D || 0)) + Math.min(50000, (sec80CCD1B || 0)) + (hra || 0) + (other || 0);
     return v;
  }

  // Business tax calculations
  const netProfit = annualTurnover - businessExpenses;
  const calcCorpTax = (profit) => {
    if (profit <= 0) return 0;
    // Presumptive taxation 44AD: if turnover <= 2Cr, 8% of turnover is taxable
    // Otherwise normal corporate rate 25% for turnover < 400Cr
    const rate = annualTurnover <= 20000000 ? 0.25 : 0.30;
    const tax = profit * rate;
    const surcharge = profit > 10000000 ? tax * 0.07 : 0;
    const cess = (tax + surcharge) * 0.04;
    return Math.round(tax + surcharge + cess);
  };
  const corpTax = calcCorpTax(netProfit);
  const gstAmount = Math.round(annualTurnover * (gstRate / 100));
  const effectiveRate = netProfit > 0 ? ((corpTax / netProfit) * 100).toFixed(1) : 0;

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>{isBusiness ? 'Corporate' : 'Indian'} <span className="gradient-text">{isBusiness ? 'Tax & GST' : 'Tax Planner'}</span> {isBusiness ? '🏢' : '⚖️'}</h1>
        <p>{isBusiness ? 'Estimate corporate income tax and GST outflows for your business.' : 'Compare Old vs New Tax Regime (FY 2024-25 / 2025-26)'}</p>
        {isBusiness && <div className="ai-status-badge" style={{background: 'rgba(245,158,11,0.15)', color: '#f59e0b'}}>🏢 Business Mode</div>}
      </div>

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
            {/* ── BUSINESS TAX & GST ── */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 className="card-title">🏢 Business Financials</h3>
              
              <div className="input-group">
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Annual Turnover</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{color: 'var(--text-muted)'}}>₹</span>
                    <input type="number" value={annualTurnover} onChange={(e) => setAnnualTurnover(Number(e.target.value) || 0)} style={{width: '140px', padding: '6px', borderRadius: '4px', border: '1px solid var(--navy-border)', background: 'var(--navy-dark)', color: 'white'}} />
                  </div>
                </div>
                <input type="range" min="100000" max="100000000" step="100000" value={annualTurnover} onChange={(e) => setAnnualTurnover(Number(e.target.value))} />
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
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>GST Configuration</p>
              
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <div className="input-label" style={{alignItems: 'center'}}>
                  <span>Applicable GST Slab</span>
                  <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} style={{padding: '6px 12px', borderRadius: '8px', background: 'var(--navy-dark)', color: '#fff', border: '1px solid var(--navy-border)', fontSize: '14px'}}>
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              {annualTurnover <= 20000000 && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#60a5fa', margin: 0 }}>💡 Eligible for Presumptive Taxation (Sec 44AD) — simplified filing if turnover is below ₹2 Crore.</p>
                </div>
              )}
            </div>

            <div className="results-card">
              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="result-label">Net Taxable Profit</div>
                <div className="result-value" style={{ fontSize: '36px', color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>₹{netProfit.toLocaleString('en-IN')}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Turnover − Expenses</div>
              </div>

              <div className="result-main" style={{ border: '1px dashed rgba(255, 77, 77, 0.3)', background: 'rgba(255, 77, 77, 0.04)' }}>
                <div className="result-label">Estimated Corporate Tax</div>
                <div className="result-value" style={{ color: 'var(--red-accent)', fontSize: '40px' }}>₹{corpTax.toLocaleString('en-IN')}</div>
                <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Effective Rate: <strong>{effectiveRate}%</strong> (incl. Surcharge + 4% Cess)</p>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="result-label">Estimated Annual GST Outflow</div>
                <div className="result-value" style={{ fontSize: '36px', color: '#f59e0b' }}>₹{gstAmount.toLocaleString('en-IN')}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>@ {gstRate}% on total turnover (before Input Tax Credits)</div>
              </div>

              <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>📊 Post-Tax Retained Profit</div>
                <div className="result-value" style={{ fontSize: '30px', color: '#10b981' }}>₹{Math.max(0, netProfit - corpTax).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
