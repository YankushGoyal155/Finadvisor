import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function OnboardingPage({ onComplete, user }) {
  const { updateOnboardingData } = useDashboard();
  
  const [formData, setFormData] = useState({
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
    financialGoal: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (updateOnboardingData) {
      updateOnboardingData(formData);
    }
    // Also save to local storage for persistence
    localStorage.setItem(`finance_onboarding_data_${user?.user_id}`, JSON.stringify(formData));
    onComplete();
  };

  return (
    <div className="tool-page fade-in" style={{ padding: '40px 20px' }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '40px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '10px' }}>Welcome to <span className="gradient-text">WealthRoute AI</span></h1>
          <p style={{ color: '#aaa' }}>Let's set up your profile to generate your instant Financial Score.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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

          <button type="submit" className="btn-primary pulse-glow" style={{ marginTop: '10px' }}>
            Get Instant Financial Score 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
