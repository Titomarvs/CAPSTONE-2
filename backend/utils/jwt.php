<?php
class JWT {
    private static $secret_key = "your-secret-key-change-this-in-production";
    private static $algorithm = 'HS256';

    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload = json_encode($payload);
        
        $base64_header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64_payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, self::$secret_key, true);
        $base64_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64_header . "." . $base64_payload . "." . $base64_signature;
    }

    public static function decode($jwt) {
        $token_parts = explode('.', $jwt);
        
        if (count($token_parts) != 3) {
            return false;
        }
        
        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $token_parts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $token_parts[1]));
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $token_parts[2]));
        
        $expected_signature = hash_hmac('sha256', $token_parts[0] . "." . $token_parts[1], self::$secret_key, true);
        
        if (!hash_equals($signature, $expected_signature)) {
            return false;
        }
        
        $payload_data = json_decode($payload, true);
        
        // Check if token is expired
        if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
            return false;
        }
        
        return $payload_data;
    }

    public static function getTokenFromHeader() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
}
?>











