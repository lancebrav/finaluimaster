function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const appBase = '/finaluimaster';

    // Security storage keys
    const attemptsKey = 'failedAttempts';
    const lockKey = 'lockUntil';

    // Get current values
    let failedAttempts = localStorage.getItem(attemptsKey) || 0;
    let lockUntil = localStorage.getItem(lockKey);

    // Check if account is locked
    if (lockUntil && Date.now() < lockUntil) {
        const remaining = Math.ceil((lockUntil - Date.now()) / 60000);
        alert(`Account locked. Try again in ${remaining} minute(s).`);
        return;
    }

    // Unlock automatically if time expired
    if (lockUntil && Date.now() >= lockUntil) {
        localStorage.removeItem(lockKey);
        localStorage.removeItem(attemptsKey);
        failedAttempts = 0;
    }

    // Send login request
    fetch(`${appBase}/php/login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })

    .then(response => response.json())

    .then(data => {

        // SUCCESS
        if (data.success) {

            // Reset security tracker
            localStorage.removeItem(attemptsKey);
            localStorage.removeItem(lockKey);

            // Open admin dashboard
            window.location.href = `${appBase}/admin/admin-dashboard.php`;

        }

        // FAILED LOGIN
        else {

            failedAttempts++;
            localStorage.setItem(attemptsKey, failedAttempts);

            // Lock after 3 tries
            if (failedAttempts >= 3) {

                const lockTime = Date.now() + (10* 60 * 1000); // 10 mins
                localStorage.setItem(lockKey, lockTime);

                alert('Too many failed attempts. Locked for 10 minutes.');

            } else {

                const remaining = 3 - failedAttempts;
                alert('Wrong credentials!');
            }
        }

    })

    .catch(error => {
        console.error('Login error:', error);
        alert('System error. Please try again.');
    });
}