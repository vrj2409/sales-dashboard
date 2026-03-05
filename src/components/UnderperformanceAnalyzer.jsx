import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { startOfWeek, subWeeks, format } from 'date-fns';
import AIInsights from './AIInsights';
import './UnderperformanceAnalyzer.css';

const UnderperformanceAnalyzer = ({ data }) => {
  const [threshold, setThreshold] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const analysis = useMemo(() => {
    const storeStats = {};
    const now = new Date();

    data.forEach(row => {
      const storeKey = `${row.storeId}-${row.store}`;
      if (!storeStats[storeKey]) {
        storeStats[storeKey] = {
          storeId: row.storeId,
          store: row.store,
          brand: row.brand,
          country: row.market,
          sales: 0,
          target: 0,
          weeklyData: {}
        };
      }
      storeStats[storeKey].sales += row.sales;
      storeStats[storeKey].target += row.target;

      // Track weekly data for sparklines
      const weekKey = format(startOfWeek(row.date), 'yyyy-MM-dd');
      if (!storeStats[storeKey].weeklyData[weekKey]) {
        storeStats[storeKey].weeklyData[weekKey] = 0;
      }
      storeStats[storeKey].weeklyData[weekKey] += row.sales;
    });

    const storeArray = Object.values(storeStats).map(store => {
      const variance = store.target > 0 ? ((store.sales - store.target) / store.target) * 100 : 0;
      const revenueGap = store.target - store.sales;
      
      // Get last 4 weeks of data for sparkline
      const sparklineData = [];
      for (let i = 3; i >= 0; i--) {
        const weekDate = format(subWeeks(now, i), 'yyyy-MM-dd');
        const weekStart = format(startOfWeek(subWeeks(now, i)), 'yyyy-MM-dd');
        sparklineData.push({
          week: weekDate,
          value: store.weeklyData[weekStart] || 0
        });
      }

      return {
        ...store,
        variance,
        revenueGap,
        sparklineData
      };
    });

    const underperforming = storeArray
      .filter(store => store.variance < -threshold)
      .sort((a, b) => a.variance - b.variance);

    const totalStores = storeArray.length;
    const underperformingCount = underperforming.length;
    const underperformingPercent = (underperformingCount / totalStores) * 100;
    const totalRevenueGap = underperforming.reduce((sum, store) => sum + store.revenueGap, 0);

    return {
      underperforming,
      totalStores,
      underperformingCount,
      underperformingPercent,
      totalRevenueGap
    };
  }, [data, threshold]);

  const filteredStores = useMemo(() => {
    if (!searchTerm) return analysis.underperforming;
    
    const term = searchTerm.toLowerCase();
    return analysis.underperforming.filter(store =>
      store.store.toLowerCase().includes(term) ||
      store.brand.toLowerCase().includes(term) ||
      store.country.toLowerCase().includes(term)
    );
  }, [analysis.underperforming, searchTerm]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const exportToCSV = () => {
    const headers = ['Store', 'Brand', 'Country', 'Target', 'Sales', 'Variance %', 'Revenue Gap'];
    const rows = filteredStores.map(store => [
      store.store,
      store.brand,
      store.country,
      store.target,
      store.sales,
      store.variance.toFixed(2),
      store.revenueGap
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'underperforming-stores.csv';
    a.click();
  };

  const getVarianceIntensity = (variance) => {
    const intensity = Math.min(Math.abs(variance) / 20, 1);
    return `rgba(239, 68, 68, ${intensity * 0.15})`;
  };

  return (
    <div className="underperformance-analyzer-container">
      {/* AI Insights Section */}
      <AIInsights data={data} />

      <div className="analyzer-header">
        <h3>⚠️ Underperformance Analyzer</h3>
        <div className="analyzer-controls">
          <div className="threshold-control">
            <label>Threshold:</label>
            <input 
              type="number" 
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min="0"
              max="100"
              step="1"
            />
            <span>%</span>
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="analyzer-summary">
        <div className="summary-card">
          <div className="summary-icon">🏪</div>
          <div className="summary-content">
            <div className="summary-value">{analysis.underperformingCount}</div>
            <div className="summary-label">Underperforming Stores</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-value">{analysis.underperformingPercent.toFixed(1)}%</div>
            <div className="summary-label">of Total Stores</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💸</div>
          <div className="summary-content">
            <div className="summary-value">{formatCurrency(analysis.totalRevenueGap)}</div>
            <div className="summary-label">Revenue Gap</div>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search stores, brands, or countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="underperforming-table-container">
        <table className="underperforming-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Brand</th>
              <th>Country</th>
              <th>Budget</th>
              <th>Sales</th>
              <th>Variance %</th>
              <th>Revenue Gap</th>
              <th>Trend (4 weeks)</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  {searchTerm ? 'No stores match your search' : '✅ No stores below the threshold. Great performance!'}
                </td>
              </tr>
            ) : (
              filteredStores.map((store, idx) => (
                <React.Fragment key={store.storeId}>
                  <tr 
                    className="underperforming-row"
                    style={{ background: getVarianceIntensity(store.variance) }}
                    onClick={() => setExpandedRow(expandedRow === store.storeId ? null : store.storeId)}
                  >
                    <td className="store-name">{store.store}</td>
                    <td>{store.brand}</td>
                    <td>{store.country}</td>
                    <td>{formatCurrency(store.target)}</td>
                    <td>{formatCurrency(store.sales)}</td>
                    <td>
                      <span className="variance-badge negative">
                        {store.variance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="gap-cell">{formatCurrency(store.revenueGap)}</td>
                    <td className="sparkline-cell">
                      <ResponsiveContainer width="100%" height={30}>
                        <AreaChart data={store.sparklineData}>
                          <defs>
                            <linearGradient id={`spark-${idx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill={`url(#spark-${idx})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </td>
                  </tr>
                  {expandedRow === store.storeId && (
                    <tr>
                      <td colSpan="8">
                        <div className="expanded-details">
                          <h4>Weekly Breakdown</h4>
                          <div className="weekly-breakdown">
                            {store.sparklineData.map((week, i) => (
                              <div key={i} className="week-item">
                                <span className="week-label">Week {i + 1}</span>
                                <span className="week-value">{formatCurrency(week.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnderperformanceAnalyzer;
