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
    fund_account_id: '',
    mode_of_payment: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [fundAccounts, setFundAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions and fund accounts on component mount
  useEffect(() => {
    fetchTransactions();
    fetchFundAccounts();
  }, []);

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
      const response = await axios.get('/api/get_fund_accounts.php', {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    setLoading(true);
    setMessage('');
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/create_transaction.php', {
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
        fund_account_id: '',
        mode_of_payment: ''
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

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleCloseTransactionDetail = () => {
    setShowTransactionDetail(false);
    setSelectedTransaction(null);
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFundAccountName = (fundAccountId) => {
    if (!fundAccountId) return 'No fund account selected';
    const account = fundAccounts.find(acc => acc.id == fundAccountId);
    return account ? `${account.name} (${account.code})` : 'Unknown account';
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

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="confirmation-overlay" style={{
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
          <div className="confirmation-popup" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div className="popup-header" style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '20px' }}>✓</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  Confirm Transaction
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Please review the transaction details before proceeding
                </p>
              </div>
            </div>

            <div className="popup-content">
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Transaction Details
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Type:</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: transactionType === 'Collection' ? '#16a34a' : '#dc2626',
                        textTransform: 'uppercase',
                        fontSize: '14px'
                      }}>
                        {transactionType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Amount:</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                        {formatCurrency(formData.amount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Description:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937', textAlign: 'right', maxWidth: '200px' }}>
                        {formData.description}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Recipient/Payer:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {formData.recipient}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Department:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {formData.department}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Category:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {formData.category}
                      </span>
                    </div>
                    {formData.reference && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Reference:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {formData.reference}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Fund Account:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {getFundAccountName(formData.fund_account_id)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Mode of Payment:</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#1f2937',
                        textTransform: 'capitalize'
                      }}>
                        {formData.mode_of_payment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {formData.fund_account_id && (
                <div style={{ 
                  backgroundColor: transactionType === 'Collection' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${transactionType === 'Collection' ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: transactionType === 'Collection' ? '#166534' : '#991b1b'
                  }}>
                    <span style={{ marginRight: '8px', fontSize: '16px' }}>
                      {transactionType === 'Collection' ? '📈' : '📉'}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {transactionType === 'Collection' 
                        ? `Amount will be added to the selected fund account`
                        : `Amount will be deducted from the selected fund account`
                      }
                    </span>
                  </div>
                </div>
              )}
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
                onClick={handleCancelConfirmation}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransaction}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {loading ? 'Creating...' : 'Confirm & Create Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Popup */}
      {showTransactionDetail && selectedTransaction && (
        <div className="transaction-detail-overlay" style={{
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
          <div className="transaction-detail-popup" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: selectedTransaction.type === 'Collection' ? '#16a34a' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '20px' }}>
                    {selectedTransaction.type === 'Collection' ? '📈' : '📉'}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    Transaction #{selectedTransaction.id}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    {selectedTransaction.type} Transaction Details
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseTransactionDetail}
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
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Transaction Information
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Transaction Type:</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: selectedTransaction.type === 'Collection' ? '#16a34a' : '#dc2626',
                        textTransform: 'uppercase',
                        fontSize: '14px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: selectedTransaction.type === 'Collection' ? '#f0fdf4' : '#fef2f2'
                      }}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Amount:</span>
                      <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '18px' }}>
                        {formatCurrency(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Description:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937', textAlign: 'right', maxWidth: '300px' }}>
                        {selectedTransaction.description}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Recipient/Payer:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {selectedTransaction.recipient}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Department:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {selectedTransaction.department}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Category:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {selectedTransaction.category}
                      </span>
                    </div>
                    {selectedTransaction.reference && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Reference Number:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {selectedTransaction.reference}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Fund Account:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {selectedTransaction.fund_account_name ? 
                          `${selectedTransaction.fund_account_name} (${selectedTransaction.fund_account_code})` : 
                          'No fund account'
                        }
                      </span>
                    </div>
                    {selectedTransaction.mode_of_payment && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Mode of Payment:</span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          textTransform: 'capitalize'
                        }}>
                          {selectedTransaction.mode_of_payment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Transaction Metadata
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Transaction ID:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        #{selectedTransaction.id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Created By:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {selectedTransaction.created_by_name || 'Unknown User'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#6b7280' }}>Created Date:</span>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {new Date(selectedTransaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    {selectedTransaction.updated_at !== selectedTransaction.created_at && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: '#6b7280' }}>Last Updated:</span>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>
                          {new Date(selectedTransaction.updated_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
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
                onClick={handleCloseTransactionDetail}
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
                    {account.name} ({account.code})
                  </option>
                ))}
              </select>
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                {transactionType === 'Collection' ? 'Amount will be added to selected fund account' : 
                 transactionType === 'Disburse' ? 'Amount will be deducted from selected fund account' : 
                 'Select a fund account to track this transaction'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="mode_of_payment">Mode of Payment *</label>
              <select
                id="mode_of_payment"
                name="mode_of_payment"
                value={formData.mode_of_payment}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select mode of payment</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
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
                  <tr 
                    key={transaction.id}
                    onClick={() => handleTransactionClick(transaction)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
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
