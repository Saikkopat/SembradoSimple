<?php
declare(strict_types=1);

/**
 * Funciones utilitarias compartidas para los controladores de API
 */

// Obtener la conexión a la base de datos
function getDatabaseConnection() {
    static $conn = null;
    if (!$conn) {
        require __DIR__ . '/../db.php'; // Asegúrate de que este archivo exista y esté configurado
        if (!$conn) {
            throw new RuntimeException('Error de conexión a la base de datos');
        }
    }
    return $conn;
}

// Validar un parámetro POST y convertirlo a entero
function validatePostParam(string $param): int {
    $value = $_POST[$param] ?? null;
    if (!ctype_digit((string)$value)) {
        throw new InvalidArgumentException("Parámetro inválido: $param");
    }
    return (int)$value;
}

// Enviar una respuesta JSON con datos
function sendDataResponse($result): void {
    $data = $result ? pg_fetch_all($result) : [];
    echo json_encode([
        'success' => !empty($data),
        'data' => $data ?: []
    ]);
    exit;
}

// Enviar una respuesta de error en formato JSON
function sendErrorResponse(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}

/**
 * Obtiene la lista de alcaldías disponibles
 * 
 * @return void
 * @throws RuntimeException Si hay error en la consulta
 */
function handleAlcaldias(): void {
    $conn = getDatabaseConnection();
    $result = pg_query_params(
        $conn,
        "SELECT id_alcaldia AS id, nombre_alcaldia AS nombre 
         FROM alcaldias 
         ORDER BY nombre_alcaldia",
        []
    );
    
    if (!$result) {
        throw new RuntimeException('Error al obtener alcaldías: ' . pg_last_error($conn));
    }
    
    sendDataResponse($result);
}