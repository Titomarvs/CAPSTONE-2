<?php
// Include CORS headers first
require_once 'config/cors.php';

// Simple API router for development
$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /backend from path if it exists (for when running from project root)
$path = str_replace('/backend', '', $path);

// Handle root path
if ($path === '/' || $path === '') {
    echo json_encode(array("message" => "React Auth API", "version" => "1.0.0"));
    exit();
}

switch ($path) {
    case '/api/register':
        require_once 'api/register.php';
        break;
    case '/api/login':
        require_once 'api/login.php';
        break;
    case '/api/user':
        require_once 'api/user.php';
        break;
    case '/api/create_user':
        require_once 'api/create_user.php';
        break;
    case '/api/get_users':
        require_once 'api/get_users.php';
        break;
    case '/api/create_transaction':
        require_once 'api/create_transaction.php';
        break;
    case '/api/get_transactions':
        require_once 'api/get_transactions.php';
        break;
    case '/api/create_fund_account':
        require_once 'api/create_fund_account.php';
        break;
    case '/api/get_fund_accounts':
        require_once 'api/get_fund_accounts.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint not found.", "path" => $path));
        break;
}
?>

