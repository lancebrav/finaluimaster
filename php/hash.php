<?php //OLD FILE BUT DO NOT DELETE CAUSE IT WORKS, use this to generate hashed pass.
$hashed = password_hash('admin123', PASSWORD_BCRYPT); 
echo $hashed;
?>