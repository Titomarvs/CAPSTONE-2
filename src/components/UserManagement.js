import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';

const UserManagement = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Collecting Officer'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/get_users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error loading users');
      setMessageType('error');
    } finally {
      setUsersLoading(false);
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
      const response = await axios.post('http://localhost:8000/api/create_user', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('User created successfully!');
      setMessageType('success');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Collecting Officer'
      });
      setShowCreateForm(false);
      // Refresh the user list
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating user');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-content">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>

        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="content-card">
          <div className="card-header">
            <h2>System Users</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Add New User'}
            </button>
          </div>
          
          {showCreateForm && (
            <div className="form-container">
              <h3>Create New User</h3>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Collecting Officer">Collecting Officer</option>
                    <option value="Disbursing Officer">Disbursing Officer</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div className="form-actions">
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
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="user-list-container" style={{ 
            marginTop: showCreateForm ? '20px' : '0'
          }}>
            <div className="user-list-header">
              <h3>User List</h3>
              <p>View and manage existing users ({users.length} total)</p>
            </div>
            
            {usersLoading ? (
              <div className="loading-container" style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state" style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h4>No users found</h4>
                <p>Create your first user to get started.</p>
              </div>
            ) : (
              <div className="user-table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role.toLowerCase().replace(' ', '-')}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-secondary">Edit</button>
                          <button className="btn btn-sm btn-danger" style={{ marginLeft: '8px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
