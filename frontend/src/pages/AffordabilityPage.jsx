import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './ToolPage.css';

export default function AffordabilityPage() {
  const { taxData, affordData } = useDashboard(); // Using taxData for income assumption if needed
  
  const [itemName, setItemName] = useState(affordData?.itemName || '');
  const [itemPrice, setItemPrice] = useState(affordData?.itemPrice || '');
  const [savingsRate, setSavingsRate] = useState(affordData?.savingsRate || 20); // 20% default savings rate
  
  useEffect(() => {
    if (affordData) {
      if (affordData.itemName) setItemName(affordData.itemName);
      if (affordData.itemPrice) setItemPrice(affordData.itemPrice);
      if (affordData.savingsRate) setSavingsRate(affordData.savingsRate);
    }
  }, [affordData]);
  const monthlyIncome = taxData?.income ? taxData.income / 12 : 50000;
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    if (!price || price <= 0) return;

    // 50/30/20 rule
    const needs = monthlyIncome * 0.50;
    const wants = monthlyIncome * 0.30;
    const savings = monthlyIncome * 0.20;
    
    // Total monthly savings based on user input
    const monthlySavings = monthlyIncome * (savingsRate / 100);
    const monthsToSave = Math.ceil(price / monthlySavings);

    let verdict = '';
    let color = '';
    let emoji = '';
    let advice = [];

    if (price <= wants) {
      verdict = 'Yes, comfortably!'; color = 'green-light'; emoji = '🎉';
    } else if (price <= monthlyIncome * 0.5) {
      verdict = 'Yes, but be careful.'; color = 'gold'; emoji = '⚠️';
    } else {
      verdict = 'Not right now (Red Flag!).'; color = 'red-accent'; emoji = '🛑';
    }

    setResult({ verdict, color, emoji, advice: ["Analyzing your purchase with AI... 🤖"], monthsToSave, monthlySavings });
    setIsLoading(true);

    try {
      const prompt = `I want to buy/pay for: ${itemName} which costs ₹${price}. My monthly income is ₹${monthlyIncome} and I save ${savingsRate}% of it (approx ₹${monthlySavings} per mo). Give me 3 short, punchy bullet points of advice on how to plan, save for, or afford this specific item/experience. No intro/outro, just 3 distinct lines. Make it highly specific to the item (${itemName}). Include some smart saving or booking tips if it's a trip.`;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: prompt, model: 'gpt-4o-mini' })
      });
      const data = await response.json();
      
      if(data.response) {
          let aiText = data.response.replace(/\[\[ACTION:.*?\]\]/gs, '').trim();
          let points = aiText.split('\n').filter(p => p.trim().length > 0).map(p => p.replace(/^[-\*•\d\.]+\s*/, ''));
          setResult(prev => ({ ...prev, advice: points }));
      }
    } catch (err) {
      setResult(prev => ({ 
        ...prev, 
        advice: [
          `Save ₹${monthlySavings.toLocaleString('en-IN')} for ${monthsToSave} months.`,
          "Look for discounts, cashback, or off-season booking.",
          "Avoid using a high-interest credit card."
        ] 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tool-page fade-in">
      <div className="tool-header">
        <h1>Can I <span className="gradient-text">Afford This?</span> 🛍️</h1>
        <p>Your daily decision tool before making big purchases. Stop impulse buying.</p>
        <div className="ai-status-badge">Habit Builder</div>
      </div>

      <div className="tool-grid">
        {/* Input Form */}
        <div className="glass-card">
          <h3 className="card-title">Check Purchase</h3>
          <form className="tool-form" onSubmit={handleCalculate}>
            <div className="form-group">
              <label>What do you want to buy?</label>
              <input 
                type="text" 
                placeholder="e.g. iPhone 15, New Laptop, Goa Trip" 
                value={itemName} 
                onChange={e => setItemName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>How much does it cost? (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 75000" 
                value={itemPrice} 
                onChange={e => setItemPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>My estimated monthly income is: ₹{Math.round(monthlyIncome).toLocaleString('en-IN')}</label>
              <small style={{ color: '#888' }}>(Based on tax planner profile. Update in Tax Planner)</small>
            </div>
            <div className="form-group">
              <label>I usually save this % of my income:</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  value={savingsRate} 
                  onChange={e => setSavingsRate(e.target.value)}
                  className="range-input"
                />
                <span className="slider-value">{savingsRate}%</span>
              </div>
            </div>
            <button type="submit" className="btn-primary pulse-glow" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Purchase'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="glass-card result-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: result ? 1 : 0.6 }}>
          {result ? (
            <div className="fade-in" style={{ width: '100%' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{result.emoji}</div>
              <h2 style={{ color: `var(--${result.color})`, marginBottom: '10px' }}>{result.verdict}</h2>
              <h3 style={{ marginBottom: '20px' }}>{itemName}</h3>
              
              <div className="result-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="result-stat-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Cost</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{parseFloat(itemPrice).toLocaleString('en-IN')}</div>
                </div>
                <div className="result-stat-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Months to save</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{result.monthsToSave}</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{color: 'var(--saffron)'}}>💡</span> AI Recommendations
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.advice.map((line, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', lineHeight: '1.4' }}>
                      <span>👉</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ color: '#888' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛒</div>
              <p>Enter an item and its price to see if you can truly afford it without wrecking your goals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
