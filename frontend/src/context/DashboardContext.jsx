import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

// Helper to load from localStorage with fallback
const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
};

export function DashboardProvider({ children }) {
  // 1. EMI Calculator Data — default ZERO (user hasn't set anything yet)
  const [emiData, setEmiData] = useState(() => loadState('finance_emi_data', {
    principal: 0,
    rate: 0,
    tenure: 0
  }));

  // 2. Mutual Fund Filters
  const [mfFilters, setMfFilters] = useState({
    search: '',
    category: 'All'
  });

  // 3. Tax Planner Data — default ZERO
  const [taxData, setTaxData] = useState(() => loadState('finance_tax_data', {
    income: 0,
    deductions: 0
  }));

  // 4. Investment Planning Data — default ZERO (no investment questions in onboarding)
  const [investData, setInvestData] = useState(() => loadState('finance_invest_data', {
    monthlyAmount: 0,
    expectedReturn: 0,
    timeHorizon: 0
  }));

  // 5. Financial Goals Data
  const [goalsData, setGoalsData] = useState(() => loadState('finance_goals_data', []));

  // 6. Retirement Planning Data — default ZERO
  const [retirementData, setRetirementData] = useState(() => loadState('finance_retirement_data', {
    currentAge: 0,
    retirementAge: 0,
    monthlyExpense: 0,
    inflationRate: 0,
    expectedReturn: 0
  }));

  // 7. Affordability Data
  const [affordData, setAffordData] = useState({
    itemName: '',
    itemPrice: '',
    savingsRate: 20
  });

  // 8. Onboarding Data
  const [onboardingData, setOnboardingData] = useState(() => {
    const saved = localStorage.getItem('finance_onboarding_data');
    return saved ? JSON.parse(saved) : null;
  });

  // 9. User Persona ('personal' or 'business')
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('finance_user_persona') || 'personal';
  });

  // Persist calculator data to localStorage on every change
  useEffect(() => { localStorage.setItem('finance_emi_data', JSON.stringify(emiData)); }, [emiData]);
  useEffect(() => { localStorage.setItem('finance_tax_data', JSON.stringify(taxData)); }, [taxData]);
  useEffect(() => { localStorage.setItem('finance_invest_data', JSON.stringify(investData)); }, [investData]);
  useEffect(() => { localStorage.setItem('finance_goals_data', JSON.stringify(goalsData)); }, [goalsData]);
  useEffect(() => { localStorage.setItem('finance_retirement_data', JSON.stringify(retirementData)); }, [retirementData]);

  // Action Updaters
  const updateEmi = (newData) => setEmiData(prev => ({ ...prev, ...newData }));
  const updateMfFilters = (newFilters) => setMfFilters(prev => ({ ...prev, ...newFilters }));
  const updateTax = (newData) => setTaxData(prev => ({ ...prev, ...newData }));
  const updateInvest = (newData) => setInvestData(prev => ({ ...prev, ...newData }));
  const updateGoals = (newData) => setGoalsData(newData);
  const updateRetirement = (newData) => setRetirementData(prev => ({ ...prev, ...newData }));
  const updateAfford = (newData) => setAffordData(prev => ({ ...prev, ...newData }));
  const updateOnboardingData = (newData) => setOnboardingData(prev => ({ ...prev, ...newData }));
  const updatePersona = (newPersona) => {
    setPersona(newPersona);
    localStorage.setItem('finance_user_persona', newPersona);
  };

  return (
    <DashboardContext.Provider value={{
      emiData, updateEmi,
      mfFilters, updateMfFilters,
      taxData, updateTax,
      investData, updateInvest,
      goalsData, updateGoals,
      retirementData, updateRetirement,
      affordData, updateAfford,
      onboardingData, updateOnboardingData,
      persona, updatePersona
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
