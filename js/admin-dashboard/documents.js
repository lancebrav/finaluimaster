/* DOCUMENT REQUESTS */

// Pagination State
const ROWS_PER_PAGE = 6;
let currentPages = {
    'Ongoing': 1,
    'Approved': 1,
    'Rejected': 1
};

// Helper function to ensure consistent date display format (M/D/YYYY)
function formatDateForDisplay(dateString) {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TAB SWITCHING LOGIC ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.request-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            tabBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => {
                s.classList.remove('active-section');
                s.classList.add('hidden-section');
            });

            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
        });
    });

    // --- 2. TABLE RENDERING WITH PAGINATION ---
    window.loadAndRenderDocumentRequests = function() {
        let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];

        requests.sort((a, b) => {
            const dateA = new Date(a.dateRequested).getTime();
            const dateB = new Date(b.dateRequested).getTime();
            
            if (dateA !== dateB) {
                return dateA - dateB; 
            }
            return parseInt(a.id) - parseInt(b.id);
        });

        const ongoingReqs = requests.filter(r => r.status === 'Ongoing');
        const approvedReqs = requests.filter(r => r.status === 'Approved');
        const rejectedReqs = requests.filter(r => r.status === 'Rejected');

        renderTableSection('Ongoing', ongoingReqs, 'ongoingRequestsBody', 'pageInfoOngoing', 'prevOngoing', 'nextOngoing');
        renderTableSection('Approved', approvedReqs, 'approvedRequestsBody', 'pageInfoApproved', 'prevApproved', 'nextApproved');
        renderTableSection('Rejected', rejectedReqs, 'rejectedRequestsBody', 'pageInfoRejected', 'prevRejected', 'nextRejected');
    };

    function renderTableSection(status, data, tbodyId, infoId, prevId, nextId) {
        const tbody = document.getElementById(tbodyId);
        const info = document.getElementById(infoId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);

        if (!tbody) return;

        const totalPages = Math.ceil(data.length / ROWS_PER_PAGE) || 1;
        
        if (currentPages[status] > totalPages) currentPages[status] = totalPages;
        if (currentPages[status] < 1) currentPages[status] = 1;

        const startIdx = (currentPages[status] - 1) * ROWS_PER_PAGE;
        const paginatedData = data.slice(startIdx, startIdx + ROWS_PER_PAGE);

        tbody.innerHTML = '';

        paginatedData.forEach(req => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', req.id);

            const initials = ((req.residentFirstName?.[0] || '') + (req.residentLastName?.[0] || '')).toUpperCase();
            const fullName = `${req.residentFirstName || ''} ${req.residentLastName || ''}`.trim();
            const displayDate = formatDateForDisplay(req.dateRequested); 

            let residencyBadge = '<span class="badge-non-resident" style="background:#f1f1f1; color:#555;">Unknown</span>';
            if (req.residentIsResident === 'Yes') {
                residencyBadge = '<span class="badge-resident">Resident</span>';
            } else if (req.residentIsResident === 'No') {
                residencyBadge = '<span class="badge-non-resident">Non-Resident</span>';
            }

            if (status === 'Ongoing') {
                tr.innerHTML = `
                    <td class="name-cell">
                        <div class="profile-pic pic-blue">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="action-icons">
                        <i class="fas fa-check-circle edit-icon" title="Approve"></i>
                        <i class="fas fa-times-circle delete-icon" title="Reject"></i>
                    </td>
                `;
            } else if (status === 'Approved') {
                tr.innerHTML = `
                    <td><input type="checkbox" class="request-checkbox" data-id="${req.id}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-red">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="status-ready">READY</td>
                    <td class="action-icons">
                        <button class="archive-icon" onclick="window.archiveRequest('${req.id}')" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
                    </td>
                `;
            } else if (status === 'Rejected') {
                tr.innerHTML = `
                    <td><input type="checkbox" class="request-checkbox" data-id="${req.id}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-purple">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${req.id})">${req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="status-rejected">REJECTED</td>
                    <td class="action-icons">
                        <button class="archive-icon" onclick="window.archiveRequest('${req.id}')" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
                    </td>
                `;
            }
            tbody.appendChild(tr);
        });

        if (info) info.textContent = `Page ${currentPages[status]} of ${totalPages}`;
        
        if (prevBtn) {
            prevBtn.disabled = currentPages[status] === 1;
            prevBtn.onclick = () => {
                if (currentPages[status] > 1) {
                    currentPages[status]--;
                    renderTableSection(status, data, tbodyId, infoId, prevId, nextId);
                }
            };
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentPages[status] === totalPages || totalPages === 0;
            nextBtn.onclick = () => {
                if (currentPages[status] < totalPages) {
                    currentPages[status]++;
                    renderTableSection(status, data, tbodyId, infoId, prevId, nextId);
                }
            };
        }
    }

    // --- 3. MODAL POPULATION LOGIC ---
    window.viewDocDetails = function(id) {
        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        const req = requests.find(r => r.id == id);
        if (!req) return;

        const fields = [
            'residentFirstName', 'residentMiddleName', 'residentLastName',
            'residentSuffix', 'residentGender', 'residentNationality',
            'residentCivilStatus', 'residentBirthDate', 'residentPlaceOfBirth',
            'residentEmailAddress', 'residentContactNumber', 'residentVoterStatus',
            'residentPhilSysNumber', 'residentHouseNo', 'residentStreet', 
            'residentPurposeOfRequest', 'residentIsResident'
        ];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                let rawValue = req[field];
                let value = rawValue && String(rawValue).trim() !== '' ? String(rawValue) : 'N/A';
                
                if (field === 'residentIsResident' && value !== 'N/A') {
                    if (value.toLowerCase() === 'yes') {
                        value = 'Resident';
                    } else if (value.toLowerCase() === 'no') {
                        value = 'Non-Resident';
                    }
                }

                el.textContent = value;
            }
        });

        const modal = document.getElementById('docDetailsModal');
        if (modal) modal.classList.add('active');
    };

    window.loadAndRenderDocumentRequests();

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

    // --- 5. BULK DELETE & ARCHIVE ACTIONS ---
    const deleteApprovedBtn = document.getElementById('deleteApprovedBtn');
    const deleteRejectedBtn = document.getElementById('deleteRejectedBtn');
    const archiveApprovedBtn = document.getElementById('archiveApprovedBtn');
    const archiveRejectedBtn = document.getElementById('archiveRejectedBtn');
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

        if (!confirm(`Permanently delete ${selectedIds.length} selected ${status.toLowerCase()} request(s)?`)) return;

        let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        requests = requests.filter(req => !(selectedIds.includes(String(req.id)) && req.status === status));
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        window.loadAndRenderDocumentRequests();
        resetSelectionButtons();
    };

    const archiveSelectedRequests = (status) => {
        const bodyId = status === 'Approved' ? 'approvedRequestsBody' : 'rejectedRequestsBody';
        const selectedIds = Array.from(document.querySelectorAll(`#${bodyId} .request-checkbox:checked`)).map(cb => cb.dataset.id);
        if (!selectedIds.length) {
            alert('Please select at least one row to archive.');
            return;
        }

        if (!confirm(`Archive ${selectedIds.length} selected ${status.toLowerCase()} request(s)?`)) return;

        let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        let archivedDocs = JSON.parse(localStorage.getItem('brgyArchivedDocuments')) || [];

        const toArchive = requests.filter(req => selectedIds.includes(String(req.id)) && req.status === status);
        toArchive.forEach(req => {
            req.dateArchived = new Date().toLocaleDateString();
            archivedDocs.push(req);
        });

        requests = requests.filter(req => !(selectedIds.includes(String(req.id)) && req.status === status));
        
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        localStorage.setItem('brgyArchivedDocuments', JSON.stringify(archivedDocs));
        window.loadAndRenderDocumentRequests();
        resetSelectionButtons();
    };

    if (selectApprovedAllBtn) selectApprovedAllBtn.addEventListener('click', () => toggleSectionSelection(selectApprovedAllBtn, 'approvedRequestsBody'));
    if (selectRejectedAllBtn) selectRejectedAllBtn.addEventListener('click', () => toggleSectionSelection(selectRejectedAllBtn, 'rejectedRequestsBody'));
    
    if (deleteApprovedBtn) deleteApprovedBtn.addEventListener('click', () => deleteSelectedRequests('Approved'));
    if (deleteRejectedBtn) deleteRejectedBtn.addEventListener('click', () => deleteSelectedRequests('Rejected'));

    if (archiveApprovedBtn) archiveApprovedBtn.addEventListener('click', () => archiveSelectedRequests('Approved'));
    if (archiveRejectedBtn) archiveRejectedBtn.addEventListener('click', () => archiveSelectedRequests('Rejected'));

    // --- 6. PRINT DROPDOWN LOGIC ---
    const printBtn = document.getElementById('printDropdownBtn');
    const printMenu = document.getElementById('printDropdownMenu');

    if (printBtn && printMenu) {
        printBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            printMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!printBtn.contains(e.target) && !printMenu.contains(e.target)) {
                printMenu.classList.remove('show');
            }
        });
    }
});

