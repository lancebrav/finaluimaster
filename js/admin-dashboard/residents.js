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
                const editId = document.getElementById('editResidentId').value;
                const confirmed = confirm(editId ?
                    'Are you sure you want to save changes to this resident?' :
                    'Are you sure you want to add this resident to the list?');
                if (!confirmed) return;

                const photoInput = document.getElementById('resPhoto');
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

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(residentData)
                });

                const data = await window.parseJsonResponse(response, endpoint);

                if (data.success) {
                    residentForm.reset();
                    const previewEl = document.getElementById('imagePreview');
                    if (previewEl) {
                        previewEl.innerHTML = "?";
                    }
                    document.getElementById('editResidentId').value = "";
                    document.getElementById('modalTitle').innerText = "Register Resident";
                    document.getElementById('residentModal').classList.remove('active');
                    window.loadAndRenderResidents();
                } else {
                    alert('Error saving resident: ' + data.message);
                }

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

    // === UPDATED PAGINATION EVENT LISTENERS ===
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (window.currentPage > 1) { 
            window.currentPage--; 
            window.loadAndRenderResidents(); 
        }
    });

    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        const totalResidents = typeof window.filteredResidentsTotal === 'number'
            ? window.filteredResidentsTotal
            : (window.cachedResidents || []).length;
        const totalPages = Math.ceil(totalResidents / window.rowsPerPage) || 1;
        if (window.currentPage < totalPages) {
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

    // Dynamic Search across all tabs in Archives
    const archiveSearchInput = document.getElementById('archiveSearch');
    if (archiveSearchInput) {
        archiveSearchInput.addEventListener('keyup', () => {
            const query = archiveSearchInput.value.toLowerCase();
            const activeSection = document.querySelector('.request-section.active-section');
            if (activeSection) {
                const rows = activeSection.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
                });
            }
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

    if (document.querySelector('#archiveResidentsTable tbody')) {
        window.loadAndRenderArchives();
    }

    if (document.getElementById('ongoingRequestsBody') && typeof window.loadAndRenderDocumentRequests === 'function') {
        window.loadAndRenderDocumentRequests();
    }
});

window.currentPage = 1;
window.rowsPerPage = 10;
window.cachedResidents = [];
window.residentMapById = {};
window.familyMembersByKey = {};
window.filteredResidentsTotal = 0;
window.residentFilters = { field: '', values: [], ageMin: '', ageMax: '' };
window.selectedColumns = ['fullName', 'houseNum', 'streetName', 'familyGroup', 'householdHeadName', 'birthday', 'gender', 'age', 'status'];

