# Deployment Guide

This project is a PHP + MySQL application built to run on Apache and MariaDB/MySQL. The simplest deployment path is XAMPP locally, then the same structure can be moved to a live Apache-hosted server.

## What You Need

- PHP 8+ with `mysqli` enabled
- MySQL or MariaDB
- Apache web server
- Composer

## Project Files That Matter

- `php/db.php` controls the database connection
- `database_setup.sql` creates the base schema
- `php/email_config.php` controls SMTP settings for email notifications
- `php/create_admin.php` creates the first admin account
- `vendor/` contains Composer dependencies such as PHPMailer

## Local Deployment With XAMPP

1. Copy the project folder into `htdocs`, for example `C:\xampp\htdocs\finaluimaster`.
2. Open XAMPP Control Panel and start `Apache` and `MySQL`.
3. Install PHP dependencies from the project root:

   ```bash
   composer install
   ```

4. Open phpMyAdmin at `http://localhost/phpmyadmin`.
5. Create or select the database named `finalui3`.
6. Import `database_setup.sql` into that database.
7. Check `php/db.php` and confirm the connection values match your local MySQL setup.
8. Configure email settings in `php/email_config.php` if you want submission notifications to work.
9. Create the first admin account by opening `php/create_admin.php` in the browser once, then remove or secure that script after use.
10. Test the app in the browser:

   ```text
   http://localhost/finaluimaster/pages/login.html
   ```

## Production Deployment

1. Upload the project files to your Apache document root or hosting file manager.
2. Make sure the server supports PHP and MySQL.
3. Create a production database and import `database_setup.sql`.
4. Update `php/db.php` with the production database host, username, password, and database name.
5. Run `composer install` on the server if Composer is available, or upload the `vendor/` folder from a local install.
6. Update `php/email_config.php` with production SMTP credentials.
7. Make sure writable folders such as `uploads/` are writable by the web server.
8. Create the first admin account with `php/create_admin.php`, then disable or delete that file when finished.
9. Verify the app loads and that login, resident management, and document request flows work.

## Free Hosting Deployment

Free hosting can work for this project if the host supports PHP, MySQL, and file uploads. The easiest path is a host with a control panel and phpMyAdmin, such as InfinityFree, 000webhost, AwardSpace, or x10hosting.

1. Create a free hosting account and a new site or subdomain.
2. Create a MySQL database from the host panel.
3. Open phpMyAdmin from the hosting dashboard and import `database_setup.sql`.
4. Upload the project files to the public web root, usually `public_html` or `htdocs`.
5. Update `php/db.php` with the free host database host, username, password, and database name.
6. If the host blocks Composer, upload the prepared `vendor/` folder from a local `composer install` instead.
7. Configure `php/email_config.php` only if the host allows outbound SMTP. Many free hosts restrict mail, so document-request emails may need to be disabled or routed through an external SMTP service.
8. Open `php/create_admin.php` once to create the first admin account, then delete or rename it immediately after use.
9. Test the site using the free host URL and confirm login, resident management, and document request flows work.

### Free Hosting Notes

- Free plans often have slower performance and storage limits.
- Some hosts suspend accounts for heavy traffic or inactive sites.
- If HTTPS is not provided automatically, avoid exposing real user data until SSL is enabled.
- If file uploads are used, confirm the `uploads/` folder has write permission.

## Barangay-Owned Server Deployment

If the barangay has its own server, that is usually the best option for this system. It gives you more control over uptime, database access, backups, and privacy.

1. Install Apache, PHP, and MySQL/MariaDB on the server.
2. Copy the project to the server’s web root.
3. Create a production database on the server and import `database_setup.sql`.
4. Update `php/db.php` with the server’s local database credentials.
5. Run `composer install` on the server, or upload the `vendor/` folder from a trusted local install.
6. Configure `php/email_config.php` if the server is allowed to send outbound email.
7. Set folder permissions for `uploads/` and any other writable directories.
8. Create the first admin account with `php/create_admin.php`, then remove or disable it.
9. Test the system on the local network before exposing it to the public internet.

### Detailed Access Steps

#### Option 1: Local Network Only

Use this if only barangay staff or office computers need access.

1. Connect the server and user computers to the same router or switch.
2. Give the server a static local IP address, such as `192.168.1.50`.
3. Make sure Apache is running on the server.
4. Open the firewall for port `80` if using HTTP, or `443` if using HTTPS.
5. On each client computer, open the browser and visit the server using its local IP, for example:

   ```text
   http://192.168.1.50/finaluimaster/pages/login.html
   ```

6. If the URL works, staff can bookmark it for daily use.
7. If you want a nicer address, add a local DNS name such as `barangay663.local`.

#### Option 2: Public Internet Access

Use this if residents outside the barangay must access the system from home.

1. Get a public IP address or a domain name.
2. Configure port forwarding on the router to send traffic to the server.
3. Forward port `80` to the web server, or preferably port `443` for HTTPS.
4. Allow the same port in the server firewall.
5. Install an SSL certificate so the site uses HTTPS.
6. Update any app links or environment settings that assume a local IP.
7. Test the site from a mobile data connection or an external network, not from inside the barangay network.
8. Share the final URL with users, for example:

   ```text
   https://barangay663.example.com/pages/login.html
   ```

#### Option 3: Hybrid Setup

Use this if staff use the local network but residents also need internet access.

1. Keep the internal server address for office use.
2. Expose the same server publicly through a domain name and HTTPS.
3. Make sure the database is not publicly exposed.
4. Restrict admin access using strong passwords and role checks.
5. Test both access paths separately:
   - local office computers
   - external internet users

### Best Practice For Users

- Staff should use the local network URL if they are inside the barangay office.
- Residents should use the public URL only if the system is intentionally exposed online.
- Do not let users connect directly to MySQL; only the web app should talk to the database.

### Why This Is Better

- Better control over resident data and backups
- No dependence on a free host’s restrictions or account suspension rules
- Easier to set up internal access for staff on the barangay network
- More reliable if the server is maintained properly

### Recommended Server Setup

- Use a dedicated machine or a small office server with UPS power
- Restrict database access to the server itself or trusted IP addresses
- Use regular automated backups for both files and the database
- Enable HTTPS if the system will be used outside the local network

## Recommended Production Checks

- Confirm database connection works without exposing credentials publicly
- Confirm the `uploads/` directory accepts file writes if your workflow uses uploads
- Test login, request submission, and admin dashboard access
- Test the `php/status.php` endpoint after deployment

## Common Problems

- `Connection failed`: the database host, username, password, or database name in `php/db.php` is wrong.
- `PHPMailer not found`: run `composer install` or make sure `vendor/` is deployed.
- Email sending fails: check `php/email_config.php` and your SMTP app password.
- Login does not work: confirm the admin account exists and the password was created with bcrypt through `php/create_admin.php`.

## Quick Deployment Checklist

- Project files uploaded
- Database imported
- `php/db.php` updated
- `composer install` completed
- SMTP configured
- Admin account created
- Unused setup scripts disabled or removed
