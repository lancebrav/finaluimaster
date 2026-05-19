document.addEventListener('DOMContentLoaded', () => {
    // --- Pagination State ---
    let currentPage = 1;
    const itemsPerPage = 8; 

    // Auto-detect ongoing vs upcoming and AUTO-ARCHIVE past events
    window.updateEventStatuses = function() {
        let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        let archivedEvents = JSON.parse(localStorage.getItem('brgyArchivedEvents')) || [];
        const now = new Date(); 
        
        let activeEvents = [];
        let newlyArchived = false;

        events.forEach(event => {
            if (event.endDate) {
                // Safely parse Start Date & Time
                const sDate = new Date(event.startDate);
                if (event.startTime && event.startTime.includes(':')) {
                    let [h, m] = event.startTime.split(':');
                    sDate.setHours(h, m, 0, 0);
                } else {
                    sDate.setHours(0, 0, 0, 0);
                }

                // Safely parse End Date & Time
                const eDate = new Date(event.endDate);
                if (event.endTime && event.endTime.includes(':')) {
                    let [h, m] = event.endTime.split(':');
                    eDate.setHours(h, m, 59, 999);
                } else {
                    eDate.setHours(23, 59, 59, 999);
                }
                
                if (now > eDate) {
                    event.type = 'past';
                    event.dateArchived = now.toLocaleDateString();
                    archivedEvents.push(event);
                    newlyArchived = true;
                } else if (now >= sDate && now <= eDate) {
                    event.type = 'ongoing';
                    activeEvents.push(event);
                } else if (now < sDate) {
                    event.type = 'upcoming';
                    activeEvents.push(event);
                }
            } else if (event.date) {
                // Fallback for old data
                const eventDate = new Date(event.date);
                eventDate.setHours(23, 59, 59); 
                
                if (now > eventDate && !event.isBirthday) {
                    event.type = 'past';
                    event.dateArchived = now.toLocaleDateString();
                    archivedEvents.push(event);
                    newlyArchived = true;
                } else {
                    event.type = 'ongoing';
                    activeEvents.push(event);
                }
            } else {
                activeEvents.push(event); 
            }
        });

        localStorage.setItem('brgyEvents', JSON.stringify(activeEvents));
        if (newlyArchived) {
            localStorage.setItem('brgyArchivedEvents', JSON.stringify(archivedEvents));
        }
    };

    window.generateBirthdayAnnouncements = function() {
        const officers = JSON.parse(localStorage.getItem('brgyOfficers')) || [];
        let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        officers.forEach(officer => {
            if (officer.birthday) {
                const birthDate = new Date(officer.birthday);
                const currentYear = today.getFullYear();
                const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

                if (nextBirthday < today) {
                    nextBirthday.setFullYear(currentYear + 1);
                }

                const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

                if (daysUntil <= 10 && daysUntil >= 0) {
                    const bdayId = `bday-${officer.id}`;
                    const existing = events.find(e => e.id == bdayId);

                    if (!existing) {
                        events.push({
                            id: bdayId,
                            title: `🎉 Happy Birthday ${officer.name}!`,
                            details: `Celebrating ${officer.position} on their special day. Join us in wishing them well!`,
                            type: 'upcoming',
                            date: nextBirthday.toISOString().split('T')[0],
                            startDate: nextBirthday.toISOString().split('T')[0],
                            endDate: nextBirthday.toISOString().split('T')[0],
                            photo: officer.photo || '',
                            isBirthday: true,
                            visibility: 'admin'
                        });
                    }
                }
            }
        });
        localStorage.setItem('brgyEvents', JSON.stringify(events));
    };

    updateEventStatuses();
    generateBirthdayAnnouncements();

    // Event listener for the Status Filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentPage = 1; // Snap back to page 1 on filter change
            displayAdminAnnouncements();
        });
    }

    window.displayAdminAnnouncements = function() {
        let events = JSON.parse(localStorage.getItem('brgyEvents'));
        if (!Array.isArray(events)) events = []; 
        
        // Apply the Filter
        if (statusFilter && statusFilter.value !== 'all') {
            events = events.filter(ev => ev.type === statusFilter.value);
        }
        
        // Sort by Category Priority (Ongoing -> Upcoming -> Past)
        events.sort((a, b) => {
            const statusWeight = { 'ongoing': 1, 'upcoming': 2, 'past': 3 };
            const weightA = statusWeight[a.type] || 4;
            const weightB = statusWeight[b.type] || 4;

            if (weightA !== weightB) {
                return weightA - weightB;
            }

            const dateA = new Date(a.startDate || a.date || 0);
            const dateB = new Date(b.startDate || b.date || 0);
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

        function createEventRow(event) {
            const tr = document.createElement('tr');
            
            // Map the new values, fallback to old values if missing
            let formattedDate = event.startDate || event.date || 'No Date';
            let author = event.author || 'Admin';
            let dueDate = event.endDate || event.dueDate || 'N/A';
            
            // Format military time to standard 12-hour AM/PM (Start Time)
            let formattedTime = event.startTime || event.time || 'TBA';
            if (formattedTime && formattedTime !== 'TBA' && formattedTime.includes(':')) {
                let [h, m] = formattedTime.split(':');
                let suffix = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12; // Convert 0 (midnight) or 13+ to 12-hour format
                formattedTime = `${h}:${m} ${suffix}`;
            }

            // Format military time to standard 12-hour AM/PM (End Time)
            let formattedEndTime = event.endTime || '';
            if (formattedEndTime && formattedEndTime.includes(':')) {
                let [eh, em] = formattedEndTime.split(':');
                let esuffix = eh >= 12 ? 'PM' : 'AM';
                eh = eh % 12 || 12; 
                formattedEndTime = ` ${eh}:${em} ${esuffix}`;
                
                if (dueDate !== 'N/A') {
                    dueDate += formattedEndTime;
                }
            }

            // Status Badge
            let typeBadge = '';
            if(event.type === 'ongoing') typeBadge = '<span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Ongoing</span>';
            if(event.type === 'upcoming') typeBadge = '<span style="background: #3498db; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Upcoming</span>';
            if(event.type === 'past') typeBadge = '<span style="background: #95a5a6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Past</span>';

            tr.innerHTML = `
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; color: #1a1a4b; font-weight: 600;">
                    ${event.title}
                </td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                    ${typeBadge}
                </td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                    ${formattedDate}
                </td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                    ${author}
                </td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                    ${formattedTime}
                </td>
                <td style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                    ${dueDate}
                </td>
                <td class="action-icons" style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; text-align: center; white-space: nowrap;">
                    ${event.isBirthday ? '<i class="fas fa-pencil-alt" style="visibility: hidden; margin-right: 15px;"></i>' : '<i class="fas fa-pencil-alt edit-icon" title="Edit" style="color: #1a1a4b; margin-right: 15px; cursor: pointer;"></i>'}
                    <i class="fas fa-archive archive-icon" title="Archive" style="color: #f39c12; cursor: pointer;"></i>
                </td>
            `;

            // Edit Event Listener
            if (!event.isBirthday) {
                const editBtn = tr.querySelector('.edit-icon');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.editEvent(event.id);
                    });
                }
            }

            // Archive Event Listener
            const archiveBtn = tr.querySelector('.archive-icon');
            if (archiveBtn) {
                archiveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.archiveEvent(event.id);
                });
            }

            return tr;
        }

        paginatedEvents.forEach(event => {
            tbody.appendChild(createEventRow(event));
        });

        updatePaginationUI(totalPages);
    };

    function updatePaginationUI(totalPages) {
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
    }

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayAdminAnnouncements();
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value !== 'all') {
            events = events.filter(ev => ev.type === statusFilter.value);
        }
        
        const totalPages = Math.ceil(events.length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            displayAdminAnnouncements();
        }
    });

    displayAdminAnnouncements();

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

            // Safer Date validation for form submission
            const sDate = new Date(startDate);
            if (startTime) {
                let [sh, sm] = startTime.split(':');
                sDate.setHours(sh, sm, 0, 0);
            }

            const eDate = new Date(endDate);
            if (endTime) {
                let [eh, em] = endTime.split(':');
                eDate.setHours(eh, em, 0, 0);
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
                    events[index] = { 
                        ...events[index], 
                        title, 
                        details, 
                        location, 
                        startDate, 
                        startTime, 
                        endDate, 
                        endTime, 
                        type: autoType, 
                        visibility, 
                        photo: photoBase64,
                        date: startDate 
                    };
                }
            } else {
                events.unshift({ 
                    id: Date.now(), 
                    title, details, location, startDate, startTime, endDate, endTime,
                    type: autoType, visibility, photo: photoBase64,
                    author: 'Admin',
                    date: startDate
                });
            }

            localStorage.setItem('brgyEvents', JSON.stringify(events));
            updateEventStatuses();

            eventForm.reset();
            if (document.getElementById('editEventId')) document.getElementById('editEventId').value = "";

            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';

            const titleEl = document.querySelector('#eventModal .modal-header h3');
            if (titleEl) titleEl.innerText = "Create New Announcement";

            const modalElement = document.getElementById('eventModal');
            if (modalElement) modalElement.classList.remove('active');

            currentPage = 1;
            displayAdminAnnouncements();
        });
    }
});

