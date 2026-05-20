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
        const preview = area.querySelector('.upload-preview');
        if (preview) {
            preview.removeAttribute('src');
            preview.style.display = 'none';
        }
        const icon = area.querySelector('i');
        if (icon) {
            icon.style.display = '';
        }
        delete area.dataset.fileData;
        delete area.dataset.uploadType;
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
if (typeof window.getBase64 !== 'function') {
    window.getBase64 = function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };
}

// Initialize triggers for all upload areas
document.querySelectorAll('.upload-area').forEach((area, index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = "image/*"; 
    
    // The second upload area (index 1) allows multiple files for IDs
    if (index === 1) input.multiple = true; 

    area.appendChild(input);
    const previewImg = document.createElement('img');
    previewImg.className = 'upload-preview';
    previewImg.alt = 'Upload preview';
    previewImg.style.cssText = 'display:none; width:100%; height:100%; object-fit:cover; border-radius:8px;';
    area.appendChild(previewImg);
    area.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            const fileName = input.files.length > 1 
                ? `${input.files.length} files selected` 
                : input.files[0].name;

            if (index === 0) {
                window.getBase64(input.files[0]).then((dataUrl) => {
                    area.dataset.uploadType = 'photo';
                    area.dataset.fileData = dataUrl;
                    previewImg.src = dataUrl;
                    previewImg.style.display = 'block';
                    const icon = area.querySelector('i');
                    if (icon) icon.style.display = 'none';
                });
            } else if (index === 1) {
                const files = Array.from(input.files);
                Promise.all(files.map(file => window.getBase64(file))).then((dataUrls) => {
                    area.dataset.uploadType = 'id';
                    area.dataset.fileData = JSON.stringify(dataUrls);
                    previewImg.src = dataUrls[0] || '';
                    previewImg.style.display = dataUrls[0] ? 'block' : 'none';
                    const icon = area.querySelector('i');
                    if (icon) icon.style.display = dataUrls[0] ? 'none' : '';
                });
            }
            
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

        residentForm.addEventListener('submit', async function(event) {
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

            let residentValidation = null;
            if (typeof window.validateDocumentRequestResident === 'function') {
                residentValidation = window.validateDocumentRequestResident();
                if (!residentValidation.valid) {
                    showNotification(residentValidation.message, 'error');
                    return;
                }
            }

            const docType = this.getAttribute('data-doc-type') || "Document Request";
            
            const purposeDropdown = document.getElementById('purposeDropdown');
            const otherPurposeText = document.getElementById('otherPurposeText');
            let finalPurpose = purposeDropdown ? purposeDropdown.value : "";
            if (finalPurpose === 'Others' && otherPurposeText) {
                finalPurpose = otherPurposeText.value;
            }

            // Combine Prefix and Contact Number
            const prefix = document.getElementById('contactPrefix')?.value || '';
            const number = document.getElementById('contactNumber')?.value || '';
            const fullContactNumber = prefix + number;

            const uploadAreas = Array.from(document.querySelectorAll('.upload-area'));
            const photoData = uploadAreas.find(area => area.dataset.uploadType === 'photo')?.dataset.fileData || '';
            const idDataRaw = uploadAreas.find(area => area.dataset.uploadType === 'id')?.dataset.fileData || '';
            let idData = '';
            if (idDataRaw) {
                try {
                    idData = JSON.parse(idDataRaw);
                } catch (err) {
                    idData = idDataRaw;
                }
            }

            const supportingDocuments = {
                photo: photoData,
                id: idData
            };

            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Processing Request...";
            submitBtn.disabled = true;

            const firstName = document.getElementById('firstName')?.value || '';
            const lastName = document.getElementById('lastName')?.value || '';

            const newRequest = {
                status: 'Ongoing',
                dateRequested: new Date().toISOString().split('T')[0],
                documentType: docType,
                resident_id: residentValidation ? residentValidation.resident_id : null,
                firstName,
                middleName: document.getElementById('middleName')?.value || '',
                lastName,
                suffix: document.getElementById('suffix')?.value || '',
                gender: document.getElementById('gender')?.value || '',
                nationality: document.getElementById('nationality')?.value || '',
                civilStatus: document.getElementById('civilStatus')?.value || '',
                birthDate: document.getElementById('birthDate')?.value || '',
                placeOfBirth: document.getElementById('placeOfBirth')?.value || '',
                voterStatus: document.getElementById('voterStatus')?.value || '',
                houseNo: document.getElementById('houseNo')?.value || '',
                street: document.getElementById('street')?.value || '',
                purpose_of_request: finalPurpose,
                notification_email: document.getElementById('emailAddress')?.value || '',
                contact_number: fullContactNumber,
                supporting_documents: supportingDocuments
            };

            let savedOk = false;
            fetch('../php/add_document_request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest)
            })
            .then(resp => resp.json())
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Submission failed');
                }
                savedOk = true;

                return fetch('../php/send_submission_email.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: newRequest.notification_email,
                        name: (firstName + ' ' + (lastName || '')).trim(),
                        docType: newRequest.documentType,
                        requestId: result.id,
                        subject: newRequest.documentType + ' Submission Received'
                    })
                })
                .then(r => r.json())
                .then(emailResult => {
                    if (!emailResult.success) {
                        showNotification('Submitted but email failed: ' + (emailResult.message || ''), 'warning');
                    }
                });
            })
            .catch(err => {
                console.error('Submission error:', err);
                showNotification('Request submission failed. Please try again.', 'error');
            })
            .finally(() => {
                if (savedOk) {
                    showNotification(docType + " Submitted Successfully!", "success");
                    this.reset();
                    if(typeof closeModal === 'function') closeModal(); 
                    if(typeof resetUploadUI === 'function') resetUploadUI();
                }
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
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