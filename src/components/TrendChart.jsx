import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine 
} from 'recharts';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import './TrendChart.css';

const TrendChart = ({ data, granularity }) => {
  const [viewMode, setViewMode] = useState('sales');

  const chartData = useMemo(() => {
    const grouped = {};

    data.forEach(row => {
      let dateKey;
      if (granularity === 'weekly') {
        dateKey = format(startOfWeek(row.date), 'yyyy-MM-dd');
      } else if (granularity === 'monthly') {
        dateKey = format(startOfMonth(row.date), 'yyyy-MM');
      } else {
        dateKey = format(row.date, 'yyyy-MM-dd');
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sales: 0,
          target: 0,
          variance: 0
        };
      }

      grouped[dateKey].sales += row.sales;
      grouped[dateKey].target += row.target;
    });

    return Object.values(grouped)
      .map(d => ({
        ...d,
        variance: d.sales - d.target
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, granularity]);

  const avgBudget = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.target, 0);
    return total / chartData.length;
  }, [chartData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="trend-chart-container">
      <div className="chart-header">
        <h3>📈 Sales Trend Analysis</h3>
        <div className="view-toggle">
          <button 
            className={viewMode === 'sales' ? 'active' : ''}
            onClick={() => setViewMode('sales')}
          >
            Sales
          </button>
          <button 
            className={viewMode === 'target' ? 'active' : ''}
            onClick={() => setViewMode('target')}
          >
            Budget
          </button>
          <button 
            className={viewMode === 'variance' ? 'active' : ''}
            onClick={() => setViewMode('variance')}
          >
            Variance
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {viewMode === 'sales' && (
            <>
              <ReferenceLine 
                y={avgBudget} 
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                label={{ value: 'Avg Budget', fill: '#f59e0b', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#salesGradient)"
                name="Sales"
                animationDuration={1000}
              />
            </>
          )}

          {viewMode === 'target' && (
            <Area
              type="monotone"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={3}
              fill="url(#targetGradient)"
              name="Target"
              animationDuration={1000}
            />
          )}

          {viewMode === 'variance' && (
            <Area
              type="monotone"
              dataKey="variance"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#varianceGradient)"
              name="Variance"
              animationDuration={1000}
            />
          )}

          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#6366f1"
            fill="#f8fafc"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
