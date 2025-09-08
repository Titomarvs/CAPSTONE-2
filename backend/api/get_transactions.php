<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Verify JWT token
$token = JWT::getTokenFromHeader();
if (!$token) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
    exit();
}

$decoded = JWT::decode($token);
if (!$decoded) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token."));
    exit();
}

try {
    // Get all transactions with creator and fund account information
    $query = "SELECT 
                t.id, 
                t.type, 
                t.amount, 
                t.description, 
                t.recipient, 
                t.department, 
                t.category, 
                t.reference, 
                t.fund_account_id,
                t.created_at, 
                t.updated_at,
                u.name as created_by_name,
                u.role as created_by_role,
                f.name as fund_account_name,
                f.code as fund_account_code
              FROM transactions t 
              LEFT JOIN users u ON t.created_by = u.id 
              LEFT JOIN fund_accounts f ON t.fund_account_id = f.id
              ORDER BY t.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = array(
        "message" => "Transactions retrieved successfully.",
        "transactions" => $transactions,
        "count" => count($transactions)
    );
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>
