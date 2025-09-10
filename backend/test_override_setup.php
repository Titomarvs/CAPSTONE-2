<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    // Test database connection
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
    
    $results = [];
    
    // Check if override_requests table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'override_requests'");
    $results['override_requests_table_exists'] = $tableCheck->rowCount() > 0;
    
    // Check if mode_of_payment column exists in transactions table
    $columnCheck = $pdo->query("SHOW COLUMNS FROM transactions LIKE 'mode_of_payment'");
    $results['mode_of_payment_column_exists'] = $columnCheck->rowCount() > 0;
    
    // Check if we can query transactions table
    $transactionCheck = $pdo->query("SELECT COUNT(*) as count FROM transactions");
    $results['transactions_table_accessible'] = $transactionCheck !== false;
    $results['transaction_count'] = $transactionCheck->fetch()['count'];
    
    // Check if we can query users table
    $userCheck = $pdo->query("SELECT COUNT(*) as count FROM users");
    $results['users_table_accessible'] = $userCheck !== false;
    $results['user_count'] = $userCheck->fetch()['count'];
    
    echo json_encode([
        'status' => 'success',
        'database_connection' => 'OK',
        'checks' => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
