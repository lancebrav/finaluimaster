document.addEventListener('DOMContentLoaded', () => {
    const resPhotoInput = document.getElementById('resPhoto');
    const imagePreview = document.getElementById('imagePreview');

    if (resPhotoInput && imagePreview) {
        resPhotoInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const base64 = await window.getBase64(this.files[0]);
                imagePreview.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const residentForm = document.getElementById('addResidentForm');

    const birthdayInput = document.getElementById('resBirthday');
    if (birthdayInput) {
        birthdayInput.max = new Date().toISOString().split('T')[0];
    }

    if (residentForm) {
        residentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const photoInput = document.getElementById('resPhoto');
                const editId = document.getElementById('editResidentId').value;
                let photoBase64 = "";

                if (photoInput && photoInput.files[0]) {
                    photoBase64 = await window.getBase64(photoInput.files[0]);
                } else if (editId) {
                    photoBase64 = "";
                }
                const fName = document.getElementById('resFirstName')?.value || '';
                const mName = document.getElementById('resMiddleName')?.value || '';
                const lName = document.getElementById('resLastName')?.value || '';
                const suffix = document.getElementById('resSuffix')?.value || '';
                const middleInitial = mName ? `${mName.charAt(0).toUpperCase()}. ` : '';
                const displaySuffix = suffix ? ` ${suffix}` : '';
                const fullName = `${fName} ${middleInitial}${lName}${displaySuffix}`.trim();
                const birthday = document.getElementById('resBirthday')?.value || '';
                const birthDate = birthday ? new Date(birthday) : null;
                const today = new Date();

                if (birthDate && birthDate > today) {
                    alert('Birthday cannot be in the future. Please choose a valid birth date.');
                    return;
                }

                const computedAge = window.calculateAge(birthday);
                if (computedAge < 0) {
                    alert('Birthday cannot be in the future. Please choose a valid birth date.');
                    return;
                }
                const gender = document.getElementById('resGender')?.value || '';
                const house = document.getElementById('resHouse')?.value || '';
                const status = document.getElementById('resStatus')?.value || '';
                const vStatus = document.getElementById('resVoterStatus')?.value || '';
                const addr = document.getElementById('resAddress')?.value || '';

                const residentData = {
                    resident_id: editId || null,
                    firstName: fName,
                    middleName: mName,
                    lastName: lName,
                    suffix: suffix,
                    fullName: fullName,
                    birthday: birthday,
                    age: computedAge,
                    gender: gender,
                    houseNum: house,
                    civilStatus: status,
                    voterStatus: vStatus,
                    address: addr,
                    photo: photoBase64,
                    initials: (fName.charAt(0) + lName.charAt(0)).toUpperCase(),
                    placeOfBirth: document.getElementById('resPlaceOfBirth')?.value || '',
                    citizenship: document.getElementById('resCitizenship')?.value || 'Filipino',
                    occupation: document.getElementById('resOccupation')?.value || '',
                    houseHeadRelationship: document.getElementById('resHouseHeadRelationship')?.value || '',
                    streetName: document.getElementById('resStreetName')?.value || ''
                };

                const endpoint = editId ? '../php/edit_resident.php' : '../php/add_resident.php';

                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(residentData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        residentForm.reset();
                        document.getElementById('imagePreview').innerHTML = "?";
                        document.getElementById('editResidentId').value = "";
                        document.getElementById('modalTitle').innerText = "Register Resident";
                        document.getElementById('residentModal').classList.remove('active');
                        window.loadAndRenderResidents();
                    } else {
                        alert('Error saving resident: ' + data.message);
                    }
                })
                .catch(fetchErr => {
                    console.error("FETCH ERROR:", fetchErr);
                    alert('Network error: Could not reach the server. Check your connection or PHP path.\n\n' + fetchErr.message);
                });

            } catch (err) {
                console.error("FORM ERROR:", err);
                alert("Form error: " + err.message + "\n\nCheck F12 Console for details.");
            }
        });
    }

    const setupModal = (btnId, modalId, closeId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const close = document.getElementById(closeId);
        if (btn && modal) btn.onclick = () => modal.classList.add('active');
        if (close && modal) close.onclick = () => {
            modal.classList.remove('active');
            if (modalId === 'residentModal') {
                document.getElementById('addResidentForm').reset();
                document.getElementById('editResidentId').value = "";
                document.getElementById('modalTitle').innerText = "Register Resident";
            }
        };
    };

    setupModal('addResidentBtn', 'residentModal', 'closeResidentModal');
    setupModal('addEventBtn', 'eventModal', 'closeEventModal');
    setupModal('addOfficerBtn', 'officerModal', 'closeOfficerModal');

    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (window.currentPage > 1) { window.currentPage--; window.loadAndRenderResidents(); }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        const totalResidents = typeof window.filteredResidentsTotal === 'number'
            ? window.filteredResidentsTotal
            : (window.cachedResidents || []).length;
        if (window.currentPage * window.rowsPerPage < totalResidents) {
            window.currentPage++;
            window.loadAndRenderResidents();
        }
    });

    const searchInput = document.getElementById('residentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.currentPage = 1;
            window.loadAndRenderResidents();
        });
    }

    const archiveSearchInput = document.getElementById('archiveSearch');
    if (archiveSearchInput) {
        archiveSearchInput.addEventListener('keyup', () => {
            const query = archiveSearchInput.value.toLowerCase();
            const rows = document.querySelectorAll('#archiveTable tbody tr');
            rows.forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
            });
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    const filterFieldSelect = document.getElementById('filterField');
    const filterValueDropdown = document.getElementById('filterValueDropdown');
    const filterValueToggle = document.getElementById('filterValueToggle');
    const filterValueMenu = document.getElementById('filterValueMenu');
    const ageMinInput = document.getElementById('ageMin');
    const ageMaxInput = document.getElementById('ageMax');
    const applyFiltersBtn = document.getElementById('applyResidentFilters');
    const clearFiltersBtn = document.getElementById('clearResidentFilters');

    if (filterFieldSelect && filterValueDropdown && filterValueToggle && filterValueMenu) {
        filterFieldSelect.addEventListener('change', () => {
            window.residentFilters.field = filterFieldSelect.value;
            window.residentFilters.values = [];
            window.updateFilterToggleLabel();
            window.updateResidentFilterValues(window.cachedResidents || []);
        });

        filterValueToggle.addEventListener('click', () => {
            filterValueDropdown.classList.toggle('open');
        });

        filterValueMenu.addEventListener('change', () => {
            const selectedValues = Array.from(filterValueMenu.querySelectorAll('input[type="checkbox"]:checked'))
                .map(input => input.value);
            window.residentFilters.values = selectedValues;
            window.updateFilterToggleLabel();
        });

        window.addEventListener('click', (e) => {
            if (!filterValueDropdown.contains(e.target)) {
                filterValueDropdown.classList.remove('open');
            }
        });
    }

    if (applyFiltersBtn && ageMinInput && ageMaxInput) {
        applyFiltersBtn.addEventListener('click', () => {
            window.residentFilters.ageMin = ageMinInput.value.trim();
            window.residentFilters.ageMax = ageMaxInput.value.trim();
            window.currentPage = 1;
            window.loadAndRenderResidents();
        });
    }

    if (clearFiltersBtn && filterFieldSelect && ageMinInput && ageMaxInput) {
        clearFiltersBtn.addEventListener('click', () => {
            window.residentFilters = { field: '', values: [], ageMin: '', ageMax: '' };
            filterFieldSelect.value = '';
            ageMinInput.value = '';
            ageMaxInput.value = '';
            if (filterValueMenu) {
                filterValueMenu.innerHTML = '';
            }
            window.updateFilterToggleLabel();
            window.currentPage = 1;
            window.loadAndRenderResidents();
        });
    }

    const columnSelectorToggle = document.getElementById('columnSelectorToggle');
    const columnSelectorDropdown = document.getElementById('columnSelectorDropdown');
    const columnSelectorMenu = document.getElementById('columnSelectorMenu');

    if (columnSelectorToggle && columnSelectorDropdown && columnSelectorMenu) {
        columnSelectorToggle.addEventListener('click', () => {
            columnSelectorDropdown.classList.toggle('open');
        });

        columnSelectorMenu.addEventListener('change', () => {
            const selected = Array.from(columnSelectorMenu.querySelectorAll('input[type="checkbox"]:checked'))
                .map(input => input.value);
            window.selectedColumns = selected;
            const count = selected.length;
            columnSelectorToggle.textContent = count ? `${count} columns` : 'Select columns';
            window.currentPage = 1;
            window.loadAndRenderResidents();
        });

        window.addEventListener('click', (e) => {
            if (!columnSelectorDropdown.contains(e.target)) {
                columnSelectorDropdown.classList.remove('open');
            }
        });

        window.updateColumnSelectorLabel = function() {
            const count = window.selectedColumns.length;
            columnSelectorToggle.textContent = count ? `${count} columns` : 'Select columns';
        };
    }


    if (document.querySelector('#residentTable tbody')) {
        window.loadAndRenderResidents();
    }

    if (document.querySelector('#officerTable tbody') && typeof window.loadAndRenderOfficers === 'function') {
        window.loadAndRenderOfficers();
    }

    if (document.querySelector('#archiveTable tbody')) {
        window.loadAndRenderArchives();
    }

    if (document.getElementById('ongoingRequestsBody') && typeof window.loadAndRenderDocumentRequests === 'function') {
        window.loadAndRenderDocumentRequests();
    }

    // ZOOM IN / ZOOM OUT INITIALIZERS REMOVED FROM HERE
});

