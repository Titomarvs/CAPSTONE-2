<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    
    $name = trim($data->name);
    $email = trim($data->email);
    $password = $data->password;
    $role = isset($data->role) ? $data->role : 'Admin';
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid email format."));
        exit();
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(array("message" => "Password must be at least 6 characters long."));
        exit();
    }
    
    // Validate role
    $validRoles = ['Collecting Officer', 'Disbursing Officer', 'Cashier', 'Admin'];
    if (!in_array($role, $validRoles)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid role specified."));
        exit();
    }
    
    try {
        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Email already exists."));
            exit();
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Create the user
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':role', $role);
        
        if ($stmt->execute()) {
            $userId = $db->lastInsertId();
            
            // Generate JWT token
            require_once __DIR__ . '/../utils/jwt.php';
            
            $payload = array(
                "user_id" => $userId,
                "email" => $email,
                "role" => $role,
                "exp" => time() + (24 * 60 * 60) // 24 hours
            );
            
            $token = JWT::encode($payload);
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "User was created successfully.",
                "token" => $token,
                "user" => array(
                    "id" => $userId,
                    "name" => $name,
                    "email" => $email,
                    "role" => $role
                )
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
}
?>

