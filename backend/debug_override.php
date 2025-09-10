<?php
// Simple debug script for override feature
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Override Feature Debug</h2>";

// Test 1: Check if files exist
echo "<h3>1. File Existence Check:</h3>";
$files = [
    'config/database.php',
    'config/cors.php', 
    'utils/jwt.php',
    'api/create_override_request.php'
];

foreach ($files as $file) {
    $exists = file_exists($file);
    echo "✓ $file: " . ($exists ? "EXISTS" : "MISSING") . "<br>";
}

// Test 2: Check database connection
echo "<h3>2. Database Connection Test:</h3>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $pdo = $database->getConnection();
    
    if ($pdo) {
        echo "✓ Database connection: SUCCESS<br>";
        
        // Test 3: Check tables
        echo "<h3>3. Table Existence Check:</h3>";
        
        // Check transactions table
        $stmt = $pdo->query("SHOW TABLES LIKE 'transactions'");
        echo "✓ transactions table: " . ($stmt->rowCount() > 0 ? "EXISTS" : "MISSING") . "<br>";
        
        // Check users table
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        echo "✓ users table: " . ($stmt->rowCount() > 0 ? "EXISTS" : "MISSING") . "<br>";
        
        // Check override_requests table
        $stmt = $pdo->query("SHOW TABLES LIKE 'override_requests'");
        echo "✓ override_requests table: " . ($stmt->rowCount() > 0 ? "EXISTS" : "MISSING") . "<br>";
        
        // Check mode_of_payment column
        $stmt = $pdo->query("SHOW COLUMNS FROM transactions LIKE 'mode_of_payment'");
        echo "✓ mode_of_payment column: " . ($stmt->rowCount() > 0 ? "EXISTS" : "MISSING") . "<br>";
        
    } else {
        echo "✗ Database connection: FAILED<br>";
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "<br>";
}

// Test 4: Check JWT class
echo "<h3>4. JWT Class Test:</h3>";
try {
    require_once 'utils/jwt.php';
    echo "✓ JWT class: LOADED<br>";
    
    // Test JWT encode/decode
    $testPayload = ['user_id' => 1, 'email' => 'test@test.com'];
    $token = JWT::encode($testPayload);
    $decoded = JWT::decode($token);
    
    if ($decoded && $decoded['user_id'] == 1) {
        echo "✓ JWT encode/decode: WORKING<br>";
    } else {
        echo "✗ JWT encode/decode: FAILED<br>";
    }
    
} catch (Exception $e) {
    echo "✗ JWT error: " . $e->getMessage() . "<br>";
}

// Test 5: Check CORS
echo "<h3>5. CORS Test:</h3>";
try {
    require_once 'config/cors.php';
    echo "✓ CORS config: LOADED<br>";
} catch (Exception $e) {
    echo "✗ CORS error: " . $e->getMessage() . "<br>";
}

echo "<h3>Debug Complete!</h3>";
echo "<p>If any items show as MISSING or FAILED, those need to be fixed first.</p>";
?>
