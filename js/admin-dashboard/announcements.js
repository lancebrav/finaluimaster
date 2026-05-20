document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 8;
    let cachedAnnouncements = [];

    const statusFilter = document.getElementById('statusFilter');

    const getEventType = (event) => {
        if (event.event_type) return event.event_type;

        const now = new Date();
        const sDate = new Date(event.start_date || event.startDate || event.date || 0);
        const eDate = new Date(event.end_date || event.endDate || event.date || 0);

        if (event.start_time) {
            const parts = event.start_time.split(':');
            sDate.setHours(parseInt(parts[0], 10), parseInt(parts[1] || '0', 10), 0, 0);
        } else {
            sDate.setHours(0, 0, 0, 0);
        }

        if (event.end_time) {
            const parts = event.end_time.split(':');
            eDate.setHours(parseInt(parts[0], 10), parseInt(parts[1] || '0', 10), 59, 999);
        } else {
            eDate.setHours(23, 59, 59, 999);
        }

        if (now > eDate) return 'past';
        if (now < sDate) return 'upcoming';
        return 'ongoing';
    };

    const getFilteredAnnouncements = () => {
        let events = cachedAnnouncements.slice();
        if (statusFilter && statusFilter.value !== 'all') {
            events = events.filter(ev => getEventType(ev) === statusFilter.value);
        }
        return events;
    };

    const updatePaginationUI = (totalPages) => {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageIndicator = document.getElementById('pageIndicator');

        if (pageIndicator) {
            pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = currentPage === 1;
            prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
            prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
            nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
        }
    };

    const displayAdminAnnouncements = () => {
        let events = getFilteredAnnouncements();

        events.sort((a, b) => {
            const statusWeight = { ongoing: 1, upcoming: 2, past: 3 };
            const weightA = statusWeight[getEventType(a)] || 4;
            const weightB = statusWeight[getEventType(b)] || 4;
            if (weightA !== weightB) return weightA - weightB;

            const dateA = new Date(a.start_date || a.date || 0);
            const dateB = new Date(b.start_date || b.date || 0);
            return dateA - dateB;
        });

        const tbody = document.querySelector('#announcementsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const totalPages = Math.ceil(events.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedEvents = events.slice(startIndex, endIndex);

        if (paginatedEvents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 30px; text-align: center; color: #7f8c8d; font-weight: 600;">No announcements found.</td></tr>`;
            updatePaginationUI(totalPages);
            return;
        }

        paginatedEvents.forEach(event => {
            const eventType = getEventType(event);
            const tr = document.createElement('tr');

            let formattedDate = event.start_date || event.date || 'No Date';
            let author = event.author || 'Admin';
            let dueDate = event.end_date || 'N/A';

            let formattedTime = event.start_time || 'TBA';
            if (formattedTime && formattedTime !== 'TBA' && formattedTime.includes(':')) {
                const parts = formattedTime.split(':');
                let h = parseInt(parts[0], 10);
                const m = parts[1];
                const suffix = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                formattedTime = `${h}:${m} ${suffix}`;
            }

            let formattedEndTime = event.end_time || '';
            if (formattedEndTime && formattedEndTime.includes(':')) {
                const parts = formattedEndTime.split(':');
                let h = parseInt(parts[0], 10);
                const m = parts[1];
                const suffix = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                formattedEndTime = ` ${h}:${m} ${suffix}`;

                if (dueDate !== 'N/A') {
                    dueDate += formattedEndTime;
                }
            }

            let typeBadge = '';
            if (eventType === 'ongoing') typeBadge = '<span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Ongoing</span>';
            if (eventType === 'upcoming') typeBadge = '<span style="background: #3498db; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Upcoming</span>';
            if (eventType === 'past') typeBadge = '<span style="background: #95a5a6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Past</span>';

            tr.innerHTML = `
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; color: #1a1a4b; font-weight: 600;">${event.title}</td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">${typeBadge}</td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">${formattedDate}</td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">${author}</td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">${formattedTime}</td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">${dueDate}</td>
                <td class="action-icons" style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; text-align: center; white-space: nowrap;">
                    ${event.is_birthday ? '<i class="fas fa-pencil-alt" style="visibility: hidden; margin-right: 15px;"></i>' : '<i class="fas fa-pencil-alt edit-icon" title="Edit" style="color: #1a1a4b; margin-right: 15px; cursor: pointer;"></i>'}
                    <i class="fas fa-archive archive-icon" title="Archive" style="color: #f39c12; cursor: pointer;"></i>
                </td>
            `;

            if (!event.is_birthday) {
                const editBtn = tr.querySelector('.edit-icon');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.editEvent(event.announcement_id);
                    });
                }
            }

            const archiveBtn = tr.querySelector('.archive-icon');
            if (archiveBtn) {
                archiveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.archiveEvent(event.announcement_id);
                });
            }

            tbody.appendChild(tr);
        });

        updatePaginationUI(totalPages);
    };

    const loadAnnouncements = async () => {
        try {
            const response = await fetch('../php/get_announcements.php');
            const data = await response.json();
            cachedAnnouncements = Array.isArray(data.announcements) ? data.announcements : [];
        } catch (err) {
            console.error('Error fetching announcements:', err);
            cachedAnnouncements = [];
        }
        displayAdminAnnouncements();
    };

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentPage = 1;
            displayAdminAnnouncements();
        });
    }

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayAdminAnnouncements();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredAnnouncements().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            displayAdminAnnouncements();
        }
    });

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
                    if (defaultIcon) defaultIcon.style.display = 'none';
                    if (placeholderText) placeholderText.style.display = 'none';
                }
            }
        });
    }

    if (typeof window.getBase64 !== 'function') {
        window.getBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    const eventForm = document.getElementById('addEventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('editEventId')?.value;
            const title = document.getElementById('eventTitle').value;
            const details = document.getElementById('eventDetails').value;
            const location = document.getElementById('eventLocation').value;
            const startDate = document.getElementById('eventStartDate').value;
            const startTime = document.getElementById('eventStartTime').value;
            const endDate = document.getElementById('eventEndDate').value;
            const endTime = document.getElementById('eventEndTime').value;
            const visibility = document.getElementById('eventVisibility').value;

            const sDate = new Date(startDate);
            if (startTime) {
                const parts = startTime.split(':');
                sDate.setHours(parts[0], parts[1] || 0, 0, 0);
            }

            const eDate = new Date(endDate);
            if (endTime) {
                const parts = endTime.split(':');
                eDate.setHours(parts[0], parts[1] || 0, 0, 0);
            }

            if (sDate > eDate) {
                alert('End Date and Time cannot be earlier than the Start Date and Time.');
                return;
            }

            const now = new Date();
            let autoType = 'upcoming';
            if (now >= sDate && now <= eDate) {
                autoType = 'ongoing';
            } else if (now > eDate) {
                autoType = 'past';
            }

            let photoBase64 = '';
            if (eventPhotoInput && eventPhotoInput.files[0]) {
                photoBase64 = await window.getBase64(eventPhotoInput.files[0]);
            } else if (editId) {
                const existingEv = cachedAnnouncements.find(ev => String(ev.announcement_id) === String(editId));
                photoBase64 = existingEv ? (existingEv.photo || '') : '';
            }

            const payload = {
                announcement_id: editId || undefined,
                title,
                details,
                location,
                start_date: startDate,
                start_time: startTime,
                end_date: endDate,
                end_time: endTime,
                event_type: autoType,
                visibility,
                author: 'Admin',
                photo: photoBase64,
                is_birthday: 0
            };

            const endpoint = editId ? '../php/edit_announcement.php' : '../php/add_announcement.php';

            try {
                const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await resp.json();
                if (!result.success) {
                    throw new Error(result.message || 'Failed to save announcement');
                }
            } catch (err) {
                console.error('Announcement save error:', err);
                alert('Failed to save announcement.');
                return;
            }

            eventForm.reset();
            if (document.getElementById('editEventId')) document.getElementById('editEventId').value = '';

            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';

            const titleEl = document.querySelector('#eventModal .modal-header h3');
            if (titleEl) titleEl.innerText = 'Create New Announcement';

            const modalElement = document.getElementById('eventModal');
            if (modalElement) modalElement.classList.remove('active');

            currentPage = 1;
            loadAnnouncements();
        });
    }

    window.editEvent = function(id) {
        if (!id) return;
        const ev = cachedAnnouncements.find(e => String(e.announcement_id) === String(id));
        if (!ev) return;

        const editIdInput = document.getElementById('editEventId');
        if (editIdInput) editIdInput.value = ev.announcement_id;

        document.getElementById('eventTitle').value = ev.title || '';
        document.getElementById('eventDetails').value = ev.details || '';
        document.getElementById('eventLocation').value = ev.location || '';
        document.getElementById('eventStartDate').value = ev.start_date || '';
        document.getElementById('eventStartTime').value = ev.start_time || '';
        document.getElementById('eventEndDate').value = ev.end_date || '';
        document.getElementById('eventEndTime').value = ev.end_time || '';
        document.getElementById('eventVisibility').value = ev.visibility || 'both';

        if (loadedPhoto && ev.photo) {
            loadedPhoto.src = ev.photo;
            loadedPhoto.style.display = 'block';
            if (defaultIcon) defaultIcon.style.display = 'none';
            if (placeholderText) placeholderText.style.display = 'none';
        } else {
            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';
        }

        const titleEl = document.querySelector('#eventModal .modal-header h3');
        if (titleEl) titleEl.innerText = 'Edit Announcement Details';

        const modalElement = document.getElementById('eventModal');
        if (modalElement) modalElement.classList.add('active');
    };

    window.archiveEvent = async function(id) {
        if (!confirm('Are you sure you want to archive this announcement?')) return;

        try {
            const resp = await fetch('../php/archive_announcement.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ announcement_id: id })
            });
            const result = await resp.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to archive announcement');
            }
        } catch (err) {
            console.error('Archive announcement error:', err);
            alert('Failed to archive announcement.');
            return;
        }

        loadAnnouncements();
    };

    loadAnnouncements();
});
