document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------
    // UTILITY: Image to Base64
    // -----------------------------------------
    const offPhotoInput = document.getElementById('offPhoto'); //grab file input element with id "offPhoto"
    const offImagePreview = document.getElementById('offImagePreview'); //grab preview container

    if (offPhotoInput && offImagePreview) {
        offPhotoInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const base64 = await getBase64(this.files[0]);
                offImagePreview.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        });
    }
    const resPhotoInput = document.getElementById('resPhoto');
    const imagePreview = document.getElementById('imagePreview');

    if (resPhotoInput && imagePreview) {
        resPhotoInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const base64 = await getBase64(this.files[0]);
                imagePreview.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            }
        });
    }

    // -----------------------------------------
    // 1. SIDEBAR & NAVIGATION
    // -----------------------------------------
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');

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

    // -----------------------------------------
    // 2. ANNOUNCEMENT LOGIC
    // -----------------------------------------
    window.displayEvents = function() {
        const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        
        const ongoingEvents = events.filter(event => event.type === 'ongoing');
        const upcomingEvents = events.filter(event => event.type === 'upcoming');
        
        const ongoingEventsList = document.getElementById('ongoingEventsList');
        const upcomingEventsList = document.getElementById('upcomingEventsList');
        
        // Helper function to create the fuller card DOM structure with listeners
        function createEventCard(event) {
            const card = document.createElement('div');
            card.className = 'event-card';

            const photoSrc = event.photo ? event.photo : 'https://via.placeholder.com/400x200?text=No+Photo';
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const detailsText = event.details || 'No additional details provided.';

            card.innerHTML = `
                <img src="${photoSrc}" alt="Event Picture" class="event-pic">
                <div class="event-content">
                    <div class="event-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-desc">${detailsText}</div>
                    
                    <div class="event-actions">
                        <div class="view-details">View Details <i class="fas fa-chevron-right"></i></div>
                        <div class="card-icons">
                            <i class="fas fa-pencil-alt edit-icon" title="Edit"></i>
                            <i class="fas fa-trash-alt delete-icon" title="Delete"></i>
                        </div>
                    </div>
                </div>
            `;

            // Make the delete button work
            const deleteBtn = card.querySelector('.delete-icon');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                    let currentEvents = JSON.parse(localStorage.getItem('brgyEvents')) || [];
                    currentEvents = currentEvents.filter(e => e.id !== event.id);
                    localStorage.setItem('brgyEvents', JSON.stringify(currentEvents));
                    displayEvents(); // Refresh the list
                }
            });

            const editBtn = card.querySelector('.edit-icon');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    window.editEvent(event.id);
                });
            }

            return card;
        }

        // Display Ongoing Events
        if (ongoingEventsList) {
            ongoingEventsList.innerHTML = '';
            ongoingEvents.forEach(event => {
                const card = createEventCard(event);
                ongoingEventsList.appendChild(card);
            });
        }
        
        // Display Upcoming Events
        if (upcomingEventsList) {
            upcomingEventsList.innerHTML = '';
            upcomingEvents.forEach(event => {
                const card = createEventCard(event);
                upcomingEventsList.appendChild(card);
            });
        }
    };

    // Initial display on page load
    if (document.getElementById('ongoingEventsList')) {
        displayEvents();
    }

    // -----------------------------------------
    // 3. RESIDENT MANAGEMENT 
    // -----------------------------------------
    const residentForm = document.getElementById('addResidentForm');

    if (residentForm) {
        residentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const photoInput = document.getElementById('resPhoto');
                const editId = document.getElementById('editResidentId').value;
                let photoBase64 = "";

                 if (photoInput && photoInput.files[0]) {
                    photoBase64 = await getBase64(photoInput.files[0]);
                } else if (editId) {
                    // For edit mode, keep existing photo if no new one uploaded
                    // We'll handle this server-side
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
                const computedAge = window.calculateAge(birthday);
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
                
                //decides whether form is adding or editing
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

    // -----------------------------------------
    // 4. MODAL TOGGLES & PAGINATION
    // -----------------------------------------
    const setupModal = (btnId, modalId, closeId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const close = document.getElementById(closeId);
        if (btn && modal) btn.onclick = () => modal.classList.add('active');
        if (close && modal) close.onclick = () => {
            modal.classList.remove('active');
            if(modalId === 'residentModal') {
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
        const residents = JSON.parse(localStorage.getItem('brgyResidents')) || [];
        if (window.currentPage * window.rowsPerPage < residents.length) { window.currentPage++; window.loadAndRenderResidents(); }
    });

    // -----------------------------------------
    // 5. SEARCH LOGIC
    // -----------------------------------------
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

    // -----------------------------------------
    // 6. DOCUMENT REQUESTS LOGIC (UPDATED)
    // -----------------------------------------
    
    // Function to draw the tables from the live database
    window.loadAndRenderDocumentRequests = function() {
        const ongoingBody = document.getElementById('ongoingRequestsBody');
        const approvedBody = document.getElementById('approvedRequestsBody');
        const rejectedBody = document.getElementById('rejectedRequestsBody');

        // If we aren't on the document requests page, exit safely
        if (!ongoingBody || !approvedBody || !rejectedBody) return;

        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];

        // Clear existing tables
        ongoingBody.innerHTML = '';
        approvedBody.innerHTML = '';
        rejectedBody.innerHTML = '';

        requests.forEach(req => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', req.id); // This is what makes the Approve/Reject buttons work!

            // Generate Initials (e.g., Juan Santos -> JS)
            const initials = ((req.residentFirstName?.[0] || '') + (req.residentLastName?.[0] || '')).toUpperCase();
            const fullName = `${req.residentFirstName || ''} ${req.residentLastName || ''}`.trim();

            if (req.status === 'Ongoing') {
                tr.innerHTML = `
                    <td class="name-cell">
                        <div class="profile-pic pic-blue">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${req.dateRequested}</td>
                    <td class="action-icons">
                        <i class="fas fa-check-circle edit-icon" title="Approve"></i>
                        <i class="fas fa-times-circle delete-icon" title="Reject"></i>
                    </td>
                `;
                ongoingBody.appendChild(tr);
            } else if (req.status === 'Approved') {
                tr.innerHTML = `
                    <td class="name-cell">
                        <div class="profile-pic pic-red">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${req.dateRequested}</td>
                    <td class="status-ready">READY</td>
                `;
                approvedBody.appendChild(tr);
            } else if (req.status === 'Rejected') {
                tr.innerHTML = `
                    <td class="name-cell">
                        <div class="profile-pic pic-purple">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${req.dateRequested}</td>
                    <td class="status-rejected">REJECTED</td>
                `;
                rejectedBody.appendChild(tr);
            }
        });
    };

    // Modal Pop-Up Logic (Finds the exact request by ID)
    window.viewDocDetails = function(id) {
        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        const req = requests.find(r => r.id == id);
        if(!req) return;

        const fields = ['residentFirstName', 'residentMiddleName', 'residentLastName', 'residentGender', 'residentBirthDate', 'residentEmailAddress', 'residentContactNumber', 'residentFullAddress', 'residentPurposeOfRequest'];
        
        fields.forEach(field => {
            const el = document.getElementById(field);
            if(el) el.textContent = req[field] || 'N/A';
        });

        const modal = document.getElementById('docDetailsModal');
        if(modal) modal.classList.add('active');
    };

    // Close Modal Button
    const closeDocumentModalIcon = document.getElementById('closeDocModal');
    if (closeDocumentModalIcon) {
        closeDocumentModalIcon.addEventListener('click', () => {
            document.getElementById('docDetailsModal').classList.remove('active');
        });
    }

    // Approve & Reject Button Clicks
    const ongoingBody = document.getElementById('ongoingRequestsBody');
    if (ongoingBody) {
        ongoingBody.addEventListener('click', (event) => {
            const icon = event.target;
            const row = icon.closest('tr');
            if(!row) return;

            const id = row.getAttribute('data-id');
            
            if (icon.classList.contains('edit-icon')) {
                window.changeRequestStatus(id, 'Approved');
                window.loadAndRenderDocumentRequests(); // Instantly redraws the tables!
            } else if (icon.classList.contains('delete-icon')) {
                window.changeRequestStatus(id, 'Rejected');
                window.loadAndRenderDocumentRequests(); // Instantly redraws the tables!
            }
        });
    }

    // -----------------------------------------
    // INITIAL PAGE LOADS (CRITICAL FOR ARCHIVES)
    // -----------------------------------------
    if (document.querySelector('#residentTable tbody')) {
        window.loadAndRenderResidents();
    }
    
    if (document.querySelector('#officerTable tbody')) {
        window.loadAndRenderOfficers();
    }

    if (document.querySelector('#archiveTable tbody')) {
        window.loadAndRenderArchives(); 
    }
    if (document.getElementById('ongoingRequestsBody')) {
        window.loadAndRenderDocumentRequests();
    }
});

