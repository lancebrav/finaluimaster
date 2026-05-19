document.addEventListener('DOMContentLoaded', () => {
    const offPhotoInput = document.getElementById('offPhoto');
    const offImagePreview = document.getElementById('offImagePreview');

    if (offPhotoInput && offImagePreview) {
        offPhotoInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const base64 = await window.getBase64(this.files[0]);
                offImagePreview.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        });
    }

    // Set up real-time filter execution when typing in the search bar
    const searchInput = document.getElementById('officerSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.loadAndRenderOfficers();
        });
    }
});

window.loadAndRenderOfficers = function() {
    const tbody = document.querySelector('#officerTable tbody');
    if (!tbody) return;

    // Fetch the filter criteria
    const searchInput = document.getElementById('officerSearchInput');
    const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
    tbody.innerHTML = '';

    // Filter officers array conditionally
    const filteredOfficers = officers.filter(off => {
        const matchesName = off.name ? off.name.toLowerCase().includes(filterText) : false;
        const matchesPosition = off.position ? off.position.toLowerCase().includes(filterText) : false;
        return matchesName || matchesPosition;
    });

    filteredOfficers.forEach(off => {
        const initials = off.name ? off.name.substring(0, 2).toUpperCase() : '??';
        const displayAge = off.birthday ? window.calculateAge(off.birthday) : (off.age || 'N/A');

        const profileDisplay = off.photo
            ? `<img src="${off.photo}" alt="${off.name}" class="profile-image">`
            : `<div class="profile-pic pic-red">${initials}</div>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="name-cell">
                ${profileDisplay}
                <span>${off.name}</span>
            </td>
            <td>${displayAge}</td>
            <td>
                <span style="display: block; font-weight: bold; color: var(--sidebar-bg); margin-bottom: 3px;">${off.position}</span>
                <span style="font-size: 0.85rem; color: #666;">Term: ${off.term || 'Active'}</span>
            </td>
            <td class="action-icons">
                <i class="fas fa-pencil-alt edit-icon" title="Edit" style="cursor: pointer;" onclick="window.editOfficer(${off.id})"></i>
                <i class="fas fa-archive archive-icon" title="Archive" style="cursor: pointer; color: #f39c12;" onclick="window.archiveOfficer(${off.id})"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
};

const offForm = document.getElementById('addOfficerForm');
if (offForm) {
    offForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('editOfficerId').value;
        const name = document.getElementById('offName').value;
        const birthday = document.getElementById('offBirthday').value;
        const computedAge = window.calculateAge(birthday);
        const position = document.getElementById('offPosition').value;
        const term = document.getElementById('offTerm').value;

        const uniquePositions = [
            'Punong Barangay',
            'SK Chairman',
            'Barangay Secretary',
            'Barangay Treasurer',
            'SK Secretary',
            'SK Treasurer'
        ];

        let officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
        const existingSameRoleCount = officers.filter(o => o.position === position && o.id != editId).length;

        if (uniquePositions.includes(position) && existingSameRoleCount >= 1) {
            alert(`Only one ${position} may be added at a time.`);
            return;
        }

        if ((position === 'SK Kagawad' || position === 'Barangay Kagawad') && existingSameRoleCount >= 7) {
            alert(`Only seven ${position} members may be added.`);
            return;
        }

        const photoInput = document.getElementById('offPhoto');
        let photoBase64 = "";

        if (photoInput && photoInput.files[0]) {
            photoBase64 = await window.getBase64(photoInput.files[0]);
        } else if (editId) {
            const officersForPhoto = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
            const existingOff = officersForPhoto.find(o => o.id == editId);
            photoBase64 = existingOff ? existingOff.photo : "";
        }

        if (editId) {
            const index = officers.findIndex(o => o.id == editId);
            if (index !== -1) {
                officers[index] = { ...officers[index], name, birthday, age: computedAge, position, term, photo: photoBase64 };
            }
        } else {
            officers.push({
                id: Date.now(),
                name,
                birthday: birthday,
                age: computedAge,
                position,
                term,
                photo: photoBase64
            });
        }

        localStorage.setItem('brgyOfficers', JSON.stringify(officers));

        offForm.reset();
        const offPreview = document.getElementById('offImagePreview');
        if (offPreview) offPreview.innerHTML = "?";

        document.getElementById('editOfficerId').value = "";
        document.getElementById('officerModalTitle').innerText = "Add New Officer";
        document.getElementById('officerModal').classList.remove('active');
        window.loadAndRenderOfficers();
    });
}

window.editOfficer = function(id) {
    const officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
    const off = officers.find(o => o.id == id);

    if (off) {
        document.getElementById('officerModalTitle').innerText = "Edit Officer Details";
        document.getElementById('editOfficerId').value = off.id;
        document.getElementById('offName').value = off.name;
        document.getElementById('offBirthday').value = off.birthday || '';
        document.getElementById('offPosition').value = off.position;
        document.getElementById('offTerm').value = off.term;
        document.getElementById('officerModal').classList.add('active');
    }
};

window.archiveOfficer = function(id) {
    if (confirm("Are you sure you want to archive this officer?")) {
        let officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
        let archivedOfficers = JSON.parse(localStorage.getItem('brgyArchivedOfficers')) || [];
        
        const index = officers.findIndex(o => o.id == id);
        
        if (index !== -1) {
            const offToArchive = officers[index];
            offToArchive.dateArchived = new Date().toLocaleDateString();
            
            // Push to archives
            archivedOfficers.push(offToArchive);
            localStorage.setItem('brgyArchivedOfficers', JSON.stringify(archivedOfficers));
            
            // Remove from active list
            officers.splice(index, 1);
            localStorage.setItem('brgyOfficers', JSON.stringify(officers));
            
            window.loadAndRenderOfficers();
        }
    }
};