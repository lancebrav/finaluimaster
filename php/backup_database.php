<?php
header('Content-Type: application/json');
set_time_limit(300);

$host = 'localhost';
$user = 'root';
$password = '';
$database = 'finalui3';
$backupDir = __DIR__ . '/../backups/';

if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$timestamp = date('Y-m-d_H-i-s');
$backupFile = $backupDir . 'finalui3_' . $timestamp . '.sql';
$mysqldumpPath = 'C:\xampp\mysql\bin\mysqldump.exe';
$command = "\"$mysqldumpPath\" --host=$host --user=$user --password=$password $database > \"$backupFile\"";

exec($command, $output, $returnVar);
$success = ($returnVar === 0 && file_exists($backupFile));

if (!$success && file_exists($backupFile)) {
    unlink($backupFile);
}

$files = glob($backupDir . '*.sql');
if ($files && count($files) > 10) {
    usort($files, function ($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    $filesToDelete = array_slice($files, 10);
    foreach ($filesToDelete as $file) {
        @unlink($file);
    }
}

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Backup completed']);
} else {
    echo json_encode(['success' => false, 'message' => 'Backup failed']);
}
?>
