<?php
// Direct test of override functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Direct Override Test</h2>";

// Test 1: Check if all required files exist
echo "<h3>1. File Check:</h3>";
$files = [
    'config/database.php',
    'config/cors.php',
    'utils/jwt.php'
];

foreach ($files as $file) {
    $exists = file_exists($file);
    echo ($exists ? "✓" : "✗") . " $file<br>";
}

// Test 2: Database connection
echo "<h3>2. Database Test:</h3>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    
    if ($pdo) {
        echo "✓ Database connection successful<br>";
        
        // Check tables
        $tables = ['users', 'transactions', 'override_requests'];
        foreach ($tables as $table) {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            $exists = $stmt->rowCount() > 0;
            echo ($exists ? "✓" : "✗") . " Table $table exists<br>";
        }
        
        // Check if we have test data
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM transactions");
        $count = $stmt->fetch()['count'];
        echo "✓ Transactions count: $count<br>";
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $count = $stmt->fetch()['count'];
        echo "✓ Users count: $count<br>";
        
    } else {
        echo "✗ Database connection failed<br>";
    }
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "<br>";
}

// Test 3: JWT functionality
echo "<h3>3. JWT Test:</h3>";
try {
    require_once 'utils/jwt.php';
    
    $payload = [
        'user_id' => 13,
        'email' => 'm@gmail.com',
        'role' => 'Admin',
        'exp' => time() + 3600
    ];
    
    $token = JWT::encode($payload);
    echo "✓ JWT encode successful<br>";
    
    $decoded = JWT::decode($token);
    if ($decoded && $decoded['user_id'] == 13) {
        echo "✓ JWT decode successful<br>";
    } else {
        echo "✗ JWT decode failed<br>";
    }
} catch (Exception $e) {
    echo "✗ JWT error: " . $e->getMessage() . "<br>";
}

// Test 4: Simulate override request
echo "<h3>4. Override Request Simulation:</h3>";
try {
    $testData = [
        'transaction_id' => 11,
        'reason' => 'Test override',
        'changes' => [
            'amount' => '100.00',
            'description' => 'Test description',
            'recipient' => 'Test Recipient',
            'department' => 'Finance & Budget',
            'category' => 'Education',
            'reference' => 'TEST123',
            'fund_account_id' => '4',
            'mode_of_payment' => 'Cash'
        ]
    ];
    
    // Check if transaction exists
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$testData['transaction_id']]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($transaction) {
        echo "✓ Transaction " . $testData['transaction_id'] . " exists<br>";
    } else {
        echo "✗ Transaction " . $testData['transaction_id'] . " not found<br>";
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([13]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "✓ User 13 exists: " . $user['name'] . "<br>";
    } else {
        echo "✗ User 13 not found<br>";
    }
    
    // Try to insert override request
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
    
    $changes_json = json_encode($testData['changes']);
    $result = $stmt->execute([
        $testData['transaction_id'],
        13, // user_id
        $testData['reason'],
        $changes_json
    ]);
    
    if ($result) {
        $override_id = $pdo->lastInsertId();
        echo "✓ Override request created successfully! ID: $override_id<br>";
    } else {
        echo "✗ Failed to create override request<br>";
        echo "Error: " . print_r($stmt->errorInfo(), true) . "<br>";
    }
    
} catch (Exception $e) {
    echo "✗ Override simulation error: " . $e->getMessage() . "<br>";
}

echo "<h3>Test Complete!</h3>";
echo "<p>If all tests pass, the override feature should work. If any fail, we need to fix those issues first.</p>";
?>
