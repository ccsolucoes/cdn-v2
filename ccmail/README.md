# CC Mail Module v1.0.0

Reusable PHP email module for CDN deployment. Configure once, use everywhere.

## 📦 Features

- ✅ Simple configuration via PHP config file
- ✅ Built-in spam protection (honeypot, rate limiting)
- ✅ reCAPTCHA v3 support
- ✅ Contact form templates (HTML & plain text)
- ✅ Activity logging
- ✅ AJAX/JSON API endpoint
- ✅ JavaScript client library
- ✅ No external dependencies (uses PHP's mail())
- ✅ CORS-ready for cross-domain usage

## 🚀 Quick Start

### 1. Upload to CDN

Upload all files to your CDN:
```
/ccmail/
  ├── CCMail.php          (Main class)
  ├── mail-config.php     (Configuration)
  ├── mail-api.php        (AJAX endpoint)
  ├── ccmail-client.js    (JavaScript client)
  └── logs/               (Auto-created)
```

### 2. Configure

Edit `mail-config.php`:

```php
return [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_user' => 'noreply@yourdomain.com',
    'smtp_pass' => 'your-app-password',
    
    'from_email' => 'noreply@yourdomain.com',
    'from_name' => 'Impulso Digital',
    
    'contact_recipient' => 'contato@impulsodigital.com.br',
    'contact_subject_prefix' => '[Site] ',
    'contact_template' => 'html',
    
    'enable_rate_limit' => true,
    'rate_limit_seconds' => 60,
];
```

### 3. Add to Your Website

**Option A: JavaScript Client (Recommended)**

Add to your HTML:
```html
<!-- Add honeypot field (hidden) -->
<input type="text" name="honeypot" style="display:none" tabindex="-1" autocomplete="off">

<!-- Add data-ccmail attribute to form -->
<form id="contactForm" data-ccmail>
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Enviar</button>
  
  <div class="success-message" style="display:none;"></div>
  <div class="error-message" style="display:none;"></div>
</form>

<!-- Include client library -->
<script src="https://cdn.yourdomain.com/ccmail/ccmail-client.js"></script>
<script>
  // Configure
  CCMailClient.config.apiUrl = 'https://cdn.yourdomain.com/ccmail/mail-api.php';
</script>
```

**Option B: Custom JavaScript**

```javascript
const form = document.getElementById('contactForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('https://cdn.yourdomain.com/ccmail/mail-api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Mensagem enviada!');
      form.reset();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Erro ao enviar');
  }
});
```

**Option C: Direct PHP Usage**

```php
require_once 'https://cdn.yourdomain.com/ccmail/CCMail.php';

$mail = new CCMail();

// Send contact form
$result = $mail->sendContactForm($_POST);

if ($result['success']) {
    echo "Email sent!";
} else {
    echo "Error: " . $result['message'];
}
```

## 🔧 Advanced Configuration

### reCAPTCHA v3 Setup

1. Get keys from https://www.google.com/recaptcha/admin

2. Add to config:
```php
'recaptcha_secret' => 'your-secret-key',
```

3. Add to HTML:
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

4. Configure client:
```javascript
CCMailClient.config.recaptchaSiteKey = 'YOUR_SITE_KEY';
```

### Custom Email Templates

Create custom template in config:
```php
'contact_template' => 'html', // or 'plain'
```

### CORS Configuration

Edit `mail-api.php`:
```php
$allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    // Add more domains
];
```

### Rate Limiting

Prevent spam by limiting submissions:
```php
'enable_rate_limit' => true,
'rate_limit_seconds' => 60, // Minimum time between emails
```

### Logging

Enable activity logging:
```php
'enable_logging' => true,
'log_path' => __DIR__ . '/logs',
```

Logs are created daily: `logs/mail-2026-02-14.log`

## 📋 API Reference

### CCMail Class

```php
// Initialize
$mail = new CCMail($configPath);

// Send email
$result = $mail->send([
    'to' => 'recipient@example.com',
    'subject' => 'Subject',
    'message' => 'Message body',
    'reply_to' => 'user@example.com',
    'html' => true
]);

// Send contact form
$result = $mail->sendContactForm($_POST);

// Validate reCAPTCHA
$valid = $mail->validateRecaptcha($token);

// Check honeypot
$valid = $mail->checkHoneypot($value);

// Check rate limit
$allowed = $mail->checkRateLimit($identifier);
```

### JavaScript Client

```javascript
// Submit form
await CCMailClient.submitForm(form, {
  loadingCallback: (loading) => { /* ... */ },
  successCallback: (result) => { /* ... */ },
  errorCallback: (error) => { /* ... */ }
});

// Manual submission
await CCMailClient.submitForm({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});
```

## 🔒 Security Features

1. **Honeypot Field** - Hidden field to catch bots
2. **Rate Limiting** - Prevent spam submissions
3. **reCAPTCHA v3** - Google bot detection
4. **Input Validation** - Email and required field validation
5. **CORS Protection** - Whitelist allowed domains
6. **IP Logging** - Track submission sources

## 🌍 Multiple Website Usage

**Per-Project Setup:**

1. Create project-specific config:
```php
// site1-mail-config.php
return [
    'from_email' => 'noreply@site1.com',
    'contact_recipient' => 'contato@site1.com',
    // ... other settings
];
```

2. Initialize with custom config:
```php
$mail = new CCMail(__DIR__ . '/site1-mail-config.php');
```

3. Update JavaScript client:
```javascript
CCMailClient.config.apiUrl = 'https://cdn.yourdomain.com/ccmail/site1-api.php';
```

## 📝 Form Field Mapping

The module automatically processes these common fields:

- `name` - Sender name
- `email` - Sender email (becomes Reply-To)
- `phone` - Phone number
- `company` - Company name
- `subject` - Email subject
- `message` - Message content
- `service` - Service selection
- Any custom fields you add

## 🐛 Debugging

Enable debug mode in config:
```php
'debug_mode' => true,
```

This will show detailed error messages (disable in production).

Check logs:
```bash
tail -f logs/mail-2026-02-14.log
```

## 📧 Email Service Providers

### Gmail
```php
'smtp_host' => 'smtp.gmail.com',
'smtp_port' => 587,
'smtp_secure' => 'tls',
```
Use App Passwords: https://support.google.com/accounts/answer/185833

### SendGrid
```php
'smtp_host' => 'smtp.sendgrid.net',
'smtp_port' => 587,
'smtp_user' => 'apikey',
'smtp_pass' => 'YOUR_API_KEY',
```

### Mailgun
```php
'smtp_host' => 'smtp.mailgun.org',
'smtp_port' => 587,
'smtp_user' => 'postmaster@yourdomain.com',
'smtp_pass' => 'YOUR_API_KEY',
```

## ⚠️ Important Notes

1. **Server Requirements**: PHP 7.0+ with mail() function enabled
2. **CDN Hosting**: Ensure PHP execution is enabled on your CDN
3. **File Permissions**: `logs/` directory needs write permissions (755)
4. **Security**: Never commit config files with real credentials to Git
5. **Testing**: Test thoroughly before deploying to production

## 📄 License

MIT License - Free to use in commercial and personal projects.

## 🆘 Support

For issues or questions:
- Check the logs first
- Enable debug mode to see detailed errors
- Verify SMTP credentials
- Test with a simple send() call first
