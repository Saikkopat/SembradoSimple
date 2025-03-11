<!DOCTYPE html>

<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
	 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <title>Sistema de Sembrado: </title>
	 <link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
	 <link rel="stylesheet" href="/include/css/main.css">
</head>

<div id="header-container"></div>

<body>
	
	<main class="container my-5">

	</main>

<div id="footer-container"></div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/js/cargaHF.js"></script>
</body>
</html>



<main class="container m-3 mx-auto p-5">
	<h2 class="mb-4">Sembrado Racimo</h2>
	<form id="formRacimo">
		 <!-- Dropdowns -->
		 <div class="mb-3">
			  <label class="form-label">Alcaldía:</label>
			  <select class="form-select" id="alcaldia" required>
					<option value="">Seleccionar...</option>
					<?php
					$result = pg_query($conn, "SELECT * FROM alcaldias");
					while ($row = pg_fetch_assoc($result)) {
						 echo "<option value='{$row['id_alcaldia']}'>{$row['nombre_alcaldia']}</option>";
					}
					?>
			  </select>
		 </div>
		 
		 <!-- Resto de dropdowns (casa, coordinacion, racimo, persona) -->
		 
		 <button type="submit" class="btn btn-primary">Guardar</button>
	</form>
			  </main>

<?php require __DIR__ . '/include/footer.php'; ?>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
$(document).ready(function() {
	// Lógica AJAX para dropdowns
	$('#alcaldia').change(function() {
		 $.ajax({
			  url: 'get_casas.php',
			  data: { id_alcaldia: $(this).val() },
			  success: function(data) {
					$('#casa').html('<option value="">Seleccionar...</option>');
					data.forEach(function(item) {
						 $('#casa').append(`<option value="${item.id}">${item.nombre}</option>`);
					});
			  }
		 });
	});
	
	// Lógica similar para otros dropdowns
	
	// Submit del formulario
	$('#formRacimo').submit(function(e) {
		 e.preventDefault();
		 $.ajax({
			  type: 'POST',
			  url: 'submit_racimo.php',
			  data: $(this).serialize(),
			  success: function() {
					window.location.href = 'successRacimo.html';
			  }
		 });
	});
});
</script>


=

=QUERY(
  {
	IMPORTRANGE(15fAjeaiUO8zv17zwZ8oA4UOQSceSog3DNfOH8EzwXj0, AOB!A$2:D;)
  };
  "SELECT Col 3 WHERE Col1 IS NOT NULL AND Col1 >= date '" & TEXTO(HOY(); "yyyy-MM-dd") & "' AND Col1 < date '" & TEXTO(HOY()+1; "yyyy-MM-dd") & "'"; 0
)

=CONTAR.SI.CONJUNTO(AL:AL;AN2;AM:AM;"SI")

94072500444482T30X5J