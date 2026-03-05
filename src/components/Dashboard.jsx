import React, { useMemo } from 'react';
import { startOfWeek, startOfMonth, subWeeks, subMonths, subYears, addDays, addYears, format } from 'date-fns';
import FilterDrawer from './FilterDrawer';
import FilterChips from './FilterChips';
import KPICards from './KPICards';
import OverviewPage from './OverviewPage';
import TrendChart from './TrendChart';
import GeoMap from './GeoMap';
import ComparativeAnalytics from './ComparativeAnalytics';
import AlertEngine from './AlertEngine';
import UnderperformanceAnalyzer from './UnderperformanceAnalyzer';
import './Dashboard.css';

const Dashboard = ({ data, currentView, filters, setFilters, filterDrawerOpen, setFilterDrawerOpen }) => {
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.countries.length > 0 && !filters.countries.includes(row.market)) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(row.brand)) return false;
      if (filters.channels.length > 0 && !filters.channels.includes(row.channel)) return false;
      if (filters.dateRange.start && row.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && row.date > filters.dateRange.end) return false;
      return true;
    });
  }, [data, filters]);

  const metrics = useMemo(() => {
    const totalSales = filteredData.reduce((sum, row) => sum + row.sales, 0);
    const totalTarget = filteredData.reduce((sum, row) => sum + row.target, 0);
    const totalTransactions = filteredData.reduce((sum, row) => sum + row.transactions, 0);
    const targetTransactions = filteredData.reduce((sum, row) => sum + row.targetTransactions, 0);
    const variance = totalSales - totalTarget;
    const variancePercent = totalTarget > 0 ? (variance / totalTarget) * 100 : 0;
    const totalStores = new Set(filteredData.map(d => d.storeId)).size;

    const now = new Date();
    const weekAgo = subWeeks(now, 1);
    const monthAgo = subMonths(now, 1);
    const yearAgo = subYears(now, 1);

    const currentWeekData = filteredData.filter(d => d.date >= startOfWeek(now));
    const lastWeekData = filteredData.filter(d => d.date >= startOfWeek(weekAgo) && d.date < startOfWeek(now));
    
    const currentMonthData = filteredData.filter(d => d.date >= startOfMonth(now));
    const lastMonthData = filteredData.filter(d => d.date >= startOfMonth(monthAgo) && d.date < startOfMonth(now));
    
    const currentYearData = filteredData.filter(d => d.date.getFullYear() === now.getFullYear());
    const lastYearData = filteredData.filter(d => d.date.getFullYear() === yearAgo.getFullYear());

    const calcChange = (current, previous) => {
      const currentSum = current.reduce((sum, row) => sum + row.sales, 0);
      const previousSum = previous.reduce((sum, row) => sum + row.sales, 0);
      return previousSum > 0 ? ((currentSum - previousSum) / previousSum) * 100 : 0;
    };

    return {
      totalSales,
      totalTarget,
      totalTransactions,
      targetTransactions,
      variance,
      variancePercent,
      totalStores,
      wowChange: calcChange(currentWeekData, lastWeekData),
      momChange: calcChange(currentMonthData, lastMonthData),
      yoyChange: calcChange(currentYearData, lastYearData)
    };
  }, [filteredData]);

  const sparklineData = useMemo(() => {
    const now = new Date();
    const getLast7Days = () => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = format(date, 'yyyy-MM-dd');
        
        const dayData = filteredData.filter(d => format(d.date, 'yyyy-MM-dd') === dateKey);
        const sales = dayData.reduce((sum, row) => sum + row.sales, 0);
        const target = dayData.reduce((sum, row) => sum + row.target, 0);
        const transactions = dayData.reduce((sum, row) => sum + row.transactions, 0);
        const targetTransactions = dayData.reduce((sum, row) => sum + row.targetTransactions, 0);
        
        result.push({
          date: dateKey,
          value: sales,
          target,
          transactions,
          targetTransactions,
          variance: sales - target
        });
      }
      return result;
    };

    // Get weekly data for WoW sparkline
    const getWeeklyData = () => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const weekStart = subWeeks(now, i);
        const weekEnd = addDays(weekStart, 6);
        
        const weekData = filteredData.filter(d => 
          d.date >= weekStart && d.date <= weekEnd
        );
        const sales = weekData.reduce((sum, row) => sum + row.sales, 0);
        
        result.push({ value: sales });
      }
      return result;
    };

    // Get monthly data for MoM sparkline
    const getMonthlyData = () => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const monthStart = subMonths(now, i);
        const monthEnd = addDays(monthStart, 30);
        
        const monthData = filteredData.filter(d => 
          d.date >= monthStart && d.date <= monthEnd
        );
        const sales = monthData.reduce((sum, row) => sum + row.sales, 0);
        
        result.push({ value: sales });
      }
      return result;
    };

    // Get yearly data for YoY sparkline
    const getYearlyData = () => {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const yearStart = subYears(now, i);
        const yearEnd = addYears(yearStart, 1);
        
        const yearData = filteredData.filter(d => 
          d.date >= yearStart && d.date < yearEnd
        );
        const sales = yearData.reduce((sum, row) => sum + row.sales, 0);
        
        result.push({ value: sales });
      }
      return result;
    };

    const last7Days = getLast7Days();

    return {
      sales: last7Days.map(d => ({ value: d.value })),
      target: last7Days.map(d => ({ value: d.target })),
      transactions: last7Days.map(d => ({ value: d.transactions })),
      targetTransactions: last7Days.map(d => ({ value: d.targetTransactions })),
      variance: last7Days.map(d => ({ value: d.variance })),
      wow: getWeeklyData(),
      mom: getMonthlyData(),
      yoy: getYearlyData()
    };
  }, [filteredData]);

  const removeFilter = (type, value) => {
    if (type === 'dateRange') {
      setFilters({
        ...filters,
        dateRange: { start: null, end: null }
      });
    } else {
      setFilters({
        ...filters,
        [type]: filters[type].filter(v => v !== value)
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      countries: [],
      brands: [],
      channels: [],
      dateRange: { start: null, end: null },
      granularity: 'daily'
    });
  };

  return (
    <div className="dashboard-container">
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
        data={data}
      />

      <FilterChips
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />

      <div className="dashboard-content">
        <KPICards metrics={metrics} sparklineData={sparklineData} />

        {currentView === 'overview' && <OverviewPage data={filteredData} />}
        
        {currentView === 'analytics' && (
          <div className="page-content">
            <div className="analytics-combined">
              <TrendChart data={filteredData} granularity={filters.granularity} />
              <GeoMap data={filteredData} />
              <ComparativeAnalytics data={filteredData} />
            </div>
          </div>
        )}

        {currentView === 'alerts' && (
          <div className="page-content">
            <AlertEngine data={filteredData} />
          </div>
        )}

        {currentView === 'underperformance' && (
          <div className="page-content">
            <UnderperformanceAnalyzer data={filteredData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
