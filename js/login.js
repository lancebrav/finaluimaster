function login() { //login function to check if the user is admin or not
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const appBase = '/finaluimaster';

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
        if (data.success) {
            window.location.href = `${appBase}/admin/admin-dashboard.php`;
        } else {
            alert('Wrong credentials!');
        }
    });
}