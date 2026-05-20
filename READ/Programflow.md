# Program Flow documentation

## Document Purpose

This document explains the complete flow of the Barangay 663 web system 

## 1. System Overview

### 1.1 Architecture

The project follows a classic 3-layer web structure:

1. Presentation Layer: HTML, CSS, JavaScript
2. Application Layer: PHP endpoints
3. Data Layer: MySQL database

Main request cycle:

1. User interacts with an HTML page.
2. JavaScript captures the action.
3. JavaScript sends an HTTP request to a PHP endpoint.
4. PHP processes the request and uses `php/db.php` for database access.
5. MySQL returns data or confirms changes.
6. PHP sends a JSON response.
7. JavaScript updates the page.

### 1.2 Core Technologies

1. Frontend: HTML, CSS, JavaScript
2. Backend: PHP (procedural endpoint style)
3. Database: MySQL
4. Local runtime: XAMPP

## 2. Main Modules and Responsibilities

### 2.1 Authentication Module

Files involved:
1. `pages/login.html`
2. `js/login.js`
3. `php/login.php`
4. `php/logout.php`
5. `php/db.php`

Responsibility:
-----
1. Validate admin credentials.
2. Create and destroy server session.
3. Protect admin pages from unauthorized access.

### 2.2 Admin Management Module

Files involved:

1. `admin/admin-dashboard.php`
2. `admin/manage-residents.html`
3. `admin/archives.html`
4. `js/admin-dashboard.js`
5. Resident API endpoints under `php/`

Responsibility:

1. Display resident records.
2. Create, update, archive, restore, and delete residents.
3. Compute dashboard totals and chart values.

### 2.3 Public Information Module

Files involved:

1. `pages/home.html`
2. `pages/about.html`
3. `pages/resident-services.html`
4. `pages/resident-gallery.html`
5. `pages/resident-officials.html`
6. `pages/resident-announcements.html`
7. `css/home.css`
8. `js/home.js`

Responsibility:

1. Show public-facing barangay information.
2. Render non-admin pages with shared styling and behavior.

---

## 3. End-to-End User Flows

## 3.1 Admin Login Flow

Goal: Allow authorized admin access.

Flow steps:

1. User opens `pages/login.html`.
2. `js/login.js` captures username and password.
3. JavaScript sends `POST` request to `php/login.php` with JSON body.
4. `php/login.php` checks `admin_users` table using `php/db.php`.
5. If valid, PHP sets `$_SESSION['admin']`.
6. JavaScript redirects to `admin/admin-dashboard.php`.

Failure handling:

1. Invalid credentials return `success: false`.
2. UI shows login error message.

## 3.2 Dashboard Access Control Flow

Goal: Ensure only logged-in admins can access admin pages.

Flow steps:

1. Browser requests `admin/admin-dashboard.php`.
2. PHP starts session and checks `$_SESSION['admin']`.
3. If session is missing, browser is redirected to `pages/login.html`.
4. If session exists, admin view is rendered and script files are loaded.

Security note:

This server-side check is the main gatekeeper for admin access.

## 3.3 Logout Flow

Goal: End admin session safely.

Flow steps:

1. Admin clicks logout link in dashboard UI.
2. Browser opens `php/logout.php`.
3. PHP destroys session.
4. User is redirected to `pages/login.html`.

## 3.4 Resident Management (CRUD + Archive) Flow

Goal: Maintain resident records lifecycle.

### A. Load active residents

1. Admin opens `admin/manage-residents.html`.
2. `js/admin-dashboard.js` calls `php/get_residents.php`.
3. PHP returns residents where `is_archived = 0`.
4. JavaScript renders rows in resident table.

### B. Add resident

1. Admin fills resident form.
2. JavaScript sends `POST` request to `php/add_resident.php`.
3. PHP inserts record into `residents` table.
4. UI refreshes list and dashboard counts.

### C. Edit resident

1. Admin selects Edit action.
2. JavaScript requests record from `php/get_resident.php`.
3. Form is pre-filled with selected resident data.
4. On save, JavaScript sends request to `php/edit_resident.php`.
5. PHP updates the selected row in `residents`.

### D. Archive resident

1. Admin selects Archive action.
2. JavaScript sends `resident_id` to `php/archive_resident.php`.
3. PHP sets `is_archived = 1` and `archived_date = NOW()`.
4. Resident is removed from active list.

### E. View archived residents

1. Admin opens `admin/archives.html`.
2. JavaScript calls `php/get_archived_residents.php`.
3. PHP returns records where `is_archived = 1`.
4. UI renders archive table.

### F. Restore resident

1. Admin clicks Restore.
2. JS sends request to `php/restore_resident.php`.
3. PHP sets `is_archived = 0` and clears `archived_date`.
4. Resident returns to active table.

### G. Permanently delete resident

1. Admin confirms delete action.
2. JavaScript sends request to `php/delete_resident.php`.
3. PHP executes delete query by `resident_id`.
4. Record is permanently removed.

## 3.5 Dashboard Statistics Flow

Goal: Display real-time summary metrics.

Flow steps:

1. JavaScript fetches active residents from `php/get_residents.php`.
2. Client-side logic computes totals (total residents, male, female, voters).
3. Stats cards and charts are updated in dashboard UI.


Important limitation:

Data is still local to the browser..and does not sync to toher environemtns

---



## 4. Database and Environment Dependencies

### 4.1 Database Setup

`database_setup.sql` initializes:

1. Database: `FINALUI3`
2. Core tables: `admin_users`, `residents`, `service_types`, `barangay_officials`, `announcements`, `document_requests`
3. Default admin account for initial login

### 4.2 Shared DB Connector

`php/db.php` is the common connector used by all database-driven PHP endpoints.

### 4.3 Health Check

`php/status.php` validates:

1. Database connection
2. Required tables
3. Presence of key endpoint files

### 4.4 Runtime

`XAMPP_SETUP.md` describes local environment configuration.


## 5. What needs changes?
---

## 6. Current Limitations and Improvement Path

### 6.1 Known Limitations

1. Announcements are stored only in localStorage.
2. No QR yet for residents

### 6.2 Recommended Next Iteration

1. Move announcements to database-backed PHP endpoints.
2. Add role-based authorization checks per sensitive endpoint. 
3. Add automated test checklist for login, CRUD, archive, restore, and delete flows.
4. 


