import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  User, Building2, Briefcase, ChevronRight, ChevronLeft,
  CheckCircle2, ShieldCheck, Banknote, Landmark, Target
} from 'lucide-react';
import './ToolPage.css';

export default function OnboardingPage({ onComplete, user }) {
  const { updateOnboardingData, updatePersona } = useDashboard();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [selectedPersona, setSelectedPersona] = useState('personal');
  
  const [formData, setFormData] = useState({
    incomeSource: '',
    // Personal fields
    monthlySalary: '',
    monthlyExpenses: '',
    hasEmi: '',
    emiAmount: '',
    emiPurpose: '',
    emergencySavings: '',
    emergencyAmount: '',
    healthInsurance: '',
    healthAmount: '',
    lifeInsurance: 'no', // Defaulting to no for brevity in new UI
    lifeAmount: '',
    financialGoal: '',
    // Business fields
    monthlyRevenue: '',
    operatingExpenses: '',
    hasBusinessLoan: '',
    businessLoanAmount: '',
    businessLoanPurpose: '',
    gstRegistered: '',
    businessGoal: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
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
  const themeColor = isBusiness ? '#f59e0b' : '#3b82f6';
  const themeGradient = isBusiness ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #6366f1)';

  const renderProgressBar = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{
          flex: 1,
          height: '4px',
          borderRadius: '4px',
          background: s <= step ? themeColor : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease'
        }} />
      ))}
    </div>
  );

  const SelectionCard = ({ selected, onClick, icon, title, subtitle }) => (
    <div 
      onClick={onClick}
      style={{
        flex: 1,
        padding: '20px',
        borderRadius: '16px',
        cursor: 'pointer',
        background: selected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: selected ? `2px solid ${themeColor}` : '2px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', color: themeColor }}>
          <CheckCircle2 size={20} />
        </div>
      )}
      <div style={{ color: selected ? themeColor : '#94a3b8', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%' }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: selected ? '#fff' : '#94a3b8' }}>{title}</h4>
        {subtitle && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</p>}
      </div>
    </div>
  );

  const YesNoToggle = ({ name, value, onChange }) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      <button
        type="button"
        onClick={() => onChange(name, 'yes')}
        style={{
          flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
          background: value === 'yes' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
          border: value === 'yes' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
          color: value === 'yes' ? '#10b981' : '#94a3b8',
          fontWeight: 600, transition: 'all 0.2s'
        }}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(name, 'no')}
        style={{
          flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
          background: value === 'no' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
          border: value === 'no' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
          color: value === 'no' ? '#ef4444' : '#94a3b8',
          fontWeight: 600, transition: 'all 0.2s'
        }}
      >
        No
      </button>
    </div>
  );

  return (
    <div className="tool-page fade-in" style={{ padding: '40px 20px', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '40px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow matching persona */}
        <div style={{
          position: 'absolute', top: '-150px', left: '-150px', width: '300px', height: '300px',
          background: themeColor, filter: 'blur(150px)', opacity: 0.1, zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '10px', background: themeGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome to Finance AI
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Let's customize your financial command center.</p>
          </div>

          {renderProgressBar()}

          <form onSubmit={handleSubmit} style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            
            {/* ════ STEP 1: PERSONA & INCOME SOURCE ════ */}
            {step === 1 && (
              <div className="fade-in" style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>How will you use Finance AI?</h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                  <SelectionCard 
                    selected={selectedPersona === 'personal'}
                    onClick={() => setSelectedPersona('personal')}
                    icon={<User size={32} />}
                    title="Personal Wealth"
                    subtitle="Manage salary, savings & investments"
                  />
                  <SelectionCard 
                    selected={selectedPersona === 'business'}
                    onClick={() => setSelectedPersona('business')}
                    icon={<Building2 size={32} />}
                    title="Business Finance"
                    subtitle="Track revenue, margins & corporate tax"
                  />
                </div>

                <div className="form-group slide-up">
                  <label style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'block' }}>What is your primary income source?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {(isBusiness ? ['Trading/Retail', 'Services/Agency', 'SaaS/Tech'] : ['Salary', 'Freelance', 'Investments']).map(src => (
                      <div
                        key={src}
                        onClick={() => handleOptionSelect('incomeSource', src)}
                        style={{
                          padding: '12px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer',
                          border: formData.incomeSource === src ? `1px solid ${themeColor}` : '1px solid rgba(255,255,255,0.1)',
                          background: formData.incomeSource === src ? `${themeColor}22` : 'rgba(255,255,255,0.02)',
                          color: formData.incomeSource === src ? '#fff' : '#94a3b8',
                          fontWeight: formData.incomeSource === src ? 600 : 400,
                          transition: 'all 0.2s'
                        }}
                      >
                        {src}
                      </div>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    name="incomeSource" 
                    value={formData.incomeSource} 
                    onChange={handleChange} 
                    placeholder="Other (type here)..." 
                    style={{ marginTop: '12px', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* ════ STEP 2: FINANCES ════ */}
            {step === 2 && (
              <div className="fade-in slide-up" style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Banknote color={themeColor} /> 
                  {isBusiness ? 'Business Cash Flow' : 'Income & Expenses'}
                </h3>
                
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1' }}>{isBusiness ? 'Average Monthly Revenue (₹)' : 'Monthly Take-Home Salary (₹)'}</label>
                    <input 
                      type="number" name={isBusiness ? 'monthlyRevenue' : 'monthlySalary'} 
                      value={isBusiness ? formData.monthlyRevenue : formData.monthlySalary} 
                      onChange={handleChange} required 
                      placeholder="e.g. 150000"
                      style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1' }}>{isBusiness ? 'Average Operating Expenses (₹)' : 'Monthly Living Expenses (₹)'}</label>
                    <input 
                      type="number" name={isBusiness ? 'operatingExpenses' : 'monthlyExpenses'} 
                      value={isBusiness ? formData.operatingExpenses : formData.monthlyExpenses} 
                      onChange={handleChange} required 
                      placeholder="e.g. 80000"
                      style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════ STEP 3: LIABILITIES ════ */}
            {step === 3 && (
              <div className="fade-in slide-up" style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Landmark color={themeColor} /> 
                  Liabilities & Debt
                </h3>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '1.1rem' }}>{isBusiness ? 'Do you have active business loans or overdrafts?' : 'Are you currently paying any EMIs (Home, Car, Personal)?'}</label>
                  <YesNoToggle name={isBusiness ? 'hasBusinessLoan' : 'hasEmi'} value={isBusiness ? formData.hasBusinessLoan : formData.hasEmi} onChange={handleOptionSelect} />
                </div>

                {((isBusiness && formData.hasBusinessLoan === 'yes') || (!isBusiness && formData.hasEmi === 'yes')) && (
                  <div className="fade-in" style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>{isBusiness ? 'Total Monthly Interest/EMI (₹)' : 'Total Monthly EMI (₹)'}</label>
                        <input type="number" name={isBusiness ? 'businessLoanAmount' : 'emiAmount'} value={isBusiness ? formData.businessLoanAmount : formData.emiAmount} onChange={handleChange} required />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Primary Purpose</label>
                        <input type="text" name={isBusiness ? 'businessLoanPurpose' : 'emiPurpose'} value={isBusiness ? formData.businessLoanPurpose : formData.emiPurpose} onChange={handleChange} placeholder={isBusiness ? "e.g. Current Account OD" : "e.g. Home Loan"} required />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ STEP 4: SAFETY & GOALS ════ */}
            {step === 4 && (
              <div className="fade-in slide-up" style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isBusiness ? <Target color={themeColor} /> : <ShieldCheck color={themeColor} />}
                  {isBusiness ? 'Business Profile & Goals' : 'Safety Net & Goals'}
                </h3>

                {isBusiness ? (
                  <>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '1.1rem' }}>Is your business GST registered?</label>
                      <YesNoToggle name="gstRegistered" value={formData.gstRegistered} onChange={handleOptionSelect} />
                    </div>
                    <div className="form-group">
                      <label>What is your primary business goal for this year?</label>
                      <input type="text" name="businessGoal" value={formData.businessGoal} onChange={handleChange} placeholder="e.g. Increase margins by 10%, Hire 5 people..." style={{ padding: '16px' }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label>Do you have an emergency fund (at least 3x expenses)?</label>
                      <YesNoToggle name="emergencySavings" value={formData.emergencySavings} onChange={handleOptionSelect} />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label>Do you have active Health Insurance?</label>
                      <YesNoToggle name="healthInsurance" value={formData.healthInsurance} onChange={handleOptionSelect} />
                    </div>

                    <div className="form-group">
                      <label>What is your ultimate financial goal?</label>
                      <input type="text" name="financialGoal" value={formData.financialGoal} onChange={handleChange} placeholder="e.g. Buy a house, Retire at 40..." style={{ padding: '16px' }} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: 'auto', paddingTop: '30px' }}>
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="btn-secondary" style={{ padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChevronLeft size={20} /> Back
                </button>
              ) : (
                <div /> // Spacer
              )}
              
              {step < totalSteps ? (
                <button type="button" onClick={nextStep} className="btn-primary" style={{ background: themeGradient, padding: '16px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  Continue <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" className="btn-primary pulse-glow" style={{ background: themeGradient, padding: '16px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  Complete Setup <CheckCircle2 size={20} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