window.currentPage = 1;
window.rowsPerPage = 8;
window.cachedResidents = [];
window.filteredResidentsTotal = 0;
window.residentFilters = { field: '', values: [], ageMin: '', ageMax: '' };
window.selectedColumns = ['fullName', 'houseNum', 'streetName', 'birthday', 'gender', 'age', 'status'];

window.getColumnLabel = function(col) {
    const labels = {
        'fullName': 'Full Name',
        'houseNum': 'House No.',
        'streetName': 'Street Name',
        'placeOfBirth': 'Place of Birth',
        'birthday': 'Date of Birth',
        'gender': 'Sex',
        'civilStatus': 'Civil Status',
        'citizenship': 'Citizenship',
        'occupation': 'Occupation',
        'houseHeadRelationship': 'House Head Relationship',
        'age': 'Age',
        'status': 'Status',
        'voterStatus': 'Voter Status',
        'address': 'Address'
    };
    return labels[col] || col;
};

window.getResidentFieldValue = function(res, field) {
    switch (field) {
        case 'fullName':
            return res.fullName || '';
        case 'houseNum':
            return res.houseNum || '';
        case 'streetName':
            return res.streetName || '';
        case 'placeOfBirth':
            return res.placeOfBirth || '';
        case 'gender':
            return res.gender || '';
        case 'civilStatus':
            return res.civilStatus || '';
        case 'citizenship':
            return res.citizenship || '';
        case 'occupation':
            return res.occupation || '';
        case 'houseHeadRelationship':
            return res.houseHeadRelationship || '';
        case 'voterStatus':
            return res.voterStatus || '';
        case 'status':
            return res.is_archived == 1 ? 'Archived' : 'Active';
        case 'address':
            return res.address || '';
        case 'birthday':
            return res.birthday || '';
        case 'age':
            return res.birthday ? window.calculateAge(res.birthday) : 'N/A';
        default:
            return res[field] || '';
    }
};

