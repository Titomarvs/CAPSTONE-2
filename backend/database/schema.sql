-- Create database
CREATE DATABASE IF NOT EXISTS react_auth_app;
USE react_auth_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Collecting Officer', 'Disbursing Officer', 'Cashier', 'Admin') DEFAULT 'Collecting Officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_email ON users(email);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Disburse', 'Collection') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    reference VARCHAR(100),
    fund_account_id INT,
    mode_of_payment ENUM('Cash', 'Cheque', 'Bank Transfer') NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_account_id) REFERENCES fund_accounts(id) ON DELETE SET NULL
);

-- Create index on transaction type for faster lookups
CREATE INDEX idx_transaction_type ON transactions(type);
CREATE INDEX idx_transaction_created_at ON transactions(created_at);

-- Create fund_accounts table
CREATE TABLE IF NOT EXISTS fund_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    account_type ENUM('Revenue', 'Expense', 'Asset', 'Liability', 'Equity') NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for fund accounts
CREATE INDEX idx_fund_account_code ON fund_accounts(code);
CREATE INDEX idx_fund_account_type ON fund_accounts(account_type);
CREATE INDEX idx_fund_account_active ON fund_accounts(is_active);

-- Create override_requests table
CREATE TABLE IF NOT EXISTS override_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    requested_by INT NOT NULL,
    reason TEXT NOT NULL,
    changes JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    review_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for override requests
CREATE INDEX idx_override_status ON override_requests(status);
CREATE INDEX idx_override_transaction ON override_requests(transaction_id);
CREATE INDEX idx_override_requested_by ON override_requests(requested_by);
CREATE INDEX idx_override_created_at ON override_requests(created_at);

-- Insert sample user (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin')
ON DUPLICATE KEY UPDATE name=name;

