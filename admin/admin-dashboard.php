<?php //admin page, checks if user is logged in as admin
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: ../pages/login.html');
    exit;
} //protects the dashboard.
?> 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | Barangay 663</title>
    <link rel="stylesheet" href="../css/home.css">
    <link rel="stylesheet" href="../css/admin-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="admin-body">

<aside class="sidebar" id="sidebar"> 
    <div class="menu-toggle" id="menuBtn">
        <i class="fas fa-bars"></i>
    </div>

    <nav class="sidebar-nav">
        <div class="sidebar-logo-container">
            <img src="../logo.png" alt="Barangay Seal" class="sidebar-logo">
        </div>

        <div class="nav-links-top">
            <a href="admin-dashboard.php" class="nav-item active">
                <i class="fas fa-chart-line"></i> <span>Dashboard</span>
            </a>
            <a href="edit-announcements.html" class="nav-item">
                <i class="fas fa-bullhorn"></i> <span>Announcements</span>
            </a>
            <a href="document-requests.html" class="nav-item">
                <i class="fas fa-file-invoice"></i> <span>Documents</span>
            </a>
            <a href="manage-residents.html" class="nav-item">
                <i class="fas fa-users-cog"></i> <span>Residents List</span>
            </a>
            <a href="office-roles.html" class="nav-item">
                <i class="fas fa-laptop-house"></i> <span>Office Roles</span>
            </a>
            <a href="archives.html" class="nav-item">
                <i class="fas fa-archive"></i> <span>Archives</span>
            </a>
            <a href="#" class="nav-item" id="backup-btn">
                <i class="fas fa-database"></i> <span>Backup Database</span>
            </a>
        </div>
                
        <a href="../php/logout.php" class="nav-item logout-item">
            <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
        </a>
    </nav>
</aside>

<main class="main-dashboard">
    <header class="admin-header">
        <div class="header-left">
            <h2>Barangay 663 - Zone 71</h2>
        </div>
        <div class="header-right">
            <span class="admin-label">Admin</span>
            <i class="fas fa-user-circle profile-icon"></i>
        </div>
    </header>

    <div class="stats-overview">
        <div class="stat-card total-residents">
            <div class="stat-left">
                <span class="stat-label">Total Residents</span>
                <span class="stat-value" id="stat-total">0</span>
            </div>
            <div class="stat-icon"><i class="fas fa-users"></i></div>
        </div>
        <div class="stat-card total-male">
            <div class="stat-left">
                <span class="stat-label">Total Male</span>
                <span class="stat-value" id="stat-male">0</span>
            </div>
            <div class="stat-icon"><i class="fas fa-mars"></i></div>
        </div>
        <div class="stat-card total-female">
            <div class="stat-left">
                <span class="stat-label">Total Female</span>
                <span class="stat-value" id="stat-female">0</span>
            </div>
            <div class="stat-icon"><i class="fas fa-venus"></i></div>
        </div>
        <div class="stat-card total-voters">
            <div class="stat-left">
                <span class="stat-label">Registered Voters</span>
                <span class="stat-value" id="stat-voters">0</span>
            </div>
            <div class="stat-icon"><i class="fas fa-id-card"></i></div>
        </div>
    </div>

    <div class="charts-container">
        <div class="chart-card">
            <h3>Age Distribution (Population Curve)</h3>
            <div style="position: relative; height:300px; width:100%;">
                <canvas id="ageLineChart"></canvas>
            </div>
        </div>
        <div class="chart-card">
            <h3>Gender Ratio</h3>
            <div style="position: relative; height:300px; width:100%;">
                <canvas id="genderPieChart"></canvas>
            </div>
        </div>
    </div>

    <section class="dashboard-grid">
        <a href="edit-announcements.html" class="action-card">
            <div class="card-tag">Edit Announcements</div>
            <div class="card-main">
                <i class="fas fa-bullhorn"></i>
            </div>
        </a>

        <a href="document-requests.html" class="action-card">
            <div class="card-tag">Request for Documents</div>
            <div class="card-main">
                <i class="fas fa-file-alt"></i>
            </div>
        </a>

        <a href="manage-residents.html" class="action-card">
            <div class="card-tag">Edit Residents List</div>
            <div class="card-main">
                <i class="fas fa-users"></i>
            </div>
        </a>

        <a href="office-roles.html" class="action-card">
            <div class="card-tag">Edit Office Roles</div>
            <div class="card-main">
                <i class="fas fa-desktop"></i>
            </div>
        </a>
    </section>
</main>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="../js/admin-dashboard/utils.js"></script>
<script src="../js/admin-dashboard/sidebar.js"></script>
<script src="../js/admin-dashboard/announcements.js"></script>
<script src="../js/admin-dashboard/residents.js"></script>
<script src="../js/admin-dashboard/documents.js"></script>
<script src="../js/admin-dashboard/officers.js"></script>
<script src="../js/admin-dashboard/dashboard.js"></script>

</body>
</html>