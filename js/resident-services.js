/**
 * Resident document request validation for resident-services.html
 * Only registered residents whose form details match the registry may submit.
 */

let cachedResidentsRegistry = [];

function normalizeResidentString(value) {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function normalizeResidentGender(value) {
    const normalized = normalizeResidentString(value);
    if (normalized === 'male' || normalized === 'm') return 'm';
    if (normalized === 'female' || normalized === 'f') return 'f';
    return normalized;
}

function normalizeResidentVoterStatus(value) {
    const normalized = normalizeResidentString(value);
    if (normalized === 'not registered' || normalized === 'unregistered') return 'unregistered';
    if (normalized === 'registered' || normalized === 'registered voter') return 'registered';
    return normalized;
}

function normalizeResidentDate(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return normalizeResidentString(trimmed);
    return parsed.toISOString().split('T')[0];
}

function residentIdentityMatches(submitted, resident) {
    const checks = [
        ['firstName', 'firstName'],
        ['middleName', 'middleName'],
        ['lastName', 'lastName'],
        ['suffix', 'suffix'],
        ['civilStatus', 'civilStatus'],
        ['placeOfBirth', 'placeOfBirth'],
        ['nationality', 'citizenship'],
        ['houseNo', 'houseNum'],
        ['street', 'streetName']
    ];

    for (const [submittedKey, residentKey] of checks) {
        if (normalizeResidentString(submitted[submittedKey]) !== normalizeResidentString(resident[residentKey])) {
            return false;
        }
    }

    if (normalizeResidentGender(submitted.gender) !== normalizeResidentGender(resident.gender)) {
        return false;
    }

    if (normalizeResidentVoterStatus(submitted.voterStatus) !== normalizeResidentVoterStatus(resident.voterStatus)) {
        return false;
    }

    if (normalizeResidentDate(submitted.birthDate) !== normalizeResidentDate(resident.birthday)) {
        return false;
    }

    return true;
}

function buildSubmittedResidentProfile() {
    const prefix = document.getElementById('contactPrefix')?.value || '';
    const number = document.getElementById('contactNumber')?.value || '';

    return {
        firstName: document.getElementById('firstName')?.value || '',
        middleName: document.getElementById('middleName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        suffix: document.getElementById('suffix')?.value || '',
        gender: document.getElementById('gender')?.value || '',
        nationality: document.getElementById('nationality')?.value || '',
        civilStatus: document.getElementById('civilStatus')?.value || '',
        birthDate: document.getElementById('birthDate')?.value || '',
        placeOfBirth: document.getElementById('placeOfBirth')?.value || '',
        voterStatus: document.getElementById('voterStatus')?.value || '',
        houseNo: document.getElementById('houseNo')?.value || '',
        street: document.getElementById('street')?.value || '',
        emailAddress: document.getElementById('emailAddress')?.value || '',
        contactNumber: prefix + number
    };
}

function findMatchingResident(submitted) {
    const firstName = normalizeResidentString(submitted.firstName);
    const lastName = normalizeResidentString(submitted.lastName);

    if (!firstName || !lastName) {
        return null;
    }

    return cachedResidentsRegistry.find((resident) => residentIdentityMatches(submitted, resident)) || null;
}

async function loadResidentsRegistry() {
    try {
        const response = await fetch('../php/get_residents_registry.php');
        const data = await response.json();
        cachedResidentsRegistry = Array.isArray(data.residents) ? data.residents : [];
    } catch (err) {
        console.error('Failed to load residents registry:', err);
        cachedResidentsRegistry = [];
    }
}

window.validateDocumentRequestResident = function() {
    const submitted = buildSubmittedResidentProfile();
    const match = findMatchingResident(submitted);

    if (!match) {
        return {
            valid: false,
            message: 'Only registered barangay residents may request documents. The information you entered does not match our resident records. Please verify your details or visit the barangay office.'
        };
    }

    return {
        valid: true,
        resident_id: parseInt(match.resident_id, 10),
        resident: match,
        submitted
    };
};

document.addEventListener('DOMContentLoaded', () => {
    loadResidentsRegistry();
});
