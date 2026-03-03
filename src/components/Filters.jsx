import React from 'react';
import './Filters.css';

const Filters = ({ filters, setFilters, options }) => {
  const handleMultiSelect = (field, value) => {
    const current = filters[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
  };

  const handleDateChange = (type, value) => {
    setFilters({
      ...filters,
      dateRange: { ...filters.dateRange, [type]: value ? new Date(value) : null }
    });
  };

  const clearFilters = () => {
    setFilters({
      countries: [],
      brands: [],
      stores: [],
      dateRange: { start: null, end: null },
      granularity: 'daily'
    });
  };

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3>Global Filters</h3>
        <button className="clear-btn" onClick={clearFilters}>Clear All</button>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label>Country</label>
          <select 
            multiple 
            value={filters.countries}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFilters({ ...filters, countries: selected });
            }}
          >
            {options.countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <small>{filters.countries.length} selected</small>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select 
            multiple 
            value={filters.brands}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFilters({ ...filters, brands: selected });
            }}
          >
            {options.brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <small>{filters.brands.length} selected</small>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input 
              type="date" 
              value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
              placeholder="Start Date"
            />
            <input 
              type="date" 
              value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Granularity</label>
          <select 
            value={filters.granularity}
            onChange={(e) => setFilters({ ...filters, granularity: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
