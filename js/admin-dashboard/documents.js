/* DOCUMENT REQUESTS */

const ROWS_PER_PAGE = 6;
let currentPages = {
    Ongoing: 1,
    Approved: 1,
    Rejected: 1
};

let cachedDocumentRequests = [];

function formatGenderDisplay(gender) {
    const g = String(gender || '').trim().toUpperCase();
    if (g === 'M') return 'Male';
    if (g === 'F') return 'Female';
    return gender || 'N/A';
}

function getRequestResidentName(req) {
    const first = req.firstName || req.residentFirstName || '';
    const last = req.lastName || req.residentLastName || '';
    if (req.fullName && String(req.fullName).trim() !== '') {
        return String(req.fullName).trim();
    }
    return `${first} ${last}`.trim();
}

function getRequestResidentInitials(req) {
    const first = req.firstName || req.residentFirstName || '';
    const last = req.lastName || req.residentLastName || '';
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

function getRequestResidencyBadge(req) {
    if (req.resident_id) {
        return '<span class="badge-resident">Resident</span>';
    }
    return '<span class="badge-non-resident" style="background:#f1f1f1; color:#555;">Unknown</span>';
}

function getRequestDetailValues(req) {
    return {
        residentFirstName: req.firstName || req.residentFirstName || 'N/A',
        residentMiddleName: req.middleName || req.residentMiddleName || 'N/A',
        residentLastName: req.lastName || req.residentLastName || 'N/A',
        residentSuffix: req.suffix || req.residentSuffix || 'N/A',
        residentGender: formatGenderDisplay(req.gender || req.residentGender),
        residentNationality: req.citizenship || req.residentNationality || 'N/A',
        residentCivilStatus: req.civilStatus || req.residentCivilStatus || 'N/A',
        residentBirthDate: req.birthday || req.residentBirthDate || 'N/A',
        residentPlaceOfBirth: req.placeOfBirth || req.residentPlaceOfBirth || 'N/A',
        residentEmailAddress: req.notification_email || req.residentEmailAddress || 'N/A',
        residentContactNumber: req.contact_number || req.residentContactNumber || 'N/A',
        residentVoterStatus: req.voterStatus || req.residentVoterStatus || 'N/A',
        residentPhilSysNumber: req.residentPhilSysNumber || 'N/A',
        residentHouseNo: req.houseNum || req.residentHouseNo || 'N/A',
        residentStreet: req.streetName || req.residentStreet || 'N/A',
        residentPurposeOfRequest: req.purpose_of_request || req.residentPurposeOfRequest || 'N/A',
        residentIsResident: req.resident_id ? 'Resident' : 'N/A'
    };
}

function formatDateForDisplay(dateString) {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

async function fetchDocumentRequests() {
    try {
        const response = await fetch('../php/get_document_requests.php');
        const data = await response.json();
        cachedDocumentRequests = Array.isArray(data.requests) ? data.requests : [];
    } catch (err) {
        console.error('Error fetching document requests:', err);
        cachedDocumentRequests = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

    window.loadAndRenderDocumentRequests = async function() {
        await fetchDocumentRequests();

        const requests = cachedDocumentRequests.slice();
        requests.sort((a, b) => {
            const dateA = new Date(a.date_requested || a.dateRequested || '').getTime();
            const dateB = new Date(b.date_requested || b.dateRequested || '').getTime();
            if (dateA !== dateB) return dateA - dateB;
            return parseInt(a.request_id || a.id || 0, 10) - parseInt(b.request_id || b.id || 0, 10);
        });

        const ongoingReqs = requests.filter(r => (r.request_status || r.status) === 'Ongoing');
        const approvedReqs = requests.filter(r => (r.request_status || r.status) === 'Approved');
        const rejectedReqs = requests.filter(r => (r.request_status || r.status) === 'Rejected');

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
            const requestId = req.request_id || req.id;
            tr.setAttribute('data-id', requestId);

            const initials = getRequestResidentInitials(req);
            const fullName = getRequestResidentName(req);
            const displayDate = formatDateForDisplay(req.date_requested || req.dateRequested);
            const residencyBadge = getRequestResidencyBadge(req);

            if (status === 'Ongoing') {
                tr.innerHTML = `
                    <td class="name-cell">
                        <div class="profile-pic pic-blue">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${requestId})">${req.document_type || req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="action-icons">
                        <i class="fas fa-check-circle edit-icon" title="Approve"></i>
                        <i class="fas fa-times-circle delete-icon" title="Reject"></i>
                    </td>
                `;
            } else if (status === 'Approved') {
                tr.innerHTML = `
                    <td><input type="checkbox" class="request-checkbox" data-id="${requestId}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-red">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${requestId})">${req.document_type || req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="status-ready">READY</td>
                    <td class="action-icons">
                        <button class="archive-icon" onclick="window.archiveRequest('${requestId}')" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
                    </td>
                `;
            } else if (status === 'Rejected') {
                tr.innerHTML = `
                    <td><input type="checkbox" class="request-checkbox" data-id="${requestId}"></td>
                    <td class="name-cell">
                        <div class="profile-pic pic-purple">${initials || '?'}</div>
                        <span>${fullName || 'Unknown'}</span>
                    </td>
                    <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${requestId})">${req.document_type || req.documentType}</a></td>
                    <td>${displayDate}</td>
                    <td>${residencyBadge}</td>
                    <td class="status-rejected">REJECTED</td>
                    <td class="action-icons">
                        <button class="archive-icon" onclick="window.archiveRequest('${requestId}')" title="Archive" style="background: #070e50; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Archive</button>
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

    window.viewDocDetails = function(id) {
        const req = cachedDocumentRequests.find(r => String(r.request_id || r.id) === String(id));
        if (!req) return;

        const photoEl = document.getElementById('residentSubmittedPhoto');
        const idEl = document.getElementById('residentSubmittedId');
        const fallbackPhoto = photoEl ? photoEl.getAttribute('src') : '';
        const fallbackId = idEl ? idEl.getAttribute('src') : '';

        let supporting = req.supporting_documents || req.supportingDocuments || null;
        if (typeof supporting === 'string') {
            try {
                supporting = JSON.parse(supporting);
            } catch (err) {
                supporting = null;
            }
        }

        let photoData = '';
        let idData = '';

        if (supporting && typeof supporting === 'object') {
            photoData = supporting.photo || '';
            if (Array.isArray(supporting.id)) {
                idData = supporting.id[0] || '';
            } else {
                idData = supporting.id || '';
            }
        }

        if (photoEl) {
            photoEl.src = photoData || fallbackPhoto || '';
        }
        if (idEl) {
            idEl.src = idData || fallbackId || '';
        }

        const detailValues = getRequestDetailValues(req);
        Object.keys(detailValues).forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                el.textContent = detailValues[field];
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

    const ongoingBody = document.getElementById('ongoingRequestsBody');
    if (ongoingBody) {
        ongoingBody.addEventListener('click', async (event) => {
            const icon = event.target;
            const row = icon.closest('tr');
            if (!row) return;

            const id = row.getAttribute('data-id');

            if (icon.classList.contains('edit-icon')) {
                await window.changeRequestStatus(id, 'Approved');
                window.loadAndRenderDocumentRequests();
            } else if (icon.classList.contains('delete-icon')) {
                await window.changeRequestStatus(id, 'Rejected');
                window.loadAndRenderDocumentRequests();
            }
        });
    }

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

    const deleteSelectedRequests = async (status) => {
        const bodyId = status === 'Approved' ? 'approvedRequestsBody' : 'rejectedRequestsBody';
        const selectedIds = Array.from(document.querySelectorAll(`#${bodyId} .request-checkbox:checked`)).map(cb => cb.dataset.id);
        if (!selectedIds.length) {
            alert('Please select at least one row to delete.');
            return;
        }

        if (!confirm(`Permanently delete ${selectedIds.length} selected ${status.toLowerCase()} request(s)?`)) return;

        try {
            const resp = await fetch('../php/delete_document_request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_ids: selectedIds })
            });
            const result = await resp.json();
            if (!result.success) {
                throw new Error(result.message || 'Delete failed');
            }
        } catch (err) {
            console.error('Delete request error:', err);
            alert('Failed to delete request(s).');
            return;
        }

        window.loadAndRenderDocumentRequests();
        resetSelectionButtons();
    };

    const archiveSelectedRequests = async (status) => {
        const bodyId = status === 'Approved' ? 'approvedRequestsBody' : 'rejectedRequestsBody';
        const selectedIds = Array.from(document.querySelectorAll(`#${bodyId} .request-checkbox:checked`)).map(cb => cb.dataset.id);
        if (!selectedIds.length) {
            alert('Please select at least one row to archive.');
            return;
        }

        if (!confirm(`Archive ${selectedIds.length} selected ${status.toLowerCase()} request(s)?`)) return;

        try {
            const resp = await fetch('../php/archive_document_request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_ids: selectedIds })
            });
            const result = await resp.json();
            if (!result.success) {
                throw new Error(result.message || 'Archive failed');
            }
        } catch (err) {
            console.error('Archive request error:', err);
            alert('Failed to archive request(s).');
            return;
        }

        window.loadAndRenderDocumentRequests();
        resetSelectionButtons();
    };

    if (selectApprovedAllBtn) selectApprovedAllBtn.addEventListener('click', () => toggleSectionSelection(selectApprovedAllBtn, 'approvedRequestsBody'));
    if (selectRejectedAllBtn) selectRejectedAllBtn.addEventListener('click', () => toggleSectionSelection(selectRejectedAllBtn, 'rejectedRequestsBody'));

    if (deleteApprovedBtn) deleteApprovedBtn.addEventListener('click', () => deleteSelectedRequests('Approved'));
    if (deleteRejectedBtn) deleteRejectedBtn.addEventListener('click', () => deleteSelectedRequests('Rejected'));

    if (archiveApprovedBtn) archiveApprovedBtn.addEventListener('click', () => archiveSelectedRequests('Approved'));
    if (archiveRejectedBtn) archiveRejectedBtn.addEventListener('click', () => archiveSelectedRequests('Rejected'));

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

window.changeRequestStatus = async function(requestId, newStatus) {
    try {
        const resp = await fetch('../php/update_document_request_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId, request_status: newStatus })
        });
        const result = await resp.json();
        if (!result.success) {
            throw new Error(result.message || 'Status update failed');
        }
    } catch (err) {
        console.error('Status update error:', err);
        alert('Failed to update request status.');
        return;
    }

    const req = cachedDocumentRequests.find(r => String(r.request_id || r.id) === String(requestId));
    if (!req) return;

    const emailPayload = {
        email: req.notification_email || req.residentEmailAddress,
        name: getRequestResidentName(req),
        docType: req.document_type || req.documentType,
        requestId: req.request_id || req.id
    };

    if (newStatus === 'Approved') {
        emailPayload.subject = (req.document_type || req.documentType) + ' - Approved for Pickup';
        emailPayload.action = 'approved';

        fetch('../php/send_submission_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
        }).then(r => r.json()).catch(err => console.error('Email send error:', err));
    } else if (newStatus === 'Rejected') {
        emailPayload.subject = (req.document_type || req.documentType) + ' - Request Rejected';
        emailPayload.action = 'rejected';

        fetch('../php/send_submission_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
        }).then(r => r.json()).catch(err => console.error('Email send error:', err));
    }
};

