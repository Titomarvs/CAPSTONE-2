import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';

const Override = () => {
  const [overrideRequests, setOverrideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overrideRequestsLoading, setOverrideRequestsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showOverrideDetail, setShowOverrideDetail] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch override requests on component mount
  useEffect(() => {
    fetchOverrideRequests();
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



  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/approve_override_request.php', 
        { override_id: requestId }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('Override request approved successfully');
      setMessageType('success');
      fetchOverrideRequests();
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
        { override_id: requestId }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('Override request rejected successfully');
      setMessageType('success');
      fetchOverrideRequests();
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
    : overrideRequests.filter(request => request.status === filterStatus.toLowerCase());

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


        {/* Filter Options */}
        <div className="filter-section" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="filter-buttons" style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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
            <button 
              onClick={fetchOverrideRequests}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Override Requests List */}
        <div className="content-card">
          <div className="card-header">
            <h2>Override Requests</h2>
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
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverrideRequests.map((request) => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>
                      <td>{request.transaction_type || 'Transaction Override'}</td>
                      <td>{formatCurrency(request.original_amount || 0)}</td>
                      <td>{request.original_department || 'N/A'}</td>
                      <td>{request.requested_by_name || 'Unknown'}</td>
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
                  <strong>Type:</strong> {selectedOverride.transaction_type || 'Transaction Override'}
                </div>
                <div>
                  <strong>Amount:</strong> {formatCurrency(selectedOverride.original_amount || 0)}
                </div>
                <div>
                  <strong>Department:</strong> {selectedOverride.original_department || 'N/A'}
                </div>
                <div>
                  <strong>Requested By:</strong> {selectedOverride.requested_by_name || 'Unknown'}
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
                <strong>Original Transaction Description:</strong>
                <p style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  {selectedOverride.original_description || 'N/A'}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong>Override Reason:</strong>
                <p style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  {selectedOverride.reason}
                </p>
              </div>

              {selectedOverride.changes && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Proposed Changes:</strong>
                  <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #0ea5e9' }}>
                    {Object.entries(selectedOverride.changes).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '8px' }}>
                        <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOverride.status === 'pending' && (
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
