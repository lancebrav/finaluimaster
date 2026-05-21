/**
 * Blocks cached back/forward access to admin pages after logout.
 * Re-checks session on load and when the page is restored from bfcache.
 */
(function () {
    const SESSION_URL = '../php/session_check.php';
    const LOGIN_URL = '../pages/login.html';

    let checkInFlight = false;

    function hideUntilVerified() {
        document.documentElement.classList.add('auth-pending');
    }

    function showAfterVerified() {
        document.documentElement.classList.remove('auth-pending');
    }

    async function enforceAdminSession() {
        if (checkInFlight) {
            return;
        }
        checkInFlight = true;
        hideUntilVerified();

        try {
            const response = await fetch(SESSION_URL, {
                method: 'GET',
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
            });
            const data = await response.json();

            if (!data.logged_in) {
                window.location.replace(LOGIN_URL);
                return;
            }

            showAfterVerified();
        } catch (err) {
            console.error('Admin session check failed:', err);
            window.location.replace(LOGIN_URL);
        } finally {
            checkInFlight = false;
        }
    }

    hideUntilVerified();
    enforceAdminSession();

    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            enforceAdminSession();
        }
    });

    window.addEventListener('focus', function () {
        enforceAdminSession();
    });
})();
