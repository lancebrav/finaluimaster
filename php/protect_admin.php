<?php
/**
 * Protect admin PHP pages (server-side redirect if not authenticated).
 */
require_once __DIR__ . '/session_config.php';

init_secure_session();
send_no_cache_headers();

if (!is_admin_session_valid()) {
    destroy_admin_session();
    redirect_to_login('expired');
}

refresh_session_activity();

?>
