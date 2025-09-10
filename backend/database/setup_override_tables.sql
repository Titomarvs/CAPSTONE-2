-- Setup script for override feature
-- Run this script in your MySQL database

USE react_auth_app;

-- Add mode_of_payment column to transactions table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'transactions' 
     AND table_schema = DATABASE() 
     AND column_name = 'mode_of_payment') = 0,
    'ALTER TABLE transactions ADD COLUMN mode_of_payment ENUM("Cash", "Cheque", "Bank Transfer") NULL AFTER fund_account_id',
    'SELECT "Column mode_of_payment already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create override_requests table if it doesn't exist
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

-- Create indexes for override requests if they don't exist
CREATE INDEX IF NOT EXISTS idx_override_status ON override_requests(status);
CREATE INDEX IF NOT EXISTS idx_override_transaction ON override_requests(transaction_id);
CREATE INDEX IF NOT EXISTS idx_override_requested_by ON override_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_override_created_at ON override_requests(created_at);

-- Show success message
SELECT 'Override tables setup completed successfully!' as message;