window.escapeHtml = function(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

window.ensureFamilyDetailsModal = function() {
    if (document.getElementById('familyDetailsModal')) return;

    const modal = document.createElement('div');
    modal.id = 'familyDetailsModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="event-form-modal" style="max-width: 780px; width: min(92vw, 780px);">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 id="familyModalTitle">Family Details</h3>
                <i class="fas fa-times close-modal" id="closeFamilyModal" style="cursor:pointer;"></i>
            </div>
            <div style="padding: 16px 6px 6px;">
                <div id="familyModalSummary" style="margin-bottom: 12px; color:#334; font-size:0.95rem;"></div>
                <div style="overflow-x:auto;">
                    <table class="resident-table" style="min-width: 640px;">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Relationship</th>
                                <th>Household Head</th>
                                <th>Age</th>
                            </tr>
                        </thead>
                        <tbody id="familyModalBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeFamilyModal')?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
};

window.showFamilyDetailsModalForResident = function(residentId) {
    window.ensureFamilyDetailsModal();

    const resident = window.residentMapById[String(residentId)];
    if (!resident) {
        alert('Resident details not found for family mapping.');
        return;
    }

    const familyKey = resident.familyKey;
    const familyMembers = window.familyMembersByKey[familyKey] || [resident];
    const headName = resident.householdHeadName || 'Not set';

    const title = document.getElementById('familyModalTitle');
    const summary = document.getElementById('familyModalSummary');
    const tbody = document.getElementById('familyModalBody');

    if (!title || !summary || !tbody) return;

    title.textContent = `Family Details: ${resident.familyGroup || 'Household'}`;
    summary.innerHTML = `
        <strong>Household Head:</strong> ${window.escapeHtml(headName)}
        &nbsp;|&nbsp;
        <strong>Total Members:</strong> ${familyMembers.length}
    `;

    tbody.innerHTML = familyMembers.map(member => {
        const relation = member.houseHeadRelationship || (window.isHouseholdHead(member) ? 'Head' : 'Member');
        const age = member.birthday ? window.calculateAge(member.birthday) : 'N/A';
        const isSelected = String(member.resident_id) === String(residentId);
        return `
            <tr style="${isSelected ? 'background:#f1f6ff;' : ''}">
                <td style="font-weight:${isSelected ? '700' : '600'};">${window.escapeHtml(member.fullName || '')}</td>
                <td>${window.escapeHtml(relation)}</td>
                <td>${window.escapeHtml(headName)}</td>
                <td>${window.escapeHtml(age)}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('familyDetailsModal')?.classList.add('active');
};

window.setupResidentRowClick = function() {
    const tbody = document.querySelector('#residentTable tbody');
    if (!tbody || tbody.dataset.familyClickBound === '1') return;

    tbody.dataset.familyClickBound = '1';
    tbody.addEventListener('click', (e) => {
        if (e.target.closest('.action-icons') || e.target.closest('.resident-checkbox')) {
            return;
        }

        const row = e.target.closest('tr[data-resident-id]');
        if (!row) return;

        const residentId = row.dataset.residentId;
        if (residentId) {
            window.showFamilyDetailsModalForResident(residentId);
        }
    });
};

window.parseJsonResponse = async function(response, endpoint) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        const preview = text.slice(0, 180).replace(/\s+/g, ' ').trim();
        throw new Error(`Invalid JSON from ${endpoint}. Response starts with: ${preview || '[empty response]'}`);
    }
};

window.normalizeFamilyText = function(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

window.isHouseholdHead = function(resident) {
    const relation = String(resident.houseHeadRelationship || '').toLowerCase().trim();
    return relation === 'head' || relation === 'household head' || relation === 'self';
};

window.buildFamilyMappings = function(residents) {
    const groups = new Map();

    residents.forEach((resident, index) => {
        const houseNum = String(resident.houseNum || '').trim();
        const street = String(resident.streetName || '').trim();
        const address = String(resident.address || '').trim();
        const fallback = `resident-${resident.resident_id || index}`;
        const rawKey = (houseNum || street)
            ? `${window.normalizeFamilyText(houseNum)}|${window.normalizeFamilyText(street)}`
            : window.normalizeFamilyText(address) || fallback;

        if (!groups.has(rawKey)) {
            groups.set(rawKey, []);
        }
        groups.get(rawKey).push(resident);
    });

    const enriched = [];
    const familyMembersByKey = {};
    const residentMapById = {};

    groups.forEach((members, key) => {
        const explicitHeads = members.filter(window.isHouseholdHead);
        let head = explicitHeads[0];

        if (!head) {
            const sortable = [...members].sort((a, b) => {
                const aDate = a.birthday ? new Date(a.birthday).getTime() : Number.POSITIVE_INFINITY;
                const bDate = b.birthday ? new Date(b.birthday).getTime() : Number.POSITIVE_INFINITY;
                return aDate - bDate;
            });
            head = sortable[0] || members[0];
        }

        const headName = head?.fullName || 'Not set';
        const familyLabel = members.length > 1 ? `Family ${key.slice(0, 8).toUpperCase()}` : 'Single-member household';

        familyMembersByKey[key] = members.map(m => ({ ...m }));

        members.forEach(member => {
            const relatives = members
                .filter(m => String(m.resident_id) !== String(member.resident_id))
                .map(m => m.fullName)
                .filter(Boolean);

            const enrichedMember = {
                ...member,
                familyKey: key,
                familyGroup: familyLabel,
                householdHeadName: headName,
                familySize: members.length,
                relatives: relatives.length ? relatives.join(', ') : 'No linked relatives'
            };

            enriched.push(enrichedMember);
            residentMapById[String(member.resident_id)] = enrichedMember;
        });
    });

    window.familyMembersByKey = familyMembersByKey;
    window.residentMapById = residentMapById;

    return enriched;
};

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
        'householdHeadName': 'Household Head',
        'familyGroup': 'Family Group',
        'relatives': 'Relatives',
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
        case 'householdHeadName':
            return res.householdHeadName || 'Not set';
        case 'familyGroup':
            return res.familyGroup || 'Unmapped';
        case 'relatives':
            return res.relatives || 'No linked relatives';
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
        <i class="fas fa-pencil-alt edit-icon" onclick="editResident(${res.resident_id})" title="Edit" style="cursor:pointer; color:#1a1a4b;"></i>
        <i class="fas fa-archive archive-icon" onclick="archiveResident(${res.resident_id})" title="Archive" style="cursor:pointer; color:#f39c12;"></i>
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
    .then(response => window.parseJsonResponse(response, '../php/get_residents.php'))
    .then(data => {
        let residents = window.buildFamilyMappings(data.residents || []);
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
                const searchableText = `${res.fullName} ${res.address} ${res.voterStatus} ${res.gender} ${res.houseNum} ${res.familyGroup} ${res.householdHeadName} ${res.relatives}`.toLowerCase();
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
            row.setAttribute('data-resident-id', String(res.resident_id));
            row.style.cursor = 'pointer';
            const itemSequentialNumber = start + index + 1;
            row.innerHTML = window.buildResidentRowHTML(res, itemSequentialNumber);
            tbody.appendChild(row);
        });

        window.setupResidentRowClick();

        const totalPages = Math.ceil(window.filteredResidentsTotal / window.rowsPerPage) || 1;
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${window.currentPage} of ${totalPages}`;
        }
        
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        if (prevBtn) prevBtn.disabled = (window.currentPage === 1);
        if (nextBtn) nextBtn.disabled = (window.currentPage === totalPages || totalPages === 0);
    })
    .catch(err => {
        console.error('Error loading residents:', err);
        alert('Unable to load residents list: ' + err.message);
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
    if (!confirm('Open resident editor for this record?')) return;
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

            const previewEl = document.getElementById('imagePreview');
            if (res.photo && previewEl) {
                previewEl.innerHTML = `<img src="${res.photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
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


// --- NEW GLOBAL STATE FOR ARCHIVE PAGINATION ---
window.archiveCurrentPage = 1;
window.archiveRowsPerPage = 8;
window.cachedArchivedResidents = [];

/* ==========================================================
   UPDATED: ARCHIVES RENDER FUNCTION (WITH PAGINATION)
   ========================================================== */
window.loadAndRenderArchives = function() {
    fetch('../php/get_archived_residents.php')
    .then(response => response.json())
    .then(data => {
        window.cachedArchivedResidents = data.residents || [];
        window.archiveCurrentPage = 1; // Reset to page 1 on load
        renderArchivedTable();
    })
    .catch(err => {
        console.error('Error fetching archived residents:', err);
    });
};

window.renderArchivedTable = function() {
    const tableBody = document.querySelector('#archiveResidentsTable tbody');
    if (!tableBody) return;

    // Pagination slicing
    const start = (window.archiveCurrentPage - 1) * window.archiveRowsPerPage;
    const end = start + window.archiveRowsPerPage;
    const paginatedItems = window.cachedArchivedResidents.slice(start, end);

    tableBody.innerHTML = '';

    if (window.cachedArchivedResidents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: #7f8c8d; font-weight: 600;">No archived residents found.</td></tr>`;
        return;
    }

    paginatedItems.forEach((archivedPerson, index) => {
        const tableRow = document.createElement('tr');
        const displayAge = archivedPerson.birthday ? window.calculateAge(archivedPerson.birthday) : 'N/A';
        const displayDate = archivedPerson.archived_date ? new Date(archivedPerson.archived_date).toLocaleDateString() : 'Unknown';

        tableRow.innerHTML = `
            <td style="text-align: center; font-weight: bold; color: #7f8c8d;">${start + index + 1}</td>
            <td class="name-cell">${archivedPerson.fullName}</td>
            <td style="text-align: center;">${displayAge}</td>
            <td style="text-align: center;">${archivedPerson.gender}</td>
            <td style="text-align: center;">${archivedPerson.civilStatus}</td>
            <td>${archivedPerson.houseNum} ${archivedPerson.address}</td>
            <td style="font-weight: 600; color: #a93226; text-align: center;">${displayDate}</td>
            <td class="action-icons" style="text-align: center;">
                <i class="fas fa-undo edit-icon" onclick="restoreResident(${archivedPerson.resident_id})" title="Restore to Active List" style="cursor: pointer; color: #1a1a4b; font-size: 1.1rem;"></i>
            </td>
        `;
        tableBody.appendChild(tableRow);
    });

    // Update Page Info
    const totalPages = Math.ceil(window.cachedArchivedResidents.length / window.archiveRowsPerPage) || 1;
    const pageInfo = document.getElementById('archivePageInfo');
    if (pageInfo) pageInfo.textContent = `Page ${window.archiveCurrentPage} of ${totalPages}`;
};

window.restoreResident = function(id) {
    if (!confirm('Restore this resident to the active list?')) return;

    fetch('../php/restore_resident.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resident_id: id })
    })
    .then(response => window.parseJsonResponse(response, '../php/restore_resident.php'))
    .then(data => {
        if (data.success) {
            alert('Resident restored successfully');
            // refresh both archived and active lists
            if (typeof window.loadAndRenderArchives === 'function') window.loadAndRenderArchives();
            if (typeof window.loadAndRenderResidents === 'function') window.loadAndRenderResidents();
        } else {
            alert('Error restoring resident: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Error restoring resident:', err);
        alert('Failed to restore resident: ' + err.message);
    });
};