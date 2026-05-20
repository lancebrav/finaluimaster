<?php
header('Content-Type: application/json');
require_once 'db.php';

$result = mysqli_query(
    $conn,
    "SELECT resident_id, firstName, middleName, lastName, suffix, birthday, gender,
            houseNum, civilStatus, voterStatus, placeOfBirth, citizenship, streetName
     FROM residents
     WHERE is_archived = 0
     ORDER BY lastName ASC, firstName ASC"
);

$residents = [];
while ($row = mysqli_fetch_assoc($result)) {
    $residents[] = $row;
}

echo json_encode(['success' => true, 'residents' => $residents]);

mysqli_close($conn);
?>
