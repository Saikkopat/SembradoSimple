<!DOCTYPE html>

<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
	 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <title>Sistema de Sembrado</title>
	 <link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
	 <link rel="stylesheet" href="/include/css/main.css">
</head>

<div id="header-container"></div>

<body>
	
	<main class="container my-5 text-center">
		<h1 class="h1 mb-2">Bienvenido al sistema de Sembrado</h1>
		<div class="card py-5">
			<div class="card-body">
				<h3 class="my-1">Selecciona una operación:</3>
				<div class="d-grid gap-4 py-3 mx-auto">
					<button 
						type="button" 
						class="w-50 btn text-white btn-lg mx-auto p-3 btn-racimo"
						onclick="window.location.href='sembradoRacimo.html'"
						role="link"
						aria-label="Ir a Sembrado Racimo">
						<i class="fas fa-seedling me-2" aria-hidden="true"></i>
						Sembrado Racimo
					</button>

					<button 
						type="button" 
						class="w-50 btn text-white btn-lg mx-auto p-3 btn-uba"
						onclick="window.location.href='sembradoUBA.html'"
						role="link"
						aria-label="Ir a Sembrado UBA">
						<i class="far fa-lemon me-2" aria-hidden="true"></i>
						Sembrado UBA
					</button>
				</div>
				<div class="d-grid gap-4 py-3 mx-auto">
					<h3 class="h3">Otras opciones:</h3>
					<button 
						type="button" 
						class="w-50 btn text-white btn-lg mx-auto p-3 btn-personas"
						onclick="window.location.href='listadoPersonasDisponibles.html'"
						role="link"
						aria-label="Ir al listado de personas disponibles">
						<i class="fas fas fa-users me-2" aria-hidden="true"></i>
						Listado de Personas disponibles
					</button>
					<button 
						type="button" 
						class="w-50 btn text-white btn-lg mx-auto p-3 btn-personas"
						onclick="window.location.href='listadoSembradoUBA.html'"
						role="link"
						aria-label="Ir al listado de personas disponibles">
						<i class="fas fas fa-users me-2" aria-hidden="true"></i>
						Listado de Sembrado UBA
					</button>
				</div>
			</div>
		</div>
	</main>

<div id="footer-container"></div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/js/cargaHF.js"></script>
</body>
</html>