window.buildResidentRowHTML = function(res, index) {
    const cols = window.selectedColumns || ['fullName', 'houseNum', 'streetName', 'birthday', 'gender', 'age', 'status'];
    let html = `<td><input type="checkbox" class="resident-checkbox" data-id="${res.resident_id}"></td><td>${index}</td>`;
    
    cols.forEach(col => {
        const value = window.getResidentFieldValue(res, col);
        if (col === 'voterStatus') {
            html += `<td style="font-weight:600; color:${value === 'Registered' ? '#27ae60' : '#e74c3c'}">${value}</td>`;
        } else {
            html += `<td>${value}</td>`;
        }
    });
    
    html += `<td class="action-icons">
        <i class="fas fa-pencil-alt edit-icon" onclick="editResident(${res.resident_id})" title="Edit"></i>
        <i class="fas fa-archive archive-icon" onclick="archiveResident(${res.resident_id})" title="Archive"></i>
        <i class="fas fa-trash-alt delete-icon" onclick="deleteResident(${res.resident_id})" title="Delete"></i>
    </td>`;
    
    return html;
};

window.updateTableHeader = function() {
    const thead = document.querySelector('#residentTable thead tr');
    if (!thead) return;
    
    const cols = window.selectedColumns || ['fullName', 'houseNum', 'streetName', 'birthday', 'gender', 'age', 'status'];
    let html = '<th><input type="checkbox" id="selectAllResidents"></th><th>#</th>';
    
    cols.forEach(col => {
        html += `<th>${window.getColumnLabel(col)}</th>`;
    });
    
    html += '<th>Actions</th>';
    thead.innerHTML = html;

    const selectAll = document.getElementById('selectAllResidents');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#residentTable tbody .resident-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
};

