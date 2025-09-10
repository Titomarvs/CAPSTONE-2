<?php
// Test script to simulate override request
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Override API Test</h2>";

// Test data
$testData = [
    'transaction_id' => 11, // Using transaction ID 11 from your database
    'reason' => 'Test override request',
    'changes' => [
        'amount' => '100.00',
        'description' => 'Updated description',
        'recipient' => 'Test Recipient',
        'department' => 'Finance & Budget',
        'category' => 'Education',
        'reference' => 'TEST123',
        'fund_account_id' => '4',
        'mode_of_payment' => 'Cash'
    ]
];

echo "<h3>Test Data:</h3>";
echo "<pre>" . json_encode($testData, JSON_PRETTY_PRINT) . "</pre>";

// Test JWT token (you'll need to get a real one from login)
echo "<h3>JWT Token Test:</h3>";
try {
    require_once 'utils/jwt.php';
    
    // Create a test token
    $testPayload = [
        'user_id' => 13, // Using user ID 13 from your database
        'email' => 'm@gmail.com',
        'role' => 'Admin',
        'exp' => time() + 3600
    ];
    
    $testToken = JWT::encode($testPayload);
    echo "✓ Test token created: " . substr($testToken, 0, 50) . "...<br>";
    
    // Test decode
    $decoded = JWT::decode($testToken);
    if ($decoded) {
        echo "✓ Token decode successful<br>";
        echo "User ID: " . $decoded['user_id'] . "<br>";
    } else {
        echo "✗ Token decode failed<br>";
    }
    
} catch (Exception $e) {
    echo "✗ JWT Error: " . $e->getMessage() . "<br>";
}

// Test database connection
echo "<h3>Database Test:</h3>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    
    if ($pdo) {
        echo "✓ Database connection successful<br>";
        
        // Test transaction exists
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$testData['transaction_id']]);
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($transaction) {
            echo "✓ Transaction " . $testData['transaction_id'] . " exists<br>";
        } else {
            echo "✗ Transaction " . $testData['transaction_id'] . " not found<br>";
        }
        
        // Test user exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([13]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "✓ User 13 exists: " . $user['name'] . "<br>";
        } else {
            echo "✗ User 13 not found<br>";
        }
        
    } else {
        echo "✗ Database connection failed<br>";
    }
    
} catch (Exception $e) {
    echo "✗ Database Error: " . $e->getMessage() . "<br>";
}

echo "<h3>API Test Complete!</h3>";
echo "<p>If all tests pass, the override API should work. Try submitting an override request now.</p>";
?>
