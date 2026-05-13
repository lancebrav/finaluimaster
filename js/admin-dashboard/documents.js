/* DOCUMENT REQUESTS: ISSUE, IT DOES NOT UPLOAD THE DOCUMENTS TO THE ADMIN DASHBOARD*/



document.addEventListener('DOMContentLoaded', () => {
    window.loadAndRenderDocumentRequests = function() {
        const ongoingBody = document.getElementById('ongoingRequestsBody');
        const approvedBody = document.getElementById('approvedRequestsBody');
        const rejectedBody = document.getElementById('rejectedRequestsBody');

        if (!ongoingBody || !approvedBody || !rejectedBody) return;

        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];

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

    window.viewDocDetails = function(id) {
        const requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
        const req = requests.find(r => r.id == id);
        if (!req) return;

        const fields = ['residentFirstName', 'residentMiddleName', 'residentLastName', 'residentGender', 'residentBirthDate', 'residentEmailAddress', 'residentContactNumber', 'residentFullAddress', 'residentPurposeOfRequest'];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.textContent = req[field] || 'N/A';
        });

        const modal = document.getElementById('docDetailsModal');
        if (modal) modal.classList.add('active');
    };

    const closeDocumentModalIcon = document.getElementById('closeDocModal');
    if (closeDocumentModalIcon) {
        closeDocumentModalIcon.addEventListener('click', () => {
            document.getElementById('docDetailsModal').classList.remove('active');
        });
    }

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
});

window.changeRequestStatus = function(requestId, newStatus) {
    let requests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
    let index = requests.findIndex(req => req.id == requestId);

    if (index !== -1) {
        requests[index].status = newStatus;
        localStorage.setItem('brgyDocumentRequests', JSON.stringify(requests));
        console.log(`Saved: Request ${requestId} is now ${newStatus}`);
    }
};