window.changeRequestStatus = function(requestId, newStatus) {
    let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    let index = requests.findIndex(req => req.id == requestId);

    if (index !== -1) {
        requests[index].status = newStatus;
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));

        const req = requests[index];
        const emailPayload = {
            email: req.residentEmailAddress,
            name: (req.residentFirstName + ' ' + (req.residentLastName || '')).trim(),
            docType: req.documentType,
            requestId: req.id
        };

        // Send approval email
        if (newStatus === 'Approved') {
            emailPayload.subject = req.documentType + ' - Approved for Pickup';
            emailPayload.action = 'approved';

            fetch('../php/send_submission_email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload)
            })
            .then(r => r.json())
            .catch(err => console.error('Email send error:', err));
        }
        // Send rejection email
        else if (newStatus === 'Rejected') {
            emailPayload.subject = req.documentType + ' - Request Rejected';
            emailPayload.action = 'rejected';

            fetch('../php/send_submission_email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload)
            })
            .then(r => r.json())
            .catch(err => console.error('Email send error:', err));
        }
    }
};

window.sendCustomEmail = function() {
    const customSubject = prompt('Enter email subject:');
    if (!customSubject) return;

    const customMessage = prompt('Enter email message/body:');
    if (!customMessage === null) return;

    const modal = document.getElementById('docDetailsModal');
    if (!modal) return;

    const emailEl = document.getElementById('residentEmailAddress');
    const nameFirstEl = document.getElementById('residentFirstName');
    const nameLastEl = document.getElementById('residentLastName');

    if (!emailEl || !nameFirstEl || !nameLastEl) {
        alert('Could not retrieve recipient email.');
        return;
    }

    const email = emailEl.textContent || '';
    const name = (nameFirstEl.textContent || '') + ' ' + (nameLastEl.textContent || '');

    if (!email || email === 'N/A') {
        alert('No valid email address found for this resident.');
        return;
    }

    const payload = {
        email: email,
        name: name.trim(),
        subject: customSubject,
        customBody: customMessage
    };

    fetch('../php/send_submission_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(result => {
        if (result.success) {
            alert('Custom email sent successfully!');
        } else {
            alert('Email failed: ' + (result.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Error sending custom email:', err);
        alert('Failed to send custom email');
    });
};

window.archiveRequest = function(id) {
    if (!confirm('Are you sure you want to archive this request?')) return;

    let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    let archivedDocs = JSON.parse(localStorage.getItem('brgyArchivedDocuments')) || [];

    const index = requests.findIndex(r => r.id == id);
    if (index !== -1) {
        const req = requests[index];
        req.dateArchived = new Date().toLocaleDateString();
        archivedDocs.push(req);
        
        requests.splice(index, 1);
        
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        localStorage.setItem('brgyArchivedDocuments', JSON.stringify(archivedDocs));
        
        window.loadAndRenderDocumentRequests();
    }
};

// ==========================================
// DOCXTEMPLATER - WORD DOC GENERATION ENGINE
// ==========================================

// Helper to append "st", "nd", "rd", "th" to the date
function getOrdinalSuffix(i) {
    let j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
}

// Helper to load binary files (your docx templates)
function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

window.printDocument = function(docType) {
    const printMenu = document.getElementById('printDropdownMenu');
    if (printMenu) printMenu.classList.remove('show');
    
    const selectedCheckboxes = document.querySelectorAll('#approvedRequestsBody .request-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Please check the box next to a resident to generate their document.');
        return;
    }
    
    if (selectedCheckboxes.length > 1) {
        alert('Please select only ONE resident at a time for document generation.');
        return;
    }
    
    const selectedId = selectedCheckboxes[0].dataset.id;
    const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    const req = requests.find(r => r.id == selectedId);
    
    if (!req) {
        alert('Could not locate resident data.');
        return;
    }

    let templatePath = '';
    let outputFileName = '';
    const safeLastName = (req.residentLastName || 'Resident').replace(/[^a-z0-9]/gi, '_');

    switch(docType) {
        case 'Barangay Clearance':
            templatePath = '../templates/clearance_template.docx';
            outputFileName = `${safeLastName}_Clearance.docx`;
            break;
        case 'Barangay Residency':
            templatePath = '../templates/residency_template.docx';
            outputFileName = `${safeLastName}_Residency.docx`;
            break;
        case 'Barangay Indigency':
            templatePath = '../templates/indigency_template.docx';
            outputFileName = `${safeLastName}_Indigency.docx`;
            break;
        case 'Barangay Certificate':
            templatePath = '../templates/certificate_template.docx';
            outputFileName = `${safeLastName}_Certificate.docx`;
            break;
        default:
            alert('Unknown document type.');
            return;
    }

    // Attempt to load and map the Word Template
    loadFile(templatePath, function(error, content) {
        if (error) {
            console.error("Error loading template:", error);
            alert("Could not load the document template. Ensure the template exists at: " + templatePath);
            return;
        }
        
        try {
            const zip = new PizZip(content);
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // Set up the formal date string format you requested
            const today = new Date();
            const dayWithSuffix = getOrdinalSuffix(today.getDate());
            const month = today.toLocaleString('default', { month: 'long' });
            const year = today.getFullYear();
            const formattedDate = `${dayWithSuffix} day of ${month} ${year}`;

            // Combine the house number and street into a single address string
            let combinedAddress = `${req.residentHouseNo || ''} ${req.residentStreet || ''}`.trim();
            if(combinedAddress === "") combinedAddress = "N/A";

            // Make sure these match the curly bracket tags { } in your Word Doc exactly!
            doc.render({
                firstName: req.residentFirstName || '',
                middleName: req.residentMiddleName || '',
                lastName: req.residentLastName || '',
                address: combinedAddress,
                purposeOfRequest: req.residentPurposeOfRequest || 'General Purpose',
                currentDate: formattedDate
            });

            const out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            
            // Automatically prompt the user to download the completed document
            saveAs(out, outputFileName);
            
            // Uncheck the box in the UI
            selectedCheckboxes[0].checked = false;

        } catch (error) {
            console.error("Error generating document:", error);
            alert("An error occurred while filling out the document.");
        }
    });
};