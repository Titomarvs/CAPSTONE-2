import React from 'react';
import Layout from './Layout';

const Reporting = () => {
  return (
    <Layout>
      <div className="page-content">
      <div className="page-header">
        <h1>Reporting</h1>
        <p>Generate financial reports and analytics</p>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Financial Reports</h2>
          <button className="btn btn-primary">Generate Report</button>
        </div>
        
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#6b7280',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3>Reporting Module</h3>
          <p>This module will allow you to:</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
            <li>Generate budget reports</li>
            <li>Create expenditure summaries</li>
            <li>Export data to Excel/PDF</li>
            <li>Schedule automated reports</li>
            <li>Create custom analytics dashboards</li>
          </ul>
          <p><em>Feature coming soon...</em></p>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Reporting;
