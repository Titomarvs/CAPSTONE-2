import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import TransactionManagement from './components/TransactionManagement';
import FundAccounts from './components/FundAccounts';
import Override from './components/Override';
import Reporting from './components/Reporting';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute />} />
            <Route path="/user-management" element={<ProtectedRoute />} />
            <Route path="/transaction-management" element={<ProtectedRoute />} />
            <Route path="/fund-accounts" element={<ProtectedRoute />} />
            <Route path="/override" element={<ProtectedRoute />} />
            <Route path="/reporting" element={<ProtectedRoute />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = window.location.pathname;
  
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Government Financial Management System</h1>
            <p>Verifying access credentials...</p>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#6b7280'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #1e3c72',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Please wait while we verify your credentials...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render different components based on the route
  switch (location) {
    case '/dashboard':
      return <Dashboard />;
    case '/user-management':
      return <UserManagement />;
    case '/transaction-management':
      return <TransactionManagement />;
    case '/fund-accounts':
      return <FundAccounts />;
    case '/override':
      return <Override />;
    case '/reporting':
      return <Reporting />;
    default:
      return <Dashboard />;
  }
}

export default App;

