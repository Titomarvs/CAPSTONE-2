import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';

const FundAccounts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    initial_balance: '',
    account_type: 'Asset',
    department: ''
  });
  const [fundAccounts, setFundAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fundAccountsLoading, setFundAccountsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showFundAccountDetail, setShowFundAccountDetail] = useState(false);
  const [selectedFundAccount, setSelectedFundAccount] = useState(null);
  const [fundAccountTransactions, setFundAccountTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Fetch fund accounts on component mount
  useEffect(() => {
    fetchFundAccounts();
  }, []);

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
      setMessage('Error loading fund accounts');
      setMessageType('error');
    } finally {
      setFundAccountsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/create_fund_account.php', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('Fund account created successfully!');
      setMessageType('success');
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        initial_balance: '',
        account_type: 'Asset',
        department: ''
      });
      setShowCreateForm(false);
      
      // Refresh fund accounts list
      fetchFundAccounts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating fund account');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'Revenue':
        return '#16a34a';
      case 'Expense':
        return '#dc2626';
      case 'Asset':
        return '#1e40af';
      case 'Liability':
        return '#d97706';
      case 'Equity':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  const handleFundAccountClick = async (fundAccount) => {
    setSelectedFundAccount(fundAccount);
    setShowFundAccountDetail(true);
    await fetchFundAccountTransactions(fundAccount.id);
  };

  const handleCloseFundAccountDetail = () => {
    setShowFundAccountDetail(false);
    setSelectedFundAccount(null);
    setFundAccountTransactions([]);
  };

  const fetchFundAccountTransactions = async (fundAccountId) => {
    try {
      setTransactionsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/get_transactions.php?fund_account_id=${fundAccountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFundAccountTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching fund account transactions:', error);
      setFundAccountTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-content">
        <div className="page-header">
          <h1>Fund Accounts</h1>
          <p>Manage government fund accounts and allocations</p>
        </div>

        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* Fund Account Detail Popup */}
        {showFundAccountDetail && selectedFundAccount && (
          <div className="fund-account-detail-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="fund-account-detail-popup" style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="popup-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: getAccountTypeColor(selectedFundAccount.account_type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                      {selectedFundAccount.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                      {selectedFundAccount.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      {selectedFundAccount.code} • {selectedFundAccount.account_type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseFundAccountDetail}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>

              <div className="popup-content">
                {/* Fund Account Information */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    Account Information
                  </h4>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Account Name:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {selectedFundAccount.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Account Code:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {selectedFundAccount.code}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Account Type:</span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: 'white',
                          backgroundColor: getAccountTypeColor(selectedFundAccount.account_type),
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}>
                          {selectedFundAccount.account_type}
                        </span>
                      </div>
                      {selectedFundAccount.department && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500', color: '#6b7280' }}>Department:</span>
                          <span style={{ fontWeight: '500', color: '#1f2937' }}>
                            {selectedFundAccount.department}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Initial Balance:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {formatCurrency(selectedFundAccount.initial_balance)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Current Balance:</span>
                        <span style={{ 
                          fontWeight: '700', 
                          color: selectedFundAccount.current_balance >= 0 ? '#16a34a' : '#dc2626',
                          fontSize: '18px'
                        }}>
                          {formatCurrency(selectedFundAccount.current_balance)}
                        </span>
                      </div>
                      {selectedFundAccount.description && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: '500', color: '#6b7280' }}>Description:</span>
                          <span style={{ fontWeight: '500', color: '#1f2937', textAlign: 'right', maxWidth: '300px' }}>
                            {selectedFundAccount.description}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Created Date:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {new Date(selectedFundAccount.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Section */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    Transaction History ({fundAccountTransactions.length})
                  </h4>
                  {transactionsLoading ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#6b7280',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p>Loading transactions...</p>
                    </div>
                  ) : fundAccountTransactions.length === 0 ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#6b7280',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4>No transactions found</h4>
                      <p>This fund account has no associated transactions yet.</p>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden'
                    }}>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                            <tr>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>ID</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fundAccountTransactions.map((transaction) => (
                              <tr key={transaction.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>#{transaction.id}</td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: transaction.type === 'Collection' ? '#f0fdf4' : '#fef2f2',
                                    color: transaction.type === 'Collection' ? '#166534' : '#991b1b'
                                  }}>
                                    {transaction.type}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                  {formatCurrency(transaction.amount)}
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {transaction.description}
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="popup-actions" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={handleCloseFundAccountDetail}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Fund Account Section */}
        <div className="content-card">
          <div className="card-header">
            <h2>Create New Fund Account</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Fund'}
            </button>
          </div>

          {showCreateForm && (
            <div className="form-container">
              <h3>Fund Account Details</h3>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Fund Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter fund account name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">Fund Code *</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter unique fund code (e.g., GEN-001)"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="account_type">Account Type *</label>
                    <select
                      id="account_type"
                      name="account_type"
                      value={formData.account_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Asset">Asset</option>
                      <option value="Liability">Liability</option>
                      <option value="Equity">Equity</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="initial_balance">Initial Balance</label>
                    <input
                      type="number"
                      id="initial_balance"
                      name="initial_balance"
                      value={formData.initial_balance}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select department (optional)</option>
                    <option value="Finance & Budget">Finance & Budget</option>
                    <option value="Public Works">Public Works</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter fund account description (optional)"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Fund Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Fund Accounts List */}
        <div className="content-card">
          <div className="card-header">
            <h2>Fund Accounts</h2>
            <button className="btn btn-secondary" onClick={fetchFundAccounts}>
              Refresh
            </button>
          </div>

          <div className="fund-accounts-container">
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
              <div className="fund-accounts-grid">
                {fundAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="fund-account-card"
                    onClick={() => handleFundAccountClick(account)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    <div className="fund-account-header">
                      <h3>{account.name}</h3>
                      <span 
                        className="account-type-badge"
                        style={{ 
                          backgroundColor: getAccountTypeColor(account.account_type),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        {account.account_type}
                      </span>
                    </div>
                    <div className="fund-account-details">
                      <p><strong>Code:</strong> {account.code}</p>
                      {account.department && <p><strong>Department:</strong> {account.department}</p>}
                      <p><strong>Current Balance:</strong> 
                        <span style={{ 
                          color: account.current_balance >= 0 ? '#16a34a' : '#dc2626',
                          fontWeight: '600',
                          marginLeft: '8px'
                        }}>
                          {formatCurrency(account.current_balance)}
                        </span>
                      </p>
                      {account.description && <p><strong>Description:</strong> {account.description}</p>}
                      <p><strong>Created:</strong> {new Date(account.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FundAccounts;
