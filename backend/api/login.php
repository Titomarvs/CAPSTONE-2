<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

// Debug: Log the raw input for troubleshooting
error_log("Raw input: " . $raw_input);
error_log("Decoded data: " . print_r($data, true));

// If JSON parsing failed, try to get data from POST
if (!$data && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = (object) $_POST;
}

// Validate required fields
if (!empty($data->email) && !empty($data->password)) {
    
    $email = trim($data->email);
    $password = $data->password;
    
    try {
        // Check if email exists and get user data
        $query = "SELECT id, name, email, password, role FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                
                // Generate JWT token
                require_once __DIR__ . '/../utils/jwt.php';
                
                $payload = array(
                    "user_id" => $user['id'],
                    "email" => $user['email'],
                    "role" => $user['role'],
                    "exp" => time() + (24 * 60 * 60) // 24 hours
                );
                
                $token = JWT::encode($payload);
                
                http_response_code(200);
                echo json_encode(array(
                    "message" => "Login successful.",
                    "token" => $token,
                    "user" => array(
                        "id" => $user['id'],
                        "name" => $user['name'],
                        "email" => $user['email'],
                        "role" => $user['role']
                    )
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Email not found."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to login. Data is incomplete."));
}
?>

