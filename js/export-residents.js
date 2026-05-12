/**
 * export-residents.js
 * Handles Export to Excel for the Manage Residents page.
 * Place this file in: js/export-residents.js
 * 
 * Requires: SheetJS (xlsx) loaded via CDN in manage-residents.html
 * Fetches ALL residents from the PHP backend (not just current page),
 * then downloads as a formatted .xlsx file.
 */

document.addEventListener('DOMContentLoaded', function () {

    const exportBtn = document.getElementById('exportExcelBtn');
    if (!exportBtn) return; // only runs on manage-residents page

    exportBtn.addEventListener('click', function () {
        exportResidentsToExcel();
    });

});

function exportResidentsToExcel() {

    // Show loading state on button
    const btn = document.getElementById('exportExcelBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
    btn.disabled = true;

    // Fetch ALL residents from backend (ignores pagination)
    fetch('../php/get_residents.php')
        .then(function (response) {
            if (!response.ok) throw new Error('Server returned ' + response.status);
            return response.json();
        })
        .then(function (data) {
            const residents = data.residents || [];

            if (residents.length === 0) {
                alert('No residents found to export.');
                return;
            }

            // Define Excel column headers
            const headers = [
                'Last Name',
                'First Name',
                'Middle Name',
                'Suffix',
                'Full Name',
                'Date of Birth',
                'Age',
                'Sex',
                'House No.',
                'Street Name',
                'Full Address',
                'Place of Birth',
                'Civil Status',
                'Citizenship',
                'Occupation',
                'House Head Relationship',
                'Voter Status'
            ];

            // Map each resident to a row
            const rows = residents.map(function (res) {
                return [
                    res.lastName               || '',
                    res.firstName              || '',
                    res.middleName             || '',
                    res.suffix                 || '',
                    res.fullName               || '',
                    res.birthday               || '',
                    res.birthday ? calculateAgeFromBirthday(res.birthday) : (res.age || ''),
                    res.gender                 || '',
                    res.houseNum               || '',
                    res.streetName             || '',
                    res.address                || '',
                    res.placeOfBirth           || '',
                    res.civilStatus            || '',
                    res.citizenship            || 'Filipino',
                    res.occupation             || '',
                    res.houseHeadRelationship  || '',
                    res.voterStatus            || ''
                ];
            });

            // Build worksheet data (headers + rows)
            const wsData = [headers].concat(rows);
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Auto column widths based on content
            ws['!cols'] = headers.map(function (h, i) {
                const maxLen = Math.max(
                    h.length,
                    Math.max.apply(null, rows.map(function (r) {
                        return String(r[i] || '').length;
                    }))
                );
                return { wch: Math.min(maxLen + 4, 40) };
            });

            // Create workbook and append sheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Residents');

            // Filename with today's date
            const today = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, 'Barangay663_Residents_' + today + '.xlsx');
        })
        .catch(function (err) {
            console.error('Export error:', err);
            alert('Export failed: ' + err.message + '\n\nMake sure you are accessing via http://localhost and not file://');
        })
        .finally(function () {
            // Restore button state
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        });
}

/**
 * Calculates age from a birthday string (YYYY-MM-DD)
 * Used as fallback if window.calculateAge is not available
 */
function calculateAgeFromBirthday(birthday) {
    if (typeof window.calculateAge === 'function') {
        return window.calculateAge(birthday);
    }
    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}
