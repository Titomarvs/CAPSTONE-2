<?php
// Debug version of override request API
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

$debug_info = [];

try {
    $debug_info['step'] = 'Starting request processing';
    
    // Get the request body
    $raw_input = file_get_contents('php://input');
    $debug_info['raw_input'] = $raw_input;
    
    $input = json_decode($raw_input, true);
    $debug_info['decoded_input'] = $input;
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON data', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'Input validation passed';
    
    // Validate required fields
    $required_fields = ['transaction_id', 'reason', 'changes'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['message' => "Missing required field: $field", 'debug' => $debug_info]);
            exit();
        }
    }
    
    $debug_info['step'] = 'Required fields validation passed';
    
    // Get JWT token
    $headers = getallheaders();
    $debug_info['headers'] = $headers;
    
    $token = null;
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
        }
    }
    
    $debug_info['token_found'] = !empty($token);
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'Authorization token required', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'Token found, validating JWT';
    
    // Load JWT class
    require_once __DIR__ . '/../utils/jwt.php';
    $decoded = JWT::decode($token);
    $debug_info['jwt_decoded'] = $decoded;
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid or expired token', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'JWT validation passed';
    
    // Get database connection
    require_once __DIR__ . '/../config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    $debug_info['database_connected'] = !empty($pdo);
    
    if (!$pdo) {
        http_response_code(500);
        echo json_encode(['message' => 'Database connection failed', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'Database connection successful';
    
    // Check if override_requests table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'override_requests'");
    $debug_info['override_table_exists'] = $tableCheck->rowCount() > 0;
    
    if ($tableCheck->rowCount() == 0) {
        http_response_code(500);
        echo json_encode(['message' => 'Override requests table does not exist', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'Table check passed';
    
    // Get user ID from JWT token
    $user_id = $decoded['user_id'];
    $debug_info['user_id'] = $user_id;
    
    // Verify the transaction exists
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$input['transaction_id']]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    $debug_info['transaction_found'] = !empty($transaction);
    
    if (!$transaction) {
        http_response_code(404);
        echo json_encode(['message' => 'Transaction not found', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'Transaction verification passed';
    
    // Verify the requesting user exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $debug_info['user_found'] = !empty($user);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User not found', 'debug' => $debug_info]);
        exit();
    }
    
    $debug_info['step'] = 'User verification passed';
    
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
    
    $debug_info['filtered_changes'] = $filtered_changes;
    
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
    $debug_info['changes_json'] = $changes_json;
    
    $result = $stmt->execute([
        $input['transaction_id'],
        $user_id,
        $input['reason'],
        $changes_json
    ]);
    
    $debug_info['insert_result'] = $result;
    $debug_info['insert_error'] = $stmt->errorInfo();
    
    if (!$result) {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create override request', 'debug' => $debug_info]);
        exit();
    }
    
    $override_id = $pdo->lastInsertId();
    $debug_info['override_id'] = $override_id;
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Override request created successfully',
        'override_id' => $override_id,
        'debug' => $debug_info
    ]);
    
} catch (Exception $e) {
    $debug_info['error'] = $e->getMessage();
    $debug_info['file'] = $e->getFile();
    $debug_info['line'] = $e->getLine();
    
    http_response_code(500);
    echo json_encode([
        'message' => 'An error occurred',
        'debug' => $debug_info
    ]);
}
?>
