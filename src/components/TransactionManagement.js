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
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

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
      
      // Show receipt for collection transactions
      if (transactionType === 'Collection') {
        const receiptInfo = {
          transactionId: response.data.transaction.id,
          type: transactionType,
          amount: formData.amount,
          description: formData.description,
          recipient: formData.recipient,
          department: formData.department,
          category: formData.category,
          reference: formData.reference,
          modeOfPayment: formData.mode_of_payment,
          date: new Date().toLocaleString(),
          createdBy: user?.name || 'System User'
        };
        setReceiptData(receiptInfo);
        setShowReceipt(true);
      }
      
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

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  const handlePrintReceipt = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const receiptContent = document.getElementById('receipt-content');
    
    if (receiptContent && printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Collection Receipt</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: black;
              background: white;
              padding: 20px;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .receipt-subtitle {
              font-size: 18px;
              margin-bottom: 5px;
              color: #333;
            }
            .receipt-date {
              font-size: 12px;
              color: #666;
            }
            .receipt-content {
              display: flex;
              gap: 40px;
              margin-bottom: 30px;
            }
            .receipt-column {
              flex: 1;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: 500;
            }
            .info-value {
              font-weight: bold;
            }
            .info-block {
              margin-bottom: 8px;
            }
            .info-block-label {
              font-weight: bold;
            }
            .info-block-value {
              margin-left: 10px;
              margin-top: 2px;
            }
            .highlight-box {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #e9ecef;
            }
            .description-section {
              margin-bottom: 20px;
            }
            .description-content {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #e9ecef;
              font-size: 14px;
              line-height: 1.4;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
            }
            .footer-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #16a34a;
            }
            .footer-subtitle {
              font-size: 12px;
              color: #666;
            }
            .footer-note {
              font-size: 10px;
              color: #999;
              margin-top: 10px;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                overflow: hidden !important;
              }
              #receipt-content {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 794px !important;
                height: 192px !important;
                margin: 0 !important;
                padding: 4px !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                font-size: 7px !important;
                line-height: 1.0 !important;
                box-sizing: border-box !important;
              }
              #receipt-content * {
                max-width: 100% !important;
                word-wrap: break-word !important;
                overflow: hidden !important;
              }
              @page {
                size: A4 portrait;
                margin: 0.5in;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      // Fallback to regular print
      window.print();
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

  const getFundAccountName = (fundAccountId) => {
    if (!fundAccountId) return 'No fund account selected';
    const account = fundAccounts.find(acc => acc.id == fundAccountId);
    return account ? `${account.name} (${account.code})` : 'Unknown account';
  };


  return (
    <Layout>
      <style jsx>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .receipt-overlay {
            position: static !important;
            background: none !important;
            display: block !important;
            visibility: visible !important;
          }
          
          .receipt-popup {
            position: static !important;
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            background: white !important;
          }
          
          .receipt-header,
          .receipt-actions {
            display: none !important;
          }
          
          #receipt-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            display: block !important;
            visibility: visible !important;
            width: 794px !important;
            height: 192px !important;
            margin: 0 !important;
            padding: 4px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            font-size: 7px !important;
            line-height: 1.0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            color: black !important;
          }
          
          #receipt-content * {
            visibility: visible !important;
            color: black !important;
            background: transparent !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0.5in;
            padding: 0;
          }
        }
      `}</style>
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="confirmation-popup" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
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
          zIndex: 1500,
          padding: '20px'
        }}>
          <div className="transaction-detail-popup" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
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

      {/* Receipt Popup */}
      {showReceipt && receiptData && (
        <div className="receipt-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="receipt-popup" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <div className="receipt-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                Collection Receipt
              </h3>
              <button
                onClick={handleCloseReceipt}
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

            {/* Receipt Content - Ultra Compact for 8.27" x 2" thermal receipt */}
            <div 
              id="receipt-content"
              style={{
                width: '794px', // 8.27 inches at 96 DPI
                height: '192px', // 2 inches at 96 DPI
                backgroundColor: 'white',
                padding: '4px',
                fontFamily: 'monospace',
                fontSize: '7px',
                lineHeight: '1.0',
                border: '1px solid #e5e7eb',
                margin: '0 auto',
                textAlign: 'left',
                overflow: 'hidden'
              }}
            >
              {/* Ultra Compact Header */}
              <div style={{ textAlign: 'center', marginBottom: '3px', borderBottom: '1px solid #000', paddingBottom: '1px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '1px' }}>
                  GOVERNMENT OFFICE
                </div>
                <div style={{ fontSize: '8px', marginBottom: '1px' }}>
                  COLLECTION RECEIPT
                </div>
                <div style={{ fontSize: '7px', color: '#666' }}>
                  {receiptData.date}
                </div>
              </div>

              {/* Ultra Compact Main Content */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                {/* Left Section */}
                <div style={{ flex: '1' }}>
                  <div style={{ marginBottom: '3px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '2px', color: '#333' }}>
                      TRANSACTION
                    </div>
                    <div style={{ display: 'grid', gap: '1px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                        <span>Receipt #:</span>
                        <span style={{ fontWeight: 'bold' }}>#{receiptData.transactionId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                        <span>Type:</span>
                        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{receiptData.type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                        <span>Amount:</span>
                        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(receiptData.amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                        <span>Payment:</span>
                        <span>{receiptData.modeOfPayment}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section */}
                <div style={{ flex: '1.5' }}>
                  <div style={{ marginBottom: '3px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '2px', color: '#333' }}>
                      PAYER INFO
                    </div>
                    <div style={{ display: 'grid', gap: '1px' }}>
                      <div style={{ fontSize: '7px' }}>
                        <span style={{ fontWeight: 'bold' }}>Name:</span>
                        <div style={{ marginLeft: '3px', marginTop: '0px' }}>{receiptData.recipient}</div>
                      </div>
                      <div style={{ fontSize: '7px' }}>
                        <span style={{ fontWeight: 'bold' }}>Dept:</span>
                        <div style={{ marginLeft: '3px', marginTop: '0px' }}>{receiptData.department}</div>
                      </div>
                      <div style={{ fontSize: '7px' }}>
                        <span style={{ fontWeight: 'bold' }}>Category:</span>
                        <div style={{ marginLeft: '3px', marginTop: '0px' }}>{receiptData.category}</div>
                      </div>
                      {receiptData.reference && (
                        <div style={{ fontSize: '7px' }}>
                          <span style={{ fontWeight: 'bold' }}>Ref:</span>
                          <div style={{ marginLeft: '3px', marginTop: '0px' }}>{receiptData.reference}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div style={{ flex: '1' }}>
                  <div style={{ marginBottom: '3px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '2px', color: '#333' }}>
                      PROCESSED BY
                    </div>
                    <div style={{ fontSize: '7px' }}>
                      {receiptData.createdBy}
                    </div>
                    <div style={{ fontSize: '6px', color: '#666', marginTop: '1px' }}>
                      {receiptData.date}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ultra Compact Description */}
              <div style={{ marginBottom: '2px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>DESCRIPTION</div>
                <div style={{ fontSize: '6px', lineHeight: '1.1', backgroundColor: '#f5f5f5', padding: '1px', borderRadius: '1px' }}>
                  {receiptData.description}
                </div>
              </div>

              {/* Ultra Compact Footer */}
              <div style={{ 
                textAlign: 'center', 
                borderTop: '1px solid #000',
                paddingTop: '1px',
                fontSize: '6px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0px' }}>
                  Thank you for your payment!
                </div>
                <div style={{ color: '#666' }}>
                  Keep this receipt for your records
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="receipt-actions" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={handlePrintReceipt}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={handleCloseReceipt}
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
