(function() {
    if (window.__adminDashboardBundleLoaded) return;
    window.__adminDashboardBundleLoaded = true;

    const scripts = [
        '../js/admin-dashboard/utils.js',
        '../js/admin-dashboard/sidebar.js',
        '../js/admin-dashboard/announcements.js',
        '../js/admin-dashboard/residents.js',
        '../js/admin-dashboard/documents.js',
        '../js/admin-dashboard/officers.js',
        '../js/admin-dashboard/dashboard.js'
    ];

    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    });
})();
