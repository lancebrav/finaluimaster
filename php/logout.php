<?php
require_once __DIR__ . '/session_config.php';

init_secure_session();
destroy_admin_session();

send_no_cache_headers();
header('Location: ../pages/login.html?logged_out=1');
exit;

?>
