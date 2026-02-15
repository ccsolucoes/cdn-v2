<?php
/**
 * CC Mail Module v1.0.0
 * Reusable email handler for CDN deployment
 * 
 * Usage: Include once, configure via config file, and use anywhere
 */

class CCMail {
    private $config;
    private $errors = [];
    
    /**
     * Initialize with config file path
     */
    public function __construct($configPath = null) {
        if ($configPath === null) {
            $configPath = __DIR__ . '/mail-config.php';
        }
        
        if (!file_exists($configPath)) {
            throw new Exception("Mail config file not found: {$configPath}");
        }
        
        $this->config = require $configPath;
        $this->validateConfig();
    }
    
    /**
     * Validate configuration
     */
    private function validateConfig() {
        $required = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'from_email', 'from_name'];
        
        foreach ($required as $key) {
            if (empty($this->config[$key])) {
                throw new Exception("Missing required config: {$key}");
            }
        }
    }
    
    /**
     * Send email
     * 
     * @param array $data Email data (to, subject, message, etc)
     * @return array Response with success status and message
     */
    public function send($data) {
        try {
            // Validate input
            if (!$this->validateInput($data)) {
                return [
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $this->errors
                ];
            }
            
            // Prepare email
            $to = $data['to'];
            $subject = $data['subject'];
            $message = $data['message'];
            $headers = $this->buildHeaders($data);
            
            // Send
            $sent = mail($to, $subject, $message, $headers);
            
            if ($sent) {
                // Log if enabled
                if ($this->config['enable_logging']) {
                    $this->log('success', $data);
                }
                
                return [
                    'success' => true,
                    'message' => 'Email enviado com sucesso'
                ];
            } else {
                throw new Exception('Falha ao enviar email');
            }
            
        } catch (Exception $e) {
            if ($this->config['enable_logging']) {
                $this->log('error', ['message' => $e->getMessage()]);
            }
            
            return [
                'success' => false,
                'message' => $this->config['debug_mode'] ? $e->getMessage() : 'Erro ao enviar email'
            ];
        }
    }
    
    /**
     * Send contact form email
     * 
     * @param array $formData Form submission data
     * @return array Response
     */
    public function sendContactForm($formData) {
        // Build email content
        $subject = $this->config['contact_subject_prefix'] . ($formData['subject'] ?? 'Novo contato');
        
        $message = $this->buildContactMessage($formData);
        
        $data = [
            'to' => $this->config['contact_recipient'] ?? $this->config['from_email'],
            'subject' => $subject,
            'message' => $message,
            'reply_to' => $formData['email'] ?? null,
            'reply_to_name' => $formData['name'] ?? null
        ];
        
        return $this->send($data);
    }
    
    /**
     * Build contact form message
     */
    private function buildContactMessage($data) {
        $template = $this->config['contact_template'] ?? 'default';
        
        if ($template === 'html') {
            return $this->buildHtmlContactMessage($data);
        }
        
        // Plain text template
        $message = "Nova mensagem de contato\n\n";
        $message .= str_repeat("=", 50) . "\n\n";
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['submit', 'honeypot'])) continue;
            
            $label = ucfirst(str_replace('_', ' ', $key));
            $message .= "{$label}: {$value}\n";
        }
        
        $message .= "\n" . str_repeat("=", 50) . "\n";
        $message .= "Enviado em: " . date('d/m/Y H:i:s') . "\n";
        $message .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
        
        return $message;
    }
    
    /**
     * Build HTML contact message
     */
    private function buildHtmlContactMessage($data) {
        $rows = '';
        foreach ($data as $key => $value) {
            if (in_array($key, ['submit', 'honeypot'])) continue;
            
            $label = ucfirst(str_replace('_', ' ', $key));
            $value = htmlspecialchars($value);
            $rows .= "<tr><td style='padding:8px;border-bottom:1px solid #eee;font-weight:600;'>{$label}</td><td style='padding:8px;border-bottom:1px solid #eee;'>{$value}</td></tr>";
        }
        
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2 style='margin:0;'>Nova Mensagem de Contato</h2>
                </div>
                <div class='content'>
                    <p>Você recebeu uma nova mensagem através do formulário de contato:</p>
                    <table>
                        {$rows}
                    </table>
                    <p style='margin-top:30px;padding-top:20px;border-top:1px solid #eee;color:#6b7280;font-size:0.9em;'>
                        Enviado em: " . date('d/m/Y H:i:s') . "<br>
                        IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "
                    </p>
                </div>
                <div class='footer'>
                    <p>Email automático - Não responda diretamente</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        return $html;
    }
    
    /**
     * Build email headers
     */
    private function buildHeaders($data) {
        $headers = [];
        
        // From
        $headers[] = "From: {$this->config['from_name']} <{$this->config['from_email']}>";
        
        // Reply-To
        if (!empty($data['reply_to'])) {
            $replyName = $data['reply_to_name'] ?? '';
            $headers[] = "Reply-To: {$replyName} <{$data['reply_to']}>";
        }
        
        // CC
        if (!empty($data['cc'])) {
            $headers[] = "Cc: {$data['cc']}";
        }
        
        // BCC
        if (!empty($data['bcc'])) {
            $headers[] = "Bcc: {$data['bcc']}";
        }
        
        // Content type
        $contentType = (!empty($data['html']) || $this->config['contact_template'] === 'html') 
            ? 'text/html' 
            : 'text/plain';
        $headers[] = "Content-Type: {$contentType}; charset=UTF-8";
        
        // Additional headers
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "X-Mailer: CCMail/1.0.0";
        
        return implode("\r\n", $headers);
    }
    
    /**
     * Validate input data
     */
    private function validateInput($data) {
        $this->errors = [];
        
        // Required fields
        if (empty($data['to'])) {
            $this->errors['to'] = 'Destinatário é obrigatório';
        } elseif (!filter_var($data['to'], FILTER_VALIDATE_EMAIL)) {
            $this->errors['to'] = 'Email inválido';
        }
        
        if (empty($data['subject'])) {
            $this->errors['subject'] = 'Assunto é obrigatório';
        }
        
        if (empty($data['message'])) {
            $this->errors['message'] = 'Mensagem é obrigatória';
        }
        
        return empty($this->errors);
    }
    
    /**
     * Log email activity
     */
    private function log($type, $data) {
        if (!$this->config['enable_logging']) return;
        
        $logDir = $this->config['log_path'] ?? __DIR__ . '/logs';
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logFile = $logDir . '/mail-' . date('Y-m-d') . '.log';
        
        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'type' => $type,
            'data' => $data
        ];
        
        file_put_contents(
            $logFile, 
            json_encode($entry) . "\n", 
            FILE_APPEND
        );
    }
    
    /**
     * Validate reCAPTCHA (if configured)
     */
    public function validateRecaptcha($token) {
        if (empty($this->config['recaptcha_secret'])) {
            return true; // reCAPTCHA not configured, skip validation
        }
        
        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = [
            'secret' => $this->config['recaptcha_secret'],
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        $response = json_decode($result);
        
        return $response->success === true;
    }
    
    /**
     * Check honeypot field (spam protection)
     */
    public function checkHoneypot($value) {
        return empty($value);
    }
    
    /**
     * Rate limiting check
     */
    public function checkRateLimit($identifier = null) {
        if (!$this->config['enable_rate_limit']) {
            return true;
        }
        
        $identifier = $identifier ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $cacheFile = sys_get_temp_dir() . '/ccmail_rate_' . md5($identifier);
        
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            $timeElapsed = time() - $data['timestamp'];
            
            if ($timeElapsed < $this->config['rate_limit_seconds']) {
                return false;
            }
        }
        
        // Update rate limit
        file_put_contents($cacheFile, json_encode([
            'timestamp' => time(),
            'identifier' => $identifier
        ]));
        
        return true;
    }
}
