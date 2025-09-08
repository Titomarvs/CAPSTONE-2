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
    // Get all fund accounts with creator information
    $query = "SELECT 
                f.id, 
                f.name, 
                f.code, 
                f.description, 
                f.initial_balance, 
                f.current_balance, 
                f.account_type, 
                f.department, 
                f.is_active, 
                f.created_at, 
                f.updated_at,
                u.name as created_by_name,
                u.role as created_by_role
              FROM fund_accounts f 
              LEFT JOIN users u ON f.created_by = u.id 
              ORDER BY f.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $fundAccounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = array(
        "message" => "Fund accounts retrieved successfully.",
        "fund_accounts" => $fundAccounts,
        "count" => count($fundAccounts)
    );
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>
