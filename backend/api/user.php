<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get JWT token from header
$token = JWT::getTokenFromHeader();

if (!$token) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
    exit();
}

// Decode JWT token
$payload = JWT::decode($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token."));
    exit();
}

try {
    // Get user data from database
    $query = "SELECT id, name, email, role, created_at FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $payload['user_id']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(array(
            "user" => array(
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role'],
                "created_at" => $user['created_at']
            )
        ));
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found."));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>

