$(document).ready(function () {
	// Constantes y configuraciones
	const API_BASE = '../php/api/sembradoRacimo.php'; // Endpoint base de la API
	let currentData = {}; // Almacena los datos actuales del formulario
 
	// Cargar alcaldías iniciales
	loadOptions('alcaldias', '#alcaldia');
 
	// Manejar cambios en los dropdowns
	$('#alcaldia').change(() => {
	  clearDependentFields(); // Limpiar y deshabilitar campos dependientes
	  loadCasas(); // Cargar casas basadas en la alcaldía seleccionada
	});
	$('#casa').change(() => loadCoordinaciones()); // Cargar coordinaciones basadas en la casa seleccionada
	$('#coordinacion').change(() => loadRacimos()); // Cargar racimos basados en la coordinación seleccionada
	$('#racimo').change(() => loadPersonas()); // Cargar personas basadas en el racimo seleccionado
 
	// Enviar formulario
	$('#formRacimo').submit(function (e) {
	  e.preventDefault();
 
	  if (!validateForm()) {
		 showToast('Verifique todos los campos requeridos', 'error');
		 return;
	  }
 
	  const formData = {
		 id_racimo: $('#racimo').val(),
		 id_persona: $('#persona').val(), // Usar el ID de la persona seleccionada
	  };
 
	  $.ajax({
		 url: `${API_BASE}?action=guardar`,
		 method: 'POST',
		 dataType: 'json',
		 data: formData,
		 beforeSend: showLoading,
		 success: handleSubmission,
		 error: handleError,
	  });
	});
 
	// Validación del formulario
	function validateForm() {
	  let isValid = true;
 
	  // Validar dropdowns
	  const dropdowns = ['#alcaldia', '#casa', '#coordinacion', '#racimo', '#persona'];
	  dropdowns.forEach((selector) => {
		 const value = $(selector).val();
		 if (!value || isNaN(value)) {
			$(selector).addClass('is-invalid');
			isValid = false;
		 } else {
			$(selector).removeClass('is-invalid');
		 }
	  });
 
	  return isValid;
	}
 
	// Funciones auxiliares
 
	/**
	 * Carga opciones en un dropdown desde la API.
	 * @param {string} action - Acción a realizar (ej: 'alcaldias', 'casas').
	 * @param {string} selector - Selector del dropdown a poblar.
	 */
	function loadOptions(action, selector) {
	  $.getJSON(API_BASE, { action })
		 .done((data) => {
			if (data.data && data.data.length > 0) {
			  populateDropdown(selector, data.data);
			} else {
			  showEmptyOption(selector);
			}
		 })
		 .fail(handleError);
	}
 
	/**
	 * Carga las casas basadas en la alcaldía seleccionada.
	 */
	function loadCasas() {
	  currentData.id_alcaldia = $('#alcaldia').val();
	  if (currentData.id_alcaldia) {
		 loadDependentOptions('casas', '#casa', currentData);
	  }
	}
 
	/**
	 * Carga las coordinaciones basadas en la casa seleccionada.
	 */
	function loadCoordinaciones() {
	  currentData.id_casa = $('#casa').val();
	  if (currentData.id_casa) {
		 loadDependentOptions('coordinaciones', '#coordinacion', currentData);
	  }
	}
 
	/**
	 * Carga los racimos basados en la coordinación seleccionada.
	 */
	function loadRacimos() {
	  currentData.id_coordinacion = $('#coordinacion').val();
	  if (currentData.id_coordinacion) {
		 loadDependentOptions('racimos', '#racimo', currentData);
	  }
	}
 
	/**
	 * Carga las personas basadas en la alcaldía seleccionada.
	 */
	function loadPersonas() {
	  currentData.id_alcaldia = $('#alcaldia').val();
	  if (currentData.id_alcaldia) {
		 loadDependentOptions('personas', '#persona', currentData);
	  }
	}
 
	/**
	 * Carga opciones dependientes en un dropdown.
	 * @param {string} action - Acción a realizar (ej: 'casas', 'coordinaciones').
	 * @param {string} selector - Selector del dropdown a poblar.
	 * @param {object} params - Parámetros para la consulta.
	 */
	function loadDependentOptions(action, selector, params) {
	  $.getJSON(API_BASE, { action, ...params })
		 .done((data) => {
			if (data.data && data.data.length > 0) {
			  populateDropdown(selector, data.data);
			  $(selector).prop('disabled', false);
			} else {
			  showEmptyOption(selector);
			}
		 })
		 .fail(handleError);
	}
 
	/**
	 * Pobla un dropdown con datos.
	 * @param {string} selector - Selector del dropdown.
	 * @param {array} data - Datos para poblar el dropdown.
	 */
	function populateDropdown(selector, data) {
	  const $select = $(selector).html('').append($('<option>').text('Seleccionar...'));
 
	  data.forEach((item) => {
		 $select.append($('<option>').val(item.id).text(item.nombre));
	  });
	}
 
	/**
	 * Muestra una opción vacía en un dropdown y lo deshabilita.
	 * @param {string} selector - Selector del dropdown.
	 */
	function showEmptyOption(selector) {
	  $(selector).html('').append($('<option>').text('No hay opciones disponibles')).prop('disabled', true);
	}
 
	/**
	 * Maneja la respuesta exitosa del servidor.
	 * @param {object} response - Respuesta del servidor.
	 */
	function handleSubmission(response) {
	  showToast(response.message || 'Registro guardado exitosamente!');
	  resetForm();
	}
 
	/**
	 * Maneja errores de la solicitud AJAX.
	 * @param {object} xhr - Objeto de la solicitud AJAX.
	 */
	function handleError(xhr) {
	  const errorMsg = xhr.responseJSON?.error || 'Error en la conexión con el servidor';
	  showToast(errorMsg, 'error');
	}
 
	/**
	 * Muestra un indicador de carga.
	 */
	function showLoading() {
	  $('#resultContainer').html(`
		 <div class="spinner-border text-primary" role="status">
			<span class="visually-hidden">Cargando...</span>
		 </div>
	  `);
	}
 
	/**
	 * Reinicia el formulario a su estado inicial.
	 */
	function resetForm() {
	  $('#formRacimo')[0].reset();
	  $('select').not('#alcaldia').prop('disabled', true);
	  $('#alcaldia').prop('disabled', false).trigger('change');
	}
 
	/**
	 * Limpia y deshabilita los campos dependientes.
	 */
	function clearDependentFields() {
	  $('#casa, #coordinacion, #racimo, #persona').val('').prop('disabled', true);
	}
 
	/**
	 * Muestra una notificación toast.
	 * @param {string} message - Mensaje a mostrar.
	 * @param {string} type - Tipo de notificación ('success' o 'error').
	 */
	function showToast(message, type = 'success') {
	  const toastLive = document.getElementById('liveToast');
	  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
	  const toastBody = toastLive.querySelector('.toast-body');
	  const toastHeader = toastLive.querySelector('.toast-header');
 
	  // Configura el mensaje y el estilo del toast
	  toastBody.textContent = message;
	  toastHeader.className = `toast-header ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
	  toastBootstrap.show();
	}
 });