<?php

//admin user management script
//still modifying
require_once 'db.php';

//modify if you want to create a different user or reset password for an existing user
$action = 'create'; // 'create' or 'reset'
$username = 'admin';
$password = 'admin123'; //change to desired pass
$email = 'admin@barangay663.local';


//hash using bcrypt
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

if ($action === 'create') {
    //create new admin user
    $stmt = mysqli_prepare($conn, "INSERT INTO admin_users (username, password, email, role) VALUES (?, ?, ?, 'admin')");
    mysqli_stmt_bind_param($stmt, "sss", $username, $hashed_password, $email);
    
    if (mysqli_stmt_execute($stmt)) {
        echo "<h2 style='color: green;'>admin user '{$username}' created successfully!</h2>";
        echo "<p>Password: {$password}</p>";
    } else {
        if (strpos(mysqli_error($conn), 'Duplicate entry') !== false) {
            echo "<h2 style='color: orange;'> '{$username}' already exists. Use action 'reset' to change password.</h2>";
        } else {
            echo "<h2 style='color: red;'> " . mysqli_error($conn) . "</h2>";
        }
    }
    
} else if ($action === 'reset') {
    //reset existing admin user's password
    $stmt = mysqli_prepare($conn, "UPDATE admin_users SET password = ? WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "ss", $hashed_password, $username);
    
    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_affected_rows($conn) > 0) {
            echo "<h2 style='color: green;'>'{$username}' reset successfully!</h2>";
            echo "<p>New password: {$password}</p>";
            echo "<p><strong></strong></p>";
        } else {
            echo "<h2 style='color: red;'>'{$username}' not found.</h2>";
        }
    } else {
        echo "<h2 style='color: red;'>" . mysqli_error($conn) . "</h2>";
    }
}

mysqli_close($conn);
?>
