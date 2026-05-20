<?php
header('Content-Type: application/json');

//for status testing
//test db connection
$dbError = null;
try {
    require_once 'db.php';
} catch (Throwable $e) {
    $conn = null;
    $dbError = $e->getMessage();
}

$tests = [];

// does database connection exist?
$tests['db_connection'] = !empty($conn) ? 'OK' : 'FAILED';
if ($dbError) {
    $tests['db_error'] = $dbError;
}

// do the tables exist?
if (!empty($conn)) {
    $requiredTables = [
        'residents',
        'admin_users',
        'service_types',
        'barangay_officials',
        'announcements',
        'document_requests'
    ];

    foreach ($requiredTables as $tableName) {
        $stmt = mysqli_prepare(
            $conn,
            "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?"
        );

        if ($stmt) {
            mysqli_stmt_bind_param($stmt, 's', $tableName);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $row = $result ? mysqli_fetch_assoc($result) : null;
            $tests[$tableName . '_table_exists'] = (!empty($row['table_count'])) ? 'OK' : 'NOT FOUND';
            mysqli_stmt_close($stmt);
        } else {
            $tests[$tableName . '_table_exists'] = 'NOT FOUND';
        }
    }
}

// check the table columns for the core resident table
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
    'get_archived_residents.php' => file_exists('../php/get_archived_residents.php') ? 'EXISTS' : 'MISSING',
    'get_officials.php' => file_exists('../php/get_officials.php') ? 'EXISTS' : 'MISSING',
    'get_archived_officials.php' => file_exists('../php/get_archived_officials.php') ? 'EXISTS' : 'MISSING',
    'add_official.php' => file_exists('../php/add_official.php') ? 'EXISTS' : 'MISSING',
    'edit_official.php' => file_exists('../php/edit_official.php') ? 'EXISTS' : 'MISSING',
    'archive_official.php' => file_exists('../php/archive_official.php') ? 'EXISTS' : 'MISSING',
    'restore_official.php' => file_exists('../php/restore_official.php') ? 'EXISTS' : 'MISSING',
    'get_announcements.php' => file_exists('../php/get_announcements.php') ? 'EXISTS' : 'MISSING',
    'get_archived_announcements.php' => file_exists('../php/get_archived_announcements.php') ? 'EXISTS' : 'MISSING',
    'add_announcement.php' => file_exists('../php/add_announcement.php') ? 'EXISTS' : 'MISSING',
    'edit_announcement.php' => file_exists('../php/edit_announcement.php') ? 'EXISTS' : 'MISSING',
    'archive_announcement.php' => file_exists('../php/archive_announcement.php') ? 'EXISTS' : 'MISSING',
    'restore_announcement.php' => file_exists('../php/restore_announcement.php') ? 'EXISTS' : 'MISSING',
    'get_document_requests.php' => file_exists('../php/get_document_requests.php') ? 'EXISTS' : 'MISSING',
    'get_archived_document_requests.php' => file_exists('../php/get_archived_document_requests.php') ? 'EXISTS' : 'MISSING',
    'add_document_request.php' => file_exists('../php/add_document_request.php') ? 'EXISTS' : 'MISSING',
    'update_document_request_status.php' => file_exists('../php/update_document_request_status.php') ? 'EXISTS' : 'MISSING',
    'archive_document_request.php' => file_exists('../php/archive_document_request.php') ? 'EXISTS' : 'MISSING',
    'restore_document_request.php' => file_exists('../php/restore_document_request.php') ? 'EXISTS' : 'MISSING',
    'delete_document_request.php' => file_exists('../php/delete_document_request.php') ? 'EXISTS' : 'MISSING',
    'get_service_types.php' => file_exists('../php/get_service_types.php') ? 'EXISTS' : 'MISSING'
];

echo json_encode($tests, JSON_PRETTY_PRINT); //verify status in json format for frontend to consume
?>
