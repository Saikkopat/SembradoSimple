$(document).ready(function () {
	const API_BASE = 'php/api/listadoPersonasDisponibles.php';

	// Cargar alcaldías al iniciar
	cargarAlcaldias();

	// Cargar todas las personas al iniciar
	cargarPersonas();

	// Evento para filtrar personas por alcaldía al cambiar el select
	$('#alcaldiaFilter').change(function () {
		 const idAlcaldia = $(this).val(); // Obtener el valor seleccionado
		 cargarPersonas(idAlcaldia); // Filtrar personas por alcaldía
	});

	// Función para cargar alcaldías en el dropdown
	function cargarAlcaldias() {
		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: { action: 'alcaldias' },
			  success: (data) => {
					if (data.success) {
						 const $select = $('#alcaldiaFilter');
						 $select.empty().append('<option value="">Todas las alcaldías</option>'); // Opción por defecto
						 data.data.forEach((alcaldia) => {
							  $select.append(`<option value="${alcaldia.id}">${alcaldia.nombre}</option>`);
						 });
					} else {
						 alert('Error al cargar alcaldías');
					}
			  },
			  error: () => {
					alert('Error de conexión al cargar alcaldías');
			  }
		 });
	}

	// Función para cargar personas (opcionalmente filtradas por alcaldía)
	function cargarPersonas(idAlcaldia = '') {
		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: { action: 'personas', id_alcaldia: idAlcaldia },
			  success: (data) => {
					if (data.success) {
						 const $tbody = $('#tablaPersonas tbody');
						 $tbody.empty(); // Limpiar la tabla antes de agregar nuevos datos

						 data.data.forEach((persona) => {
							  const fila = `
									<tr>
										 <td>${persona.primer_apellido}</td>
										 <td>${persona.segundo_apellido || ''}</td>
										 <td>${persona.nombre_persona}</td>
										 <td>${persona.activo ? 'Activo' : 'Inactivo'}</td>
										 <td>${persona.nombre_alcaldia}</td>
										 <td>${persona.telefono_personal || ''}</td>
										 <td>${persona.telefono_institucional || ''}</td>
									</tr>
							  `;
							  $tbody.append(fila);
						 });
					} else {
						 alert('Error al cargar personas');
					}
			  },
			  error: () => {
					alert('Error de conexión al cargar personas');
			  }
		 });
	}
});