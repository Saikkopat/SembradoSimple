$(document).ready(function () {
	const API_BASE = 'php/api/sembradoUBA.php';
	const toastLive = document.getElementById('liveToast');
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
	let currentData = {};

	// Función para mostrar notificaciones
	function showToast(message, type = 'success') {
		 const toastBody = toastLive.querySelector('.toast-body');
		 const toastHeader = toastLive.querySelector('.toast-header');

		 // Configura el mensaje y el estilo del toast
		 toastBody.textContent = message;
		 toastHeader.className = `toast-header ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
		 toastBootstrap.show();
	}

	// Función para poblar un dropdown con datos
	function populateDropdown(selector, data) {
		 const $select = $(selector).html('<option value="">Seleccionar...</option>');

		 if (data && data.length > 0) {
			  data.forEach((item) => {
					$select.append($(`<option value="${item.id}">${item.nombre}</option>`));
			  });
			  $(selector).prop('disabled', false); // Habilita el dropdown
		 } else {
			  $(selector).html('<option value="">No hay opciones disponibles</option>');
		 }
	}

	// Función para cargar alcaldías
	function loadAlcaldias() {
		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: { action: 'alcaldias' },
			  success: (data) => populateDropdown('#alcaldia', data.data),
			  error: () => showToast('Error cargando alcaldías', 'error')
		 });
	}

	// Función para cargar opciones dependientes
	function loadDependentOptions(action, selector, params) {
		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: { action, ...params },
			  success: (data) => {
					populateDropdown(selector, data.data);
					enableNextDropdown(selector); // Habilita el siguiente dropdown
			  },
			  error: () => {
					showToast(`Error cargando ${action}`, 'error');
					$(selector).prop('disabled', true); // Deshabilita el dropdown en caso de error
			  }
		 });
	}

	// Habilitar el siguiente dropdown en la secuencia
	function enableNextDropdown(currentSelector) {
		 const dropdownsFlow = {
			  '#alcaldia': ['#casa', '#persona'], // Alcaldía habilita Casa y Persona
			  '#casa': '#coordinacion', // Casa habilita Coordinación
			  '#coordinacion': '#racimo', // Coordinación habilita Racimo
			  '#racimo': '#uba', // Racimo habilita UBA
		 };

		 if (dropdownsFlow[currentSelector]) {
			  $(dropdownsFlow[currentSelector]).prop('disabled', false);
		 }
	}

	// Reiniciar solo los campos UBA y Personas
	function resetUbaYPersons() {
		 $('#uba, #persona').val('').prop('disabled', true); // Limpia y deshabilita UBA y Personas
	}

	// Recargar UBA y Personas basado en el valor actual de Racimo y Alcaldía
	function recargarUbaYPersons() {
		 const idRacimo = $('#racimo').val();
		 const idAlcaldia = $('#id_alcaldia').val();

		 if (idRacimo) {
			  loadDependentOptions('ubas', '#uba', { id_racimo: idRacimo });
		 }

		 if (idAlcaldia) {
			  loadDependentOptions('personas', '#persona', { id_alcaldia: idAlcaldia });
		 }
	}

	// Limpiar campos dependientes al cambiar de Alcaldía (solo hasta Racimo)
	function clearDependentFields() {
		 $('#casa, #coordinacion, #racimo').val('').prop('disabled', true);
	}

	// Evento de cambio para Alcaldía
	$('#alcaldia').change(function () {
		 const selectedAlcaldia = $(this).val();
		 if (selectedAlcaldia) {
			  $('#id_alcaldia').val(selectedAlcaldia); // Actualiza el campo oculto
			  clearDependentFields(); // Limpia y deshabilita campos dependientes
			  currentData.id_alcaldia = selectedAlcaldia;
			  loadDependentOptions('casas', '#casa', { id_alcaldia: currentData.id_alcaldia });
			  loadDependentOptions('personas', '#persona', { id_alcaldia: currentData.id_alcaldia });
		 }
	});

	// Evento de cambio para Casa
	$('#casa').change(function () {
		 currentData.id_casa = $(this).val();
		 if (currentData.id_casa) {
			  loadDependentOptions('coordinaciones', '#coordinacion', { id_casa: currentData.id_casa });
		 }
	});

	// Evento de cambio para Coordinación
	$('#coordinacion').change(function () {
		 currentData.id_coordinacion = $(this).val();
		 if (currentData.id_coordinacion) {
			  loadDependentOptions('racimos', '#racimo', { id_coordinacion: currentData.id_coordinacion });
		 }
	});

	// Evento de cambio para Racimo
	$('#racimo').change(function () {
		 currentData.id_racimo = $(this).val();
		 if (currentData.id_racimo) {
			  loadDependentOptions('ubas', '#uba', { id_racimo: currentData.id_racimo });
		 }
	});

	// Evento de envío del formulario
	$('#formUBA').submit(function (e) {
		 e.preventDefault();

		 const formData = {
			  action: 'guardar',
			  id_uba: $('#uba').val(),
			  persona: $('#persona').val(),
			  id_alcaldia: $('#id_alcaldia').val() // Incluye id_alcaldia en los datos enviados
		 };

		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: formData,
			  success: (response) => {
					if (response && response.success) {
						 showToast('Persona registrada y asignada exitosamente!');
						 resetUbaYPersons(); // Limpia y deshabilita UBA y Personas
						 recargarUbaYPersons(); // Recarga las opciones de UBA y Personas
					} else {
						 const errorMsg = response?.error || 'Error en el registro';
						 showToast(errorMsg, 'error');
					}
			  },
			  error: (xhr) => {
					const errorMsg = xhr.responseJSON?.error || 'Error de conexión';
					showToast(errorMsg, 'error');
			  }
		 });
	});

	// Inicialización
	loadAlcaldias(); // Carga las alcaldías al cargar la página
});