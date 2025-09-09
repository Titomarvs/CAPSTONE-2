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
if (!empty($data->type) && !empty($data->amount) && !empty($data->description) && 
    !empty($data->recipient) && !empty($data->department) && !empty($data->category)) {
    
    $type = trim($data->type);
    $amount = number_format((float)$data->amount, 2, '.', '');
    $description = trim($data->description);
    $recipient = trim($data->recipient);
    $department = trim($data->department);
    $category = trim($data->category);
    $reference = isset($data->reference) ? trim($data->reference) : '';
    $fund_account_id = isset($data->fund_account_id) ? intval($data->fund_account_id) : null;
    
    // Validate transaction type
    $validTypes = ['Disburse', 'Collection'];
    if (!in_array($type, $validTypes)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid transaction type. Must be 'Disburse' or 'Collection'."));
        exit();
    }
    
    // Validate amount
    if ((float)$amount <= 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Amount must be greater than 0."));
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
        // Validate fund account if provided
        if ($fund_account_id) {
            $fundQuery = "SELECT id, current_balance FROM fund_accounts WHERE id = :fund_id AND is_active = 1";
            $fundStmt = $db->prepare($fundQuery);
            $fundStmt->bindParam(':fund_id', $fund_account_id);
            $fundStmt->execute();
            
            if ($fundStmt->rowCount() == 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Invalid or inactive fund account selected."));
                exit();
            }
            
            $fundAccount = $fundStmt->fetch(PDO::FETCH_ASSOC);
            $currentBalance = $fundAccount['current_balance'];
            
            // Check if disbursement would result in negative balance
            if ($type === 'Disburse' && $currentBalance < $amount) {
                http_response_code(400);
                echo json_encode(array("message" => "Insufficient funds. Available balance: ₱" . number_format($currentBalance, 2)));
                exit();
            }
        }
        
        // Create the transaction
        $query = "INSERT INTO transactions (type, amount, description, recipient, department, category, reference, fund_account_id, created_by) 
                  VALUES (:type, :amount, :description, :recipient, :department, :category, :reference, :fund_account_id, :created_by)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':recipient', $recipient);
        $stmt->bindParam(':department', $department);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':reference', $reference);
        $stmt->bindParam(':fund_account_id', $fund_account_id);
        $stmt->bindParam(':created_by', $created_by);
        
        if ($stmt->execute()) {
            $transactionId = $db->lastInsertId();
            
            // Update fund account balance if fund account is specified
            if ($fund_account_id) {
                $balanceChange = ($type === 'Collection') ? (float)$amount : -(float)$amount;
                $updateBalanceQuery = "UPDATE fund_accounts SET current_balance = current_balance + :balance_change WHERE id = :fund_id";
                $updateStmt = $db->prepare($updateBalanceQuery);
                $updateStmt->bindParam(':balance_change', $balanceChange);
                $updateStmt->bindParam(':fund_id', $fund_account_id);
                $updateStmt->execute();
            }
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "Transaction was created successfully.",
                "transaction" => array(
                    "id" => $transactionId,
                    "type" => $type,
                    "amount" => $amount,
                    "description" => $description,
                    "recipient" => $recipient,
                    "department" => $department,
                    "category" => $category,
                    "reference" => $reference,
                    "fund_account_id" => $fund_account_id,
                    "created_by" => $created_by
                )
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create transaction."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create transaction. Data is incomplete."));
}
?>
