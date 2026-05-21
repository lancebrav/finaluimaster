<?php
require_once __DIR__ . '/session_config.php';

init_secure_session();
header('Content-Type: application/json');
send_no_cache_headers();

$throttleMessage = is_login_throttled();
if ($throttleMessage !== null) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => $throttleMessage]);
    exit;
}

require_once __DIR__ . '/db.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($username === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Username or password empty']);
    exit;
}

$stmt = mysqli_prepare($conn, 'SELECT user_id, username, password FROM admin_users WHERE username = ?');
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

mysqli_stmt_bind_param($stmt, 's', $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    if (password_verify($password, $row['password'])) {
        bind_admin_session((int) $row['user_id'], $row['username']);
        clear_login_throttle();

        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        register_failed_login_attempt();
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} else {
    register_failed_login_attempt();
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);

?>
