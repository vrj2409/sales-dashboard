import React, { useMemo, useState } from 'react';
import './AIInsights.css';

const AIInsights = ({ data }) => {
  const [expandedInsight, setExpandedInsight] = useState(null);

  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Analyze store performance
    const storePerformance = {};
    data.forEach(row => {
      const key = `${row.storeId}-${row.store}`;
      if (!storePerformance[key]) {
        storePerformance[key] = {
          storeId: row.storeId,
          store: row.store,
          market: row.market,
          brand: row.brand,
          totalSales: 0,
          totalTarget: 0,
          transactions: 0,
          count: 0
        };
      }
      storePerformance[key].totalSales += row.sales;
      storePerformance[key].totalTarget += row.target;
      storePerformance[key].transactions += row.transactions;
      storePerformance[key].count++;
    });

    const stores = Object.values(storePerformance).map(s => ({
      ...s,
      variance: ((s.totalSales - s.totalTarget) / s.totalTarget) * 100,
      avgTransaction: s.totalSales / s.transactions
    }));

    // Find underperforming stores
    const underperforming = stores
      .filter(s => s.variance < -10)
      .sort((a, b) => a.variance - b.variance)
      .slice(0, 5);

    // Find top performers
    const topPerformers = stores
      .filter(s => s.variance > 10)
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5);

    // Analyze by market
    const marketPerformance = {};
    data.forEach(row => {
      if (!marketPerformance[row.market]) {
        marketPerformance[row.market] = { sales: 0, target: 0, stores: new Set() };
      }
      marketPerformance[row.market].sales += row.sales;
      marketPerformance[row.market].target += row.target;
      marketPerformance[row.market].stores.add(row.storeId);
    });

    const markets = Object.entries(marketPerformance).map(([market, data]) => ({
      market,
      variance: ((data.sales - data.target) / data.target) * 100,
      storeCount: data.stores.size,
      sales: data.sales
    }));

    // Analyze by brand
    const brandPerformance = {};
    data.forEach(row => {
      if (!brandPerformance[row.brand]) {
        brandPerformance[row.brand] = { sales: 0, target: 0 };
      }
      brandPerformance[row.brand].sales += row.sales;
      brandPerformance[row.brand].target += row.target;
    });

    const brands = Object.entries(brandPerformance).map(([brand, data]) => ({
      brand,
      variance: ((data.sales - data.target) / data.target) * 100,
      sales: data.sales
    }));

    // Generate insights
    const generatedInsights = [];

    // Insight 1: Underperforming stores
    if (underperforming.length > 0) {
      const worstStore = underperforming[0];
      generatedInsights.push({
        id: 'underperforming-stores',
        type: 'warning',
        icon: '⚠️',
        title: 'Underperforming Stores Detected',
        summary: `${underperforming.length} stores are significantly below target (>10% variance)`,
        details: {
          stores: underperforming,
          analysis: `${worstStore.store} in ${worstStore.market} is ${Math.abs(worstStore.variance).toFixed(1)}% below target.`,
          recommendations: [
            'Review inventory levels and product mix at underperforming locations',
            'Analyze foot traffic patterns and adjust staffing accordingly',
            'Consider localized marketing campaigns to drive traffic',
            'Evaluate pricing strategy compared to local competitors',
            'Assess store layout and customer experience factors'
          ]
        }
      });
    }

    // Insight 2: Top performers
    if (topPerformers.length > 0) {
      const bestStore = topPerformers[0];
      generatedInsights.push({
        id: 'top-performers',
        type: 'success',
        icon: '🌟',
        title: 'Top Performing Stores',
        summary: `${topPerformers.length} stores are exceeding targets by >10%`,
        details: {
          stores: topPerformers,
          analysis: `${bestStore.store} in ${bestStore.market} is leading with ${bestStore.variance.toFixed(1)}% above target.`,
          recommendations: [
            'Document and replicate best practices from top performers',
            'Share successful strategies across underperforming locations',
            'Consider expanding product lines that work well in these stores',
            'Use these stores as training locations for new staff',
            'Analyze what makes these locations successful (demographics, competition, etc.)'
          ]
        }
      });
    }

    // Insight 3: Market analysis
    const weakMarket = markets.sort((a, b) => a.variance - b.variance)[0];
    const strongMarket = markets.sort((a, b) => b.variance - a.variance)[0];
    
    if (weakMarket && strongMarket) {
      generatedInsights.push({
        id: 'market-analysis',
        type: 'info',
        icon: '🌍',
        title: 'Geographic Performance Insights',
        summary: `Performance varies significantly across markets`,
        details: {
          weakMarket: { name: weakMarket.market, variance: weakMarket.variance },
          strongMarket: { name: strongMarket.market, variance: strongMarket.variance },
          analysis: `${strongMarket.market} outperforms ${weakMarket.market} by ${(strongMarket.variance - weakMarket.variance).toFixed(1)} percentage points.`,
          recommendations: [
            `Investigate regional factors affecting ${weakMarket.market} performance`,
            'Consider market-specific product assortments and promotions',
            'Analyze competitive landscape in underperforming markets',
            'Review supply chain efficiency across different regions',
            `Replicate successful strategies from ${strongMarket.market}`
          ]
        }
      });
    }

    // Insight 4: Brand performance
    const weakBrand = brands.sort((a, b) => a.variance - b.variance)[0];
    const strongBrand = brands.sort((a, b) => b.variance - a.variance)[0];
    
    if (weakBrand && strongBrand && weakBrand.variance < -5) {
      generatedInsights.push({
        id: 'brand-analysis',
        type: 'warning',
        icon: '🏷️',
        title: 'Brand Performance Gap',
        summary: `${weakBrand.brand} is underperforming compared to other brands`,
        details: {
          weakBrand: { name: weakBrand.brand, variance: weakBrand.variance },
          strongBrand: { name: strongBrand.brand, variance: strongBrand.variance },
          analysis: `${weakBrand.brand} is ${Math.abs(weakBrand.variance).toFixed(1)}% below target while ${strongBrand.brand} is ${strongBrand.variance.toFixed(1)}% above.`,
          recommendations: [
            `Review ${weakBrand.brand} product positioning and pricing`,
            'Increase marketing investment for underperforming brand',
            'Analyze customer feedback and satisfaction scores',
            'Consider promotional campaigns or bundle offers',
            'Evaluate product quality and customer perception issues'
          ]
        }
      });
    }

    // Insight 5: Transaction value analysis
    const avgTransactionValue = stores.reduce((sum, s) => sum + s.avgTransaction, 0) / stores.length;
    const lowValueStores = stores.filter(s => s.avgTransaction < avgTransactionValue * 0.8).length;
    
    if (lowValueStores > 0) {
      generatedInsights.push({
        id: 'transaction-value',
        type: 'info',
        icon: '💰',
        title: 'Transaction Value Opportunity',
        summary: `${lowValueStores} stores have below-average transaction values`,
        details: {
          avgValue: avgTransactionValue,
          lowValueCount: lowValueStores,
          analysis: `Average transaction value is $${avgTransactionValue.toFixed(2)}, but ${lowValueStores} stores are 20% below this.`,
          recommendations: [
            'Implement upselling and cross-selling training programs',
            'Introduce bundle offers and combo deals',
            'Review product placement and merchandising strategies',
            'Consider loyalty programs to increase basket size',
            'Analyze product mix and ensure high-margin items are visible'
          ]
        }
      });
    }

    return generatedInsights;
  }, [data]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="ai-insights-container">
      <div className="ai-insights-header">
        <h2>🤖 AI-Powered Insights</h2>
        <p>Automated analysis and actionable recommendations based on your data</p>
      </div>

      <div className="insights-grid">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className={`insight-card ${expandedInsight === insight.id ? 'expanded' : ''}`}
            style={{ '--insight-color': getTypeColor(insight.type) }}
          >
            <div 
              className="insight-header"
              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
            >
              <div className="insight-icon">{insight.icon}</div>
              <div className="insight-title-section">
                <h3>{insight.title}</h3>
                <p className="insight-summary">{insight.summary}</p>
              </div>
              <div className="expand-icon">{expandedInsight === insight.id ? '−' : '+'}</div>
            </div>

            {expandedInsight === insight.id && (
              <div className="insight-details">
                <div className="insight-analysis">
                  <h4>📊 Analysis</h4>
                  <p>{insight.details.analysis}</p>
                </div>

                {insight.details.stores && (
                  <div className="insight-stores">
                    <h4>🏪 Affected Stores</h4>
                    <div className="stores-list">
                      {insight.details.stores.slice(0, 3).map((store, idx) => (
                        <div key={idx} className="store-item">
                          <span className="store-name">{store.store}</span>
                          <span className="store-market">{store.market}</span>
                          <span className={`store-variance ${store.variance >= 0 ? 'positive' : 'negative'}`}>
                            {store.variance >= 0 ? '+' : ''}{store.variance.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(insight.details.weakMarket || insight.details.weakBrand) && (
                  <div className="insight-comparison">
                    <div className="comparison-item weak">
                      <h5>Needs Attention</h5>
                      <p className="comparison-name">
                        {insight.details.weakMarket?.name || insight.details.weakBrand?.name}
                      </p>
                      <p className="comparison-variance negative">
                        {(insight.details.weakMarket?.variance || insight.details.weakBrand?.variance).toFixed(1)}%
                      </p>
                    </div>
                    <div className="comparison-item strong">
                      <h5>Top Performer</h5>
                      <p className="comparison-name">
                        {insight.details.strongMarket?.name || insight.details.strongBrand?.name}
                      </p>
                      <p className="comparison-variance positive">
                        +{(insight.details.strongMarket?.variance || insight.details.strongBrand?.variance).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="insight-recommendations">
                  <h4>💡 Recommendations</h4>
                  <ul>
                    {insight.details.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="no-insights">
          <p>No significant insights detected. Your performance is stable across all metrics.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
