import React, { useState } from 'react';
import './CorporateTaxPage.css';
import { Building2, User, Briefcase, Calculator, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CorporateTaxPage() {
  const [entityType, setEntityType] = useState('business'); // business, professional, corporate
  const [revenue, setRevenue] = useState(2500000);
  const [expenses, setExpenses] = useState(1500000);

  // Simple New Tax Regime Slab Calculation (for Proprietorships/Professionals)
  const calculateIndividualTax = (income) => {
    if (income <= 700000) return 0; // Tax rebate up to 7L under new regime
    let tax = 0;
    if (income > 300000) tax += Math.min(income - 300000, 400000) * 0.05;
    if (income > 700000) tax += Math.min(income - 700000, 300000) * 0.10;
    if (income > 1000000) tax += Math.min(income - 1000000, 200000) * 0.15;
    if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
    if (income > 1500000) tax += (income - 1500000) * 0.30;
    return tax + (tax * 0.04); // adding 4% health & education cess
  };

  const calculateTaxes = () => {
    const netProfit = Math.max(0, revenue - expenses);
    let result = {
      netProfit,
      regime1Name: '',
      regime1Tax: 0,
      regime2Name: '',
      regime2Tax: 0,
      recommendation: '',
    };

    if (entityType === 'business') {
      // Sole Proprietorship (Trading / Retail / Mfg)
      const normalTax = calculateIndividualTax(netProfit);
      
      // Section 44AD Presumptive (Assume 6% profit on digital transactions)
      const presumptiveProfit = revenue * 0.06;
      const presumptiveTax = calculateIndividualTax(presumptiveProfit);

      result.regime1Name = "Detailed Audit (Normal Tax)";
      result.regime1Tax = normalTax;
      result.regime2Name = "Presumptive Tax (Sec 44AD @ 6%)";
      result.regime2Tax = presumptiveTax;

      if (presumptiveTax < normalTax && revenue <= 30000000) {
        result.recommendation = `Opt for Presumptive Taxation (Sec 44AD). You save ₹${(normalTax - presumptiveTax).toLocaleString('en-IN')} and don't need to maintain heavy audit books!`;
      } else {
        result.recommendation = "Normal taxation is better because your actual expenses are very high, resulting in lower net profit.";
      }

    } else if (entityType === 'professional') {
      // Professionals / Freelancers
      const normalTax = calculateIndividualTax(netProfit);
      
      // Section 44ADA Presumptive (50% profit)
      const presumptiveProfit = revenue * 0.50;
      const presumptiveTax = calculateIndividualTax(presumptiveProfit);

      result.regime1Name = "Detailed Audit (Normal Tax)";
      result.regime1Tax = normalTax;
      result.regime2Name = "Presumptive Tax (Sec 44ADA @ 50%)";
      result.regime2Tax = presumptiveTax;

      if (presumptiveTax < normalTax && revenue <= 7500000) {
        result.recommendation = `Opt for Presumptive Taxation (Sec 44ADA). You save ₹${(normalTax - presumptiveTax).toLocaleString('en-IN')} without bookkeeping hassle.`;
      } else {
        result.recommendation = "Normal taxation is better. Your actual profit margin is lower than 50% due to high expenses.";
      }

    } else if (entityType === 'corporate') {
      // Private Limited Company
      // Option 1: Standard Tax (approx 25% + matching cess) -> ~26%
      const standardTax = netProfit * 0.26;
      
      // Option 2: Section 115BAA (Flat 22% + 10% Surcharge + 4% Cess = 25.168%)
      const concessionalTax = netProfit * 0.25168;

      result.regime1Name = "Standard Corporate Tax (~26%)";
      result.regime1Tax = standardTax;
      result.regime2Name = "Concessional (Sec 115BAA ~25.17%)";
      result.regime2Tax = concessionalTax;

      result.recommendation = "As a Private Company, Section 115BAA is generally better if you don't have heavy carrying-forward losses or specific deductions.";
    }

    return result;
  };

  const taxData = calculateTaxes();

  return (
    <div className="corp-tax-wrapper fade-in">
      <div className="corp-tax-header">
        <h1 className="gradient-text">Business & Corporate Tax Planner</h1>
        <p>Simple tax comparisons for Proprietors, Freelancers, and Private Companies.</p>
      </div>

      {/* Profile Selector */}
      <div className="entity-selector">
        <label 
          className={`entity-btn ${entityType === 'business' ? 'active' : ''}`}
          onClick={() => setEntityType('business')}
        >
          <User size={20} />
          <span>Proprietor (Trading/Biz)</span>
        </label>
        <label 
          className={`entity-btn ${entityType === 'professional' ? 'active' : ''}`}
          onClick={() => setEntityType('professional')}
        >
          <Briefcase size={20} />
          <span>Freelancer / Professional</span>
        </label>
        <label 
          className={`entity-btn ${entityType === 'corporate' ? 'active' : ''}`}
          onClick={() => setEntityType('corporate')}
        >
          <Building2 size={20} />
          <span>Private Limited Company</span>
        </label>
      </div>

      <div className="tax-dashboard-grid">
        {/* Left: Interactive Inputs */}
        <div className="tax-input-card">
          <div className="card-heading">
            <Calculator className="icon-gold" />
            <h2>Financial Details</h2>
          </div>

          <div className="input-group">
            <div className="label-flex">
              <label>Annual Gross Revenue</label>
              <span className="value-badge">₹{(revenue / 100000).toFixed(1)} Lakhs</span>
            </div>
            <input 
              type="range" 
              className="styled-slider gold-slider" 
              min="0" max="50000000" step="500000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
            />
            <div className="slider-marks">
              <span>₹0</span>
              <span>₹5 Cr</span>
            </div>
          </div>

          <div className="input-group">
            <div className="label-flex">
              <label>Actual Business Expenses</label>
              <span className="value-badge">₹{(expenses / 100000).toFixed(1)} Lakhs</span>
            </div>
            <input 
              type="range" 
              className="styled-slider red-slider" 
              min="0" max="50000000" step="100000"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
            />
            <div className="slider-marks">
              <span>₹0</span>
              <span>₹5 Cr</span>
            </div>
          </div>

          <div className="summary-box">
            <span>Resulting Actual Net Profit:</span>
            <strong>₹{taxData.netProfit.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Right: AI Analysis & Output */}
        <div className="tax-output-card">
          <div className="card-heading">
            <TrendingUp className="icon-blue" />
            <h2>Tax Comparison</h2>
          </div>

          <div className="comparison-flex">
            <div className="tax-bucket">
              <h4>{taxData.regime1Name}</h4>
              <div className="tax-amount">₹{Math.round(taxData.regime1Tax).toLocaleString('en-IN')}</div>
              <span className="tax-subtitle">Tax Payable</span>
            </div>

            <div className="vs-circle">VS</div>

            <div className={`tax-bucket ${taxData.regime2Tax < taxData.regime1Tax ? 'winner' : ''}`}>
              <h4>{taxData.regime2Name}</h4>
              <div className="tax-amount">₹{Math.round(taxData.regime2Tax).toLocaleString('en-IN')}</div>
              <span className="tax-subtitle">Tax Payable</span>
            </div>
          </div>

          <div className={`ai-recommendation ${taxData.recommendation.includes('better') || taxData.recommendation.includes('Opt') ? 'positive' : 'warning'}`}>
            {taxData.recommendation.includes('Opt') ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p>{taxData.recommendation}</p>
          </div>
          
          <div className="disclaimer-note">
            <p>*Calculations are estimates based on standard Indian corporate and presumptive taxation rules for FY 24-25. Professional advice is recommended.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
