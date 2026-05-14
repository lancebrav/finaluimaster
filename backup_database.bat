@echo off
REM Database Backup Batch Script
REM This script runs the PHP backup script

echo Starting database backup...
"C:\xampp\php\php.exe" "C:\xampp\htdocs\finaluimaster\php\backup_database.php"
echo Backup process completed.
pause