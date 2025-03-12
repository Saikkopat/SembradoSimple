<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $action = $_GET['action'] ?? ($_POST['action'] ?? '');
    $response = ['success' => false];
    
    switch ($action) {
        /* Obtener Alcaldías */
        case 'alcaldias':
            $result = pg_query($conn, "SELECT id_alcaldia as id, nombre_alcaldia as nombre FROM alcaldias");
            break;

        /* Obtener Casas de Gobierno */
        case 'casas':
            $id_alcaldia = $_GET['id_alcaldia'] ?? null;
            $result = pg_query_params($conn, 
                "SELECT id_casa as id, nombre_casa as nombre 
                 FROM casas_gobierno 
                 WHERE id_alcaldia = $1",
                [$id_alcaldia]
            );
            break;

        /* Obtener Coordinaciones Territoriales */
        case 'coordinaciones':
            $id_casa = $_GET['id_casa'] ?? null;
            $result = pg_query_params($conn, 
                "SELECT id_coordinacion as id, nombre_coordinacion as nombre 
                 FROM coordinaciones_territoriales 
                 WHERE id_casa = $1",
                [$id_casa]
            );
            break;

        /* Obtener Racimos */
        case 'racimos':
            $id_coordinacion = $_GET['id_coordinacion'] ?? null;
            $result = pg_query_params($conn, 
                "SELECT id_racimo as id, nombre_racimo as nombre 
                 FROM racimos 
                 WHERE id_coordinacion = $1",
                [$id_coordinacion]
            );
            break;

        /* Obtener Personas */
        case 'personas':
            $id_alcaldia = $_GET['id_alcaldia'] ?? null;
            $result = pg_query_params($conn, 
                "SELECT p.id_persona as id, 
                 CONCAT(p.primer_apellido, ' ', COALESCE(p.segundo_apellido, ''), ' ', p.nombre_persona) as nombre
                 FROM personas p
                 WHERE p.id_alcaldia = $1
                 AND p.activo = true
                 AND p.id_posicion = 3
                 AND p.id_persona NOT IN (SELECT id_persona FROM sembrado_uba)
                 ORDER BY primer_apellido",
                [$id_alcaldia]
            );
            break;

        /* Guardar Registro */
        case 'guardar':
            pg_query($conn, "BEGIN"); // Iniciar transacción
            try {
                // Verificar que el ID de la persona y el racimo estén presentes
                $id_persona = $_POST['id_persona'] ?? null;
                $id_racimo = $_POST['id_racimo'] ?? null;

                if (!$id_persona || !$id_racimo) {
                    throw new Exception('Datos incompletos: ID de persona o racimo no proporcionado.');
                }

                // Insertar en sembrado_racimo
                $sembradoResult = pg_query_params($conn,
                    "INSERT INTO sembrado_racimo (id_racimo, id_persona) 
                     VALUES ($1, $2)",
                    [$id_racimo, $id_persona]
                );

                if (!$sembradoResult) {
                    throw new Exception('Error al asignar racimo: ' . pg_last_error($conn));
                }

                pg_query($conn, "COMMIT"); // Confirmar transacción
                $response['success'] = true;
                $response['message'] = 'Racimo asignado exitosamente!';
            } catch (Exception $e) {
                pg_query($conn, "ROLLBACK"); // Revertir en caso de error
                throw $e;
            }
            break;

        default:
            throw new Exception('Acción no válida');
    }

    // Procesar resultados de consultas
    if (isset($result)) {
        $response['data'] = pg_fetch_all($result) ?: [];
        $response['success'] = !empty($response['data']) || $action === 'guardar';
    }

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}