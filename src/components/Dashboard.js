import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentTime] = useState(new Date().toLocaleString());
  const [fundAccounts, setFundAccounts] = useState([]);
  const [fundAccountsLoading, setFundAccountsLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState('All');
  const [overrideRequests, setOverrideRequests] = useState([]);
  const [overrideRequestsLoading, setOverrideRequestsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  // Fetch fund accounts, override requests, and transactions on component mount
  useEffect(() => {
    fetchFundAccounts();
    fetchOverrideRequests();
    fetchTransactions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const fetchFundAccounts = async () => {
    try {
      setFundAccountsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/get_fund_accounts.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFundAccounts(response.data.fund_accounts);
    } catch (error) {
      console.error('Error fetching fund accounts:', error);
    } finally {
      setFundAccountsLoading(false);
    }
  };

  const fetchOverrideRequests = async () => {
    try {
      setOverrideRequestsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/get_override_requests.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setOverrideRequests(response.data.override_requests || []);
    } catch (error) {
      console.error('Error fetching override requests:', error);
    } finally {
      setOverrideRequestsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/get_transactions.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Calculate pending override requests
  const pendingOverrideRequests = overrideRequests.filter(request => request.status === 'pending').length;

  // Calculate completed transactions (all transactions are considered completed once created)
  const completedTransactions = transactions.length;

  // Mock financial data - in a real system, this would come from your backend
  const financialData = {
    totalBudget: 25000000,
    allocatedFunds: 18750000,
    remainingBudget: 6250000,
    pendingApprovals: pendingOverrideRequests,
    completedTransactions: completedTransactions,
    monthlyExpenditure: 3125000
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Filter fund accounts based on selected account type
  const filteredFundAccounts = selectedAccountType === 'All' 
    ? fundAccounts 
    : fundAccounts.filter(account => account.account_type === selectedAccountType);

  // Account types for filter dropdown
  const accountTypes = ['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const handleAccountTypeFilter = (accountType) => {
    setSelectedAccountType(accountType);
    setShowFilterDropdown(false);
  };

  return (
    <Layout>
      <style jsx>{`
        .financial-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .filter-container {
          position: relative;
        }
        
        .filter-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          z-index: 1000;
          min-width: 150px;
          margin-top: 4px;
        }
        
        .filter-dropdown button:last-child {
          border-bottom: none;
        }
      `}</style>
      <div className="dashboard-content">
        {/* Financial Summary */}
        <div className="financial-summary">
          <div className="financial-summary-header">
            <h2>Financial Overview</h2>
            <div className="filter-container">
              <button 
                className="filter-button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '16px',
                  height: '2px',
                  backgroundColor: '#6b7280',
                  borderRadius: '1px'
                }}></div>
                <div style={{
                  width: '16px',
                  height: '2px',
                  backgroundColor: '#6b7280',
                  borderRadius: '1px'
                }}></div>
                <div style={{
                  width: '16px',
                  height: '2px',
                  backgroundColor: '#6b7280',
                  borderRadius: '1px'
                }}></div>
              </button>
              
              {showFilterDropdown && (
                <div className="filter-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 1000,
                  minWidth: '150px',
                  marginTop: '4px'
                }}>
                  {accountTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAccountTypeFilter(type)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: selectedAccountType === type ? '#3b82f6' : 'transparent',
                        color: selectedAccountType === type ? 'white' : '#374151',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: selectedAccountType === type ? '600' : '400',
                        transition: 'all 0.2s',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedAccountType !== type) {
                          e.target.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAccountType !== type) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {fundAccountsLoading ? (
            <div className="loading-container" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>Loading fund accounts...</p>
            </div>
          ) : fundAccounts.length === 0 ? (
            <div className="empty-state" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4>No fund accounts found</h4>
              <p>Create your first fund account to get started.</p>
            </div>
          ) : (
            <div className="summary-grid">
              {filteredFundAccounts.slice(0, 4).map((account) => (
                <div key={account.id} className="summary-item">
                  <div className="value">{formatCurrency(account.current_balance)}</div>
                  <div className="label">{account.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
       

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">✅</span>
              Override Requests
            </h3>
            <p>Review and approve Override Requests</p>
            <div className="card-value">
              {overrideRequestsLoading ? (
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
              ) : (
                financialData.pendingApprovals
              )}
            </div>
            <div className="card-subtitle">Pending Override Requests</div>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/override'}
                disabled={overrideRequestsLoading}
              >
                Review Requests
              </button>
              <button 
                className="quick-action-btn secondary"
                onClick={() => window.location.href = '/override'}
                disabled={overrideRequestsLoading}
              >
                Approval History
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>
              <span className="card-icon">💰</span>
              Transactions
            </h3>
            <p>Track all financial transactions, payments, and transfers within the government system.</p>
            <div className="card-value">
              {transactionsLoading ? (
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</span>
              ) : (
                financialData.completedTransactions
              )}
            </div>
            <div className="card-subtitle">Total Transactions</div>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/transaction-management'}
                disabled={transactionsLoading}
              >
                View Transactions
              </button>
              <button 
                className="quick-action-btn secondary"
                onClick={() => window.location.href = '/reporting'}
                disabled={transactionsLoading}
              >
                Generate Report
              </button>
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

       

        
        </div>

        {/* System Information */}
     
      </div>
    </Layout>
  );
};

export default Dashboard;

