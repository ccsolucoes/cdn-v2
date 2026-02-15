<?php
/**
 * CC Mail Configuration
 * Copy this file for each project and customize as needed
 */

return [
    // ====================================
    // SMTP Settings (if using SMTP)
    // ====================================
    'smtp_host' => 'smtp.example.com',
    'smtp_port' => 587,
    'smtp_user' => 'noreply@yourdomain.com',
    'smtp_pass' => 'your-password-here',
    'smtp_secure' => 'tls', // 'tls' or 'ssl'
    
    // ====================================
    // From Settings
    // ====================================
    'from_email' => 'noreply@yourdomain.com',
    'from_name' => 'Your Company Name',
    
    // ====================================
    // Contact Form Settings
    // ====================================
    'contact_recipient' => 'contato@yourdomain.com', // Where contact forms are sent
    'contact_subject_prefix' => '[Website] ', // Prefix for contact form subjects
    'contact_template' => 'html', // 'html' or 'plain'
    
    // ====================================
    // Security & Validation
    // ====================================
    'enable_rate_limit' => true,
    'rate_limit_seconds' => 60, // Minimum seconds between emails from same IP
    
    'recaptcha_secret' => '', // Google reCAPTCHA secret key (leave empty to disable)
    
    // ====================================
    // Logging
    // ====================================
    'enable_logging' => true,
    'log_path' => __DIR__ . '/logs',
    
    // ====================================
    // Debug
    // ====================================
    'debug_mode' => false, // Set to true to show detailed error messages
    
    // ====================================
    // Additional Headers (optional)
    // ====================================
    'additional_headers' => [
        // 'X-Custom-Header' => 'value'
    ],
];