window.updateFilterToggleLabel = function() {
    const toggle = document.getElementById('filterValueToggle');
    if (!toggle) return;
    const count = (window.residentFilters.values || []).length;
    toggle.textContent = count ? `${count} selected` : 'Select values';
};

window.updateResidentFilterValues = function(residents) {
    const menu = document.getElementById('filterValueMenu');
    const toggle = document.getElementById('filterValueToggle');
    if (!menu || !toggle) return;

    const field = window.residentFilters.field;
    menu.innerHTML = '';

    if (!field) {
        toggle.textContent = 'Select values';
        return;
    }

    const uniqueValues = new Map();
    residents.forEach(res => {
        const rawValue = window.getResidentFieldValue(res, field);
        const trimmed = String(rawValue || '').trim();
        const entry = trimmed ? { key: trimmed, label: trimmed } : { key: '__EMPTY__', label: 'N/A' };
        if (!uniqueValues.has(entry.key)) {
            uniqueValues.set(entry.key, entry.label);
        }
    });

    const items = Array.from(uniqueValues.entries()).map(([key, label]) => ({ key, label }));
    items.sort((a, b) => {
        if (a.key === '__EMPTY__') return 1;
        if (b.key === '__EMPTY__') return -1;
        return a.label.localeCompare(b.label);
    });

    if (items.length === 0) {
        menu.innerHTML = '<div class="checkbox-item">No values</div>';
        toggle.textContent = 'Select values';
        return;
    }

    menu.innerHTML = items.map(item => {
        return `
        <label class="checkbox-item">
            <input type="checkbox" value="${item.key}">
            <span>${item.label}</span>
        </label>`;
    }).join('');

    const selected = new Set(window.residentFilters.values || []);
    menu.querySelectorAll('input[type="checkbox"]').forEach(input => {
        if (selected.has(input.value)) {
            input.checked = true;
        }
    });

    window.updateFilterToggleLabel();
};

