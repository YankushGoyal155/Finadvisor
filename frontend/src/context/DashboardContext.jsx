import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  // 1. EMI Calculator Data
  const [emiData, setEmiData] = useState({
    principal: 5000000,
    rate: 8.5,
    tenure: 20
  });

  // 2. Mutual Fund Filters
  const [mfFilters, setMfFilters] = useState({
    search: '',
    category: 'All'
  });

  // 3. Tax Planner Data
  const [taxData, setTaxData] = useState({
    income: 1200000,
    deductions: 150000
  });

  // 4. Investment Planning Data
  const [investData, setInvestData] = useState({
    monthlyAmount: 20000,
    expectedReturn: 12,
    timeHorizon: 10
  });

  // 5. Financial Goals Data
  const [goalsData, setGoalsData] = useState([]);

  // 6. Retirement Planning Data
  const [retirementData, setRetirementData] = useState({
    currentAge: 30,
    retirementAge: 60,
    monthlyExpense: 50000,
    inflationRate: 6,
    expectedReturn: 10
  });

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

  // Action Updaters
  const updateEmi = (newData) => setEmiData(prev => ({ ...prev, ...newData }));
  const updateMfFilters = (newFilters) => setMfFilters(prev => ({ ...prev, ...newFilters }));
  const updateTax = (newData) => setTaxData(prev => ({ ...prev, ...newData }));
  const updateInvest = (newData) => setInvestData(prev => ({ ...prev, ...newData }));
  const updateGoals = (newData) => setGoalsData(newData); // Usually full replacement for lists
  const updateRetirement = (newData) => setRetirementData(prev => ({ ...prev, ...newData }));
  const updateAfford = (newData) => setAffordData(prev => ({ ...prev, ...newData }));
  const updateOnboardingData = (newData) => setOnboardingData(prev => ({ ...prev, ...newData }));

  return (
    <DashboardContext.Provider value={{
      emiData, updateEmi,
      mfFilters, updateMfFilters,
      taxData, updateTax,
      investData, updateInvest,
      goalsData, updateGoals,
      retirementData, updateRetirement,
      affordData, updateAfford,
      onboardingData, updateOnboardingData
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
