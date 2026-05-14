<?php
// Database Backup Script for FINALUI3
// This script creates a backup of the database using mysqldump

// Database configuration
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'finalui3';

// Backup directory
$backupDir = __DIR__ . '/../backups/';

// Ensure backup directory exists
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

// Generate backup filename with timestamp
$timestamp = date('Y-m-d_H-i-s');
$backupFile = $backupDir . 'backup_' . $database . '_' . $timestamp . '.sql';

// mysqldump command
$mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
$command = "\"$mysqldumpPath\" --host=$host --user=$user --password=$password $database > \"$backupFile\"";

// Execute the command
exec($command, $output, $returnVar);

// Check if backup was successful
if ($returnVar === 0) {
    echo "Database backup created successfully: $backupFile\n";
    echo "Backup size: " . filesize($backupFile) . " bytes\n";
} else {
    echo "Error creating database backup. Return code: $returnVar\n";
    echo "Command output: " . implode("\n", $output) . "\n";
}

// Optional: Compress the backup (using 7-Zip if available)
$sevenZipPath = 'C:\\Program Files\\7-Zip\\7z.exe';
if (file_exists($sevenZipPath)) {
    $gzFile = $backupFile . '.7z';
    $compressCommand = "\"$sevenZipPath\" a \"$gzFile\" \"$backupFile\"";
    exec($compressCommand, $output, $returnVar);
    if ($returnVar === 0) {
        echo "Backup compressed to: $gzFile\n";
        echo "Compressed size: " . filesize($gzFile) . " bytes\n";
        unlink($backupFile); // Remove uncompressed file
    } else {
        echo "Compression failed.\n";
    }
} else {
    echo "7-Zip not found, backup saved uncompressed.\n";
}

// Optional: Clean up old backups (keep last 10)
$files = glob($backupDir . '*.sql.gz');
if (count($files) > 10) {
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    $filesToDelete = array_slice($files, 10);
    foreach ($filesToDelete as $file) {
        unlink($file);
        echo "Deleted old backup: $file\n";
    }
}
?>