$(document).ready(function () {
	const API_BASE = 'php/api/listadoSembradoUBA.php';

	// Cargar personas sembradas al iniciar
	cargarPersonasSembradas();

	// Función para cargar personas sembradas
	function cargarPersonasSembradas() {
		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: { action: 'obtener_personas_sembradas' },
			  success: (data) => {
					if (data.success) {
						 const $tbody = $('#tablaPersonasSembradas tbody');
						 $tbody.empty(); // Limpiar la tabla antes de agregar nuevos datos

						 data.data.forEach((persona) => {
							  const fila = `
									<tr>
										 <td>${persona.id_uba}</td>
										 <td>${persona.primer_apellido}</td>
										 <td>${persona.segundo_apellido || ''}</td>
										 <td>${persona.nombre_persona}</td>
										 <td>${persona.telefono_personal || ''}</td>
										 <td>${persona.telefono_institucional || ''}</td>
									</tr>
							  `;
							  $tbody.append(fila);
						 });
					} else {
						 alert('Error al cargar personas sembradas');
					}
			  },
			  error: () => {
					alert('Error de conexión al cargar personas sembradas');
			  }
		 });
	}
});