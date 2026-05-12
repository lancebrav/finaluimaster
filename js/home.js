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
                residentGender: allDropdownMenusList[0].value,
                residentBirthDate: birthDateInput.value,
                residentEmailAddress: emailAddressInput.value,
                residentContactNumber: contactNumberInput.value,
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
                alert(docType + " Submitted Successfully! You will receive an SMS update shortly.");
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
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
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