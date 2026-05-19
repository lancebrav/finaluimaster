/* DOCUMENT REQUESTS */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TAB SWITCHING LOGIC ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.request-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Tab clicked:", btn.textContent); // For debugging F12

            // Remove active state from all buttons and hide all sections
            tabBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => {
                s.classList.remove('active-section');
                s.classList.add('hidden-section');
            });

            // Add active state to the clicked button
            btn.classList.add('active');

            // Show the targeted section based on data-target attribute
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
        });
    });

    // --- 2. TABLE RENDERING LOGIC ---
    window.loadAndRenderDocumentRequests = function() {
        const ongoingBody = document.getElementById('ongoingRequestsBody');
        const approvedBody = document.getElementById('approvedRequestsBody');
        const rejectedBody = document.getElementById('rejectedRequestsBody');

        if (!ongoingBody || !approvedBody || !rejectedBody) return;

        let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];

        // Sort requests by date (Oldest first)
        requests.sort((a, b) => {
            const dateA = new Date(a.dateRequested).getTime();
            const dateB = new Date(b.dateRequested).getTime();
            
            // If the dates are exactly the same, use the ID as a tie-breaker
            if (dateA === dateB) {
                return a.id - b.id; 
            }
            
            return dateA - dateB;
        });

        ongoingBody.innerHTML = '';
        approvedBody.innerHTML = '';
        rejectedBody.innerHTML = '';

        requests.forEach(req => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', req.id);

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
                    <td><input type="checkbox" class="request-checkbox" data-id="${req.id}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-red">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${req.dateRequested}</td>
                    <td class="status-ready">READY</td>
                    
                    <td class="action-icons">
                        <button class="archive-icon" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
                    </td>
                `;
                approvedBody.appendChild(tr);
            } else if (req.status === 'Rejected') {
                tr.innerHTML = `
                    <td><input type="checkbox" class="request-checkbox" data-id="${req.id}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-purple">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${req.dateRequested}</td>
                    <td class="status-rejected">REJECTED</td>
                    
                    <td class="action-icons">
                        <button class="archive-icon" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
                    </td>
                `;
                rejectedBody.appendChild(tr);
            }
        });
    };

    // --- 3. MODAL POPULATION LOGIC ---
    window.viewDocDetails = function(id) {
        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        const req = requests.find(r => r.id == id);
        if (!req) return;

        // Ensure we fetch all necessary fields and apply them to the DOM elements
        const fields = [
            'residentFirstName', 'residentMiddleName', 'residentLastName',
            'residentSuffix', 'residentGender', 'residentNationality',
            'residentCivilStatus', 'residentBirthDate', 'residentPlaceOfBirth',
            'residentEmailAddress', 'residentContactNumber', 'residentVoterStatus',
            'residentPrecinctNumber', 'residentFullAddress', 'residentPurposeOfRequest'
        ];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                // If the field is empty or undefined, display 'N/A'
                el.textContent = req[field] && req[field].trim() !== '' ? req[field] : 'N/A';
            }
        });

        const modal = document.getElementById('docDetailsModal');
        if (modal) modal.classList.add('active');
    };

    // Initial render
    window.loadAndRenderDocumentRequests();

    // Modal Close
    const closeDocumentModalIcon = document.getElementById('closeDocModal');
    if (closeDocumentModalIcon) {
        closeDocumentModalIcon.addEventListener('click', () => {
            document.getElementById('docDetailsModal').classList.remove('active');
        });
    }

    // --- 4. APPROVE/REJECT ACTIONS ---
    const ongoingBody = document.getElementById('ongoingRequestsBody');
    if (ongoingBody) {
        ongoingBody.addEventListener('click', (event) => {
            const icon = event.target;
            const row = icon.closest('tr');
            if (!row) return;

            const id = row.getAttribute('data-id');

            if (icon.classList.contains('edit-icon')) {
                window.changeRequestStatus(id, 'Approved');
                window.loadAndRenderDocumentRequests();
            } else if (icon.classList.contains('delete-icon')) {
                window.changeRequestStatus(id, 'Rejected');
                window.loadAndRenderDocumentRequests();
            }
        });
    }

    // --- 5. BULK DELETE ACTIONS ---
    const deleteApprovedBtn = document.getElementById('deleteApprovedBtn');
    const deleteRejectedBtn = document.getElementById('deleteRejectedBtn');
    const selectApprovedAllBtn = document.getElementById('selectApprovedAllBtn');
    const selectRejectedAllBtn = document.getElementById('selectRejectedAllBtn');

    const toggleSectionSelection = (button, bodyId) => {
        const checkboxes = document.querySelectorAll(`#${bodyId} .request-checkbox`);
        const selectAll = button.dataset.selectAll === 'true';
        checkboxes.forEach(cb => cb.checked = selectAll);
        button.dataset.selectAll = selectAll ? 'false' : 'true';
        button.textContent = selectAll ? 'Clear Selection' : 'Select All';
    };

    const resetSelectionButtons = () => {
        [selectApprovedAllBtn, selectRejectedAllBtn].forEach(btn => {
            if (btn) {
                btn.dataset.selectAll = 'true';
                btn.textContent = 'Select All';
            }
        });
    };

    const deleteSelectedRequests = (status) => {
        const bodyId = status === 'Approved' ? 'approvedRequestsBody' : 'rejectedRequestsBody';
        const selectedIds = Array.from(document.querySelectorAll(`#${bodyId} .request-checkbox:checked`)).map(cb => cb.dataset.id);
        if (!selectedIds.length) {
            alert('Please select at least one row to delete.');
            return;
        }

        if (!confirm(`Delete ${selectedIds.length} selected ${status.toLowerCase()} request(s)?`)) {
            return;
        }

        let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        requests = requests.filter(req => !(selectedIds.includes(String(req.id)) && req.status === status));
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        window.loadAndRenderDocumentRequests();
        resetSelectionButtons();
    };

    if (selectApprovedAllBtn) selectApprovedAllBtn.addEventListener('click', () => toggleSectionSelection(selectApprovedAllBtn, 'approvedRequestsBody'));
    if (selectRejectedAllBtn) selectRejectedAllBtn.addEventListener('click', () => toggleSectionSelection(selectRejectedAllBtn, 'rejectedRequestsBody'));
    if (deleteApprovedBtn) deleteApprovedBtn.addEventListener('click', () => deleteSelectedRequests('Approved'));
    if (deleteRejectedBtn) deleteRejectedBtn.addEventListener('click', () => deleteSelectedRequests('Rejected'));
});

// Utility to change status globally
window.changeRequestStatus = function(requestId, newStatus) {
    let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    let index = requests.findIndex(req => req.id == requestId);

    if (index !== -1) {
        requests[index].status = newStatus;
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
    }
};