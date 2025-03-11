<?php
include 'db.php';

$data = [
    'id_racimo' => $_POST['racimo'],
    'id_persona' => $_POST['persona']
];

$result = pg_insert($conn, 'sembrado_racimo', $data);
if ($result) {
    header("Location: racimoExitoso.html");
} else {
    echo "Error: " . pg_last_error($conn);
}
?>