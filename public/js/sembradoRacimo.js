$(document).ready(function () {
	const API_BASE = 'php/api/sembradoRacimo.php';
	const toastLive = document.getElementById("liveToast");
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
					enableNextDropdown(selector);
			  },
			  error: () => {
					showToast(`Error cargando ${action}`, 'error');
					$(selector).prop('disabled', true);
			  }
		 });
	}

	// Habilitar el siguiente dropdown en la secuencia
	function enableNextDropdown(currentSelector) {
		 const dropdownsFlow = {
			  '#alcaldia': ['#casa', '#persona'], // Alcaldía habilita Casa y Persona
			  '#casa': '#coordinacion', // Casa habilita Coordinación
			  '#coordinacion': '#racimo', // Coordinación habilita Racimo
		 };

		 if (dropdownsFlow[currentSelector]) {
			  $(dropdownsFlow[currentSelector]).prop('disabled', false);
		 }
	}

	// Reiniciar el formulario (excepto Alcaldía)
	function resetForm() {
		 $('#formRacimo')[0].reset(); // Limpia todos los campos
		 $('select').not('#alcaldia').prop('disabled', true); // Deshabilita todos los dropdowns excepto Alcaldía
		 loadAlcaldias(); // Recarga las alcaldías
	}

	// Limpiar campos dependientes al cambiar de Alcaldía
	function clearDependentFields() {
		 $('#casa, #coordinacion, #racimo, #persona').val('').prop('disabled', true);
	}

	// Evento de cambio para Alcaldía
	$('#alcaldia').change(function () {
		 const selectedAlcaldia = $(this).val();
		 if (selectedAlcaldia) {
			  clearDependentFields();
			  currentData.id_alcaldia = selectedAlcaldia;
			  loadDependentOptions('casas', '#casa', { id_alcaldia: currentData.id_alcaldia });
			  loadDependentOptions('personas_racimo', '#persona', { id_alcaldia: currentData.id_alcaldia });
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

	// Evento de envío del formulario
	$('#formRacimo').submit(function (e) {
		 e.preventDefault();

		 const formData = {
			  action: 'guardar_racimo',
			  id_racimo: $('#racimo').val(),
			  id_persona: $('#persona').val()
		 };

		 $.ajax({
			  url: API_BASE,
			  method: 'POST',
			  dataType: 'json',
			  data: formData,
			  success: (response) => {
					if (response.success) {
						 showToast('Asignación de racimo exitosa');
						 resetForm();
					} else {
						 showToast(response.error || 'Error en el registro', 'error');
					}
			  },
			  error: (xhr) => {
					const errorMsg = xhr.responseJSON?.error || 'Error de conexión';
					showToast(errorMsg, 'error');
			  }
		 });
	});

	// Inicialización
	loadAlcaldias();
});