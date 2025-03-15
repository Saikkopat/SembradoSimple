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
									<tr data-id-persona="${persona.id_persona}" data-id-uba="${persona.id_uba}">
										 <td>${persona.id_uba}</td>
										 <td>${persona.primer_apellido}</td>
										 <td>${persona.segundo_apellido || ''}</td>
										 <td>${persona.nombre_persona}</td>
										 <td>${persona.telefono_personal || ''}</td>
										 <td>${persona.telefono_institucional || ''}</td>
										 <td>
											  <button class="btn btn-warning btn-editar" data-id-persona="${persona.id_persona}">
													<i class="fas fa-edit"></i> Editar
											  </button>
											  <button class="btn btn-danger btn-eliminar" data-id-persona="${persona.id_persona}">
													<i class="fas fa-trash"></i> Eliminar
											  </button>
										 </td>
									</tr>
							  `;
							  $tbody.append(fila);
						 });

						 // Asignar eventos a los botones de editar y eliminar
						 asignarEventos();
					} else {
						 alert('Error al cargar personas sembradas');
					}
			  },
			  error: () => {
					alert('Error de conexión al cargar personas sembradas');
			  }
		 });
	}

	// Función para asignar eventos a los botones de editar y eliminar
	function asignarEventos() {
		 // Evento para editar
		 $('.btn-editar').click(function () {
			  const idPersona = $(this).data('id-persona');
			  editarPersona(idPersona);
		 });

		 // Evento para eliminar
		 $('.btn-eliminar').click(function () {
			  const idPersona = $(this).data('id-persona');
			  eliminarPersona(idPersona);
		 });
	}

	// Función para editar una persona
	function editarPersona(idPersona) {
		 // Aquí puedes abrir un modal o redirigir a una página de edición
		 alert(`Editar persona con ID: ${idPersona}`);
	}

	// Función para eliminar una persona
	function eliminarPersona(idPersona) {
		 if (confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
			  $.ajax({
					url: API_BASE,
					method: 'POST',
					dataType: 'json',
					data: { action: 'eliminar_persona_sembrada', id_persona: idPersona },
					success: (response) => {
						 if (response.success) {
							  alert('Persona eliminada correctamente');
							  cargarPersonasSembradas(); // Recargar la tabla
						 } else {
							  alert('Error al eliminar persona: ' + response.error);
						 }
					},
					error: () => {
						 alert('Error de conexión al eliminar persona');
					}
			  });
		 }
	}
});