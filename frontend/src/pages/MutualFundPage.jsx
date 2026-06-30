import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './MutualFundPage.css';

const FAMOUS_FUNDS = [
  { name: "Quant Small Cap", code: "120823", category: "Small Cap", risk: "Very High" },
  { name: "Parag Parikh Flexi Cap", code: "122639", category: "Flexi Cap", risk: "Moderate" },
  { name: "HDFC Top 100 Fund", code: "102000", category: "Large Cap", risk: "Low" },
  { name: "Nippon India Small Cap", code: "118778", category: "Small Cap", risk: "Very High" },
  { name: "SBI Bluechip Fund", code: "103504", category: "Large Cap", risk: "Low" },
  { name: "Mirae Asset Large Cap", code: "107578", category: "Large Cap", risk: "Low" },
];

export default function MutualFundPage() {
  const { mfFilters } = useDashboard();
  const [allFunds, setAllFunds] = useState([]);
  const [search, setSearch] = useState(mfFilters.search || '');
  const [selectedFund, setSelectedFund] = useState(null);
  const [fundHistory, setFundHistory] = useState(null);

  // Sync with AI search
  useEffect(() => {
    if (mfFilters.search) {
      setSearch(mfFilters.search);
      // If there's an exact match in allFunds, we could auto-select it here
      // But for now, just setting the search box is enough for the user to see results
    }
  }, [mfFilters]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const canvasRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setListLoading(true);
    fetch('https://api.mfapi.in/mf')
      .then(r => r.json())
      .then(data => {
        setAllFunds(data); // Load all funds for comprehensive search (or slice(0, 10000) if it's too slow)
        setListLoading(false);
      })
      .catch(e => {
        console.error('Failed to load funds', e);
        setListLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedFund) return;
    setLoading(true);
    setFundHistory(null);
    fetch(`https://api.mfapi.in/mf/${selectedFund.schemeCode}`)
      .then(r => r.json())
      .then(data => {
        setFundHistory(data);
        setLoading(false);
      })
      .catch(e => {
        console.error('Failed to load history', e);
        setLoading(false);
      });
  }, [selectedFund]);

  useEffect(() => {
    if (!fundHistory || !fundHistory.data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rawData = fundHistory.data.slice(0, 90).reverse();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const navs = rawData.map(d => parseFloat(d.nav));
    const min = Math.min(...navs);
    const max = Math.max(...navs);
    const range = max - min || 1;
    const padding = { top: 20, right: 20, bottom: 30, left: 55 };
    const w = canvas.width - padding.left - padding.right;
    const h = canvas.height - padding.top - padding.bottom;

    const getX = (i) => padding.left + (i / (rawData.length - 1)) * w;
    const getY = (v) => padding.top + h - ((v - min) / range) * h;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + w, y);
      ctx.stroke();
      const val = max - ((max - min) / 4) * i;
      ctx.fillStyle = 'rgba(139,155,191,0.7)';
      ctx.font = '9px Outfit';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + val.toFixed(2), padding.left - 6, y + 4);
    }

    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + h);
    const isPositive = parseFloat(navs[navs.length-1]) >= parseFloat(navs[0]);
    grad.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + h);
    rawData.forEach((d, i) => ctx.lineTo(getX(i), getY(parseFloat(d.nav))));
    ctx.lineTo(getX(rawData.length - 1), padding.top + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(parseFloat(rawData[0].nav)));
    rawData.forEach((d, i) => ctx.lineTo(getX(i), getY(parseFloat(d.nav))));
    ctx.strokeStyle = isPositive ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

  }, [fundHistory]);

  const filteredFunds = allFunds.filter(f =>
    f.schemeName.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // Show up to 50 results in dropdown for better selection

  const getReturns = (days) => {
    if (!fundHistory?.data || fundHistory.data.length < days) return null;
    const latest = parseFloat(fundHistory.data[0]?.nav);
    const past = parseFloat(fundHistory.data[Math.min(days, fundHistory.data.length - 1)]?.nav);
    if (!past) return null;
    return (((latest - past) / past) * 100).toFixed(2);
  };

  const handleSelectFund = (fund) => {
    setSelectedFund(fund);
    setSearch(fund.schemeName);
    setShowDropdown(false);
  };

  const handleSelectFamous = (fund) => {
    setSelectedFund({ schemeCode: fund.code, schemeName: fund.name });
    setSearch(fund.name);
    setShowDropdown(false);
  };

  const ReturnBadge = ({ label, value }) => {
    if (value === null) return null;
    const pos = parseFloat(value) >= 0;
    return (
      <div className="mf-return-badge">
        <div className="mf-return-label">{label}</div>
        <div className={`mf-return-value ${pos ? 'positive' : 'negative'}`}>
          {pos ? '▲' : '▼'} {Math.abs(value)}%
        </div>
      </div>
    );
  };

  return (
    <div className="mf-page fade-in">
      <div className="mf-header">
        <div className="mf-header-text">
          <h1>Live Mutual <span className="gradient-text">Fund Tracker</span> 💹</h1>
          <p>Real-time NAV data & performance insights for Indian investors.</p>
        </div>
        <div className="mf-header-badges">
          <span className="badge badge-green">🔴 Live Data</span>
          <span className="badge badge-gold">🇮🇳 India Focused</span>
        </div>
      </div>

      <div className="mf-search-wrapper" ref={searchRef}>
        <div className="mf-search-bar">
          <span className="mf-search-icon">🔍</span>
          <input
            type="text"
            placeholder={listLoading ? "Loading schemes..." : "Search e.g. HDFC Nifty, Axis Small Cap..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
          />
          {search && (
            <button className="mf-clear-btn" onClick={() => { setSearch(''); setSelectedFund(null); setFundHistory(null); setShowDropdown(false); }}>✕</button>
          )}
        </div>

        {showDropdown && search && filteredFunds.length > 0 && (
          <div className="mf-dropdown">
            {filteredFunds.map(f => (
              <button key={f.schemeCode} className="mf-dropdown-item" onClick={() => handleSelectFund(f)}>
                <span className="mf-fund-code">#{f.schemeCode}</span>
                <span className="mf-fund-name">{f.schemeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedFund ? (
        <div className="mf-empty-state">
          <div className="mf-welcome-section">
            <div className="mf-empty-icon">📊</div>
            <h2>Discover Top Indian Mutual Funds</h2>
            <p>Track real-time performance and historical trends across categories.</p>
          </div>

          <div className="mf-famous-section">
            <div className="mf-section-label">🔥 FAMOUS FUNDS REDEFINED</div>
            <div className="mf-famous-grid">
              {FAMOUS_FUNDS.map((fund) => (
                <button key={fund.code} className="mf-famous-card" onClick={() => handleSelectFamous(fund)}>
                  <div className="mf-famous-name">{fund.name}</div>
                  <div className="mf-famous-meta">
                    <span className="mf-famous-cat">{fund.category}</span>
                    <span className={`mf-famous-risk ${fund.risk.toLowerCase().replace(' ', '-')}`}>{fund.risk} Risk</span>
                  </div>
                  <div className="mf-famous-hover">Analyze Fund →</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mf-content fade-in">
          <div className="mf-sidebar">
            <div className="glass-card mf-meta-card">
              <div className="mf-meta-header">
                <div className="mf-meta-icon">📊</div>
                <div>
                  <div className="mf-meta-title">{fundHistory?.meta?.scheme_name || selectedFund.schemeName}</div>
                  <div className="mf-meta-code">Code: <strong>{selectedFund.schemeCode}</strong></div>
                </div>
              </div>
              <div className="mf-meta-tags">
                <span className="badge badge-saffron">{fundHistory?.meta?.scheme_category || 'Mutual Fund'}</span>
                <span className="badge badge-gold">{fundHistory?.meta?.scheme_type || 'Direct'}</span>
              </div>
              <div className="mf-meta-rows">
                <div className="mf-meta-row"><span>House</span><strong>{fundHistory?.meta?.fund_house?.split(' ')[0] || '—'}</strong></div>
                <div className="mf-meta-row"><span>NAVs</span><strong>{fundHistory?.data?.length || '—'} records</strong></div>
              </div>
            </div>

            <div className="glass-card mf-nav-card">
              <div className="mf-nav-label">Latest NAV</div>
              <div className="mf-nav-value">₹{fundHistory?.data?.[0]?.nav || '—'}</div>
              <div className="mf-nav-date">last updated {fundHistory?.data?.[0]?.date || '...'}</div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '15px', background: 'var(--green-light)', color: 'white', border: 'none' }}
                onClick={() => alert(`Successfully added ${selectedFund.schemeName} to your portfolio tracking!`)}
              >
                + Add to My Portfolio
              </button>
            </div>

            {!loading && fundHistory?.data && (
              <div className="glass-card mf-returns-card">
                <div className="mf-section-title">📈 Returns</div>
                <div className="mf-returns-grid">
                  <ReturnBadge label="1M" value={getReturns(30)} />
                  <ReturnBadge label="6M" value={getReturns(180)} />
                  <ReturnBadge label="1Y" value={getReturns(365)} />
                  <ReturnBadge label="3Y" value={getReturns(1095)} />
                </div>
              </div>
            )}
          </div>

          <div className="mf-chart-area">
            <div className="glass-card mf-chart-card">
              <div className="mf-chart-header">
                <div className="mf-section-title">📉 NAV Tracker (90 Days)</div>
              </div>
              <div className="mf-canvas-wrapper">
                {loading ? <div className="loader">⚡ Loading...</div> : <canvas ref={canvasRef} width="800" height="340" style={{ width: '100%', height: 'auto' }}></canvas>}
              </div>
            </div>

            {!loading && fundHistory?.data && (
              <div className="glass-card mf-table-card">
                <div className="mf-section-title">📋 NAV Log</div>
                <div className="mf-table-wrapper">
                  <table className="mf-table">
                    <thead><tr><th>#</th><th>Date</th><th>NAV (₹)</th><th>Change</th></tr></thead>
                    <tbody>
                      {fundHistory.data.slice(0, 8).map((d, i) => {
                        const curr = parseFloat(d.nav);
                        const prev = parseFloat(fundHistory.data[i + 1]?.nav);
                        const change = prev ? ((curr - prev) / prev * 100).toFixed(2) : null;
                        return (
                          <tr key={i}>
                            <td>{i+1}</td>
                            <td>{d.date}</td>
                            <td>₹{curr.toFixed(2)}</td>
                            <td><span className={parseFloat(change) >= 0 ? 'pos' : 'neg'}>{change}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