window.loadAndRenderResidents = function() {
    fetch('../php/get_residents.php')
    .then(response => response.json())
    .then(data => {
        let residents = data.residents || [];
        window.cachedResidents = residents;
        window.updateResidentFilterValues(residents);
        const tbody = document.querySelector('#residentTable tbody');
        if (!tbody) return;

        const headerCells = Array.from(document.querySelectorAll('#residentTable thead th'));
        const headerText = headerCells.map(th => th.textContent.trim().toLowerCase());
        const isAdminLayout = headerText.includes('full name') && headerText.includes('house head relationship');

        const searchInput = document.getElementById('residentSearch');
        if (searchInput && searchInput.value.trim() !== '') {
            const query = searchInput.value.toLowerCase();
            residents = residents.filter(res => {
                const searchableText = `${res.fullName} ${res.address} ${res.voterStatus} ${res.gender} ${res.houseNum}`.toLowerCase();
                return searchableText.includes(query);
            });
        }

        if (window.residentFilters.field && window.residentFilters.values.length > 0) {
            const field = window.residentFilters.field;
            const selected = new Set(window.residentFilters.values);
            residents = residents.filter(res => {
                const rawValue = window.getResidentFieldValue(res, field);
                const trimmed = String(rawValue || '').trim();
                const key = trimmed ? trimmed : '__EMPTY__';
                return selected.has(key);
            });
        }

        if (window.residentFilters.ageMin || window.residentFilters.ageMax) {
            const minAge = window.residentFilters.ageMin ? parseInt(window.residentFilters.ageMin, 10) : null;
            const maxAge = window.residentFilters.ageMax ? parseInt(window.residentFilters.ageMax, 10) : null;
            residents = residents.filter(res => {
                const age = res.birthday ? window.calculateAge(res.birthday) : NaN;
                if (Number.isNaN(age)) return false;
                if (minAge !== null && age < minAge) return false;
                if (maxAge !== null && age > maxAge) return false;
                return true;
            });
        }

        window.filteredResidentsTotal = residents.length;
        window.filteredResidents = residents; 

        window.updateTableHeader();

        tbody.innerHTML = '';
        const start = (window.currentPage - 1) * window.rowsPerPage;
        const end = start + window.rowsPerPage;
        const paginatedItems = residents.slice(start, end);

        paginatedItems.forEach((res, index) => {
            const row = document.createElement('tr');
            const itemSequentialNumber = start + index + 1;
            row.innerHTML = window.buildResidentRowHTML(res, itemSequentialNumber);
            tbody.appendChild(row);
        });
    });
};

