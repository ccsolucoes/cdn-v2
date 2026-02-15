<?php
/**
 * CC Mail API Endpoint
 * Handle AJAX form submissions
 * 
 * Usage: POST to this file with form data
 */

// Set headers for JSON response
header('Content-Type: application/json');

// CORS headers (adjust domains as needed)
$allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000', // For development
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido'
    ]);
    exit;
}

try {
    // Load CCMail
    require_once __DIR__ . '/CCMail.php';
    
    // Initialize (will use default config path)
    $mail = new CCMail();
    
    // Get POST data
    $data = [];
    
    // Check if JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
    } else {
        // Form data
        $data = $_POST;
    }
    
    // Security checks
    
    // 1. Honeypot check
    if (!$mail->checkHoneypot($data['honeypot'] ?? '')) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Spam detectado'
        ]);
        exit;
    }
    
    // 2. Rate limiting
    if (!$mail->checkRateLimit()) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Muitas tentativas. Por favor, aguarde um momento.'
        ]);
        exit;
    }
    
    // 3. reCAPTCHA validation (if configured)
    if (!empty($data['recaptcha_token'])) {
        if (!$mail->validateRecaptcha($data['recaptcha_token'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Validação reCAPTCHA falhou'
            ]);
            exit;
        }
    }
    
    // Send contact form
    $result = $mail->sendContactForm($data);
    
    // Set appropriate HTTP status code
    http_response_code($result['success'] ? 200 : 400);
    
    // Return response
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}
