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
        
        // Remove any lingering red error highlights from regular inputs and checkbox groups
        form.querySelectorAll('[required]').forEach(el => {
            el.style.borderColor = '';
            el.style.backgroundColor = '';
            if (el.type === 'radio' || el.type === 'checkbox') {
                el.closest('.checkbox-group, div').style.color = '';
            }
        });
        
        // Ensure the "Others" container is hidden upon opening
        const otherPurposeContainer = document.getElementById("otherPurposeContainer");
        const otherPurposeText = document.getElementById("otherPurposeText");
        if (otherPurposeContainer && otherPurposeText) {
            otherPurposeContainer.style.display = "none";
            otherPurposeText.removeAttribute("required");
        }
        
        // 2. Clear out the "Upload" text and colors
        resetUploadUI();

        // 3. Set the new header and doc-type
        header.innerText = "Application for " + documentType;
        form.setAttribute('data-doc-type', documentType); 
        
        // 4. Initialize validations
        initializePhoneValidation();
        initializePhilSysValidation();
        
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
            
            // Revert back to the active theme color if file is provided
            area.style.borderColor = "var(--orange)";
            area.style.backgroundColor = "#fff9f2";
        }
    });
});

// --- 5. FIELD VALIDATIONS (PHONE & PHILSYS) ---
function initializePhoneValidation() {
    const contactPrefix = document.getElementById('contactPrefix');
    const contactNumberInput = document.getElementById('contactNumber');
    
    if (!contactNumberInput || !contactPrefix) return;

    // Update placeholder based on selected prefix
    contactPrefix.addEventListener('change', function() {
        contactNumberInput.value = ''; // Clear input on prefix change
        if (this.value === '09') {
            contactNumberInput.placeholder = "XXXXXXXXX (9 digits)";
        } else {
            contactNumberInput.placeholder = "9XXXXXXXXX (10 digits)";
        }
    });

    contactNumberInput.addEventListener('input', function(event) {
        let value = this.value;
        const digitsOnly = value.replace(/\D/g, '');
        
        if (digitsOnly !== value && value.length > digitsOnly.length) {
            showNotification('⚠️ Only numbers are allowed in the phone field!', 'warning');
        }
        
        // Determine max length based on prefix
        const maxLength = contactPrefix.value === '09' ? 9 : 10;

        if (digitsOnly.length > maxLength) {
            showNotification(`❌ Phone number cannot exceed ${maxLength} digits for this format!`, 'error');
            this.value = digitsOnly.substring(0, maxLength);
        } else {
            this.value = digitsOnly;
        }
    });

    contactNumberInput.addEventListener('keypress', function(event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
            showNotification('⚠️ Only numeric input is allowed!', 'warning');
        }
    });
}

