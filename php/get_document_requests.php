<?php
header('Content-Type: application/json');
require_once 'db.php';

$sql = "SELECT dr.*,
               r.firstName,
               r.middleName,
               r.lastName,
               r.suffix,
               r.birthday,
               r.gender,
               r.houseNum,
               r.civilStatus,
               r.voterStatus,
               r.placeOfBirth,
               r.citizenship,
               r.streetName,
               r.fullName
        FROM document_requests dr
        INNER JOIN residents r ON dr.resident_id = r.resident_id
        WHERE dr.is_archived = 0
        ORDER BY dr.date_requested DESC, dr.request_id DESC";

$result = mysqli_query($conn, $sql);
$requests = [];

while ($row = mysqli_fetch_assoc($result)) {
    $requests[] = $row;
}

echo json_encode(['success' => true, 'requests' => $requests]);

mysqli_close($conn);
?>
