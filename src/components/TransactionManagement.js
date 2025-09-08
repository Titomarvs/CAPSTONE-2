import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import axios from 'axios';

const TransactionManagement = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    recipient: '',
    department: '',
    category: '',
    reference: '',
    fund_account_id: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [fundAccounts, setFundAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch transactions and fund accounts on component mount
  useEffect(() => {
    fetchTransactions();
    fetchFundAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/get_transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessage('Error loading transactions');
      setMessageType('error');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchFundAccounts = async () => {
    try {
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
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/create_transaction', {
        type: transactionType,
        ...formData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(`${transactionType} transaction created successfully!`);
      setMessageType('success');
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        recipient: '',
        department: '',
        category: '',
        reference: '',
        fund_account_id: ''
      });
      setTransactionType('');
      setShowCreateForm(false);
      
      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating transaction');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <Layout>
      <div className="page-content">
      <div className="page-header">
        <h1>Transaction Management</h1>
        <p>Manage financial transactions, disbursements, and collections</p>
      </div>

      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Create Transaction Section */}
      <div className="content-card">
        <div className="card-header">
          <h2>Create New Transaction</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Transaction'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transactionType">Transaction Type *</label>
                <select
                  id="transactionType"
                  name="transactionType"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select transaction type</option>
                  <option value="Disburse">Disburse</option>
                  <option value="Collection">Collection</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select department</option>
                  <option value="Finance & Budget">Finance & Budget</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select category</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter transaction description"
                rows="3"
                className="form-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipient">Recipient/Payer *</label>
                <input
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter recipient or payer name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reference">Reference Number</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Enter reference number (optional)"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fund_account_id">Fund Account</label>
              <select
                id="fund_account_id"
                name="fund_account_id"
                value={formData.fund_account_id}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select fund account (optional)</option>
                {fundAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.code}) - {formatCurrency(account.current_balance)}
                  </option>
                ))}
              </select>
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                {transactionType === 'Collection' ? 'Amount will be added to selected fund account' : 
                 transactionType === 'Disburse' ? 'Amount will be deducted from selected fund account' : 
                 'Select a fund account to track this transaction'}
              </small>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : `Create ${transactionType} Transaction`}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="content-card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
          <button className="btn btn-secondary" onClick={fetchTransactions}>
            Refresh
          </button>
        </div>

        <div className="transactions-table">
          {transactionsLoading ? (
            <div className="loading-container" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state" style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4>No transactions found</h4>
              <p>Create your first transaction to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Recipient</th>
                  <th>Department</th>
                  <th>Fund Account</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>#{transaction.id}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="amount">{formatCurrency(transaction.amount)}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.recipient}</td>
                    <td>{transaction.department}</td>
                    <td>
                      {transaction.fund_account_name ? (
                        <span style={{ fontSize: '0.9rem' }}>
                          {transaction.fund_account_name} ({transaction.fund_account_code})
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No fund account</span>
                      )}
                    </td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default TransactionManagement;
