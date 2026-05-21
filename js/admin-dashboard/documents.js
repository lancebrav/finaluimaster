/* DOCUMENT REQUESTS — 4-step workflow */

const ROWS_PER_PAGE = 6;

const REQUEST_STATUS = {
    ONGOING: 'Ongoing',
    APPROVED: 'Approved',
    READY: 'Ready to Print',
    RECEIVED: 'Received'
};

const WORKFLOW_STEPS = [
    {
        status: REQUEST_STATUS.ONGOING,
        sectionId: 'section-ongoing',
        tbodyId: 'ongoingRequestsBody',
        pageInfoId: 'pageInfoOngoing',
        prevId: 'prevOngoing',
        nextId: 'nextOngoing',
        dateLabel: 'Date Requested',
        statusBadge: 'ONGOING',
        statusClass: 'status-ongoing',
        actionLabel: 'Approve',
        nextStatus: REQUEST_STATUS.APPROVED,
        picClass: 'pic-blue'
    },
    {
        status: REQUEST_STATUS.APPROVED,
        sectionId: 'section-approved',
        tbodyId: 'approvedRequestsBody',
        pageInfoId: 'pageInfoApproved',
        prevId: 'prevApproved',
        nextId: 'nextApproved',
        dateLabel: 'Date Approved',
        statusBadge: 'APPROVED',
        statusClass: 'status-approved',
        actionLabel: 'Ready to Print',
        nextStatus: REQUEST_STATUS.READY,
        picClass: 'pic-red'
    },
    {
        status: REQUEST_STATUS.READY,
        sectionId: 'section-ready',
        tbodyId: 'readyToPrintRequestsBody',
        pageInfoId: 'pageInfoReady',
        prevId: 'prevReady',
        nextId: 'nextReady',
        dateLabel: 'Ready Date',
        statusBadge: 'READY TO PRINT',
        statusClass: 'status-ready',
        actionLabel: 'Mark Received',
        nextStatus: REQUEST_STATUS.RECEIVED,
        picClass: 'pic-orange',
        hasSelect: true
    },
    {
        status: REQUEST_STATUS.RECEIVED,
        sectionId: 'section-received',
        tbodyId: 'receivedRequestsBody',
        pageInfoId: 'pageInfoReceived',
        prevId: 'prevReceived',
        nextId: 'nextReceived',
        dateLabel: 'Date Received',
        statusBadge: 'RECEIVED',
        statusClass: 'status-received',
        actionLabel: 'Archive',
        actionType: 'archive',
        picClass: 'pic-green'
    }
];

let currentPages = {
    [REQUEST_STATUS.ONGOING]: 1,
    [REQUEST_STATUS.APPROVED]: 1,
    [REQUEST_STATUS.READY]: 1,
    [REQUEST_STATUS.RECEIVED]: 1
};

let cachedDocumentRequests = [];

function normalizeRequestStatus(req) {
    return (req.request_status || req.status || '').trim();
}

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

