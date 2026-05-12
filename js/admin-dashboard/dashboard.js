document.addEventListener('DOMContentLoaded', () => {
    function updateDashboardStats() {
        const totalResidentsEl = document.getElementById('countTotalResidents');
        const totalMaleEl = document.getElementById('countTotalMale');
        const totalFemaleEl = document.getElementById('countTotalFemale');

        if (!totalResidentsEl || !totalMaleEl || !totalFemaleEl) return;

        const residents = JSON.parse(localStorage.getItem('brgyResidents')) || [];

        const totalCount = residents.length;
        const maleCount = residents.filter(res => res.gender === 'M').length;
        const femaleCount = residents.filter(res => res.gender === 'F').length;

        totalResidentsEl.textContent = totalCount;
        totalMaleEl.textContent = maleCount;
        totalFemaleEl.textContent = femaleCount;
    }

    updateDashboardStats();
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.stats-overview')) {
        updateDashboard();
    }
});

function updateDashboard() {
    fetch('../php/get_residents.php')
    .then(response => response.json())
    .then(data => {
        const residents = data.residents || [];

        const total = residents.length;
        const males = residents.filter(r => r.gender === 'M').length;
        const females = residents.filter(r => r.gender === 'F').length;
        const voters = residents.filter(r => r.voterStatus === 'Registered').length;

        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
        if (document.getElementById('stat-male')) document.getElementById('stat-male').innerText = males;
        if (document.getElementById('stat-female')) document.getElementById('stat-female').innerText = females;
        if (document.getElementById('stat-voters')) document.getElementById('stat-voters').innerText = voters;

        renderGenderPieChart(males, females);
        renderAgeLineChart(residents);
    })
    .catch(err => {
        console.error('Error fetching residents:', err);
    });
}

function renderGenderPieChart(males, females) {
    const ctx = document.getElementById('genderPieChart').getContext('2d');

    if (window.myPieChart) window.myPieChart.destroy();

    window.myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [males, females],
                backgroundColor: ['#1abc9c', '#e67e22'],
                hoverOffset: 10,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderAgeLineChart(residents) {
    const ctx = document.getElementById('ageLineChart').getContext('2d');

    const ageGroups = { '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '61+': 0 };

    residents.forEach(r => {
        let age = 0;
        if (r.birthday) {
            age = window.calculateAge(r.birthday);
        } else if (r.age) {
            age = parseInt(r.age);
        }

        if (age <= 10) ageGroups['0-10']++;
        else if (age <= 20) ageGroups['11-20']++;
        else if (age <= 30) ageGroups['21-30']++;
        else if (age <= 40) ageGroups['31-40']++;
        else if (age <= 50) ageGroups['41-50']++;
        else if (age <= 60) ageGroups['51-60']++;
        else ageGroups['61+']++;
    });

    if (window.myLineChart) window.myLineChart.destroy();

    window.myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'Number of Residents',
                data: Object.values(ageGroups),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}
