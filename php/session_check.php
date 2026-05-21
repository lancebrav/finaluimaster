<?php
require_once __DIR__ . '/session_config.php';

init_secure_session();
send_no_cache_headers();
header('Content-Type: application/json');

if (is_admin_session_valid()) {
    refresh_session_activity();

    $remainingInactivity = ADMIN_SESSION_INACTIVITY_TIMEOUT;
    if (isset($_SESSION['last_activity'])) {
        $remainingInactivity = max(
            0,
            ADMIN_SESSION_INACTIVITY_TIMEOUT - (time() - (int) $_SESSION['last_activity'])
        );
    }

    echo json_encode([
        'logged_in' => true,
        'username' => $_SESSION['username'],
        'user_id' => (int) $_SESSION['user_id'],
        'inactivity_timeout_seconds' => ADMIN_SESSION_INACTIVITY_TIMEOUT,
        'inactivity_remaining_seconds' => $remainingInactivity,
    ]);
    exit;
}

destroy_admin_session();
echo json_encode(['logged_in' => false]);

?>
