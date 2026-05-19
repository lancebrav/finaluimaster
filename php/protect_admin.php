<?php
/**
 * Protect Admin Pages - Session Management
 * Include this file at the top of every admin page to:
 * - Verify session is active
 * - Redirect to login if not authenticated
 * - Prevent page caching (blocks back button access)
 */

// Start or resume session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Strict session validation
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    // Destroy any invalid session
    session_destroy();
    
    // Redirect to login
    header('Location: ../pages/login.html');
    exit;
}

// Prevent browser caching (blocks back button from showing cached pages)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');

// Optional: Set session timeout (30 minutes of inactivity)
$timeout = 1800; // 30 minutes
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
    session_unset();
    session_destroy();
    header('Location: ../pages/login.html');
    exit;
}
$_SESSION['last_activity'] = time();
?>
