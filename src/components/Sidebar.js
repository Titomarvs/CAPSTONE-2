import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '',
      path: '/dashboard'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: '',
      path: '/user-management'
    },
    {
      id: 'transaction-management',
      label: 'Transaction Management',
      icon: '',
      path: '/transaction-management'
    },
    {
      id: 'fund-accounts',
      label: 'Fund Accounts',
      icon: '',
      path: '/fund-accounts'
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: '',
      path: '/reporting'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Financial System</h3>
        <p>Management Portal</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
