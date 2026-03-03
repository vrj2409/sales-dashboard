import React, { useMemo, useState } from 'react';
import './AlertEngine.css';

const AlertEngine = ({ data }) => {
  const [alertConfig, setAlertConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('alertConfiguration');
      return saved ? JSON.parse(saved) : {
        emails: [],
        filters: {
          countries: [],
          brands: [],
          stores: []
        },
        thresholds: {
          salesDrop: -10
        }
      };
    } catch (e) {
      return {
        emails: [],
        filters: {
          countries: [],
          brands: [],
          stores: []
        },
        thresholds: {
          salesDrop: -10
        }
      };
    }
  });

  const [newEmail, setNewEmail] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);

  // Extract unique values from data
  const availableOptions = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { countries: [], brands: [], stores: [] };
    }
    
    try {
      const countries = [...new Set(data.map(d => d.market).filter(Boolean))].sort();
      const brands = [...new Set(data.map(d => d.brand).filter(Boolean))].sort();
      
      const storeMap = new Map();
      data.forEach(d => {
        if (d.storeId && d.store) {
          storeMap.set(d.storeId, d.store);
        }
      });
      
      const stores = Array.from(storeMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return { countries, brands, stores };
    } catch (e) {
      console.error('Error processing data:', e);
      return { countries: [], brands: [], stores: [] };
    }
  }, [data]);

  const saveConfig = (config) => {
    setAlertConfig(config);
    try {
      localStorage.setItem('alertConfiguration', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config:', e);
    }
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes('@') && !alertConfig.emails.includes(newEmail)) {
      const updated = {
        ...alertConfig,
        emails: [...alertConfig.emails, newEmail]
      };
      saveConfig(updated);
      setNewEmail('');
    }
  };

  const removeEmail = (email) => {
    const updated = {
      ...alertConfig,
      emails: alertConfig.emails.filter(e => e !== email)
    };
    saveConfig(updated);
  };

  const addCountries = () => {
    if (selectedCountries.length > 0) {
      const updated = {
        ...alertConfig,
        filters: {
          ...alertConfig.filters,
          countries: [...new Set([...alertConfig.filters.countries, ...selectedCountries])]
        }
      };
      saveConfig(updated);
      setSelectedCountries([]);
    }
  };

  const removeCountry = (country) => {
    const updated = {
      ...alertConfig,
      filters: {
        ...alertConfig.filters,
        countries: alertConfig.filters.countries.filter(c => c !== country)
      }
    };
    saveConfig(updated);
  };

  const addBrands = () => {
    if (selectedBrands.length > 0) {
      const updated = {
        ...alertConfig,
        filters: {
          ...alertConfig.filters,
          brands: [...new Set([...alertConfig.filters.brands, ...selectedBrands])]
        }
      };
      saveConfig(updated);
      setSelectedBrands([]);
    }
  };

  const removeBrand = (brand) => {
    const updated = {
      ...alertConfig,
      filters: {
        ...alertConfig.filters,
        brands: alertConfig.filters.brands.filter(b => b !== brand)
      }
    };
    saveConfig(updated);
  };

  const addStores = () => {
    if (selectedStores.length > 0) {
      const updated = {
        ...alertConfig,
        filters: {
          ...alertConfig.filters,
          stores: [...new Set([...alertConfig.filters.stores, ...selectedStores])]
        }
      };
      saveConfig(updated);
      setSelectedStores([]);
    }
  };

  const removeStore = (storeId) => {
    const updated = {
      ...alertConfig,
      filters: {
        ...alertConfig.filters,
        stores: alertConfig.filters.stores.filter(s => s !== storeId)
      }
    };
    saveConfig(updated);
  };

  const updateThreshold = (value) => {
    const updated = {
      ...alertConfig,
      thresholds: { salesDrop: parseFloat(value) || -10 }
    };
    saveConfig(updated);
  };

  const handleCountrySelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCountries(options);
  };

  const handleBrandSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedBrands(options);
  };

  const handleStoreSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStores(options);
  };

  const getStoreName = (storeId) => {
    const store = availableOptions.stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const monitoringScope = useMemo(() => {
    const hasCountries = alertConfig.filters.countries.length > 0;
    const hasBrands = alertConfig.filters.brands.length > 0;
    const hasStores = alertConfig.filters.stores.length > 0;

    if (!hasCountries && !hasBrands && !hasStores) {
      return 'All stores across all countries and brands';
    }

    const parts = [];
    if (hasStores) parts.push(`${alertConfig.filters.stores.length} specific stores`);
    if (hasBrands) parts.push(`${alertConfig.filters.brands.length} brands`);
    if (hasCountries) parts.push(`${alertConfig.filters.countries.length} countries`);

    return parts.join(', ');
  }, [alertConfig.filters]);

  return (
    <div className="alert-config-container">
      <div className="config-header">
        <div>
          <h3>📧 Alert Configuration</h3>
          <p className="config-subtitle">Configure email alerts for sales performance dips</p>
        </div>
        <div className="config-status">
          <div className="status-badge">
            {alertConfig.emails.length > 0 ? (
              <>
                <span className="status-dot active"></span>
                <span>Active ({alertConfig.emails.length} recipients)</span>
              </>
            ) : (
              <>
                <span className="status-dot inactive"></span>
                <span>Inactive</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="config-grid">
        {/* Email Recipients Section */}
        <div className="config-card">
          <div className="card-header">
            <h4>✉️ Email Recipients</h4>
            <span className="card-badge">{alertConfig.emails.length}</span>
          </div>
          <p className="card-description">Add email addresses to receive alert notifications</p>
          
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              className="email-input"
            />
            <button onClick={addEmail} className="add-btn">Add Email</button>
          </div>

          <div className="items-list">
            {alertConfig.emails.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No email recipients configured</p>
              </div>
            ) : (
              alertConfig.emails.map((email) => (
                <div key={email} className="item-chip email-chip">
                  <span className="chip-icon">✉️</span>
                  <span className="chip-text">{email}</span>
                  <button onClick={() => removeEmail(email)} className="chip-remove">×</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert Threshold Section */}
        <div className="config-card">
          <div className="card-header">
            <h4>⚠️ Alert Threshold</h4>
          </div>
          <p className="card-description">Set the sales drop percentage that triggers an alert</p>
          
          <div className="threshold-selector">
            <label>Sales Drop Threshold</label>
            <div className="threshold-input-group">
              <input
                type="number"
                value={alertConfig.thresholds.salesDrop}
                onChange={(e) => updateThreshold(e.target.value)}
                step="1"
                min="-100"
                max="0"
                className="threshold-input"
              />
              <span className="threshold-unit">%</span>
            </div>
            <p className="threshold-note">
              Alert when sales drop by {Math.abs(alertConfig.thresholds.salesDrop)}% or more
            </p>
          </div>
        </div>
      </div>

      {/* Monitoring Filters Section */}
      <div className="config-card full-width">
        <div className="card-header">
          <h4>🎯 Monitoring Scope</h4>
        </div>
        <p className="card-description">
          Select specific countries, brands, or stores to monitor. Leave all empty to monitor everything.
        </p>
        
        <div className="scope-summary">
          <strong>Currently monitoring:</strong> {monitoringScope}
        </div>

        <div className="filters-grid">
          {/* Countries Filter */}
          <div className="filter-section">
            <label>Countries</label>
            <select 
              multiple 
              value={selectedCountries}
              onChange={handleCountrySelect}
              className="multi-select"
              size="6"
            >
              {availableOptions.countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <button 
              onClick={addCountries} 
              className="add-filter-btn"
              disabled={selectedCountries.length === 0}
            >
              Add Selected Countries
            </button>
            
            <div className="selected-items">
              {alertConfig.filters.countries.map(country => (
                <div key={country} className="item-chip country-chip">
                  <span className="chip-icon">🌍</span>
                  <span className="chip-text">{country}</span>
                  <button onClick={() => removeCountry(country)} className="chip-remove">×</button>
                </div>
              ))}
              {alertConfig.filters.countries.length === 0 && (
                <p className="filter-empty">All countries</p>
              )}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="filter-section">
            <label>Brands</label>
            <select 
              multiple 
              value={selectedBrands}
              onChange={handleBrandSelect}
              className="multi-select"
              size="6"
            >
              {availableOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <button 
              onClick={addBrands} 
              className="add-filter-btn"
              disabled={selectedBrands.length === 0}
            >
              Add Selected Brands
            </button>
            
            <div className="selected-items">
              {alertConfig.filters.brands.map(brand => (
                <div key={brand} className="item-chip brand-chip">
                  <span className="chip-icon">🏷️</span>
                  <span className="chip-text">{brand}</span>
                  <button onClick={() => removeBrand(brand)} className="chip-remove">×</button>
                </div>
              ))}
              {alertConfig.filters.brands.length === 0 && (
                <p className="filter-empty">All brands</p>
              )}
            </div>
          </div>

          {/* Stores Filter */}
          <div className="filter-section">
            <label>Stores</label>
            <select 
              multiple 
              value={selectedStores}
              onChange={handleStoreSelect}
              className="multi-select"
              size="6"
            >
              {availableOptions.stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.id} - {store.name}
                </option>
              ))}
            </select>
            <button 
              onClick={addStores} 
              className="add-filter-btn"
              disabled={selectedStores.length === 0}
            >
              Add Selected Stores
            </button>
            
            <div className="selected-items">
              {alertConfig.filters.stores.map(storeId => (
                <div key={storeId} className="item-chip store-chip">
                  <span className="chip-icon">🏪</span>
                  <span className="chip-text">{storeId} - {getStoreName(storeId)}</span>
                  <button onClick={() => removeStore(storeId)} className="chip-remove">×</button>
                </div>
              ))}
              {alertConfig.filters.stores.length === 0 && (
                <p className="filter-empty">All stores</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="config-note">
        <strong>💡 How it works:</strong> Email alerts will be sent when sales drop by {Math.abs(alertConfig.thresholds.salesDrop)}% or more 
        for the selected scope. In production, these alerts would be sent via an email service.
      </div>
    </div>
  );
};

export default AlertEngine;
