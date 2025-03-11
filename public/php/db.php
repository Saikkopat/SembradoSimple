<?php
$host = "localhost";
$dbname = "sec";
$user = "sembrado_user";
$password = "P@ssw0rdSecure!";

// Conexión con verificación estricta
$conn = pg_connect("host=$host dbname=$dbname user=$user password=$password");

if (!$conn) {
    error_log("Error PostgreSQL: " . pg_last_error());
    die("Error 500: Fallo en conexión a base de datos");
}

// Configuración adicional recomendada
pg_set_client_encoding($conn, "UTF8");
?>