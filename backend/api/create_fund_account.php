<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!empty($data->name) && !empty($data->code) && !empty($data->account_type)) {
    
    $name = trim($data->name);
    $code = trim($data->code);
    $description = isset($data->description) ? trim($data->description) : '';
    $initial_balance = isset($data->initial_balance) ? floatval($data->initial_balance) : 0.00;
    $account_type = trim($data->account_type);
    $department = isset($data->department) ? trim($data->department) : '';
    
    // Validate account type
    $validTypes = ['Revenue', 'Expense', 'Asset', 'Liability', 'Equity'];
    if (!in_array($account_type, $validTypes)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid account type. Must be one of: Revenue, Expense, Asset, Liability, Equity."));
        exit();
    }
    
    // Validate initial balance
    if ($initial_balance < 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Initial balance cannot be negative."));
        exit();
    }
    
    // Get user ID from JWT token
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
    
    $created_by = $decoded['user_id'];
    
    try {
        // Check if fund code already exists
        $checkQuery = "SELECT id FROM fund_accounts WHERE code = :code";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':code', $code);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Fund code already exists. Please use a different code."));
            exit();
        }
        
        // Create the fund account
        $query = "INSERT INTO fund_accounts (name, code, description, initial_balance, current_balance, account_type, department, created_by) 
                  VALUES (:name, :code, :description, :initial_balance, :current_balance, :account_type, :department, :created_by)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':code', $code);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':initial_balance', $initial_balance);
        $stmt->bindParam(':current_balance', $initial_balance); // Set current balance same as initial
        $stmt->bindParam(':account_type', $account_type);
        $stmt->bindParam(':department', $department);
        $stmt->bindParam(':created_by', $created_by);
        
        if ($stmt->execute()) {
            $fundAccountId = $db->lastInsertId();
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "Fund account was created successfully.",
                "fund_account" => array(
                    "id" => $fundAccountId,
                    "name" => $name,
                    "code" => $code,
                    "description" => $description,
                    "initial_balance" => $initial_balance,
                    "current_balance" => $initial_balance,
                    "account_type" => $account_type,
                    "department" => $department,
                    "is_active" => true,
                    "created_by" => $created_by
                )
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create fund account."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create fund account. Data is incomplete."));
}
?>
