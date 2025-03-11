<?php
	require_once '/../db.php';

	$result = pg_query($conn, "SELECT id_alcaldia, nombre_alcaldia FROM alcaldias");
	$alcaldias = [];

	while ($row = pg_fetch_assoc($result)) {
		$alcaldias[] = $row;
	}

	header('Content-Type: application/json');
	echo json_encode($alcaldias);
?>