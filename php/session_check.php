<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['admin']) && $_SESSION['admin'] === true) {
    echo json_encode(['logged_in' => true, 'username' => $_SESSION['username']]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>