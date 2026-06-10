import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function TaxPlannerPage() {
  const { taxData } = useDashboard();
  const [income, setIncome] = useState(taxData.income);
  const [deductions, setDeductions] = useState(taxData.deductions);

  useEffect(() => {
    setIncome(taxData.income);
    setDeductions(taxData.deductions);
  }, [taxData]);

  const calcOldRegime = (inc, ded) => {
    const taxable = Math.max(0, inc - ded - 50000);
    let tax = 0;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
    if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.20;
    if (taxable > 250000) tax += Math.min(taxable - 250000, 250000) * 0.05;
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

  const oldTax = calcOldRegime(income, deductions);
  const newTax = calcNewRegime(income);
  const winner = oldTax < newTax ? 'Old' : 'New';
  const savings = Math.abs(oldTax - newTax);

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>Indian <span className="gradient-text">Tax Planner</span> ⚖️</h1>
        <p>Compare Old vs New Tax Regime (FY 2024-25 / 2025-26)</p>
      </div>

      <div className="tool-grid">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 className="card-title">⌨️ Your Income Details</h3>
          
          <div className="input-group">
            <div className="input-label">
              <span>Annual Salary Income</span>
              <span>₹{income.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="300000" max="10000000" step="10000" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <div className="input-label">
              <span>Section 80C Deductions</span>
              <span>₹{deductions.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min="0" max="150000" step="5000" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>* Max ₹1,50,000 under 80C (PPF, ELSS, LIC, etc.)</p>
          </div>

          {/* Tax Slab Info */}
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--navy-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--navy-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontWeight: '600' }}>New Regime Slabs (FY 2025-26)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>0 – 4L: <strong style={{ color: 'var(--green-light)' }}>Nil</strong></span>
              <span>4 – 8L: <strong style={{ color: 'var(--text-primary)' }}>5%</strong></span>
              <span>8 – 12L: <strong style={{ color: 'var(--text-primary)' }}>10%</strong></span>
              <span>12 – 16L: <strong style={{ color: 'var(--text-primary)' }}>15%</strong></span>
              <span>16 – 20L: <strong style={{ color: 'var(--saffron)' }}>20%</strong></span>
              <span>Above 24L: <strong style={{ color: 'var(--red-accent)' }}>30%</strong></span>
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
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Includes ₹50k Std. Deduction + ₹{deductions/1000}k 80C.</div>
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
