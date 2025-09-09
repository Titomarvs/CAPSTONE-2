import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';

const Override = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    request_type: '',
    amount: '',
    description: '',
    justification: '',
    department: '',
    priority: 'Medium',
    fund_account_id: ''
  });
  const [overrideRequests, setOverrideRequests] = useState([]);
  const [fundAccounts, setFundAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overrideRequestsLoading, setOverrideRequestsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showOverrideDetail, setShowOverrideDetail] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch override requests and fund accounts on component mount
  useEffect(() => {
    fetchOverrideRequests();
    fetchFundAccounts();
  }, []);

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
      setMessage('Error loading override requests');
      setMessageType('error');
    } finally {
      setOverrideRequestsLoading(false);
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
      setFundAccounts(response.data.fund_accounts || []);
    } catch (error) {
      console.error('Error fetching fund accounts:', error);
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
      const response = await axios.post('/api/create_override_request.php', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMessage('Override request created successfully');
        setMessageType('success');
        setShowCreateForm(false);
        setFormData({
          request_type: '',
          amount: '',
          description: '',
          justification: '',
          department: '',
          priority: 'Medium',
          fund_account_id: ''
        });
        fetchOverrideRequests();
      } else {
        setMessage(response.data.message || 'Error creating override request');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating override request:', error);
      setMessage('Error creating override request');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/approve_override_request.php', 
        { request_id: requestId }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage('Override request approved successfully');
        setMessageType('success');
        fetchOverrideRequests();
      } else {
        setMessage(response.data.message || 'Error approving request');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error approving override request:', error);
      setMessage('Error approving override request');
      setMessageType('error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/reject_override_request.php', 
        { request_id: requestId }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage('Override request rejected successfully');
        setMessageType('success');
        fetchOverrideRequests();
      } else {
        setMessage(response.data.message || 'Error rejecting request');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error rejecting override request:', error);
      setMessage('Error rejecting override request');
      setMessageType('error');
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Pending': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Approved': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Rejected': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'Under Review': { backgroundColor: '#dbeafe', color: '#1e40af' }
    };
    
    return (
      <span 
        style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          ...statusStyles[status] || { backgroundColor: '#f3f4f6', color: '#374151' }
        }}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      'High': { backgroundColor: '#fee2e2', color: '#991b1b' },
      'Medium': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Low': { backgroundColor: '#d1fae5', color: '#065f46' }
    };
    
    return (
      <span 
        style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          ...priorityStyles[priority] || { backgroundColor: '#f3f4f6', color: '#374151' }
        }}
      >
        {priority}
      </span>
    );
  };

  // Filter override requests based on status
  const filteredOverrideRequests = filterStatus === 'All' 
    ? overrideRequests 
    : overrideRequests.filter(request => request.status === filterStatus);

  return (
    <Layout>
      <div className="page-content">
        <div className="page-header">
          <h1>Override Management</h1>
          <p>Manage override requests and approvals</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${messageType}`} style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: messageType === 'success' ? '#d1fae5' : '#fee2e2',
            color: messageType === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${messageType === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons" style={{ marginBottom: '20px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Override Request
          </button>
        </div>

        {/* Filter Options */}
        <div className="filter-section" style={{ marginBottom: '20px' }}>
          <div className="filter-buttons" style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Pending', 'Approved', 'Rejected', 'Under Review'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: filterStatus === status ? '#3b82f6' : 'white',
                  color: filterStatus === status ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: filterStatus === status ? '600' : '400'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Override Requests List */}
        <div className="content-card">
          <div className="card-header">
            <h2>Override Requests</h2>
            <button 
              className="btn btn-secondary"
              onClick={fetchOverrideRequests}
            >
              Refresh
            </button>
          </div>
          
          {overrideRequestsLoading ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              <p>Loading override requests...</p>
            </div>
          ) : filteredOverrideRequests.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#6b7280',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3>No override requests found</h3>
              <p>Create your first override request to get started.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverrideRequests.map((request) => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>
                      <td>{request.request_type}</td>
                      <td>{formatCurrency(request.amount)}</td>
                      <td>{request.department}</td>
                      <td>{getPriorityBadge(request.priority)}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>{new Date(request.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedOverride(request);
                              setShowOverrideDetail(true);
                            }}
                          >
                            View
                          </button>
                          {request.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Override Request Modal */}
        {showCreateForm && (
          <div className="modal-overlay" style={{
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
            <div className="modal-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="modal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3>Create Override Request</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div className="form-group">
                    <label>Request Type</label>
                    <select
                      name="request_type"
                      value={formData.request_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Budget Override">Budget Override</option>
                      <option value="Approval Override">Approval Override</option>
                      <option value="Limit Override">Limit Override</option>
                      <option value="Policy Override">Policy Override</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fund Account</label>
                    <select
                      name="fund_account_id"
                      value={formData.fund_account_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Fund Account</option>
                      {fundAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - {account.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Justification</label>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Provide detailed justification for this override request..."
                  />
                </div>

                <div className="form-actions" style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '20px'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Override Request Detail Modal */}
        {showOverrideDetail && selectedOverride && (
          <div className="modal-overlay" style={{
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
            <div className="modal-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="modal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3>Override Request Details</h3>
                <button
                  onClick={() => setShowOverrideDetail(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <div className="detail-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <strong>Request ID:</strong> #{selectedOverride.id}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(selectedOverride.status)}
                </div>
                <div>
                  <strong>Type:</strong> {selectedOverride.request_type}
                </div>
                <div>
                  <strong>Amount:</strong> {formatCurrency(selectedOverride.amount)}
                </div>
                <div>
                  <strong>Department:</strong> {selectedOverride.department}
                </div>
                <div>
                  <strong>Priority:</strong> {getPriorityBadge(selectedOverride.priority)}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedOverride.created_at).toLocaleString()}
                </div>
                {selectedOverride.updated_at && (
                  <div>
                    <strong>Last Updated:</strong> {new Date(selectedOverride.updated_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong>Description:</strong>
                <p style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  {selectedOverride.description}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong>Justification:</strong>
                <p style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  {selectedOverride.justification}
                </p>
              </div>

              {selectedOverride.status === 'Pending' && (
                <div className="modal-actions" style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveRequest(selectedOverride.id);
                      setShowOverrideDetail(false);
                    }}
                  >
                    Approve Request
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleRejectRequest(selectedOverride.id);
                      setShowOverrideDetail(false);
                    }}
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Override;
