import React from 'react';
import './FilterChips.css';

const FilterChips = ({ filters, onRemove, onClearAll }) => {
  const hasActiveFilters = 
    filters.countries.length > 0 ||
    filters.brands.length > 0 ||
    filters.channels.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  if (!hasActiveFilters) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="filter-chips">
      {filters.countries.map(country => (
        <div key={`country-${country}`} className="filter-chip">
          <span className="chip-label">Country:</span> {country}
          <button className="chip-remove" onClick={() => onRemove('countries', country)}>✕</button>
        </div>
      ))}

      {filters.brands.map(brand => (
        <div key={`brand-${brand}`} className="filter-chip">
          <span className="chip-label">Brand:</span> {brand}
          <button className="chip-remove" onClick={() => onRemove('brands', brand)}>✕</button>
        </div>
      ))}

      {filters.channels.map(channel => (
        <div key={`channel-${channel}`} className="filter-chip">
          <span className="chip-label">Channel:</span> {channel}
          <button className="chip-remove" onClick={() => onRemove('channels', channel)}>✕</button>
        </div>
      ))}

      {(filters.dateRange.start || filters.dateRange.end) && (
        <div className="filter-chip">
          <span className="chip-label">Date:</span>
          {filters.dateRange.start && formatDate(filters.dateRange.start)}
          {filters.dateRange.start && filters.dateRange.end && ' - '}
          {filters.dateRange.end && formatDate(filters.dateRange.end)}
          <button className="chip-remove" onClick={() => onRemove('dateRange')}>✕</button>
        </div>
      )}

      <button className="clear-all-chip" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default FilterChips;
