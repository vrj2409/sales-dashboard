import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import AIInsights from './AIInsights';
import './OverviewPage.css';

const OverviewPage = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const performanceScore = useMemo(() => {
    const totalSales = data.reduce((sum, row) => sum + row.sales, 0);
    const totalTarget = data.reduce((sum, row) => sum + row.target, 0);
    const score = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
    
    return {
      score: score.toFixed(1),
      data: [
        { name: 'Achieved', value: Math.min(totalSales, totalTarget), color: '#10b981' },
        { name: 'Remaining', value: Math.max(0, totalTarget - totalSales), color: '#e2e8f0' }
      ]
    };
  }, [data]);

  const topStores = useMemo(() => {
    const storeStats = {};
    
    data.forEach(row => {
      const key = `${row.storeId}-${row.store}`;
      if (!storeStats[key]) {
        storeStats[key] = {
          storeId: row.storeId,
          store: row.store,
          country: row.market,
          sales: 0,
          target: 0
        };
      }
      storeStats[key].sales += row.sales;
      storeStats[key].target += row.target;
    });

    return Object.values(storeStats)
      .map(store => ({
        ...store,
        variance: store.target > 0 ? ((store.sales - store.target) / store.target) * 100 : 0
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [data]);

  const alertSummary = useMemo(() => {
    const storeStats = {};
    
    data.forEach(row => {
      const key = `${row.storeId}-${row.store}`;
      if (!storeStats[key]) {
        storeStats[key] = { sales: 0, target: 0 };
      }
      storeStats[key].sales += row.sales;
      storeStats[key].target += row.target;
    });

    let critical = 0;
    let warning = 0;
    let info = 0;

    Object.values(storeStats).forEach(store => {
      const variance = store.target > 0 ? ((store.sales - store.target) / store.target) * 100 : 0;
      if (variance < -10) critical++;
      else if (variance < -5) warning++;
      else if (variance < 0) info++;
    });

    return { critical, warning, info };
  }, [data]);

  const salesByCountry = useMemo(() => {
    const countryStats = {};
    
    data.forEach(row => {
      const country = row.market || 'Unknown';
      if (!countryStats[country]) {
        countryStats[country] = 0;
      }
      countryStats[country] += row.sales;
    });

    return Object.entries(countryStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="overview-page">
      {/* AI Insights Section */}
      <AIInsights data={data} />

      <div className="bento-grid">
        <div className="bento-item performance-score">
          <h3>Performance Score</h3>
          <div className="score-content">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={performanceScore.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceScore.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="score-overlay">
              <div className="score-number">{performanceScore.score}%</div>
              <div className="score-label">of Budget</div>
            </div>
          </div>
        </div>

        <div className="bento-item top-stores wide">
          <h3>🏆 Top 5 Stores</h3>
          <div className="leaderboard">
            {topStores.map((store, idx) => (
              <div key={store.storeId} className="leaderboard-row">
                <div className="rank">#{idx + 1}</div>
                <div className="store-info">
                  <div className="store-name">{store.store}</div>
                  <div className="store-country">{store.country}</div>
                </div>
                <div className="store-sales">{formatCurrency(store.sales)}</div>
                <div className={`variance-badge ${store.variance >= 0 ? 'positive' : 'negative'}`}>
                  {store.variance >= 0 ? '+' : ''}{store.variance.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
