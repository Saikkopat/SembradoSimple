<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auxiliar.php';

try {
    $action = $_POST['action'] ?? null;

    if (!$action || !is_string($action)) {
        throw new InvalidArgumentException('Acción no especificada');
    }

    switch ($action) {
        case 'alcaldias':
            handleAlcaldias();
            break;

        case 'personas':
            handlePersonas();
            break;

        default:
            throw new RuntimeException("Acción no válida: $action");
    }
} catch (Throwable $e) {
    sendErrorResponse($e->getMessage(), 500);
}

/**
 * Obtiene la lista de personas, opcionalmente filtradas por alcaldía
 */
function handlePersonas(): void {
    $conn = getDatabaseConnection();
    $idAlcaldia = $_POST['id_alcaldia'] ?? null;

    $query = "
        SELECT p.primer_apellido, p.segundo_apellido, p.nombre_persona, 
               p.activo, a.nombre_alcaldia, p.telefono_personal, p.telefono_institucional
        FROM personas p
        LEFT JOIN alcaldias a ON p.id_alcaldia = a.id_alcaldia
        WHERE p.id_persona IN (SELECT id_persona FROM posiciones_personas pp WHERE pp.id_posicion IN (3))
        AND p.id_persona NOT IN (SELECT id_persona FROM sembrado_racimo)
    ";

    $params = [];
    if ($idAlcaldia) {
        $query .= " AND p.id_alcaldia = $1";
        $params[] = $idAlcaldia;
    }

    $result = pg_query_params($conn, $query, $params);

    if (!$result) {
        throw new RuntimeException('Error al obtener personas: ' . pg_last_error($conn));
    }

    sendDataResponse($result);
}