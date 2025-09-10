<?php
// Simplified override request API for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

try {
    echo json_encode(['debug' => 'Starting override request processing...']);
    
    // Get the request body
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON data', 'raw_input' => $raw_input]);
        exit();
    }
    
    // Validate required fields
    $required_fields = ['transaction_id', 'reason', 'changes'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['message' => "Missing required field: $field", 'received_data' => $input]);
            exit();
        }
    }
    
    // Get JWT token
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'Authorization token required', 'headers' => $headers]);
        exit();
    }
    
    // Load JWT class
    require_once '../utils/jwt.php';
    $decoded = JWT::decode($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid or expired token']);
        exit();
    }
    
    // Get database connection
    require_once '../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['message' => 'Database connection failed']);
        exit();
    }
    
    // Check if override_requests table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'override_requests'");
    if ($tableCheck->rowCount() == 0) {
        http_response_code(500);
        echo json_encode(['message' => 'Override requests table does not exist. Please run the database migration.']);
        exit();
    }
    
    // Get user ID from JWT token
    $user_id = $decoded['user_id'];
    
    // Verify the transaction exists
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$input['transaction_id']]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$transaction) {
        http_response_code(404);
        echo json_encode(['message' => 'Transaction not found']);
        exit();
    }
    
    // Verify the requesting user exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User not found']);
        exit();
    }
    
    // Validate changes data
    $changes = $input['changes'];
    $valid_fields = [
        'amount', 'description', 'recipient', 'department', 
        'category', 'reference', 'fund_account_id', 'mode_of_payment'
    ];
    
    $filtered_changes = [];
    foreach ($valid_fields as $field) {
        if (isset($changes[$field])) {
            $filtered_changes[$field] = $changes[$field];
        }
    }
    
    // Insert override request
    $stmt = $pdo->prepare("
        INSERT INTO override_requests (
            transaction_id, 
            requested_by, 
            reason, 
            changes, 
            status, 
            created_at
        ) VALUES (?, ?, ?, ?, 'pending', NOW())
    ");
    
    $changes_json = json_encode($filtered_changes);
    $result = $stmt->execute([
        $input['transaction_id'],
        $user_id,
        $input['reason'],
        $changes_json
    ]);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create override request', 'error_info' => $stmt->errorInfo()]);
        exit();
    }
    
    $override_id = $pdo->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Override request created successfully',
        'override_id' => $override_id,
        'transaction_id' => $input['transaction_id'],
        'user_id' => $user_id
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'An error occurred',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
