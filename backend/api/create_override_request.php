<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

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
    // Get the request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug logging
    error_log("Override request input: " . print_r($input, true));
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON data']);
        exit();
    }

    // Validate required fields
    $required_fields = ['transaction_id', 'reason', 'changes'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['message' => "Missing required field: $field"]);
            exit();
        }
    }

    // Validate JWT token
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
        echo json_encode(['message' => 'Authorization token required']);
        exit();
    }

    $decoded = JWT::decode($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid or expired token']);
        exit();
    }

    // Get database connection
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
    
    // Verify the transaction exists
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$input['transaction_id']]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$transaction) {
        http_response_code(404);
        echo json_encode(['message' => 'Transaction not found']);
        exit();
    }

    // Get user ID from JWT token
    $user_id = $decoded['user_id'];
    
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

    // Validate amount if provided
    if (isset($filtered_changes['amount']) && (!is_numeric($filtered_changes['amount']) || $filtered_changes['amount'] < 0)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid amount value']);
        exit();
    }

    // Validate fund_account_id if provided
    if (isset($filtered_changes['fund_account_id']) && !empty($filtered_changes['fund_account_id'])) {
        $stmt = $pdo->prepare("SELECT id FROM fund_accounts WHERE id = ?");
        $stmt->execute([$filtered_changes['fund_account_id']]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid fund account ID']);
            exit();
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
        echo json_encode(['message' => 'Failed to create override request']);
        exit();
    }

    $override_id = $pdo->lastInsertId();

    // Get the created override request with user details
    $stmt = $pdo->prepare("
        SELECT 
            ovr.*,
            u.name as requested_by_name,
            t.type as transaction_type,
            t.amount as original_amount
        FROM override_requests ovr
        JOIN users u ON ovr.requested_by = u.id
        JOIN transactions t ON ovr.transaction_id = t.id
        WHERE ovr.id = ?
    ");
    $stmt->execute([$override_id]);
    $override_request = $stmt->fetch(PDO::FETCH_ASSOC);

    // Log the override request creation
    error_log("Override request created: ID $override_id for transaction {$input['transaction_id']} by user {$user['name']}");

    http_response_code(201);
    echo json_encode([
        'message' => 'Override request created successfully',
        'override_request' => $override_request
    ]);

} catch (PDOException $e) {
    error_log("Database error in create_override_request.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in create_override_request.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'An error occurred while processing the request']);
}
?>