function initializePhilSysValidation() {
    const philsysInput = document.getElementById('philsysNumber');
    if (!philsysInput) return;

    philsysInput.addEventListener('input', function(event) {
        let value = this.value;
        
        // Strip out any non-digit characters
        let digitsOnly = value.replace(/\D/g, '');
        
        // Show warning if letters or symbols are typed
        if (digitsOnly !== value && value.length > digitsOnly.length) {
            showNotification('⚠️ Only numbers are allowed in the PhilSys field!', 'warning');
        }

        // Limit data capture to exactly 16 digits
        if (digitsOnly.length > 16) {
            showNotification('❌ PhilSys Number cannot exceed 16 digits!', 'error');
            digitsOnly = digitsOnly.substring(0, 16);
        }

        // Chunk into groups of 4 separated by dashes (XXXX-XXXX-XXXX-XXXX)
        const groups = digitsOnly.match(/\d{1,4}/g);
        if (groups) {
            this.value = groups.join('-');
        } else {
            this.value = '';
        }
    });

    philsysInput.addEventListener('keypress', function(event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    });
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
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
        background-color: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2d5a27'};
        color: white;
        border-radius: 4px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
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
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// --- 6. FORM SUBMISSION, VALIDATION & ADMIN SYNC ---
document.addEventListener('DOMContentLoaded', () => {
    const residentForm = document.getElementById('residentForm');

    // --- Auto-Capitalize First Letter of Every Word ---
    const textInputs = document.querySelectorAll('#residentForm input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\b[a-z]/g, char => char.toUpperCase());
        });
    });

    if (residentForm) {
        const submitBtn = residentForm.querySelector('.submit-full');
        
        // --- Highlight empty upload areas when the submit button is clicked ---
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                document.querySelectorAll('.upload-area').forEach(area => {
                    const input = area.querySelector('input[type="file"]');
                    if (!input || input.files.length === 0) {
                        area.style.borderColor = 'var(--apple-red, #ff4d4d)';
                        area.style.backgroundColor = '#fff0f0';
                    }
                });
            });
        }
        
        // --- Error Highlighting for Native Required Fields ---
        const requiredElements = residentForm.querySelectorAll('[required]');
        requiredElements.forEach(element => {
            element.addEventListener('invalid', function(event) {
                // Highlight text inputs, select dropdowns, etc.
                this.style.borderColor = 'var(--apple-red, #ff4d4d)';
                this.style.backgroundColor = '#fff0f0';
                
                // NEW: Highlight checkbox text labels and radio wrappers red if missed
                if(this.type === 'radio' || this.type === 'checkbox') {
                    const group = this.closest('.checkbox-group') || this.parentElement;
                    if (group) group.style.color = 'var(--apple-red, #ff4d4d)';
                }

                if (this === residentForm.querySelector(':invalid')) {
                    showNotification('⚠️ Please fill out all required fields highlighted in red.', 'error');
                }
            });

            // Remove formatting errors immediately as soon as a user interacts/changes data
            const cleanError = function() {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
                
                if(this.type === 'radio' || this.type === 'checkbox') {
                    // Reset text color of all connected/sibling groups to normal text color
                    const targetName = this.getAttribute('name');
                    if (targetName && this.type === 'radio') {
                        document.querySelectorAll(`input[name="${targetName}"]`).forEach(radio => {
                            const grp = radio.closest('.checkbox-group') || radio.parentElement;
                            if (grp) grp.style.color = '';
                        });
                    } else {
                        const group = this.closest('.checkbox-group') || this.parentElement;
                        if (group) group.style.color = '';
                    }
                }
            };

            element.addEventListener('input', cleanError);
            element.addEventListener('change', cleanError);
        });

        residentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // --- Custom Validation check for required file uploads ---
            let filesMissing = false;
            document.querySelectorAll('.upload-area').forEach(area => {
                const input = area.querySelector('input[type="file"]');
                if (!input || input.files.length === 0) {
                    area.style.borderColor = 'var(--apple-red, #ff4d4d)';
                    area.style.backgroundColor = '#fff0f0';
                    filesMissing = true;
                }
            });

            if (filesMissing) {
                showNotification('⚠️ Please upload the required supporting documents.', 'error');
                return; // Stop form execution completely
            }

            const docType = this.getAttribute('data-doc-type') || "Document Request";
            
            const purposeDropdown = document.getElementById('purposeDropdown');
            const otherPurposeText = document.getElementById('otherPurposeText');
            let finalPurpose = purposeDropdown ? purposeDropdown.value : "";
            if (finalPurpose === 'Others' && otherPurposeText) {
                finalPurpose = otherPurposeText.value;
            }

            const isResidentRadio = this.querySelector('input[name="isResident"]:checked');
            const isResidentValue = isResidentRadio ? isResidentRadio.value : "N/A";

            // Combine Prefix and Contact Number
            const prefix = document.getElementById('contactPrefix')?.value || '';
            const number = document.getElementById('contactNumber')?.value || '';
            const fullContactNumber = prefix + number;

            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Processing Request...";
            submitBtn.disabled = true;

            const newRequest = {
                id: Date.now(), 
                status: 'Ongoing', 
                dateRequested: new Date().toISOString().split('T')[0], 
                documentType: docType,
                
                residentFirstName: document.getElementById('firstName')?.value || '',
                residentMiddleName: document.getElementById('middleName')?.value || '',
                residentLastName: document.getElementById('lastName')?.value || '',
                residentSuffix: document.getElementById('suffix')?.value || '',
                residentGender: document.getElementById('gender')?.value || '',
                residentNationality: document.getElementById('nationality')?.value || '',
                residentCivilStatus: document.getElementById('civilStatus')?.value || '',
                residentBirthDate: document.getElementById('birthDate')?.value || '',
                residentPlaceOfBirth: document.getElementById('placeOfBirth')?.value || '',
                residentEmailAddress: document.getElementById('emailAddress')?.value || '',
                residentContactNumber: fullContactNumber,
                residentVoterStatus: document.getElementById('voterStatus')?.value || '',
                residentPhilSysNumber: document.getElementById('philsysNumber')?.value || '',
                residentHouseNo: document.getElementById('houseNo')?.value || '',
                residentStreet: document.getElementById('street')?.value || '',
                
                residentPurposeOfRequest: finalPurpose,
                residentIsResident: isResidentValue 
            };

            let existingRequests = JSON.parse(localStorage.getItem('brgyDocumentRequests')) || [];
            existingRequests.unshift(newRequest);
            localStorage.setItem('brgyDocumentRequests', JSON.stringify(existingRequests));

            setTimeout(() => {
                showNotification(docType + " Submitted Successfully!", "success");
                this.reset();
                if(typeof closeModal === 'function') closeModal(); 
                if(typeof resetUploadUI === 'function') resetUploadUI();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
});

// --- 7. INITIALIZATION & MOBILE NAV ---
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

document.addEventListener("DOMContentLoaded", function () {
    const purposeDropdown = document.getElementById("purposeDropdown");
    const otherPurposeContainer = document.getElementById("otherPurposeContainer");
    const otherPurposeText = document.getElementById("otherPurposeText");

    if (purposeDropdown && otherPurposeContainer && otherPurposeText) {
        purposeDropdown.addEventListener("change", function () {
            if (this.value === "Others") {
                otherPurposeContainer.style.display = "flex";
                otherPurposeText.setAttribute("required", "required");
            } else {
                otherPurposeContainer.style.display = "none";
                otherPurposeText.removeAttribute("required");
                otherPurposeText.value = ""; 
                otherPurposeText.style.borderColor = '';
                otherPurposeText.style.backgroundColor = '';
            }
        });
    }
});