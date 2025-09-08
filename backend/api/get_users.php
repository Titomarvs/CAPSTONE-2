<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Get all users (excluding password for security)
    $query = "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = array(
        "message" => "Users retrieved successfully.",
        "users" => $users,
        "count" => count($users)
    );
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>

