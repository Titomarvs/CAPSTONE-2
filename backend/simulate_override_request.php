<?php
// Simulate the exact API call that the frontend makes
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers like the real API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';

// Simulate the request body that would come from the frontend
$simulatedInput = [
    'transaction_id' => 11,
    'reason' => 'Test override request from simulation',
    'changes' => [
        'amount' => '150.00',
        'description' => 'Updated description from simulation',
        'recipient' => 'Test Recipient',
        'department' => 'Finance & Budget',
        'category' => 'Education',
        'reference' => 'SIM123',
        'fund_account_id' => '4',
        'mode_of_payment' => 'Cash'
    ]
];

// Simulate the Authorization header
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . createTestToken();

// Simulate the input stream
$inputStream = json_encode($simulatedInput);

echo "<h2>Simulating Override Request</h2>";
echo "<h3>Input Data:</h3>";
echo "<pre>" . json_encode($simulatedInput, JSON_PRETTY_PRINT) . "</pre>";

// Now include the actual API file
try {
    // Capture output
    ob_start();
    
    // Simulate the input stream
    $GLOBALS['simulated_input'] = $inputStream;
    
    // Override file_get_contents to return our simulated input
    function file_get_contents($filename) {
        if ($filename === 'php://input') {
            return $GLOBALS['simulated_input'];
        }
        return \file_get_contents($filename);
    }
    
    // Include the API file
    include 'api/create_override_request.php';
    
    $output = ob_get_clean();
    echo "<h3>API Response:</h3>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
} catch (Exception $e) {
    echo "<h3>Error:</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "<p>File: " . $e->getFile() . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
}

function createTestToken() {
    require_once 'utils/jwt.php';
    
    $payload = [
        'user_id' => 13,
        'email' => 'm@gmail.com',
        'role' => 'Admin',
        'exp' => time() + 3600
    ];
    
    return JWT::encode($payload);
}
?>
