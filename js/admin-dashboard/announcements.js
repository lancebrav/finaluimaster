document.addEventListener('DOMContentLoaded', () => {
    window.displayEvents = function() {
        const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];

        const ongoingEvents = events.filter(event => event.type === 'ongoing');
        const upcomingEvents = events.filter(event => event.type === 'upcoming');

        const ongoingEventsList = document.getElementById('ongoingEventsList');
        const upcomingEventsList = document.getElementById('upcomingEventsList');

        function createEventCard(event) {
            const card = document.createElement('div');
            card.className = 'event-card';

            const photoSrc = event.photo ? event.photo : 'https://via.placeholder.com/400x200?text=No+Photo';
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const detailsText = event.details || 'No additional details provided.';

            card.innerHTML = ` 

            /* NEEDS REFACTORING: ISSUE: If event is uploaded, it triples and duplicates*/
            
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

            const deleteBtn = card.querySelector('.delete-icon');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                    let currentEvents = JSON.parse(localStorage.getItem('brgyEvents')) || [];
                    currentEvents = currentEvents.filter(e => e.id !== event.id);
                    localStorage.setItem('brgyEvents', JSON.stringify(currentEvents));
                    displayEvents();
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

        if (ongoingEventsList) {
            ongoingEventsList.innerHTML = '';
            ongoingEvents.forEach(event => {
                const card = createEventCard(event);
                ongoingEventsList.appendChild(card);
            });
        }

        if (upcomingEventsList) {
            upcomingEventsList.innerHTML = '';
            upcomingEvents.forEach(event => {
                const card = createEventCard(event);
                upcomingEventsList.appendChild(card);
            });
        }
    };

    if (document.getElementById('ongoingEventsList')) {
        displayEvents();
    }
});

document.addEventListener('DOMContentLoaded', () => {
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
            if (document.getElementById('editEventId')) document.getElementById('editEventId').value = "";

            if (loadedPhoto) loadedPhoto.style.display = 'none';
            if (defaultIcon) defaultIcon.style.display = 'block';
            if (placeholderText) placeholderText.style.display = 'block';

            const titleEl = document.querySelector('#eventModal .modal-header h3');
            if (titleEl) titleEl.innerText = "Create New Announcement";

            document.getElementById('eventModal').classList.remove('active');
            if (typeof window.displayEvents === 'function') window.displayEvents();
        });
    }
});

window.editEvent = function(id) {
    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    const ev = events.find(e => e.id == id);

    if (ev) {
        const editIdInput = document.getElementById('editEventId');
        if (editIdInput) editIdInput.value = ev.id;

        document.getElementById('eventTitle').value = ev.title || '';
        document.getElementById('eventDetails').value = ev.details || '';
        document.getElementById('eventType').value = ev.type || 'upcoming';
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

        document.getElementById('eventModal').classList.add('active');
    }
};

window.displayEvents = function() {
    const ongoing = document.getElementById('ongoingEventsList');
    const upcoming = document.getElementById('upcomingEventsList');
    if (!ongoing) return;

    const events = JSON.parse(localStorage.getItem('brgyEvents')) || [];
    ongoing.innerHTML = '';
    upcoming.innerHTML = '';

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
};

window.deleteEvent = (id) => {
    if (confirm("Delete announcement?")) {
        let evs = JSON.parse(localStorage.getItem('brgyEvents')) || [];
        localStorage.setItem('brgyEvents', JSON.stringify(evs.filter(e => e.id !== id)));
        window.displayEvents();
    }
};
