import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import './KPICards.css';

const KPICards = ({ metrics, sparklineData }) => {
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

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusColor = (variancePercent) => {
    if (variancePercent > 0) return 'green';
    if (variancePercent >= -4) return 'amber';
    return 'red';
  };

  const cards = [
    {
      title: 'Total Sales',
      value: formatCurrency(metrics.totalSales),
      icon: '💰',
      color: '#6366f1',
      sparkline: sparklineData.sales
    },
    {
      title: 'Total Budget',
      value: formatCurrency(metrics.totalTarget),
      icon: '🎯',
      color: '#8b5cf6',
      sparkline: sparklineData.target
    },
    {
      title: 'Variance',
      value: formatPercent(metrics.variancePercent),
      change: metrics.variancePercent,
      status: getStatusColor(metrics.variancePercent),
      icon: '📊',
      color: metrics.variancePercent > 0 ? '#10b981' : metrics.variancePercent >= -4 ? '#f59e0b' : '#ef4444',
      sparkline: sparklineData.variance
    },
    {
      title: 'Total Stores',
      value: formatNumber(metrics.totalStores),
      icon: '🏪',
      color: '#06b6d4',
      sparkline: null
    },
    {
      title: 'Total Transactions',
      value: formatNumber(metrics.totalTransactions),
      icon: '🛒',
      color: '#14b8a6',
      sparkline: sparklineData.transactions
    },
    {
      title: 'Target Transactions',
      value: formatNumber(metrics.targetTransactions),
      icon: '📈',
      color: '#f59e0b',
      sparkline: sparklineData.targetTransactions
    },
    {
      title: 'WoW Change',
      value: formatPercent(metrics.wowChange),
      change: metrics.wowChange,
      icon: '📅',
      color: metrics.wowChange >= 0 ? '#10b981' : '#ef4444',
      sparkline: sparklineData.wow
    },
    {
      title: 'MoM Change',
      value: formatPercent(metrics.momChange),
      change: metrics.momChange,
      icon: '📆',
      color: metrics.momChange >= 0 ? '#10b981' : '#ef4444',
      sparkline: sparklineData.mom
    },
    {
      title: 'YoY Change',
      value: formatPercent(metrics.yoyChange),
      change: metrics.yoyChange,
      icon: '🗓️',
      color: metrics.yoyChange >= 0 ? '#10b981' : '#ef4444',
      sparkline: sparklineData.yoy
    }
  ];

  return (
    <div className="kpi-banner">
      <div className="kpi-cards-scroll">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`kpi-card ${card.status || ''}`}
            style={{ 
              '--card-color': card.color,
              animationDelay: `${index * 0.05}s`
            }}
          >
            <div className="kpi-card-header">
              <div className="kpi-icon" style={{ background: card.color }}>
                {card.icon}
              </div>
              <div className="kpi-title">{card.title}</div>
            </div>

            <div className="kpi-value">{card.value}</div>

            {card.change !== undefined && (
              <div className={`kpi-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                <span className="arrow">{card.change >= 0 ? '↑' : '↓'}</span>
                {Math.abs(card.change).toFixed(2)}%
              </div>
            )}

            {card.sparkline && card.sparkline.length > 0 && (
              <div className="kpi-sparkline">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={card.sparkline}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={card.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${index})`}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPICards;
