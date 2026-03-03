import React from 'react';
import './Topbar.css';

const Topbar = ({ lastUpdated, darkMode, setDarkMode, onFilterClick, activeFilterCount }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Sales Intelligence Dashboard</h1>
        <span className="topbar-subtitle">Last updated: {formatDate(lastUpdated)}</span>
      </div>

      <div className="topbar-right">
        <button className="filter-btn" onClick={onFilterClick}>
          <span className="filter-icon">🔍</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>

        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle theme"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
