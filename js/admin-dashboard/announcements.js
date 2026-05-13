document.addEventListener('DOMContentLoaded', () => {
    // Function to update event statuses based on date
    window.updateEventStatuses = function() {
        let events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        events.forEach(event => {
            if (event.type === 'upcoming' && event.date) {
                const eventDate = new Date(event.date);
                if (eventDate <= today) {
                    event.type = 'ongoing';
                }
            }
        });

        localStorage.setItem('brgyEvents', JSON.stringify(events));
    };

    // Function to generate birthday announcements
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

    // Call updates on load
    updateEventStatuses();
    generateBirthdayAnnouncements();

    // 1. Unified Display Function
    window.displayEvents = function() {
        const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];

        const ongoingEvents = events.filter(event => event.type === 'ongoing');
        const upcomingEvents = events.filter(event => event.type === 'upcoming' || !event.type);

        const ongoingEventsList = document.getElementById('ongoingEventsList');
        const upcomingEventsList = document.getElementById('upcomingEventsList');

        function createEventCard(event) {
            const card = document.createElement('div');
            card.className = event.isBirthday ? 'event-card birthday-card' : 'event-card';

            const photoSrc = event.photo ? event.photo : 'https://via.placeholder.com/400x200?text=No+Photo';
            
            let formattedDate = event.date || 'No Date';
            if (event.date) {
                const parsed = new Date(event.date);
                if (!isNaN(parsed)) {
                    formattedDate = parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            const detailsText = event.details || 'No additional details provided.';

            card.innerHTML = ` 
                <img src="${photoSrc}" alt="Event Picture" class="event-pic">
                <div class="event-content">
                    <div class="event-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-desc">${detailsText}</div>

                    <div class="event-actions">
                        <div class="view-details" style="visibility:hidden;"></div>
                        <div class="card-icons">
                            ${event.isBirthday ? '' : '<i class="fas fa-pencil-alt edit-icon" title="Edit"></i>'}
                            ${event.isBirthday ? '' : '<i class="fas fa-trash-alt delete-icon" title="Delete"></i>'}
                        </div>
                    </div>
                </div>
            `;

            // Only add edit/delete if not birthday
            if (!event.isBirthday) {
                const deleteBtn = card.querySelector('.delete-icon');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                        let currentEvents = JSON.parse(localStorage.getItem('brgyEvents')) || [];
                        currentEvents = currentEvents.filter(ev => ev.id !== event.id);
                        localStorage.setItem('brgyEvents', JSON.stringify(currentEvents));
                        displayEvents();
                    }
                });

                const editBtn = card.querySelector('.edit-icon');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.editEvent(event.id);
                    });
                }
            }

            return card;
        }

        // Render Ongoing List safely
        if (ongoingEventsList) {
            ongoingEventsList.innerHTML = '';
            ongoingEvents.forEach(event => {
                ongoingEventsList.appendChild(createEventCard(event));
            });
        }

        // Render Upcoming List safely
        if (upcomingEventsList) {
            upcomingEventsList.innerHTML = '';
            upcomingEvents.forEach(event => {
                upcomingEventsList.appendChild(createEventCard(event));
            });
        }
    };

    // Initial load trigger
    if (document.getElementById('ongoingEventsList') || document.getElementById('upcomingEventsList')) {
        displayEvents();
    }

    // 2. Photo Handling logic
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

    // Helper: File to Base64 Converter if not globally mapped
    if (typeof window.getBase64 !== 'function') {
        window.getBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 3. Form Submission Handling
    const eventForm = document.getElementById('addEventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('editEventId')?.value;
            const title = document.getElementById('eventTitle').value;
            const details = document.getElementById('eventDetails').value;
            const type = document.getElementById('eventType').value;
            const visibility = document.getElementById('eventVisibility').value;
            const date = document.getElementById('eventDate').value;

            // Date validation
            if (type === 'upcoming' && date) {
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    alert('Upcoming events cannot be set to a past date.');
                    return;
                }
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
                    events[index] = { ...events[index], title, details, type, visibility, date, photo: photoBase64 };
                }
            } else {
                events.push({ id: Date.now(), title, details, type, visibility, date, photo: photoBase64 });
            }

            localStorage.setItem('brgyEvents', JSON.stringify(events));

            // Update statuses automatically
            updateEventStatuses();

            // Clean up state
            eventForm.reset();
            if (document.getElementById('editEventId')) document.getElementById('editEventId').value = "";

            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';

            const titleEl = document.querySelector('#eventModal .modal-header h3');
            if (titleEl) titleEl.innerText = "Create New Announcement";

            const modalElement = document.getElementById('eventModal');
            if (modalElement) modalElement.classList.remove('active');

            // Refresh UI directly
            displayEvents();
        });
    }
});

// Global Trigger to Open Edit view
window.editEvent = function(id) {
    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    const ev = events.find(e => e.id == id);

    if (ev) {
        const editIdInput = document.getElementById('editEventId');
        if (editIdInput) editIdInput.value = ev.id;

        document.getElementById('eventTitle').value = ev.title || '';
        document.getElementById('eventDetails').value = ev.details || '';
        document.getElementById('eventType').value = ev.type || 'upcoming';
        document.getElementById('eventVisibility').value = ev.visibility || 'both';
        document.getElementById('eventDate').value = ev.date || '';

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