// Edit functionality
window.editEvent = function(id) {
    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    const ev = events.find(e => e.id == id);

    if (ev) {
        const editIdInput = document.getElementById('editEventId');
        if (editIdInput) editIdInput.value = ev.id;

        document.getElementById('eventTitle').value = ev.title || '';
        document.getElementById('eventDetails').value = ev.details || '';
        document.getElementById('eventLocation').value = ev.location || '';
        document.getElementById('eventStartDate').value = ev.startDate || ev.date || '';
        document.getElementById('eventStartTime').value = ev.startTime || '';
        document.getElementById('eventEndDate').value = ev.endDate || '';
        document.getElementById('eventEndTime').value = ev.endTime || ''; 
        document.getElementById('eventVisibility').value = ev.visibility || 'both';

        const loadedPhoto = document.getElementById('loadedPhoto');
        const defaultIcon = document.querySelector('.default-photo-icon');
        const placeholderText = document.querySelector('.placeholder-text');

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
        if (titleEl) titleEl.innerText = "Edit Announcement Details";

        const modalElement = document.getElementById('eventModal');
        if (modalElement) modalElement.classList.add('active');
    }
};

// Archive Functionality
window.archiveEvent = function(id) {
    if(!confirm('Are you sure you want to archive this announcement?')) return;
    
    let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    const index = events.findIndex(e => e.id == id);
    
    if (index !== -1) {
        let archivedEvents = JSON.parse(localStorage.getItem('brgyArchivedEvents')) || [];
        const eventToArchive = events[index];
        
        // Add timestamp for when it was archived
        eventToArchive.dateArchived = new Date().toLocaleDateString();
        
        // Push to archive storage
        archivedEvents.push(eventToArchive);
        localStorage.setItem('brgyArchivedEvents', JSON.stringify(archivedEvents));
        
        // Remove from main storage
        events.splice(index, 1);
        localStorage.setItem('brgyEvents', JSON.stringify(events));
        
        // Re-render table
        if (typeof window.displayAdminAnnouncements === 'function') {
            window.displayAdminAnnouncements();
        }
    }
};