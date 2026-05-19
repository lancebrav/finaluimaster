<?php
session_start();

// Completely destroy session data
unset($_SESSION['admin']);
unset($_SESSION['username']);
unset($_SESSION['user_id']);

// Destroy the session
session_destroy();

// Prevent browser caching by sending no-cache headers
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Redirect to login page
header('Location: ../pages/login.html');
exit;
?>
