import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'underperformance', label: 'Underperformance', icon: '⚠️' }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">💼</span>
          {!collapsed && <span className="logo-text">Sales Intel</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
