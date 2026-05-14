document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const backupBtn = document.getElementById('backup-btn');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        const checkSize = () => {
            if (window.innerWidth < 768) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        };
        window.addEventListener('resize', checkSize);
        checkSize();
    }

    // Backup database functionality
    if (backupBtn) {
        backupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to create a database backup? This may take a few moments.')) {
                try {
                    const response = await fetch('../php/backup_database.php');
                    const result = await response.text();
                    alert('Backup completed!\n\n' + result);
                } catch (error) {
                    alert('Backup failed: ' + error.message);
                }
            }
        });
    }
});
