<?php
require_once '../db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $result = pg_insert($conn, 'sembrado_uba', $data);
    if (!$result) {
        throw new Exception(pg_last_error($conn));
    }
    
    http_response_code(200);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>