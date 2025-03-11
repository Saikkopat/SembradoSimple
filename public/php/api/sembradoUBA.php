<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $action = $_GET['action'] ?? ($_POST['action'] ?? '');
    $response = ['success' => false];
    
    switch($action) {
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
            
        /* Obtener UBAs */
        case 'ubas':
            $id_racimo = $_GET['id_racimo'] ?? null;
            $result = pg_query_params($conn, 
                "SELECT id_uba as id, nombre_uba as nombre 
                 FROM ubas 
                 WHERE id_racimo = $1
                 AND id_uba NOT IN (SELECT id_uba FROM sembrado_uba)",
                [$id_racimo]
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
                 AND p.id_posicion = 4
                 AND p.id_persona NOT IN (SELECT id_persona FROM sembrado_uba)
                 ORDER BY primer_apellido",
                [$id_alcaldia]
            );
            break;
            
        /* Guardar Registro */
        case 'guardar':
			pg_query($conn, "BEGIN");
			try {
				 // Insertar nueva persona
				 $persona = $_POST['persona'];
				 $personaResult = pg_query_params($conn,
					  "INSERT INTO personas (
							primer_apellido, segundo_apellido, nombre_persona,
							telefono_personal, id_alcaldia, id_posicion, activo
					  ) VALUES ($1, $2, $3, $4, $5, $6, true)
					  RETURNING id_persona",
					  [
							$persona['primer_apellido'],
							$persona['segundo_apellido'],
							$persona['nombre'],
							$persona['telefono'],
							$persona['id_alcaldia'],
							$persona['id_posicion']
					  ]
				 );
	  
				 if (!$personaResult) {
					  throw new Exception('Error al crear persona: ' . pg_last_error($conn));
				 }
	  
				 $idPersona = pg_fetch_result($personaResult, 0, 'id_persona');
	  
				 // Insertar en sembrado_uba
				 $sembradoResult = pg_query_params($conn,
					  "INSERT INTO sembrado_uba (id_uba, id_persona)
					  VALUES ($1, $2)",
					  [$_POST['id_uba'], $idPersona]
				 );
	  
				 if (!$sembradoResult) {
					  throw new Exception('Error al asignar UBA: ' . pg_last_error($conn));
				 }
	  
				 pg_query($conn, "COMMIT");
				 $response['success'] = true;
				 $response['message'] = 'Registro exitoso!';
	  
			} catch(Exception $e) {
				 pg_query($conn, "ROLLBACK");
				 throw $e;
			}
			break;
            
        default:
            throw new Exception('Acción no válida');
    }
    
    if(isset($result)) {
        $response['data'] = pg_fetch_all($result) ?: [];
        $response['success'] = !empty($response['data']) || $action === 'guardar';
    }
    
    echo json_encode($response);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}