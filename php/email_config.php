<?php
// Email configuration for SMTP (Gmail)
// IMPORTANT: For Gmail, create an App Password and use it as SMTP_PASS.
// Install PHPMailer via Composer: run `composer require phpmailer/phpmailer` in the project root.

define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'kiyonabayot@gmail.com'); // replace with sender Gmail
define('SMTP_PASS', 'njurwjtaxhctegme');   // replace with app password
define('SMTP_FROM', 'kiyonabayot@gmail.com');
define('SMTP_FROM_NAME', 'Barangay 663');

// Optionally set EMAIL_SECURE to 'tls' or 'ssl'
define('EMAIL_SECURE', 'tls');

// Debug flag (set to true to log SMTP errors to php://stderr)
define('SMTP_DEBUG', false);

?>
