import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './GeoMap.css';

const GeoMap = ({ data }) => {
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [sortBy, setSortBy] = useState('sales');

  const countryData = useMemo(() => {
    const grouped = {};
    
    data.forEach(row => {
      const country = row.market || 'Unknown';
      if (!grouped[country]) {
        grouped[country] = {
          storeCount: new Set(),
          totalSales: 0,
          totalBudget: 0,
          countryId: row.countryId,
          brands: {}
        };
      }
      
      grouped[country].storeCount.add(row.storeId);
      grouped[country].totalSales += row.sales;
      grouped[country].totalBudget += row.budget;
      
      const brand = row.brand || 'Unknown';
      if (!grouped[country].brands[brand]) {
        grouped[country].brands[brand] = {
          sales: 0,
          budget: 0
        };
      }
      grouped[country].brands[brand].sales += row.sales;
      grouped[country].brands[brand].budget += row.budget;
    });

    const result = Object.entries(grouped).map(([country, stats]) => ({
      country,
      countryId: stats.countryId,
      storeCount: stats.storeCount.size,
      totalSales: stats.totalSales,
      totalBudget: stats.totalBudget,
      variance: ((stats.totalSales - stats.totalBudget) / stats.totalBudget) * 100,
      brands: stats.brands
    }));

    if (sortBy === 'sales') {
      return result.sort((a, b) => b.totalSales - a.totalSales);
    } else if (sortBy === 'variance') {
      return result.sort((a, b) => b.variance - a.variance);
    } else {
      return result.sort((a, b) => b.storeCount - a.storeCount);
    }
  }, [data, sortBy]);

  const maxSales = useMemo(() => {
    return Math.max(...countryData.map(d => d.totalSales));
  }, [countryData]);

  const pieData = useMemo(() => {
    return countryData.slice(0, 6).map(d => ({
      name: d.country,
      value: d.totalSales
    }));
  }, [countryData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const getCountryFlag = (country) => {
    const flags = {
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'China': '🇨🇳'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="geo-map-container">
      <h3>🌍 Geographic Performance</h3>

      <table className="geo-table">
        <thead>
          <tr>
            <th onClick={() => setSortBy('country')} style={{ cursor: 'pointer' }}>Country</th>
            <th onClick={() => setSortBy('stores')} style={{ cursor: 'pointer' }}>Stores</th>
            <th onClick={() => setSortBy('sales')} style={{ cursor: 'pointer' }}>Total Sales</th>
            <th onClick={() => setSortBy('variance')} style={{ cursor: 'pointer' }}>Variance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {countryData.map((country) => (
            <React.Fragment key={country.country}>
              <tr onClick={() => setExpandedCountry(expandedCountry === country.country ? null : country.country)}>
                <td>
                  <div className="country-cell">
                    <span className="country-flag">{getCountryFlag(country.country)}</span>
                    {country.country}
                    {country.countryId && <span className="country-id">({country.countryId})</span>}
                  </div>
                </td>
                <td>{country.storeCount}</td>
                <td className="sales-bar-cell">
                  <div 
                    className="sales-bar-bg" 
                    style={{ width: `${(country.totalSales / maxSales) * 100}%` }}
                  ></div>
                  <span className="sales-value">{formatCurrency(country.totalSales)}</span>
                </td>
                <td>
                  <span className={`variance-badge ${country.variance >= 0 ? 'positive' : 'negative'}`}>
                    {country.variance >= 0 ? '+' : ''}{country.variance.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span className={`expand-icon ${expandedCountry === country.country ? 'expanded' : ''}`}>
                    ›
                  </span>
                </td>
              </tr>
              {expandedCountry === country.country && (
                <tr>
                  <td colSpan="5">
                    <div className="brand-breakdown">
                      <h4>Brand Breakdown</h4>
                      <div className="brand-bars">
                        {Object.entries(country.brands)
                          .sort((a, b) => b[1].sales - a[1].sales)
                          .map(([brand, stats]) => {
                            const maxBrandSales = Math.max(...Object.values(country.brands).map(b => b.sales));
                            return (
                              <div key={brand} className="brand-bar-item">
                                <span className="brand-name">{brand}</span>
                                <div className="brand-bar">
                                  <div 
                                    className="brand-bar-fill"
                                    style={{ width: `${(stats.sales / maxBrandSales) * 100}%` }}
                                  >
                                    <span className="brand-bar-value">{formatCurrency(stats.sales)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="summary-donut">
        <h4>Sales Distribution by Country</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, index }) => {
                // Calculate percentages that always add up to 100%
                const total = pieData.reduce((sum, item) => sum + item.value, 0);
                const percentages = pieData.map(item => (item.value / total) * 100);
                
                // Round down all percentages
                const roundedDown = percentages.map(p => Math.floor(p));
                const totalRounded = roundedDown.reduce((sum, p) => sum + p, 0);
                
                // Distribute the remaining percentage to the largest values
                const remainder = 100 - totalRounded;
                const decimals = percentages.map((p, i) => ({ index: i, decimal: p - roundedDown[i] }));
                decimals.sort((a, b) => b.decimal - a.decimal);
                
                const finalPercentages = [...roundedDown];
                for (let i = 0; i < remainder; i++) {
                  finalPercentages[decimals[i].index]++;
                }
                
                return `${name} ${finalPercentages[index]}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GeoMap;
