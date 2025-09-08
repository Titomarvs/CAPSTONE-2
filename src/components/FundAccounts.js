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

  // Fetch fund accounts on component mount
  useEffect(() => {
    fetchFundAccounts();
  }, []);

  const fetchFundAccounts = async () => {
    try {
      setFundAccountsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/get_fund_accounts', {
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
      const response = await axios.post('http://localhost:8000/api/create_fund_account', formData, {
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
                  <div key={account.id} className="fund-account-card">
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
