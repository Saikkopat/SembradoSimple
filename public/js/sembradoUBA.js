$(document).ready(function () {
	// Constantes y configuraciones
	const API_BASE = 'php/api/sembradoUBA.php'; // Endpoint base de la API
	const toastLive = document.getElementById('liveToast'); // Elemento del toast
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive); // Instancia del toast
	let currentData = {}; // Almacena los datos actuales del formulario

	// Función para mostrar notificaciones
	function showToast(message, type = 'success') {
	const toastBody = toastLive.querySelector('.toast-body');
	const toastHeader = toastLive.querySelector('.toast-header');

	// Configura el mensaje y el estilo del toast
	toastBody.textContent = message;
	toastHeader.className = `toast-header ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
	toastBootstrap.show();
	}

	// Cargar alcaldías iniciales
	function loadAlcaldias() {
	$.getJSON(API_BASE, { action: 'alcaldias' })
		.done((data) => populateDropdown('#alcaldia', data.data))
		.fail(() => showToast('Error cargando alcaldías', 'error'));
	}

	// Poblar un dropdown con datos
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

	// Cargar opciones dependientes de un dropdown
	function loadDependentOptions(action, selector, params) {
	$.getJSON(API_BASE, { action, ...params })
		.done((data) => {
			populateDropdown(selector, data.data);
			enableNextDropdown(selector); // Habilita el siguiente dropdown
		})
		.fail(() => {
			showToast(`Error cargando ${action}`, 'error');
			$(selector).prop('disabled', true); // Deshabilita el dropdown en caso de error
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

	// Reiniciar el formulario (excepto Alcaldía)
	function resetForm() {
	$('#formUBA')[0].reset(); // Limpia todos los campos
	$('select').not('#alcaldia').prop('disabled', true); // Deshabilita todos los dropdowns excepto Alcaldía
	loadAlcaldias(); // Recarga las alcaldías
	}

	// Limpiar campos dependientes al cambiar de Alcaldía
	function clearDependentFields() {
	$('#casa, #coordinacion, #racimo, #uba, #persona').val('').prop('disabled', true);
	}

	// Validar el formulario antes de enviar
	function validateForm() {
	let isValid = true;
	const requiredFields = [
		'#alcaldia',
		'#casa',
		'#coordinacion',
		'#racimo',
		'#uba',
		'#persona'
	];

	// Valida campos requeridos
	requiredFields.forEach((selector) => {
		const value = $(selector).val();
		if (!value) {
			$(selector).addClass('is-invalid'); // Marca como inválido
			isValid = false;
		} else {
			$(selector).removeClass('is-invalid'); // Remueve marca de inválido
		}
	});

	return isValid;
	}

	// Evento de cambio para Alcaldía
	$('#alcaldia').change(function () {
	const selectedAlcaldia = $(this).val();
	if (selectedAlcaldia) {
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

	// Enviar formulario
	$('#formUBA').submit(function (e) {
	e.preventDefault();

	if (!validateForm()) {
		showToast('Verifique todos los campos requeridos', 'error');
		return;
	}

	const formData = {
		action: 'guardar',
		id_uba: $('#uba').val(),
		persona: $('#persona').val(),
	};

	$.ajax({
		url: API_BASE,
		method: 'POST',
		dataType: 'json',
		data: formData,
		beforeSend: () => {
			$('#submitBtn').prop('disabled', true);
			showToast('Registrando persona...', 'info');
		},
		success: (response) => {
			if (response.success) {
			showToast('Persona registrada y asignada exitosamente!');
			resetForm(); // Reinicia el formulario después de un registro exitoso
			} else {
			showToast(response.error || 'Error en el registro', 'error');
			}
		},
		error: (xhr) => {
			const errorMsg = xhr.responseJSON?.error || 'Error de conexión';
			showToast(errorMsg, 'error');
		},
		complete: () => $('#submitBtn').prop('disabled', false),
	});
	});

	// Inicialización
	loadAlcaldias(); // Carga las alcaldías al cargar la página
});