window.calculateAge = function(birthdayString) {
    if (!birthdayString) return null;
    const today = new Date();
    const birthDate = new Date(birthdayString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Subtract 1 year if the current month is before the birth month, 
    // or if it's the birth month but the current day is before the birth day.
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/* =========================================
   GLOBAL FUNCTIONS & TABLE RENDERING
   ========================================= */

// --- RESIDENTS ---
window.currentPage = 1;
window.rowsPerPage = 8;


window.loadAndRenderResidents = function() {
    fetch('../php/get_residents.php') //load active resident from backend
    .then(response => response.json())
    .then(data => {
        let residents = data.residents || [];
        const tbody = document.querySelector('#residentTable tbody');
        if (!tbody) return;

        const searchInput = document.getElementById('residentSearch');
        if (searchInput && searchInput.value.trim() !== '') {
            const query = searchInput.value.toLowerCase();
            residents = residents.filter(res => {
                const searchableText = `${res.fullName} ${res.address} ${res.voterStatus} ${res.gender} ${res.houseNum}`.toLowerCase();
                return searchableText.includes(query);
            });
        }

        tbody.innerHTML = '';
        const start = (window.currentPage - 1) * window.rowsPerPage;
        const end = start + window.rowsPerPage;
        const paginatedItems = residents.slice(start, end);

        paginatedItems.forEach(res => {
            const row = document.createElement('tr');
            const displayAge = res.birthday ? window.calculateAge(res.birthday) : 'N/A';
            const profileDisplay = res.photo
                ? `<img src="${res.photo}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">`
                : `<div class="profile-pic pic-blue">${res.firstName?.charAt(0)}${res.lastName?.charAt(0)}</div>`;
            row.innerHTML = `
            <td>${res.resident_id || 'N/A'}</td>
            <td class="name-cell">
                ${profileDisplay}
                <span>${res.fullName || 'Unnamed'}</span>
            </td>
            <td>${res.birthday || 'N/A'}</td>
            <td>${res.gender || 'N/A'}</td>
            <td>${res.houseNum || 'N/A'}</td>
            <td>${res.streetName || 'N/A'}</td>
            <td>${res.address || 'N/A'}</td>
            <td>${res.placeOfBirth || 'N/A'}</td>
            <td>${res.civilStatus || 'N/A'}</td>
            <td style="font-weight:600; color:${res.voterStatus === 'Registered' ? '#27ae60' : '#e74c3c'}">${res.voterStatus || 'N/A'}</td>
            <td>${res.citizenship || 'Filipino'}</td>
            <td>${res.occupation || 'N/A'}</td>
            <td>${res.houseHeadRelationship || 'N/A'}</td>
            <td>${res.is_archived == 1 ? 'Yes' : 'No'}</td>
            <td>${res.archived_date ? new Date(res.archived_date).toLocaleDateString() : 'N/A'}</td>
            <td>${res.created_at ? new Date(res.created_at).toLocaleDateString() : 'N/A'}</td>
            <td>${res.updated_at ? new Date(res.updated_at).toLocaleDateString() : 'N/A'}</td>
            <td class="action-icons">
                <i class="fas fa-pencil-alt edit-icon" onclick="editResident(${res.resident_id})" title="Edit"></i>
                <i class="fas fa-archive archive-icon" onclick="archiveResident(${res.resident_id})" title="Archive"></i>
                <i class="fas fa-trash-alt delete-icon" onclick="deleteResident(${res.resident_id})" title="Delete"></i>
            </td>`;
            tbody.appendChild(row);
            /*row.innerHTML = `
            <td class="name-cell">
                ${profileDisplay}
                <span>${res.fullName || 'Unnamed'}</span>
            </td>
            <td>${displayAge}</td>
            <td>${res.gender}</td>
            <td>${res.civilStatus}</td>
            <td style="font-weight:600; color:${res.voterStatus === 'Registered' ? '#27ae60' : '#e74c3c'}">
                ${res.voterStatus}
            </td>
            <td>${res.houseNum} ${res.address}</td>
            <td class="action-icons">
                <i class="fas fa-pencil-alt edit-icon" onclick="editResident(${res.resident_id})" title="Edit"></i>
                <i class="fas fa-archive archive-icon" onclick="archiveResident(${res.resident_id})" title="Archive"></i>
                <i class="fas fa-trash-alt delete-icon" onclick="deleteResident(${res.resident_id})" title="Delete"></i>
            </td>`;
            tbody.appendChild(row);*/
        });
    });
};

// -----------------------------------------
// EXPORT ALL RESIDENTS TO EXCEL
// -----------------------------------------
window.exportResidentsToExcel = function() {
    fetch('../php/get_residents.php')
    .then(response => response.json())
    .then(data => {
        const residents = data.residents || [];

        if (residents.length === 0) {
            alert('No residents found to export.');
            return;
        }

        const headers = [
            'Last Name', 'First Name', 'Middle Name', 'Suffix',
            'House No.', 'Street Name', 'Address',
            'Place of Birth', 'Date of Birth', 'Age',
            'Sex', 'Civil Status', 'Citizenship',
            'Occupation', 'House Head Relationship',
            'Voter Status'
        ];

        const rows = residents.map(res => [
            res.lastName || '',
            res.firstName || '',
            res.middleName || '',
            res.suffix || '',
            res.houseNum || '',
            res.streetName || '',
            res.address || '',
            res.placeOfBirth || '',
            res.birthday || '',
            res.birthday ? window.calculateAge(res.birthday) : (res.age || ''),
            res.gender || '',
            res.civilStatus || '',
            res.citizenship || 'Filipino',
            res.occupation || '',
            res.houseHeadRelationship || '',
            res.voterStatus || ''
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Style header row (bold)
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
            const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ws[cellAddr]) {
                ws[cellAddr].s = { font: { bold: true } };
            }
        }

        // Auto column widths
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
    })
    .catch(err => {
        console.error('Export error:', err);
        alert('Failed to export residents. Please try again.');
    });
};

/*window.loadAndRenderResidents = function() {
    let residents = JSON.parse(localStorage.getItem('brgyResidents')) || [];
    const tbody = document.querySelector('#residentTable tbody');
    if (!tbody) return;

    const searchInput = document.getElementById('residentSearch');
    if (searchInput && searchInput.value.trim() !== '') {
        const query = searchInput.value.toLowerCase();
        residents = residents.filter(res => {
            const searchableText = `${res.fullName} ${res.address} ${res.voterStatus} ${res.gender} ${res.houseNum}`.toLowerCase();
            return searchableText.includes(query);
        });
    }

    tbody.innerHTML = ''; 
    const start = (window.currentPage - 1) * window.rowsPerPage;
    const end = start + window.rowsPerPage;
    
    // Now it only slices the *filtered* list!
    const paginatedItems = residents.slice(start, end);

    paginatedItems.forEach(res => {
        const row = document.createElement('tr');
        const displayAge = res.birthday ? window.calculateAge(res.birthday) : (res.age || 'N/A');
        const profileDisplay = res.photo 
            ? `<img src="${res.photo}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">`
            : `<div class="profile-pic pic-blue">${res.initials || '?'}</div>`;

        row.innerHTML = `
        <td class="name-cell">
            ${profileDisplay}
            <span>${res.fullName || 'Unnamed Resident'}</span>
        </td>
        <td>${displayAge}</td>
        <td>${res.gender}</td>
        <td>${res.civilStatus}</td>
        <td style="font-weight: 600; color: ${res.voterStatus === 'Registered' ? '#27ae60' : '#e74c3c'};">
            ${res.voterStatus || 'Unregistered'}
        </td>
        <td>${res.houseNum} ${res.address}</td>
        <td class="action-icons">
            <i class="fas fa-pencil-alt edit-icon" onclick="editResident(${res.id})" title="Edit"></i>
            <i class="fas fa-archive archive-icon" onclick="archiveResident(${res.id})" title="Archive"></i>
            <i class="fas fa-trash-alt delete-icon" onclick="deleteResident(${res.id})" title="Delete"></i>
        </td>
    `;
        tbody.appendChild(row);
    });

    const info = document.querySelector('.page-info');
    if (info) {
        const total = residents.length;
        const currentRange = total === 0 ? "0" : `${start + 1}-${Math.min(end, total)}`;
        info.innerText = `Showing ${currentRange} of ${total} Residents`;
    }
}*/
//edit resident function, pre-fills the form with existing data and opens the modal
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
        fetch('../php/delete_resident.php', { //delete resident, calls delete_resident.php
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

// --- ARCHIVES ---, loads archived residents / view 
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
        fetch('../php/restore_resident.php', { //restore resident and calls restorephp
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

// --- EVENTS ---
window.displayEvents = function() {
    const ongoing = document.getElementById('ongoingEventsList');
    const upcoming = document.getElementById('upcomingEventsList');
    if (!ongoing) return;

    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    ongoing.innerHTML = ''; upcoming.innerHTML = '';

    events.forEach(event => {
        const html = `
            <div class="event-card">
                <div class="event-info">
                    <strong>${event.title}</strong>
                    <span><i class="far fa-calendar-alt"></i> ${event.date}</span>
                </div>
                <i class="fas fa-trash-alt delete-icon" onclick="deleteEvent(${event.id})"></i>
            </div>`;
        if (event.type === 'ongoing') ongoing.innerHTML += html;
        else upcoming.innerHTML += html;
    });
}

window.deleteEvent = (id) => {
    if (confirm("Delete announcement?")) {
        let evs = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        localStorage.setItem('brgyEvents', JSON.stringify(evs.filter(e => e.id !== id)));
        window.displayEvents();
    }
};

// --- OFFICERS ---
window.loadAndRenderOfficers = function() {
    const tbody = document.querySelector('#officerTable tbody');
    if (!tbody) return; 

    const officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
    tbody.innerHTML = ''; 

    officers.forEach(off => {
        const initials = off.name.substring(0,2).toUpperCase();
        
        // Live age calculation
        const displayAge = off.birthday ? window.calculateAge(off.birthday) : (off.age || 'N/A');

        const profileDisplay = off.photo 
            ? `<img src="${off.photo}" style="width:35px; height:35px; border-radius:50%; object-fit:cover; border: 1px solid #ddd;">`
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
                <i class="fas fa-pencil-alt edit-icon" onclick="window.editOfficer(${off.id})"></i>
                <i class="fas fa-trash-alt delete-icon" onclick="window.deleteOfficer(${off.id})"></i>
            </td>
        `;
        tbody.appendChild(row);
    });
}

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

        const photoInput = document.getElementById('offPhoto');
        let photoBase64 = "";

        if (photoInput && photoInput.files[0]) {
            photoBase64 = await getBase64(photoInput.files[0]);
        } else if (editId) {
            const officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
            const existingOff = officers.find(o => o.id == editId);
            photoBase64 = existingOff ? existingOff.photo : "";
        }

        let officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];

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

window.deleteOfficer = function(id) {
    if (confirm("Remove this officer from the list?")) {
        let officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
        const filtered = officers.filter(o => o.id != id);
        localStorage.setItem('brgyOfficers', JSON.stringify(filtered));
        window.loadAndRenderOfficers();
    }
};

// -----------------------------------------
// UTILITY FUNCTION
// -----------------------------------------
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.addEventListener('DOMContentLoaded', () => {



    //display and calculate dashboard stats, like total residents
    function updateDashboardStats() {
        //find the specific summary number elements by ID
        const totalResidentsEl = document.getElementById('countTotalResidents');
        const totalMaleEl = document.getElementById('countTotalMale');
        const totalFemaleEl = document.getElementById('countTotalFemale');

        //safety check to ensure we are on the dashboard page
        if (!totalResidentsEl || !totalMaleEl || !totalFemaleEl) return;

        //retrieve the current resident list from LocalStorage
        const residents = JSON.parse(localStorage.getItem('brgyResidents')) || [];

        //calculate the base counts
        const totalCount = residents.length;
        const maleCount = residents.filter(res => res.gender === 'M').length;
        const femaleCount = residents.filter(res => res.gender === 'F').length;


        //inject the calculated numbers back into the HTML
        totalResidentsEl.textContent = totalCount;
        totalMaleEl.textContent = maleCount;
        totalFemaleEl.textContent = femaleCount;
    }

    //call this function once right away when the page loads
    updateDashboardStats();

    //add more code here if needed for other dashboard functionalities, like charts or recent activity lists
});

//dashboard logic, fetches resident data and calculates statistics for the dashboard charts and cards

document.addEventListener('DOMContentLoaded', () => {
    //Check if we are on the dashboard page
    if (document.querySelector('.stats-overview')) {
        updateDashboard();
    }
});

function updateDashboard() {
    fetch('../php/get_residents.php')
    .then(response => response.json())
    .then(data => {
        const residents = data.residents || [];
        
        //calc stats
        const total = residents.length;
        const males = residents.filter(r => r.gender === 'M').length;
        const females = residents.filter(r => r.gender === 'F').length;
        const voters = residents.filter(r => r.voterStatus === 'Registered').length;

        //update card values
        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
        if (document.getElementById('stat-male')) document.getElementById('stat-male').innerText = males;
        if (document.getElementById('stat-female')) document.getElementById('stat-female').innerText = females;
        if (document.getElementById('stat-voters')) document.getElementById('stat-voters').innerText = voters;

        //initialize charts
        renderGenderPieChart(males, females);
        renderAgeLineChart(residents);
    })
    .catch(err => {
        console.error('Error fetching residents:', err);
    });
}

//pie male vs female gender distribution
function renderGenderPieChart(males, females) {
    const ctx = document.getElementById('genderPieChart').getContext('2d');
    
    // Destroy existing chart instance if it exists to prevent overlap
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

// LINE GRAPH: Age Distribution (Grouped by Decades)
function renderAgeLineChart(residents) {
    const ctx = document.getElementById('ageLineChart').getContext('2d');
    
    //Group ages: 0-10, 11-20, 21-30, etc.
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
//announcement and edit logic
document.addEventListener('DOMContentLoaded', () => {
    
    //upload button logic
    const eventPhotoInput = document.getElementById('eventPhotoInput');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const loadedPhoto = document.getElementById('loadedPhoto');
    const defaultIcon = document.querySelector('.default-photo-icon');
    const placeholderText = document.querySelector('.placeholder-text');

    if (uploadPhotoBtn && eventPhotoInput) {
        uploadPhotoBtn.addEventListener('click', () => eventPhotoInput.click());
        
        eventPhotoInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                const base64 = await window.getBase64(this.files[0]);
                if (loadedPhoto) {
                    loadedPhoto.src = base64;
                    loadedPhoto.style.display = 'block';
                    if(defaultIcon) defaultIcon.style.display = 'none';
                    if(placeholderText) placeholderText.style.display = 'none';
                }
            }
        });
    }

    //add/edit form logic
    const eventForm = document.getElementById('addEventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('editEventId')?.value;
            const title = document.getElementById('eventTitle').value;
            const details = document.getElementById('eventDetails').value;
            const type = document.getElementById('eventType').value;
            const date = document.getElementById('eventDate').value;
            
            let photoBase64 = "";

            if (eventPhotoInput && eventPhotoInput.files[0]) {
                photoBase64 = await window.getBase64(eventPhotoInput.files[0]);
            } else if (editId) {
                const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
                const existingEv = events.find(ev => ev.id == editId);
                photoBase64 = existingEv ? existingEv.photo : "";
            }

            let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];

            if (editId) {
                const index = events.findIndex(ev => ev.id == editId);
                if (index !== -1) {
                    events[index] = { ...events[index], title, details, type, date, photo: photoBase64 };
                }
            } else {
                events.push({ id: Date.now(), title, details, type, date, photo: photoBase64 });
            }

            localStorage.setItem('brgyEvents', JSON.stringify(events));
            
            eventForm.reset();
            if(document.getElementById('editEventId')) document.getElementById('editEventId').value = "";
            
            // Reset photo preview back to placeholder
            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';

            const titleEl = document.querySelector('#eventModal .modal-header h3');
            if (titleEl) titleEl.innerText = "Create New Announcement";

            document.getElementById('eventModal').classList.remove('active');
            if(typeof window.displayEvents === 'function') window.displayEvents(); 
        });
    }
});

//edit event function, pre-fills the form with existing data and opens the modal
window.editEvent = function(id) {
    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    const ev = events.find(e => e.id == id);
    
    if (ev) {
        const editIdInput = document.getElementById('editEventId');
        if(editIdInput) editIdInput.value = ev.id;
        
        document.getElementById('eventTitle').value = ev.title || '';
        document.getElementById('eventDetails').value = ev.details || '';
        document.getElementById('eventType').value = ev.type || 'upcoming';
        document.getElementById('eventDate').value = ev.date || '';
        
        //show if exists if it has one
        const loadedPhoto = document.getElementById('loadedPhoto');
        const defaultIcon = document.querySelector('.default-photo-icon');
        const placeholderText = document.querySelector('.placeholder-text');
        
        if (loadedPhoto && ev.photo) {
            loadedPhoto.src = ev.photo;
            loadedPhoto.style.display = 'block';
            if(defaultIcon) defaultIcon.style.display = 'none';
            if(placeholderText) placeholderText.style.display = 'none';
        } else {
            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';
        }
        
        //change to editing title
        const titleEl = document.querySelector('#eventModal .modal-header h3');
        if (titleEl) titleEl.innerText = "Edit Announcement Details";
        
        document.getElementById('eventModal').classList.add('active');
    }
};
// ==========================================
// PERMANENTLY SAVE DOCUMENT REQUEST STATUS
// ==========================================
window.changeRequestStatus = function(requestId, newStatus) {
    let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    let index = requests.findIndex(req => req.id == requestId);
    
    if (index !== -1) {
        requests[index].status = newStatus;
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        console.log(`Saved: Request ${requestId} is now ${newStatus}`);
    }
};