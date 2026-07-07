import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function OnboardingPage({ onComplete, user }) {
  const { updateOnboardingData, updatePersona } = useDashboard();
  const [selectedPersona, setSelectedPersona] = useState('personal');
  
  const [formData, setFormData] = useState({
    // Personal fields
    monthlySalary: '',
    monthlyExpenses: '',
    hasEmi: 'no',
    emiAmount: '',
    emiPurpose: '',
    emergencySavings: 'no',
    emergencyAmount: '',
    healthInsurance: 'no',
    healthAmount: '',
    lifeInsurance: 'no',
    lifeAmount: '',
    financialGoal: '',
    // Business fields
    monthlyRevenue: '',
    operatingExpenses: '',
    hasBusinessLoan: 'no',
    businessLoanAmount: '',
    businessLoanPurpose: '',
    gstRegistered: 'no',
    businessGoal: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, persona: selectedPersona };
    if (updateOnboardingData) {
      updateOnboardingData(dataToSave);
    }
    updatePersona(selectedPersona);
    localStorage.setItem(`finance_onboarding_data_${user?.user_id}`, JSON.stringify(dataToSave));
    onComplete();
  };

  const isBusiness = selectedPersona === 'business';

  return (
    <div className="tool-page fade-in" style={{ padding: '40px 20px' }}>
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '40px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '10px' }}>Welcome to <span className="gradient-text">Finance AI</span></h1>
          <p style={{ color: '#aaa' }}>Let's set up your profile to generate your instant Financial Score.</p>
        </div>

        {/* Persona Toggle */}
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>How are you using Finance AI?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => setSelectedPersona('personal')}
              style={{
                flex: 1, padding: '18px 16px', borderRadius: '16px', cursor: 'pointer',
                background: !isBusiness ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.04)',
                color: !isBusiness ? '#fff' : '#94a3b8',
                border: !isBusiness ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                fontWeight: !isBusiness ? 800 : 500,
                fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.3s ease',
                boxShadow: !isBusiness ? '0 8px 30px rgba(59,130,246,0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px' }}>👤</span>
              Personal Wealth
            </button>
            <button 
              type="button"
              onClick={() => setSelectedPersona('business')}
              style={{
                flex: 1, padding: '18px 16px', borderRadius: '16px', cursor: 'pointer',
                background: isBusiness ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.04)',
                color: isBusiness ? '#fff' : '#94a3b8',
                border: isBusiness ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
                fontWeight: isBusiness ? 800 : 500,
                fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.3s ease',
                boxShadow: isBusiness ? '0 8px 30px rgba(245,158,11,0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px' }}>🏢</span>
              Business Finance
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!isBusiness ? (
            <>
              {/* ── PERSONAL FIELDS (unchanged) ── */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Monthly Salary (₹)</label>
                  <input type="number" name="monthlySalary" required value={formData.monthlySalary} onChange={handleChange} placeholder="e.g. 50000" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Monthly Expenses (₹)</label>
                  <input type="number" name="monthlyExpenses" required value={formData.monthlyExpenses} onChange={handleChange} placeholder="e.g. 30000" />
                </div>
              </div>

              <div className="form-group">
                <label>Any EMI?</label>
                <select name="hasEmi" value={formData.hasEmi} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.hasEmi === 'yes' && (
                <div style={{ display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '2px solid var(--navy-mid)' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>EMI Amount (₹)</label>
                    <input type="number" name="emiAmount" value={formData.emiAmount} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Purpose</label>
                    <input type="text" name="emiPurpose" value={formData.emiPurpose} onChange={handleChange} placeholder="Car, House, etc." required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Emergency Savings?</label>
                <select name="emergencySavings" value={formData.emergencySavings} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.emergencySavings === 'yes' && (
                <div className="form-group" style={{ paddingLeft: '20px', borderLeft: '2px solid var(--navy-mid)' }}>
                  <label>Amount (₹)</label>
                  <input type="number" name="emergencyAmount" value={formData.emergencyAmount} onChange={handleChange} required />
                </div>
              )}

              <div className="form-group">
                <label>Health Insurance?</label>
                <select name="healthInsurance" value={formData.healthInsurance} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.healthInsurance === 'yes' && (
                <div className="form-group" style={{ paddingLeft: '20px', borderLeft: '2px solid var(--navy-mid)' }}>
                  <label>Cover Amount (₹)</label>
                  <input type="number" name="healthAmount" value={formData.healthAmount} onChange={handleChange} required />
                </div>
              )}

              <div className="form-group">
                <label>Life or Term Insurance?</label>
                <select name="lifeInsurance" value={formData.lifeInsurance} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.lifeInsurance === 'yes' && (
                <div className="form-group" style={{ paddingLeft: '20px', borderLeft: '2px solid var(--navy-mid)' }}>
                  <label>Cover Amount (₹)</label>
                  <input type="number" name="lifeAmount" value={formData.lifeAmount} onChange={handleChange} required />
                </div>
              )}

              <div className="form-group">
                <label>Primary Financial Goal (Optional)</label>
                <input type="text" name="financialGoal" value={formData.financialGoal} onChange={handleChange} placeholder="e.g. Buy a house, Retire early" />
              </div>
            </>
          ) : (
            <>
              {/* ── BUSINESS FIELDS ── */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Monthly Revenue (₹)</label>
                  <input type="number" name="monthlyRevenue" required value={formData.monthlyRevenue} onChange={handleChange} placeholder="e.g. 500000" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Operating Expenses (₹)</label>
                  <input type="number" name="operatingExpenses" required value={formData.operatingExpenses} onChange={handleChange} placeholder="e.g. 350000" />
                </div>
              </div>

              <div className="form-group">
                <label>Active Business Loans / Overdraft?</label>
                <select name="hasBusinessLoan" value={formData.hasBusinessLoan} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.hasBusinessLoan === 'yes' && (
                <div style={{ display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '2px solid var(--navy-mid)' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>EMI / Interest Outflow (₹)</label>
                    <input type="number" name="businessLoanAmount" value={formData.businessLoanAmount} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Purpose</label>
                    <input type="text" name="businessLoanPurpose" value={formData.businessLoanPurpose} onChange={handleChange} placeholder="Equipment, Working Capital" required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Is your business GST Registered?</label>
                <select name="gstRegistered" value={formData.gstRegistered} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Primary Business Goal (Optional)</label>
                <input type="text" name="businessGoal" value={formData.businessGoal} onChange={handleChange} placeholder="e.g. Increase margins, Setup new branch" />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary pulse-glow" style={{ marginTop: '10px', background: isBusiness ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : '' }}>
            {isBusiness ? 'Get Business Financial Score 🚀' : 'Get Instant Financial Score 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
