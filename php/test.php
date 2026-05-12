<?php
$hash = '$2y$10$f9UQSmBfbxz96SgnHvseY.rhDRy5sVy29DWx9iuRK5.pCWhSbmZpu';
$password = 'brgy663';//admin123

if (password_verify($password, $hash)) {
    echo "Password matches!";
} else {
    echo "Password does NOT match!";
}
?>