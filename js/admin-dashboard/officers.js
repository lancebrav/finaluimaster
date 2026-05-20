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

    const searchInput = document.getElementById('officerSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.loadAndRenderOfficers();
        });
    }
});

let cachedOfficers = [];

window.loadAndRenderOfficers = async function() {
    const tbody = document.querySelector('#officerTable tbody');
    if (!tbody) return;

    try {
        const response = await fetch('../php/get_officials.php');
        const data = await response.json();
        cachedOfficers = Array.isArray(data.officials) ? data.officials : [];
    } catch (err) {
        console.error('Error fetching officers:', err);
        cachedOfficers = [];
    }

    const searchInput = document.getElementById('officerSearchInput');
    const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';

    tbody.innerHTML = '';

    const filteredOfficers = cachedOfficers.filter(off => {
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
                <i class="fas fa-pencil-alt edit-icon" title="Edit" style="cursor: pointer;" onclick="window.editOfficer(${off.official_id})"></i>
                <i class="fas fa-archive archive-icon" title="Archive" style="cursor: pointer; color: #f39c12;" onclick="window.archiveOfficer(${off.official_id})"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
};

window.populateOfficerTermOptions = function(position) {
    const termSelect = document.getElementById('offTerm');
    if (!termSelect) return;

    termSelect.innerHTML = '';

    const defaultOptions = [
        { value: '', text: 'Select Term...', disabled: true, selected: true },
        { value: '2024-2027', text: '2024 - 2027' },
        { value: '2023-2026', text: '2023 - 2026' },
        { value: '2022-2025', text: '2022 - 2025' },
        { value: 'Custom', text: 'Custom / Other' }
    ];

    const skPositions = ['SK Chairman', 'SK Kagawad', 'SK Secretary', 'SK Treasurer'];
    if (skPositions.includes(position)) {
        termSelect.appendChild(new Option('Select Term...', '', true, true));
        ['2023-2026', '2022-2025', 'Custom'].forEach(tm => termSelect.appendChild(new Option(tm, tm)));
        return;
    }

    defaultOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.text;
        if (opt.disabled) option.disabled = true;
        if (opt.selected) option.selected = true;
        termSelect.appendChild(option);
    });
};

const offForm = document.getElementById('addOfficerForm');
if (offForm) {
    offForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('editOfficerId').value;
        const confirmed = confirm(editId ? 'Are you sure you want to save changes to this officer?' : 'Are you sure you want to add this officer?');
        if (!confirmed) return;

        const name = document.getElementById('offName').value;
        const birthday = document.getElementById('offBirthday').value;
        const computedAge = window.calculateAge(birthday);
        const position = document.getElementById('offPosition').value;
        const offTermEl = document.getElementById('offTerm');
        let term = offTermEl ? offTermEl.value : '';

        const uniquePositions = [
            'Punong Barangay',
            'SK Chairman',
            'Barangay Secretary',
            'Barangay Treasurer',
            'SK Secretary',
            'SK Treasurer'
        ];

        const existingSameRoleCount = cachedOfficers.filter(o => o.position === position && String(o.official_id) !== String(editId)).length;

        if (uniquePositions.includes(position) && existingSameRoleCount >= 1) {
            alert(`Only one ${position} may be added at a time.`);
            return;
        }

        if ((position === 'SK Kagawad' || position === 'Barangay Kagawad') && existingSameRoleCount >= 7) {
            alert(`Only seven ${position} members may be added.`);
            return;
        }

        const photoInput = document.getElementById('offPhoto');
        let photoBase64 = '';

        if (photoInput && photoInput.files[0]) {
            photoBase64 = await window.getBase64(photoInput.files[0]);
        } else if (editId) {
            const existingOff = cachedOfficers.find(o => String(o.official_id) === String(editId));
            photoBase64 = existingOff ? (existingOff.photo || '') : '';
        }

        let finalTerm = term;
        if (term === 'Custom') {
            const customInput = document.getElementById('offTermCustom');
            const customVal = customInput ? customInput.value.trim() : '';
            if (!customVal) {
                alert('Please enter the custom term before saving.');
                return;
            }
            finalTerm = customVal;
        }

        const payload = {
            official_id: editId || undefined,
            name,
            birthday,
            age: computedAge,
            position,
            term: finalTerm,
            photo: photoBase64
        };

        const endpoint = editId ? '../php/edit_official.php' : '../php/add_official.php';

        try {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await resp.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to save officer');
            }
        } catch (err) {
            console.error('Officer save error:', err);
            alert('Failed to save officer.');
            return;
        }

        offForm.reset();
        const offPreview = document.getElementById('offImagePreview');
        if (offPreview) offPreview.innerHTML = '?';

        document.getElementById('editOfficerId').value = '';
        document.getElementById('officerModalTitle').innerText = 'Add New Officer';
        document.getElementById('officerModal').classList.remove('active');
        window.loadAndRenderOfficers();
    });
}

