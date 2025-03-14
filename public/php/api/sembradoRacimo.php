<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auxiliar.php';

/**
 * Controlador principal para el API de Sembrado Racimo
 */
try {
    // Obtener la acción solicitada desde POST
    $action = $_POST['action'] ?? null;
    
    // Validar que la acción existe y es un string válido
    if (!$action || !is_string($action)) {
        throw new InvalidArgumentException('Acción no especificada');
    }

    // Router principal que dirige a la función correspondiente
    switch ($action) {
        /* Obtener Alcaldías */
        case 'alcaldias':
            handleAlcaldias(); // Llamada a la función en auxiliar.php
            break;

        /* Obtener Casas de Gobierno */
        case 'casas':
            handleCasas();
            break;

        /* Obtener Coordinaciones Territoriales */
        case 'coordinaciones':
            handleCoordinaciones();
            break;

        /* Obtener Racimos disponibles */
        case 'racimos':
            handleRacimosDisponibles();
            break;

        /* Obtener Personas para Racimo */
        case 'personas_racimo':
            handlePersonasRacimo();
            break;

        /* Registrar nueva asignación de Racimo */
        case 'guardar_racimo':
            handleGuardarRacimo();
            break;

        default:
            throw new RuntimeException("Acción no válida: $action");
    }
} catch (Throwable $e) {
    // Manejo centralizado de errores
    sendErrorResponse($e->getMessage(), 500);
}

/**
 * Obtiene las casas de gobierno para una alcaldía específica
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_alcaldia
 */
function handleCasas(): void {
    $conn = getDatabaseConnection();
    $idAlcaldia = validatePostParam('id_alcaldia');
    
    $result = pg_query_params(
        $conn,
        "SELECT id_casa AS id, nombre_casa AS nombre 
         FROM casas_gobierno 
         WHERE id_alcaldia = $1 
         ORDER BY nombre_casa",
        [$idAlcaldia]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener casas: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Obtiene las coordinaciones territoriales para una casa específica
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_casa
 */
function handleCoordinaciones(): void {
    $conn = getDatabaseConnection();
    $idCasa = validatePostParam('id_casa');
    
    $result = pg_query_params(
        $conn,
        "SELECT id_coordinacion AS id, nombre_coordinacion AS nombre 
         FROM coordinaciones_territoriales 
         WHERE id_casa = $1 
         ORDER BY nombre_coordinacion",
        [$idCasa]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener coordinaciones: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Obtiene los racimos disponibles para una coordinación específica
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_coordinacion
 */
function handleRacimosDisponibles(): void {
    $conn = getDatabaseConnection();
    $idCoordinacion = validatePostParam('id_coordinacion');
    
    $result = pg_query_params(
        $conn,
        "SELECT r.id_racimo AS id, r.nombre_racimo AS nombre 
         FROM racimos r
         WHERE r.id_coordinacion = $1
           AND NOT EXISTS (
               SELECT 1 FROM sembrado_racimo sr 
               WHERE sr.id_racimo = r.id_racimo
           )
         ORDER BY r.nombre_racimo",
        [$idCoordinacion]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener racimos: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Obtiene las personas disponibles para asignar a un racimo
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_alcaldia
 */
function handlePersonasRacimo(): void {
    $conn = getDatabaseConnection();
    $idAlcaldia = validatePostParam('id_alcaldia');
    
    $result = pg_query_params(
        $conn,
        "SELECT p.id_persona AS id, 
                CONCAT(
                    p.primer_apellido, ' ', 
                    COALESCE(p.segundo_apellido, ''), ' ', 
                    p.nombre_persona
                ) AS nombre
         FROM personas p
         INNER JOIN posiciones_personas pp 
             ON pp.id_persona = p.id_persona
         WHERE p.id_alcaldia = $1
           AND p.activo = true
           AND pp.id_posicion = 3
           AND NOT EXISTS (
               SELECT 1 FROM sembrado_racimo sr 
               WHERE sr.id_persona = p.id_persona
           )
         ORDER BY p.primer_apellido",
        [$idAlcaldia]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener personas: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Registra una nueva asignación de persona a racimo
 * 
 * @return void
 * @throws InvalidArgumentException Si faltan parámetros requeridos
 * @throws RuntimeException Si falla la inserción en la base de datos
 */
function handleGuardarRacimo(): void {
    $conn = getDatabaseConnection();
    $idRacimo = validatePostParam('id_racimo');
    $idPersona = validatePostParam('id_persona');

    try {
        pg_query($conn, "BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED");
        
        // Insertar la asignación sin devolver un ID específico
        $result = pg_query_params(
            $conn,
            "INSERT INTO sembrado_racimo (id_racimo, id_persona) 
             VALUES ($1, $2)",
            [$idRacimo, $idPersona]
        );
        
        if (!$result) {
            throw new RuntimeException(
                'Error en asignación: ' . pg_last_error($conn)
            );
        }
        
        pg_query($conn, "COMMIT");
        
        // Respuesta exitosa sin ID
        echo json_encode([
            'success' => true,
            'message' => 'Asignación de racimo exitosa'
        ]);
        
    } catch (Throwable $e) {
        pg_query($conn, "ROLLBACK");
        sendErrorResponse($e->getMessage());
    } finally {
        exit;
    }
}