<?php
$host = "201.103.152.176";
$port = "5432";  // Agregar puerto
$dbname = "sec";
$user = "postgres";  // Corregir typo "posgres" -> "postgres"
$password = "postgressapci!";  // Corregir typo "posgressapci!"

// Conexión con manejo mejorado de errores
try {
    $conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    
    if (!$conn) {
        throw new Exception("Error de conexión: " . pg_last_error());
    }
    
    pg_set_client_encoding($conn, "UTF8");
    
} catch (Exception $e) {
    error_log("Error PostgreSQL: " . $e->getMessage());
    die(json_encode([
        'success' => false,
        'error' => 'Error 500: Fallo en conexión a base de datos'
    ]));
}
?>