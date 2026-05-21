# BARANGAY 663 ADMIN SYSTEM - XAMPP SETUP INSTRUCTIONS


# ilagay nyo sa xampp/htdocs ung folder: finaluimaster

## Step 1: Start XAMPP Services
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Verify both show "Running" status



## Step 2: Import the Database

### Using MySQL Command Line

1. Connect to MySQL:
   ```
   mysql -u root -p
   ```
   (Press Enter if no password)
2. Run the SQL file:
   ```
   "C:\xampp\htdocs\finaluimaster\database_setup.sql"
   ```

## Step 3: Verify Database Setup
1. Go to phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on "finalui3" database on the left sidebar
3. You should see the "residents" table
4. Check the table structure by clicking on "residents" → "Structure"

## Step 4: Start Using the System
1. Open browser and navigate to:
   ```
   http://localhost/finaluimaster/pages/login.html
   ```
2. Login with test credentials:
   - Username: admin
   - Password: admin123
3. You'll be redirected to admin-dashboard.php

## Database Connection Details
- Host: localhost
- Database: finalui3
- Username:root
- Password:(null/emptuy)

These are configured in `php/db.php`

# Troubleshooting

# "Connection failed" Error
- Make sure MySQL service is running in XAMPP
- Verify database name is "finalui3" (matches php/db.php)
- Check db.php has correct credentials

#  "Table residents not found"
- Run the SQL setup script again
- Verify in phpMyAdmin that the table exists

## API Endpoints/ request
All communicate via JSON POST requests:
- /php/add_resident.php - create resident
- /php/edit_resident.php - update resident
- /php/delete_resident.php - delete resident
- /php/get_residents.php - fetch all active residents
- /php/get_resident.php - fetch single resident
- /php/archive_resident.php - archive resident
- /php/restore_resident.php - restore archived resident
- /php/get_archived_residents.php - fetch archived residents

## System Testing
`http://localhost/finaluimaster/php/status.php`

#

http://localhost/finaluimaster/php/hash.php


UPDATE admin_users SET password = 'ctrl v the hash' WHERE user_id = 1;