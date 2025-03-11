<?php
include 'db.php';
header('Content-Type: application/json');

$id_alcaldia = $_GET['id_alcaldia'] ?? '';
$casas = [];

for ($i = 0; $i < 3; $i++) {
    $result = pg_query_params($conn, 
        "SELECT id_casa, nombre_casa FROM casas_gobierno WHERE id_alcaldia = $1",
        [$id_alcaldia]
    );
    
    if ($result) {
        while ($row = pg_fetch_assoc($result)) {
            $casas[] = [
                'id' => $row['id_casa'],
                'nombre' => $row['nombre_casa']
            ];
        }
        break;
    }
    sleep(2);
}

echo json_encode($casas);
?>