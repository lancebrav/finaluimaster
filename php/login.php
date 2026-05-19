<?php
session_start(); //login script validation
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
require_once 'db.php'; //connect to database

$raw = file_get_contents('php://input');
$data = json_decode($raw, true); //decode json data from request body

if (!$data) { //if no data received, return error
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : ''; 

if (empty($username) || empty($password)) { //if username or password is empty, return error
    echo json_encode(['success' => false, 'message' => 'Username or password empty']);
    exit;
}

//PREPARED STATEMENTS FOR SQL INJECTION PREVENTION
$stmt = mysqli_prepare($conn, "SELECT user_id, username, password FROM admin_users WHERE username = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt); //FOR SQL INJECTION PROTECTION

//does the user exist? verify password using password_verify()
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    
    if (password_verify($password, $row['password'])) {
        // Regenerate session ID to prevent session fixation attacks
        session_regenerate_id(true);
        
        $_SESSION['admin'] = true;
        $_SESSION['user_id'] = $row['user_id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['login_time'] = time();
        
        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

mysqli_stmt_close($stmt); 
mysqli_close($conn);
?>
