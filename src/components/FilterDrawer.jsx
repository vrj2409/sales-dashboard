import React, { useMemo } from 'react';
import './FilterDrawer.css';

const FilterDrawer = ({ isOpen, onClose, filters, setFilters, data }) => {
  const filterOptions = useMemo(() => {
    const countries = [...new Set(data.map(d => d.market))].filter(Boolean).sort();
    const brands = [...new Set(data.map(d => d.brand))].filter(Boolean).sort();
    const channels = [...new Set(data.map(d => d.channel))].filter(Boolean).sort();
    
    return { countries, brands, channels };
  }, [data]);

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

  const clearAllFilters = () => {
    setFilters({
      countries: [],
      brands: [],
      channels: [],
      dateRange: { start: null, end: null },
      granularity: 'daily'
    });
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className={`filter-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Filters</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-content">
          <div className="filter-section">
            <label className="filter-label">Country</label>
            <div className="checkbox-group">
              {filterOptions.countries.map(country => (
                <label key={country} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.countries.includes(country)}
                    onChange={() => handleMultiSelect('countries', country)}
                  />
                  <span>{country}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Brand</label>
            <div className="checkbox-group">
              {filterOptions.brands.map(brand => (
                <label key={brand} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleMultiSelect('brands', brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Channel</label>
            <div className="checkbox-group">
              {filterOptions.channels.map(channel => (
                <label key={channel} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.channels.includes(channel)}
                    onChange={() => handleMultiSelect('channels', channel)}
                  />
                  <span>{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Date Range</label>
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

          <div className="filter-section">
            <label className="filter-label">Granularity</label>
            <div className="segmented-control">
              <button
                className={filters.granularity === 'daily' ? 'active' : ''}
                onClick={() => setFilters({ ...filters, granularity: 'daily' })}
              >
                Daily
              </button>
              <button
                className={filters.granularity === 'weekly' ? 'active' : ''}
                onClick={() => setFilters({ ...filters, granularity: 'weekly' })}
              >
                Weekly
              </button>
              <button
                className={filters.granularity === 'monthly' ? 'active' : ''}
                onClick={() => setFilters({ ...filters, granularity: 'monthly' })}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="clear-btn" onClick={clearAllFilters}>
            Clear All
          </button>
          <button className="apply-btn" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
