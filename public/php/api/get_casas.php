<?php
require_once '../db_connect.php';

$id_alcaldia = $_GET['id_alcaldia'] ?? '';

$result = pg_query_params($conn, 
    "SELECT id_casa, nombre_casa FROM casas_gobierno WHERE id_alcaldia = $1",
    [$id_alcaldia]
);

$casas = [];
while ($row = pg_fetch_assoc($result)) {
    $casas[] = $row;
}

echo json_encode($casas);
?>