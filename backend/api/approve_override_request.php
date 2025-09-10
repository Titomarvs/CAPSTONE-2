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
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON data']);
        exit();
    }

    // Validate required fields
    if (!isset($input['override_id']) || empty($input['override_id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Override ID is required']);
        exit();
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

    $override_id = intval($input['override_id']);
    $reviewer_id = $decoded['user_id'];
    $review_notes = isset($input['review_notes']) ? $input['review_notes'] : '';

    // Get the override request with transaction details
    $stmt = $pdo->prepare("
        SELECT 
            ovr.*,
            t.type as transaction_type,
            t.amount as original_amount,
            t.description as original_description,
            t.recipient as original_recipient,
            t.department as original_department,
            t.category as original_category,
            t.reference as original_reference,
            t.mode_of_payment as original_mode_of_payment,
            t.fund_account_id as original_fund_account_id
        FROM override_requests ovr
        JOIN transactions t ON ovr.transaction_id = t.id
        WHERE ovr.id = ? AND ovr.status = 'pending'
    ");
    $stmt->execute([$override_id]);
    $override_request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$override_request) {
        http_response_code(404);
        echo json_encode(['message' => 'Override request not found or already processed']);
        exit();
    }

    // Parse the changes
    $changes = json_decode($override_request['changes'], true);
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Update the original transaction with the approved changes
        $updateFields = [];
        $updateValues = [];
        
        foreach ($changes as $field => $value) {
            if (in_array($field, ['amount', 'description', 'recipient', 'department', 'category', 'reference', 'mode_of_payment', 'fund_account_id'])) {
                $updateFields[] = "$field = ?";
                $updateValues[] = $value;
            }
        }
        
        if (!empty($updateFields)) {
            $updateQuery = "UPDATE transactions SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
            $updateValues[] = $override_request['transaction_id'];
            
            $stmt = $pdo->prepare($updateQuery);
            $stmt->execute($updateValues);
        }
        
        // Update the override request status
        $stmt = $pdo->prepare("
            UPDATE override_requests 
            SET status = 'approved', 
                reviewed_by = ?, 
                review_notes = ?, 
                reviewed_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$reviewer_id, $review_notes, $override_id]);
        
        // Commit transaction
        $pdo->commit();
        
        // Log the approval
        error_log("Override request $override_id approved by user $reviewer_id");
        
        http_response_code(200);
        echo json_encode([
            'message' => 'Override request approved successfully',
            'override_id' => $override_id,
            'transaction_id' => $override_request['transaction_id']
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $pdo->rollback();
        throw $e;
    }

} catch (PDOException $e) {
    error_log("Database error in approve_override_request.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("Error in approve_override_request.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'An error occurred while processing the request']);
}
?>
