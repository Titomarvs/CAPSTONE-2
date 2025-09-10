-- Add mode_of_payment column to transactions table if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS mode_of_payment ENUM('Cash', 'Cheque', 'Bank Transfer') NULL 
AFTER fund_account_id;

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
