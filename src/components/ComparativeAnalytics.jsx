import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './ComparativeAnalytics.css';

const ComparativeAnalytics = ({ data }) => {
  const [selectedSeries, setSelectedSeries] = useState({ sales: true, target: true });

  const analytics = useMemo(() => {
    const brandStats = {};

    data.forEach(row => {
      const brand = row.brand || 'Unknown';
      if (!brandStats[brand]) {
        brandStats[brand] = {
          sales: 0,
          target: 0,
          transactions: 0,
          targetTransactions: 0
        };
      }
      brandStats[brand].sales += row.sales;
      brandStats[brand].target += row.target;
      brandStats[brand].transactions += row.transactions;
      brandStats[brand].targetTransactions += row.targetTransactions;
    });

    const brandArray = Object.entries(brandStats).map(([brand, stats]) => ({
      brand,
      Sales: stats.sales,
      Target: stats.target,
      Transactions: stats.transactions,
      'Target Transactions': stats.targetTransactions,
      variance: ((stats.sales - stats.target) / stats.target) * 100
    }));

    return brandArray.sort((a, b) => b.Sales - a.Sales);
  }, [data]);

  const heatmapData = useMemo(() => {
    const matrix = {};
    
    data.forEach(row => {
      const brand = row.brand || 'Unknown';
      const country = row.market || 'Unknown';
      
      if (!matrix[brand]) {
        matrix[brand] = {};
      }
      if (!matrix[brand][country]) {
        matrix[brand][country] = { sales: 0, target: 0 };
      }
      
      matrix[brand][country].sales += row.sales;
      matrix[brand][country].target += row.target;
    });

    const result = [];
    Object.entries(matrix).forEach(([brand, countries]) => {
      Object.entries(countries).forEach(([country, stats]) => {
        result.push({
          brand,
          country,
          variance: ((stats.sales - stats.target) / stats.target) * 100
        });
      });
    });

    return result;
  }, [data]);

  const channelMix = useMemo(() => {
    const channelStats = {};
    
    data.forEach(row => {
      const channel = row.channel || 'Unknown';
      if (!channelStats[channel]) {
        channelStats[channel] = 0;
      }
      channelStats[channel] += row.sales;
    });

    return Object.entries(channelStats).map(([name, value]) => ({ name, value }));
  }, [data]);

  const transactionsData = useMemo(() => {
    const totalTransactions = data.reduce((sum, row) => sum + row.transactions, 0);
    const totalBudgetTransactions = data.reduce((sum, row) => sum + row.targetTransactions, 0);
    
    return [
      { name: 'Actual', value: totalTransactions, color: '#6366f1' },
      { name: 'Target', value: totalBudgetTransactions, color: '#f59e0b' }
    ];
  }, [data]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getHeatmapColor = (variance) => {
    if (variance > 10) return '#10b981';
    if (variance > 5) return '#34d399';
    if (variance > 0) return '#6ee7b7';
    if (variance > -5) return '#fde68a';
    if (variance > -10) return '#fbbf24';
    return '#ef4444';
  };

  const brands = [...new Set(heatmapData.map(d => d.brand))].slice(0, 10);
  const countries = [...new Set(heatmapData.map(d => d.country))].slice(0, 8);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const toggleSeries = (key) => {
    setSelectedSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="comparative-analytics-container">
      <h3>📊 Comparative Analytics</h3>

      <div className="chart-section">
        <div className="chart-header">
          <h4>Sales vs Target by Brand</h4>
          <div className="legend-toggles">
            <button 
              className={`legend-btn ${selectedSeries.sales ? 'active' : ''}`}
              onClick={() => toggleSeries('sales')}
            >
              <span className="legend-color" style={{ background: '#6366f1' }}></span>
              Sales
            </button>
            <button 
              className={`legend-btn ${selectedSeries.target ? 'active' : ''}`}
              onClick={() => toggleSeries('target')}
            >
              <span className="legend-color" style={{ background: '#f59e0b' }}></span>
              Budget
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="brand" 
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: '#64748b' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value) => formatCurrency(value)}
            />
            {selectedSeries.sales && <Bar dataKey="Sales" fill="#6366f1" radius={[8, 8, 0, 0]} animationDuration={800} />}
            {selectedSeries.target && <Bar dataKey="Target" fill="#f59e0b" radius={[8, 8, 0, 0]} animationDuration={800} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-grid">
        <div className="channel-mix">
          <h4>Channel Mix Breakdown</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={channelMix}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelMix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="transactions-comparison">
          <h4>Transactions vs Target Transactions</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={transactionsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(value) => formatNumber(value)} />
              <YAxis type="category" dataKey="name" />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {transactionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="heatmap-section">
        <h4>Variance Heatmap: Brand × Country</h4>
        <div className="heatmap-container">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Brand / Country</th>
                {countries.map(country => (
                  <th key={country}>{country}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand}>
                  <td className="brand-label">{brand}</td>
                  {countries.map(country => {
                    const cell = heatmapData.find(d => d.brand === brand && d.country === country);
                    const variance = cell ? cell.variance : null;
                    
                    // Only show cells with variance >= -5% (yellow/green zones)
                    const shouldShow = variance !== null && variance >= -5;
                    
                    return (
                      <td 
                        key={country}
                        className="heatmap-cell"
                        style={{ 
                          background: shouldShow ? getHeatmapColor(variance) : '#f8fafc',
                          color: shouldShow && Math.abs(variance) > 5 ? 'white' : '#0f172a'
                        }}
                        title={shouldShow ? `${variance.toFixed(1)}%` : 'No data'}
                      >
                        {shouldShow ? `${variance.toFixed(0)}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="heatmap-legend">
          <span>Underperforming</span>
          <div className="legend-gradient"></div>
          <span>Overperforming</span>
        </div>
      </div>
    </div>
  );
};

export default ComparativeAnalytics;