function workflowActionButton(requestId, step) {
    const label = step.actionLabel;
    const safeId = String(requestId).replace(/'/g, "\\'");

    if (step.actionType === 'archive') {
        return `<button type="button" class="workflow-action-btn" onclick="window.archiveRequest('${safeId}')">${label}</button>`;
    }

    const nextStatus = (step.nextStatus || '').replace(/'/g, "\\'");
    return `<button type="button" class="workflow-action-btn" onclick="window.advanceRequest('${safeId}', '${nextStatus}')">${label}</button>`;
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

function renderWorkflowSection(step, data) {
    const tbody = document.getElementById(step.tbodyId);
    const info = document.getElementById(step.pageInfoId);
    const prevBtn = document.getElementById(step.prevId);
    const nextBtn = document.getElementById(step.nextId);

    if (!tbody) return;

    const totalPages = Math.ceil(data.length / ROWS_PER_PAGE) || 1;

    if (currentPages[step.status] > totalPages) currentPages[step.status] = totalPages;
    if (currentPages[step.status] < 1) currentPages[step.status] = 1;

    const startIdx = (currentPages[step.status] - 1) * ROWS_PER_PAGE;
    const paginatedData = data.slice(startIdx, startIdx + ROWS_PER_PAGE);

    tbody.innerHTML = '';

    if (paginatedData.length === 0) {
        const colSpan = step.hasSelect ? 6 : 5; /* select + 4 fields + action OR 4 fields + action */
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;padding:30px;color:#7f8c8d;font-weight:600;">No requests in this step.</td></tr>`;
    }

    paginatedData.forEach(req => {
        const tr = document.createElement('tr');
        const requestId = req.request_id || req.id;
        tr.setAttribute('data-id', requestId);

        const initials = getRequestResidentInitials(req);
        const fullName = getRequestResidentName(req) || 'Unknown';
        const displayDate = formatDateForDisplay(req.date_requested || req.dateRequested);
        const residencyBadge = getRequestResidencyBadge(req);
        const docType = req.document_type || req.documentType || 'N/A';

        let rowHtml = '';

        if (step.hasSelect) {
            rowHtml += `<td class="request-select-col"><input type="radio" name="printRequestSelect" class="request-print-select" data-id="${requestId}"></td>`;
        }

        rowHtml += `
            <td class="name-cell">
                <div class="profile-pic ${step.picClass}">${initials || '?'}</div>
                <span>${fullName}</span>
            </td>
            <td><a href="#" class="doc-link" onclick="window.viewDocDetails(${requestId}); return false;">${docType}</a></td>
            <td>${displayDate}</td>
            <td>${residencyBadge}</td>
            <td class="workflow-action-cell">${workflowActionButton(requestId, step)}</td>
        `;

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });

    if (info) info.textContent = `Page ${currentPages[step.status]} of ${totalPages}`;

    if (prevBtn) {
        prevBtn.disabled = currentPages[step.status] === 1;
        prevBtn.onclick = () => {
            if (currentPages[step.status] > 1) {
                currentPages[step.status]--;
                renderWorkflowSection(step, data);
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPages[step.status] === totalPages || totalPages === 0;
        nextBtn.onclick = () => {
            if (currentPages[step.status] < totalPages) {
                currentPages[step.status]++;
                renderWorkflowSection(step, data);
            }
        };
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

        WORKFLOW_STEPS.forEach(step => {
            const stepData = requests.filter(r => normalizeRequestStatus(r) === step.status);
            renderWorkflowSection(step, stepData);
        });
    };

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

        if (photoEl) photoEl.src = photoData || fallbackPhoto || '';
        if (idEl) idEl.src = idData || fallbackId || '';

        const detailValues = getRequestDetailValues(req);
        Object.keys(detailValues).forEach(field => {
            const el = document.getElementById(field);
            if (el) el.textContent = detailValues[field];
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

window.advanceRequest = async function(requestId, newStatus) {
    const step = WORKFLOW_STEPS.find(s => s.nextStatus === newStatus);
    const confirmMsg = step
        ? `Move this request to "${newStatus}"?`
        : 'Update this request?';

    if (!confirm(confirmMsg)) return;

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
        alert(err.message || 'Failed to update request status.');
        return;
    }

    const req = cachedDocumentRequests.find(r => String(r.request_id || r.id) === String(requestId));
    if (req && newStatus === REQUEST_STATUS.APPROVED) {
        const emailPayload = {
            email: req.notification_email || req.residentEmailAddress,
            name: getRequestResidentName(req),
            docType: req.document_type || req.documentType,
            requestId: req.request_id || req.id,
            subject: (req.document_type || req.documentType) + ' - Approved for Pickup',
            action: 'approved'
        };

        fetch('../php/send_submission_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
        }).then(r => r.json()).catch(err => console.error('Email send error:', err));
    }

    window.loadAndRenderDocumentRequests();
};

window.archiveRequest = async function(id) {
    if (!confirm('Archive this request? It will move to Archives.')) return;

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

function getOrdinalSuffix(i) {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) return i + 'st';
    if (j === 2 && k !== 12) return i + 'nd';
    if (j === 3 && k !== 13) return i + 'rd';
    return i + 'th';
}

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

window.printDocument = function(docType) {
    const printMenu = document.getElementById('printDropdownMenu');
    if (printMenu) printMenu.classList.remove('show');

    const selectedRadio = document.querySelector('#readyToPrintRequestsBody .request-print-select:checked');
    if (!selectedRadio) {
        alert('Please select a request row to generate the document.');
        return;
    }

    const selectedId = selectedRadio.dataset.id;
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
