<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $action = $_GET['action'] ?? '';
    $response = ['success' => false];
    
    switch($action) {
        case 'alcaldias':
            $result = pg_query($conn, "SELECT id_alcaldia as id, nombre_alcaldia as nombre FROM alcaldias");
            break;
            
        case 'casas':
            $result = pg_query_params($conn, 
                "SELECT id_casa as id, nombre_casa as nombre 
                 FROM casas_gobierno 
                 WHERE id_alcaldia = $1",
                [$_GET['id_alcaldia']]
            );
            break;
            
        case 'coordinaciones':
            $result = pg_query_params($conn, 
                "SELECT id_coordinacion as id, nombre_coordinacion as nombre 
                 FROM coordinaciones_territoriales 
                 WHERE id_casa = $1",
                [$_GET['id_casa']]
            );
            break;
            
        case 'racimos':
            $result = pg_query_params($conn, 
                "SELECT id_racimo as id, nombre_racimo as nombre 
                 FROM racimos 
                 WHERE id_coordinacion = $1",
                [$_GET['id_coordinacion']]
            );
            break;
            
        case 'personas':
            $result = pg_query_params($conn, 
                "SELECT p.id_persona as id, 
                 CONCAT(p.primer_apellido, ' ', COALESCE(p.segundo_apellido, ''), ' ', p.nombre_persona) as nombre
                 FROM personas p
                 INNER JOIN posiciones pos ON p.id_posicion = pos.id_posicion
                 WHERE p.id_alcaldia = $1
                 AND p.activo = true
                 AND pos.nombre_posicion = 'Coordinador de racimo'
                 AND p.id_persona NOT IN (SELECT id_persona FROM sembrado_racimo)
                 ORDER BY primer_apellido",
                [$_GET['id_alcaldia']]
            );
            break;
            
            case 'guardar':
                // Iniciar transacción
                pg_query($conn, "BEGIN");
            
                try {
                    // Insertar nueva persona
                    $personaResult = pg_query_params($conn,
                        "INSERT INTO personas (
                            primer_apellido, segundo_apellido, nombre_persona, 
                            telefono_personal, id_alcaldia, id_posicion, activo
                         ) VALUES ($1, $2, $3, $4, $5, $6, true)
                         RETURNING id_persona",
                        [
                            $_POST['persona']['primer_apellido'],
                            $_POST['persona']['segundo_apellido'],
                            $_POST['persona']['nombre'],
                            $_POST['persona']['telefono'],
                            $_POST['persona']['id_alcaldia'],
                            $_POST['persona']['id_posicion']
                        ]
                    );
            
                    if (!$personaResult) {
                        throw new Exception('Error al crear persona: ' . pg_last_error($conn));
                    }
            
                    $idPersona = pg_fetch_result($personaResult, 0, 'id_persona');
            
                    // Insertar en sembrado_racimo
                    $sembradoResult = pg_query_params($conn,
                        "INSERT INTO sembrado_racimo (id_racimo, id_persona) 
                         VALUES ($1, $2)",
                        [$_POST['id_racimo'], $idPersona]
                    );
            
                    if (!$sembradoResult) {
                        throw new Exception('Error al asignar racimo: ' . pg_last_error($conn));
                    }
            
                    // Confirmar transacción
                    pg_query($conn, "COMMIT");
            
                    $response['message'] = 'Persona y asignación creadas exitosamente!';
                    $response['success'] = true;
            
                } catch (Exception $e) {
                    // Revertir en caso de error
                    pg_query($conn, "ROLLBACK");
                    throw $e;
                }
                break;
            
        default:
            throw new Exception('Acción no válida');
    }
    
    if(isset($result)) {
        $response['data'] = pg_fetch_all($result) ?: [];
        $response['success'] = pg_num_rows($result) > 0;
    }
    
    echo json_encode($response);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}