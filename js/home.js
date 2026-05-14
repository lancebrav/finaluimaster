/**
 * BARANGAY 663 - HOME.JS
 * Combined Logic for Animations, Modals, Services, and Mobile Nav
 */

// --- 1. REVEAL ANIMATION ON SCROLL ---
function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            el.classList.add("active");
        }
    });
}

// --- 2. MODAL LOGIC (OPEN/CLOSE) ---
function openModal(documentType) {
    const modal = document.getElementById('requestModal');
    const header = document.getElementById('modalHeader');
    const form = document.getElementById('residentForm');
    
    if (modal && header && form) {
        // 1. Reset the form fields so previous inputs don't reflect here
        form.reset();
        
        // 2. Clear out the "Upload" text and colors
        resetUploadUI();

        // 3. Set the new header and doc-type
        header.innerText = "Application for " + documentType;
        form.setAttribute('data-doc-type', documentType); 
        
        // 4. Initialize phone validation
        initializePhoneValidation();
        
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; 
    }
}

// Helper function to clean up the upload boxes
function resetUploadUI() {
    document.querySelectorAll('.upload-area').forEach(area => {
        area.style.borderColor = "#ccc";
        area.style.backgroundColor = "#fafafa";
        const p = area.querySelector('p');
        if (p) {
            // Restore default text based on the icon inside
            p.innerText = area.querySelector('.fa-camera') ? "Upload Photo" : "Upload IDs";
        }
    });
}

function closeModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Resume scrolling
    }
}

// NOTE: The "Click outside to close" window.addEventListener has been intentionally removed
// so the user does not lose form data if they accidentally click the background.

// --- 3. AUTOMATIC PHOTO SCROLL (GALLERY) ---
function startAutoScroll() {
    const gallery = document.getElementById('autoPhotos');
    if (!gallery) return;

    let isPaused = false;
    const scrollStep = 1; 
    const scrollSpeed = 30; 

    setInterval(() => {
        if (!isPaused) {
            gallery.scrollLeft += scrollStep;
            if (gallery.scrollLeft >= (gallery.scrollWidth - gallery.clientWidth)) {
                gallery.scrollLeft = 0;
            }
        }
    }, scrollSpeed);

    gallery.addEventListener('mouseenter', () => isPaused = true);
    gallery.addEventListener('mouseleave', () => isPaused = false);
}

// --- 4. FILE UPLOAD UI LOGIC ---
// Initialize triggers for all upload areas
document.querySelectorAll('.upload-area').forEach((area, index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = "image/*"; 
    
    // The second upload area (index 1) allows multiple files for IDs
    if (index === 1) input.multiple = true; 

    area.appendChild(input);
    area.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            const fileName = input.files.length > 1 
                ? `${input.files.length} files selected` 
                : input.files[0].name;
            
            const p = area.querySelector('p');
            if (p) p.innerText = fileName;
            
            area.style.borderColor = "var(--orange)";
            area.style.backgroundColor = "#fff9f2";
        }
    });
});

