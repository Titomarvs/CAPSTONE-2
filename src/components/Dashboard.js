import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentTime] = useState(new Date().toLocaleString());

  const handleLogout = () => {
    logout();
  };

  // Mock financial data - in a real system, this would come from your backend
  const financialData = {
    totalBudget: 25000000,
    allocatedFunds: 18750000,
    remainingBudget: 6250000,
    pendingApprovals: 12,
    completedTransactions: 1247,
    monthlyExpenditure: 3125000
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="dashboard-content">
        {/* Financial Summary */}
        <div className="financial-summary">
          <h2>Financial Overview</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="value">{formatCurrency(financialData.totalBudget)}</div>
              <div className="label">Total Budget</div>
            </div>
            <div className="summary-item positive">
              <div className="value">{formatCurrency(financialData.allocatedFunds)}</div>
              <div className="label">Allocated Funds</div>
            </div>
            <div className="summary-item">
              <div className="value">{formatCurrency(financialData.remainingBudget)}</div>
              <div className="label">Remaining Budget</div>
            </div>
            <div className="summary-item">
              <div className="value">{formatCurrency(financialData.monthlyExpenditure)}</div>
              <div className="label">Monthly Expenditure</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>
              <span className="card-icon">📊</span>
              Budget Management
            </h3>
            <p>Monitor and manage departmental budgets, allocations, and expenditures across all government agencies.</p>
            <div className="card-value">{formatCurrency(financialData.remainingBudget)}</div>
            <div className="card-subtitle">Available for allocation</div>
            <div className="quick-actions">
              <button className="quick-action-btn">View Budgets</button>
              <button className="quick-action-btn secondary">Create Allocation</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">✅</span>
              Approvals
            </h3>
            <p>Review and approve financial requests, purchase orders, and budget modifications.</p>
            <div className="card-value">{financialData.pendingApprovals}</div>
            <div className="card-subtitle">Pending approvals</div>
            <div className="quick-actions">
              <button className="quick-action-btn">Review Requests</button>
              <button className="quick-action-btn secondary">Approval History</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">💰</span>
              Transactions
            </h3>
            <p>Track all financial transactions, payments, and transfers within the government system.</p>
            <div className="card-value">{financialData.completedTransactions}</div>
            <div className="card-subtitle">Completed this quarter</div>
            <div className="quick-actions">
              <button className="quick-action-btn">View Transactions</button>
              <button className="quick-action-btn secondary">Generate Report</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">📈</span>
              Financial Reports
            </h3>
            <p>Generate comprehensive financial reports, analytics, and compliance documentation.</p>
            <div className="card-value">24</div>
            <div className="card-subtitle">Reports available</div>
            <div className="quick-actions">
              <button className="quick-action-btn">Generate Report</button>
              <button className="quick-action-btn secondary">View Templates</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">🔒</span>
              Compliance
            </h3>
            <p>Ensure adherence to government financial regulations and audit requirements.</p>
            <div className="card-value">98.5%</div>
            <div className="card-subtitle">Compliance rate</div>
            <div className="quick-actions">
              <button className="quick-action-btn">View Compliance</button>
              <button className="quick-action-btn secondary">Audit Trail</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">⚙️</span>
              System Settings
            </h3>
            <p>Configure system parameters, user permissions, and administrative settings.</p>
            <div className="card-value">Active</div>
            <div className="card-subtitle">System status</div>
            <div className="quick-actions">
              <button className="quick-action-btn">Manage Users</button>
              <button className="quick-action-btn secondary">System Config</button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="financial-summary">
          <h2>System Information</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <strong>Last Login:</strong> {currentTime}
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <strong>User Role:</strong> Financial Administrator
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <strong>Department:</strong> Finance & Budget
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <strong>Security Level:</strong> High
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

