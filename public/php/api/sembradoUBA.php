<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auxiliar.php';

// Habilitar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Controlador principal para el API de Sembrado UBA
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
            handleRacimos();
            break;

        /* Obtener UBAs disponibles */
        case 'ubas':
            handleUbas();
            break;

        /* Obtener Personas activas */
        case 'personas':
            handlePersonas();
            break;

        /* Registrar nueva asignación */
        case 'guardar':
            handleGuardar();
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
function handleRacimos(): void {
    $conn = getDatabaseConnection();
    $idCoordinacion = validatePostParam('id_coordinacion');
    
    $result = pg_query_params(
        $conn,
        "SELECT id_racimo AS id, nombre_racimo AS nombre 
         FROM racimos 
         WHERE id_coordinacion = $1 
         ORDER BY nombre_racimo",
        [$idCoordinacion]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener racimos: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Obtiene las UBAs disponibles para un racimo específico
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_racimo
 */
function handleUbas(): void {
    $conn = getDatabaseConnection();
    $idRacimo = validatePostParam('id_racimo');
    
    $result = pg_query_params(
        $conn,
        "SELECT id_uba AS id, nombre_uba AS nombre 
         FROM ubas 
         WHERE id_racimo = $1
           AND id_uba NOT IN (SELECT id_uba FROM sembrado_uba)
         ORDER BY nombre_uba",
        [$idRacimo]
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener UBAs: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}

/**
 * Obtiene las personas disponibles para asignar a una UBA
 * 
 * @return void
 * @throws InvalidArgumentException Si falta el parámetro id_alcaldia
 */
function handlePersonas(): void {
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
           AND pp.id_posicion = 4
           AND NOT EXISTS (
               SELECT 1 FROM sembrado_uba su 
               WHERE su.id_persona = p.id_persona
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
 * Registra una nueva asignación de persona a UBA
 * 
 * @return void
 * @throws InvalidArgumentException Si faltan parámetros requeridos
 * @throws RuntimeException Si falla la inserción en la base de datos
 */
function handleGuardar(): void {
    $conn = getDatabaseConnection();
    $idUba = validatePostParam('id_uba');
    $idPersona = validatePostParam('persona');

    try {
        pg_query($conn, "BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED");
        
        $result = pg_query_params(
            $conn,
            "INSERT INTO sembrado_uba (id_uba, id_persona) 
             VALUES ($1, $2)
             RETURNING id_uba",
            [$idUba, $idPersona]
        );
        
        if (!$result || pg_num_rows($result) === 0) {
            throw new RuntimeException(
                'Error en inserción: ' . pg_last_error($conn)
            );
        }
        
        pg_query($conn, "COMMIT");
        
        echo json_encode([
            'success' => true,
            'message' => 'Registro exitoso',
            'id' => pg_fetch_result($result, 0, 0)
        ]);
        
    } catch (Throwable $e) {
        pg_query($conn, "ROLLBACK");
        sendErrorResponse($e->getMessage());
    } finally {
        exit;
    }
}