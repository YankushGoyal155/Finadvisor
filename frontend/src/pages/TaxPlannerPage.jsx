import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function TaxPlannerPage() {
  const { taxData } = useDashboard();
  const [income, setIncome] = useState(taxData.income || 1200000);
  
  // Deductions
  const [sec80C, setSec80C] = useState(taxData.deductions || 150000);
  const [sec80D, setSec80D] = useState(0); // Health Insurance
  const [sec80CCD1B, setSec80CCD1B] = useState(0); // NPS
  const [hra, setHra] = useState(0); // HRA
  const [other, setOther] = useState(0); // Other (LTA, 80G, etc)

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

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>Indian <span className="gradient-text">Tax Planner</span> ⚖️</h1>
        <p>Compare Old vs New Tax Regime (FY 2024-25 / 2025-26)</p>
      </div>

      <div className="tool-grid">
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
          {/* New Regime */}
          <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
            {winner === 'New' && <div className="badge badge-green" style={{ position: 'absolute', top: '16px', right: '16px' }}>✅ Recommended</div>}
            <div className="result-label">New Tax Regime</div>
            <div className="result-value" style={{ fontSize: '40px' }}>₹{newTax.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Standard Deduction: ₹75,000 applied.</div>
          </div>

          {/* Old Regime */}
          <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
            {winner === 'Old' && <div className="badge badge-green" style={{ position: 'absolute', top: '16px', right: '16px' }}>✅ Recommended</div>}
            <div className="result-label">Old Tax Regime</div>
            <div className="result-value" style={{ fontSize: '40px' }}>₹{oldTax.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Includes ₹50k Std. Ded. + ₹{(formatDed() - 50000).toLocaleString('en-IN')} deductions.</div>
          </div>

          {/* Savings */}
          <div className="result-main" style={{ border: '1px dashed rgba(0,200,98,0.3)', background: 'rgba(0,200,98,0.04)' }}>
            <div className="result-label">Potential Annual Savings</div>
            <div className="result-value" style={{ color: 'var(--green-light)', fontSize: '42px' }}>₹{savings.toLocaleString('en-IN')}</div>
            <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Switch to the <strong style={{ color: 'var(--text-primary)' }}>{winner} Regime</strong> to save more!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
