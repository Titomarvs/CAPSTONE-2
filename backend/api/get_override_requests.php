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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

try {
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
    
    // Get query parameters
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $transaction_id = isset($_GET['transaction_id']) ? intval($_GET['transaction_id']) : null;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    
    // Build the query
    $query = "
        SELECT 
            ovr.*,
            u.name as requested_by_name,
            u.email as requested_by_email,
            r.name as reviewed_by_name,
            t.type as transaction_type,
            t.amount as original_amount,
            t.description as original_description,
            t.recipient as original_recipient,
            t.department as original_department,
            t.category as original_category,
            t.reference as original_reference,
            t.mode_of_payment as original_mode_of_payment,
            f.name as fund_account_name,
            f.code as fund_account_code
        FROM override_requests ovr
        JOIN users u ON ovr.requested_by = u.id
        LEFT JOIN users r ON ovr.reviewed_by = r.id
        JOIN transactions t ON ovr.transaction_id = t.id
        LEFT JOIN fund_accounts f ON t.fund_account_id = f.id
        WHERE 1=1
    ";
    
    $params = [];
    
    // Add filters
    if ($status) {
        $query .= " AND ovr.status = ?";
        $params[] = $status;
    }
    
    if ($transaction_id) {
        $query .= " AND ovr.transaction_id = ?";
        $params[] = $transaction_id;
    }
    
    if ($user_id) {
        $query .= " AND ovr.requested_by = ?";
        $params[] = $user_id;
    }
    
    $query .= " ORDER BY ovr.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $override_requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse JSON changes for each request
    foreach ($override_requests as &$request) {
        $request['changes'] = json_decode($request['changes'], true);
    }
    
    http_response_code(200);
    echo json_encode([
        'message' => 'Override requests retrieved successfully',
        'override_requests' => $override_requests,
        'count' => count($override_requests)
    ]);

} catch (PDOException $e) {
    error_log("Database error in get_override_requests.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in get_override_requests.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'An error occurred while processing the request']);
}
?>
