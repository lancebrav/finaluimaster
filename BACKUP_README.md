# Database Backup Plan for FINALUI3

This document outlines the emergency database backup plan for the FINALUI3 barangay management system.

## Overview

In case of emergencies ("shit's on fire"), this backup system allows you to quickly create and store database backups to prevent data loss.

## Components

- `php/backup_database.php`: PHP script that creates database backups using mysqldump
- `backup_database.bat`: Windows batch file to run the backup script
- `backups/`: Directory where backup files are stored

## Quick Emergency Backup

1. **Double-click `backup_database.bat`** in the project root directory
2. The script will create a compressed backup file in the `backups/` folder
3. Backup files are named with timestamps: `backup_finalui3_YYYY-MM-DD_HH-MM-SS.sql.gz`

## Manual Backup

Run the PHP script directly:
```bash
php php/backup_database.php
```

## Automated Backups

For regular backups, set up Windows Task Scheduler:

1. Open Task Scheduler
2. Create a new task
3. Set trigger (e.g., daily at 2 AM)
4. Set action to run: `C:\xampp\htdocs\finaluimaster\backup_database.bat`
5. Configure user account with appropriate permissions

## Backup Storage

- **Local Storage**: Backups are stored in `backups/` folder
- **Cloud Backup**: Copy backup files to Google Drive, Dropbox, or external drive
- **Offsite**: Consider storing backups in a separate location

## Restoration

To restore from a backup:

1. Extract the .sql.gz file if compressed:
   ```bash
   gzip -d backup_file.sql.gz
   ```

2. Import using MySQL:
   ```bash
   mysql -u root finalui3 < backup_file.sql
   ```

Or use phpMyAdmin:
1. Open phpMyAdmin in XAMPP
2. Select FINALUI3 database
3. Go to Import tab
4. Upload the .sql file

## Security Considerations

- Backups contain sensitive resident data
- Store backups in encrypted locations
- Limit access to backup files
- Consider encrypting backups with tools like 7-Zip

## Maintenance

- The script automatically keeps the last 10 backups
- Manually delete older backups if needed
- Monitor backup directory size

## Testing

Regularly test backups by restoring to a test database:
1. Create a test database
2. Restore backup to test database
3. Verify data integrity

## Emergency Checklist

1. Run backup script immediately
2. Copy backups to external storage
3. Document the incident
4. Notify stakeholders
5. Begin recovery process

## Contact

For issues with backups, contact the system administrator.