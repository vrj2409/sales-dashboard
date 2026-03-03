import React, { useState, useEffect, useMemo } from 'react';
import { parseISO } from 'date-fns';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    countries: [],
    brands: [],
    channels: [],
    dateRange: { start: null, end: null },
    granularity: 'daily'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      
      // Check if data is embedded in window object (for Streamlit)
      let jsonData;
      if (window.__DATA__) {
        console.log('Using embedded data from window.__DATA__');
        jsonData = window.__DATA__;
      } else {
        console.log('Fetching data.json...');
        const response = await fetch('/data.json');
        console.log('Response received, parsing JSON...');
        jsonData = await response.json();
      }
      
      console.log(`Parsed ${jsonData.length} records, processing...`);
      
      // Sample data intelligently - take every Nth record to maintain distribution
      const targetSize = 50000;
      const samplingRate = Math.ceil(jsonData.length / targetSize);
      const sampledData = jsonData.filter((_, index) => index % samplingRate === 0);
      
      console.log(`Sampled ${sampledData.length} records from ${jsonData.length} (every ${samplingRate}th record)`);
      
      const processedData = sampledData.map(row => ({
        date: new Date(row.Date),
        storeId: row.StoreID,
        store: row.Store,
        market: row.Market,
        countryId: row.Country_ID,
        brand: row.Brand,
        channel: row.Channel,
        homeDeliveryChannel: row.HomeDelivery_Channel,
        digitalChannel: row.Digital_Channel,
        sales: parseFloat(row.Sales) || 0,
        transactions: parseInt(row.Transactions) || 0,
        target: parseFloat(row.Budget) || 0,
        targetTransactions: parseInt(row.Budget_Transactions) || 0
      })).filter(row => !isNaN(row.date.getTime()));

      console.log(`Processed ${processedData.length} valid records`);
      setRawData(processedData);
      setLoading(false);
      console.log('Data loaded successfully!');
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const lastUpdated = useMemo(() => {
    if (rawData.length === 0) return null;
    // Return current date/time instead of max date from data
    return new Date();
  }, [rawData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.countries.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.channels.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Sales Intelligence Dashboard...</p>
        <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
          Loading and sampling 1M+ records for optimal performance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className="main-content">
        <Topbar 
          lastUpdated={lastUpdated}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onFilterClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          activeFilterCount={activeFilterCount}
        />
        
        <Dashboard 
          data={rawData}
          currentView={currentView}
          filters={filters}
          setFilters={setFilters}
          filterDrawerOpen={filterDrawerOpen}
          setFilterDrawerOpen={setFilterDrawerOpen}
        />
      </div>
    </div>
  );
}

export default App;
