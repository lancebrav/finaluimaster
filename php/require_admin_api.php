<?php
/**
 * Require a valid admin session for JSON API endpoints.
 */
require_once __DIR__ . '/session_config.php';

init_secure_session();
send_no_cache_headers();

if (!is_admin_session_valid()) {
    destroy_admin_session();
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'logged_in' => false,
        'message' => 'Session expired or unauthorized. Please log in again.',
    ]);
    exit;
}

refresh_session_activity();

?>