window.editOfficer = function(id) {
    if (!confirm('Open officer editor for this record?')) return;
    const off = cachedOfficers.find(o => String(o.official_id) === String(id));

    if (off) {
        document.getElementById('officerModalTitle').innerText = 'Edit Officer Details';
        document.getElementById('editOfficerId').value = off.official_id;
        document.getElementById('offName').value = off.name;
        document.getElementById('offBirthday').value = off.birthday || '';
        document.getElementById('offPosition').value = off.position;
        window.populateOfficerTermOptions(off.position);
        const offTermEl = document.getElementById('offTerm');
        if (offTermEl) {
            const optMatch = offTermEl.querySelector(`option[value="${off.term}"]`);
            if (optMatch) {
                offTermEl.value = off.term || '';
                if (window.hideCustomTermInput) window.hideCustomTermInput();
            } else {
                offTermEl.value = 'Custom';
                if (window.showCustomTermInput) window.showCustomTermInput(off.term || '');
            }
        }
        document.getElementById('officerModal').classList.add('active');
    }
};

window.archiveOfficer = async function(id) {
    if (!confirm('Are you sure you want to archive this officer?')) return;

    try {
        const resp = await fetch('../php/archive_official.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ official_id: id })
        });
        const result = await resp.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to archive officer');
        }
    } catch (err) {
        console.error('Archive officer error:', err);
        alert('Failed to archive officer.');
        return;
    }

    window.loadAndRenderOfficers();
};

// Attach change listeners for position and term selects
 document.addEventListener('DOMContentLoaded', () => {
    const posSelect = document.getElementById('offPosition');
    const termSelect = document.getElementById('offTerm');
    const termContainer = document.getElementById('termInputContainer');

    window.showCustomTermInput = function(initialValue) {
        if (!termContainer) return;
        let existing = document.getElementById('offTermCustom');
        if (existing) {
            existing.value = initialValue || '';
            existing.style.display = '';
            return;
        }
        const input = document.createElement('input');
        input.id = 'offTermCustom';
        input.type = 'text';
        input.placeholder = 'Enter custom term...';
        input.value = initialValue || '';
        input.style = 'width:100%; padding:8px; margin-top:6px; border-radius:4px; border:1px solid #ccc;';
        termContainer.appendChild(input);
    };

    window.hideCustomTermInput = function() {
        const el = document.getElementById('offTermCustom');
        if (el && el.parentNode) el.parentNode.removeChild(el);
    };

    if (posSelect) {
        posSelect.addEventListener('change', (e) => {
            window.populateOfficerTermOptions(e.target.value);
            window.hideCustomTermInput();
        });
    }

    if (termSelect) {
        termSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Custom') {
                window.showCustomTermInput('');
            } else {
                window.hideCustomTermInput();
            }
        });
    }
 });

window.loadAndRenderOfficers();