window.exportResidentsToExcel = function() {
    const filteredResidents = window.filteredResidents || [];
    if (filteredResidents.length === 0) {
        alert('No residents to export.');
        return;
    }

    const checkedBoxes = document.querySelectorAll('#residentTable tbody .resident-checkbox:checked');
    const exportAll = checkedBoxes.length === 0;

    let residentsToExport = [];
    if (exportAll) {
        residentsToExport = filteredResidents;
    } else {
        const selectedIds = Array.from(checkedBoxes).map(cb => String(cb.dataset.id));
        residentsToExport = filteredResidents.filter(res => selectedIds.includes(String(res.resident_id)));
    }

    if (residentsToExport.length === 0) {
        alert('No residents selected to export.');
        return;
    }

    const selectedCols = window.selectedColumns || ['fullName', 'houseNum', 'streetName', 'birthday', 'gender', 'age', 'status'];
    const headers = selectedCols.map(col => window.getColumnLabel(col));

    const rows = residentsToExport.map(res => {
        return selectedCols.map(col => window.getResidentFieldValue(res, col));
    });

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[cellAddr]) {
            ws[cellAddr].s = { font: { bold: true } };
        }
    }

    ws['!cols'] = headers.map((h, i) => {
        const maxLen = Math.max(
            h.length,
            ...rows.map(r => String(r[i] || '').length)
        );
        return { wch: Math.min(maxLen + 4, 40) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Residents');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Barangay663_Residents_${today}.xlsx`);
};

window.editResident = (id) => {
    fetch('../php/get_resident.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resident_id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.resident) {
            const res = data.resident;
            document.getElementById('modalTitle').innerText = "Edit Resident Details";
            document.getElementById('editResidentId').value = res.resident_id;

            document.getElementById('resFirstName').value = res.firstName || '';
            document.getElementById('resMiddleName').value = res.middleName || '';
            document.getElementById('resLastName').value = res.lastName || '';
            document.getElementById('resSuffix').value = res.suffix || '';
            document.getElementById('resBirthday').value = res.birthday || '';
            document.getElementById('resGender').value = res.gender || '';
            document.getElementById('resHouse').value = res.houseNum || '';
            document.getElementById('resStatus').value = res.civilStatus || '';
            document.getElementById('resVoterStatus').value = res.voterStatus || '';
            document.getElementById('resAddress').value = res.address || '';
            document.getElementById('resPlaceOfBirth').value = res.placeOfBirth || '';
            document.getElementById('resCitizenship').value = res.citizenship || '';
            document.getElementById('resOccupation').value = res.occupation || '';
            document.getElementById('resHouseHeadRelationship').value = res.houseHeadRelationship || '';
            document.getElementById('resStreetName').value = res.streetName || '';

            if (res.photo) {
                document.getElementById('imagePreview').innerHTML = `<img src="${res.photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }

            document.getElementById('residentModal').classList.add('active');
        } else {
            alert('Error loading resident: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Failed to load resident data');
    });
};

window.archiveResident = (id) => {
    if (confirm("Are you sure you want to archive this resident? They will be moved out of the active list.")) {
        fetch('../php/archive_resident.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resident_id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Resident archived successfully');
                window.loadAndRenderResidents();
            } else {
                alert('Error archiving resident: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Failed to archive resident');
        });
    }
};

window.deleteResident = (id) => {
    if (confirm("Are you sure you want to permanently delete this resident? This action cannot be undone.")) {
        fetch('../php/delete_resident.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resident_id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Resident deleted successfully');
                window.loadAndRenderResidents();
            } else {
                alert('Error deleting resident: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Failed to delete resident');
        });
    }
};

window.loadAndRenderArchives = function() {
    fetch('../php/get_archived_residents.php')
    .then(response => response.json())
    .then(data => {
        const archivedResidentsVault = data.residents || [];
        const tableBody = document.querySelector('#archiveTable tbody');

        if (!tableBody) return;
        tableBody.innerHTML = '';

        archivedResidentsVault.forEach(archivedPerson => {
            const tableRow = document.createElement('tr');

            const profileDisplay = archivedPerson.photo
                ? `<img src="${archivedPerson.photo}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">`
                : `<div class="profile-pic pic-blue">${archivedPerson.firstName?.charAt(0)}${archivedPerson.lastName?.charAt(0)}</div>`;

            const displayAge = archivedPerson.birthday ? window.calculateAge(archivedPerson.birthday) : 'N/A';

            tableRow.innerHTML = `
                <td class="name-cell">
                    ${profileDisplay}
                    <span>${archivedPerson.fullName}</span>
                </td>
                <td>${displayAge}</td>
                <td>${archivedPerson.gender}</td>
                <td>${archivedPerson.civilStatus}</td>
                <td>${archivedPerson.houseNum} ${archivedPerson.address}</td>
                <td style="font-weight: 600; color: #800000;">${archivedPerson.archived_date ? new Date(archivedPerson.archived_date).toLocaleDateString() : 'Unknown'}</td>
                <td class="action-icons">
                    <i class="fas fa-undo-alt edit-icon" onclick="restoreResident(${archivedPerson.resident_id})" title="Restore to Active"></i>
                    <i class="fas fa-trash-alt delete-icon" onclick="permanentlyDeleteArchive(${archivedPerson.resident_id})" title="Delete Permanently"></i>
                </td>
            `;
            tableBody.appendChild(tableRow);
        });
    })
    .catch(err => {
        console.error('Error fetching archived residents:', err);
    });
};

window.restoreResident = function(targetId) {
    if (confirm("Restore this resident back to the active list?")) {
        fetch('../php/restore_resident.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resident_id: targetId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Resident restored successfully');
                window.loadAndRenderArchives();
            } else {
                alert('Error restoring resident: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Failed to restore resident');
        });
    }
};

window.permanentlyDeleteArchive = function(targetId) {
    if (confirm("WARNING: This will permanently delete the resident's record. This action cannot be undone.")) {
        fetch('../php/delete_resident.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resident_id: targetId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Resident permanently deleted');
                window.loadAndRenderArchives();
            } else {
                alert('Error deleting resident: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Failed to delete resident');
        });
    }
};