// --- 5. PHONE NUMBER VALIDATION ---
function initializePhoneValidation() {
    const contactNumberInput = document.querySelector('input[type="tel"]');
    if (!contactNumberInput) return;

    contactNumberInput.addEventListener('input', function(event) {
        let value = this.value;
        
        // Remove any non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        
        // If user tried to enter letters, show warning
        if (digitsOnly !== value && value.length > digitsOnly.length) {
            showNotification('⚠️ Only numbers are allowed in the phone field!', 'warning');
        }
        
        // Limit to 11 digits
        if (digitsOnly.length > 11) {
            showNotification('❌ Phone number cannot exceed 11 digits!', 'error');
            this.value = digitsOnly.substring(0, 11);
        } else {
            this.value = digitsOnly;
        }
    });

    contactNumberInput.addEventListener('keypress', function(event) {
        // Check if the key pressed is NOT a number
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
            showNotification('⚠️ Only numeric input is allowed!', 'warning');
        }
    });
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 20px;
        background-color: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        border-radius: 4px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.querySelector('style[data-phone-validation]')) {
    const style = document.createElement('style');
    style.setAttribute('data-phone-validation', 'true');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(-50%) translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-20px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// --- 5. FORM SUBMISSION & ADMIN SYNC ---
document.addEventListener('DOMContentLoaded', () => {
    const residentForm = document.getElementById('residentForm');

    if (residentForm) {
        residentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // 1. Identify Document Type
            const docType = this.getAttribute('data-doc-type') || "Document Request";

            // 2. Fetch all inputs
            const allTextInputsList = this.querySelectorAll('input[type="text"]');
            const allDropdownMenusList = this.querySelectorAll('select');
            const birthDateInput = this.querySelector('input[type="date"]');
            const emailAddressInput = this.querySelector('input[type="email"]');
            const contactNumberInput = this.querySelector('input[type="tel"]');
            const purposeOfRequestInput = this.querySelector('textarea');

            // 3. Update Button State
            const submitBtn = this.querySelector('.submit-full');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Processing Request...";
            submitBtn.disabled = true;

            // 4. Create the Request Object
            const newRequest = {
                id: Date.now(), // Gives it a unique ID
                status: 'Ongoing', // Sets default status so Admin knows it's new
                dateRequested: new Date().toLocaleDateString(), // Captures today's date
                documentType: docType,
                
                // Resident Info
                residentFirstName: allTextInputsList[0].value,
                residentMiddleName: allTextInputsList[1].value,
                residentLastName: allTextInputsList[2].value,
                residentSuffix: allTextInputsList[3].value,
                residentGender: allDropdownMenusList[0].value,
                residentNationality: allTextInputsList[4].value,
                residentCivilStatus: allDropdownMenusList[1].value,
                residentBirthDate: birthDateInput.value,
                residentPlaceOfBirth: allTextInputsList[5].value,
                residentEmailAddress: emailAddressInput.value,
                residentContactNumber: contactNumberInput.value,
                residentVoterStatus: allDropdownMenusList[2].value,
                residentPrecinctNumber: allTextInputsList[6].value,
                residentFullAddress: `${allTextInputsList[7].value} ${allDropdownMenusList[3].value}, Barangay 663, Manila`,
                residentPurposeOfRequest: purposeOfRequestInput.value
            };

            // 5. SAVE TO A PERMANENT ARRAY IN LOCALSTORAGE
            // Get the existing list of requests (or start a new empty list)
            let existingRequests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
            
            // Add the new request to the top of the list
            existingRequests.unshift(newRequest);
            
            // Save the updated list back to the browser
            localStorage.setItem('brgyDocumentRequests', JSON.stringify(existingRequests));

            // 6. Simulate Success and Reset
            setTimeout(() => {
                alert(docType + " Submitted Successfully!");
                this.reset();
                if(typeof closeModal === 'function') closeModal(); 
                if(typeof resetUploadUI === 'function') resetUploadUI();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
});

// --- 6. INITIALIZATION & MOBILE NAV ---
window.addEventListener("scroll", reveal);
window.addEventListener("load", () => {
    reveal();
    if(typeof startAutoScroll === 'function') startAutoScroll();
});

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('header nav');
    let mobileMenu = document.getElementById('mobile-menu');

    if (nav && !mobileMenu) {
        const header = document.querySelector('header');
        if (header) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'menu-toggle';
            mobileMenu.id = 'mobile-menu';
            mobileMenu.innerHTML = '<i class="fas fa-bars"></i>';
            header.insertBefore(mobileMenu, nav);
        }
    }

    if (mobileMenu && nav) {
        const menuIcon = mobileMenu.querySelector('i');
        mobileMenu.addEventListener('click', () => {
            nav.classList.toggle('active');
            if (nav.classList.contains('active')) {
                menuIcon.classList.replace('fa-bars', 'fa-times');
            } else {
                menuIcon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }
});