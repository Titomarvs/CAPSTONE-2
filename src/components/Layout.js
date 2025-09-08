import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <Sidebar />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Government Financial Management System</h1>
            <div className="user-info">
              <p>Welcome, {user?.name}</p>
              <p>{user?.email}</p>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Layout;
