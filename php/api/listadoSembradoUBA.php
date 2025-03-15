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
        case 'obtener_personas_sembradas':
            handleObtenerPersonasSembradas();
            break;

        case 'eliminar_persona_sembrada':
            handleEliminarPersonaSembrada();
            break;

        default:
            throw new RuntimeException("Acción no válida: $action");
    }
} catch (Throwable $e) {
    sendErrorResponse($e->getMessage(), 500);
}

/**
 * Obtiene la lista de personas sembradas con sus UBAs
 */
function handleObtenerPersonasSembradas(): void {
    $conn = getDatabaseConnection();

    $query = "
        SELECT 
            s.id_uba,
            s.id_persona,
            p.primer_apellido,
            p.segundo_apellido,
            p.nombre_persona,
            p.telefono_personal,
            p.telefono_institucional
        FROM 
            sembrado_uba s
        JOIN 
            personas p ON s.id_persona = p.id_persona
    ";

    $result = pg_query($conn, $query);

    if (!$result) {
        throw new RuntimeException('Error al obtener personas sembradas: ' . pg_last_error($conn));
    }

    sendDataResponse($result);
}

/**
 * Elimina una persona sembrada
 */
function handleEliminarPersonaSembrada(): void {
    $conn = getDatabaseConnection();
    $idPersona = validatePostParam('id_persona');

    // Eliminar la persona de la tabla sembrado_uba
    $query = "DELETE FROM sembrado_uba WHERE id_persona = $1";
    $result = pg_query_params($conn, $query, [$idPersona]);

    if (!$result) {
        throw new RuntimeException('Error al eliminar persona sembrada: ' . pg_last_error($conn));
    }

    echo json_encode(['success' => true, 'message' => 'Persona eliminada correctamente']);
}