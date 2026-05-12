<?php 
session_start(); 
session_destroy(); //destroy session to log out user and prevent url access
header('Location: ../pages/login.html'); //redirect to login page after logout
exit;
?>
