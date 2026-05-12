<?php
header('Content-Type: application/json');

//for status testing
//test db connection
require_once 'db.php';

$tests = [];

// does database connection exist?
$tests['db_connection'] = !empty($conn) ? 'OK' : 'FAILED';

//do the tables exist?
if (!empty($conn)) {
    $result = mysqli_query($conn, "SHOW TABLES LIKE 'residents'");
    $tests['residents_table_exists'] = mysqli_num_rows($result) > 0 ? 'OK' : 'NOT FOUND';
}

//check the table columns
if (!empty($conn) && $tests['residents_table_exists'] === 'OK') {
    $result = mysqli_query($conn, "DESCRIBE residents");
    $columns = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $columns[] = $row['Field'];
    }
    $tests['residents_columns'] = $columns;
}

//api endpoints
$tests['php_files'] = [
    'add_resident.php' => file_exists('../php/add_resident.php') ? 'EXISTS' : 'MISSING',
    'edit_resident.php' => file_exists('../php/edit_resident.php') ? 'EXISTS' : 'MISSING',
    'delete_resident.php' => file_exists('../php/delete_resident.php') ? 'EXISTS' : 'MISSING',
    'archive_resident.php' => file_exists('../php/archive_resident.php') ? 'EXISTS' : 'MISSING',
    'restore_resident.php' => file_exists('../php/restore_resident.php') ? 'EXISTS' : 'MISSING',
    'get_resident.php' => file_exists('../php/get_resident.php') ? 'EXISTS' : 'MISSING',
    'get_residents.php' => file_exists('../php/get_residents.php') ? 'EXISTS' : 'MISSING',
    'get_archived_residents.php' => file_exists('../php/get_archived_residents.php') ? 'EXISTS' : 'MISSING'
];

echo json_encode($tests, JSON_PRETTY_PRINT); //verify status in json format for frontend to consume
?>