window.sendCustomEmail = function() {
    const customSubject = prompt('Enter email subject:');
    if (!customSubject) return;

    const customMessage = prompt('Enter email message/body:');
    if (customMessage === null) return;

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

window.archiveRequest = async function(id) {
    if (!confirm('Are you sure you want to archive this request?')) return;

    try {
        const resp = await fetch('../php/archive_document_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: id })
        });
        const result = await resp.json();
        if (!result.success) {
            throw new Error(result.message || 'Archive failed');
        }
    } catch (err) {
        console.error('Archive request error:', err);
        alert('Failed to archive request.');
        return;
    }

    window.loadAndRenderDocumentRequests();
};

// DOCXTEMPLATER - WORD DOC GENERATION ENGINE
function getOrdinalSuffix(i) {
    let j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + 'st';
    if (j == 2 && k != 12) return i + 'nd';
    if (j == 3 && k != 13) return i + 'rd';
    return i + 'th';
}

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
    const req = cachedDocumentRequests.find(r => String(r.request_id || r.id) === String(selectedId));

    if (!req) {
        alert('Could not locate resident data.');
        return;
    }

    let templatePath = '';
    let outputFileName = '';
    const safeLastName = (req.lastName || req.residentLastName || 'Resident').replace(/[^a-z0-9]/gi, '_');

    switch (docType) {
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

    loadFile(templatePath, function(error, content) {
        if (error) {
            console.error('Error loading template:', error);
            alert('Could not load the document template. Ensure the template exists at: ' + templatePath);
            return;
        }

        try {
            const zip = new PizZip(content);
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true
            });

            const today = new Date();
            const dayWithSuffix = getOrdinalSuffix(today.getDate());
            const month = today.toLocaleString('default', { month: 'long' });
            const year = today.getFullYear();
            const formattedDate = `${dayWithSuffix} day of ${month} ${year}`;

            let combinedAddress = `${req.houseNum || req.residentHouseNo || ''} ${req.streetName || req.residentStreet || ''}`.trim();
            if (combinedAddress === '') {
                combinedAddress = req.address || 'N/A';
            }

            doc.render({
                firstName: req.firstName || req.residentFirstName || '',
                middleName: req.middleName || req.residentMiddleName || '',
                lastName: req.lastName || req.residentLastName || '',
                address: combinedAddress,
                purposeOfRequest: req.purpose_of_request || req.residentPurposeOfRequest || 'General Purpose',
                currentDate: formattedDate
            });

            const out = doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });

            saveAs(out, outputFileName);
        } catch (error) {
            console.error('Error generating document:', error);
            alert('Document generation failed.');
        }
    });
};
