<?php
session_start();

// Prevent caching of session data
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json');

// Check if admin session is active
if (isset($_SESSION['admin']) && $_SESSION['admin'] === true) {
    echo json_encode(['logged_in' => true, 'username' => $_SESSION['username']]);
} else {
    // If not logged in, ensure session is destroyed
    session_destroy();
    echo json_encode(['logged_in' => false]);
}
?>