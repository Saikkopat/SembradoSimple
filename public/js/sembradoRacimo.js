$(document).ready(function() {
	const API_BASE = '../php/api/sembradoRacimo.php';
	let currentData = {};

	// Cargar alcaldías iniciales
	loadOptions('alcaldias', '#alcaldia');

	// Manejar cambios en los dropdowns
	$('#alcaldia').change(() => loadCasas());
	$('#casa').change(() => loadCoordinaciones());
	$('#coordinacion').change(() => loadRacimos());
	$('#racimo').change(() => loadPersonas());

	// Enviar formulario
	$('#racimoForm').submit(function(e) {
		e.preventDefault();
		
		const formData = {
			 id_racimo: $('#racimo').val(),
			 persona: {
				  primer_apellido: $('#primerApellido').val(),
				  segundo_apellido: $('#segundoApellido').val(),
				  nombre: $('#nombrePersona').val(),
				  telefono: $('#telefono').val(),
				  id_alcaldia: $('#alcaldia').val(),
				  id_posicion: 3 // Asumiendo que 3 es el ID de "Coordinador de racimo"
			 }
		};

		if (!validateForm()) return;

		$.ajax({
			 url: `${API_BASE}?action=guardar`,
			 method: 'POST',
			 dataType: 'json',
			 data: formData,
			 beforeSend: showLoading,
			 success: handleSubmission,
			 error: handleError
		});
  });

  // Validación mejorada
  function validateForm() {
	let isValid = true;

	// Validar dropdowns
	const dropdowns = ['#alcaldia', '#casa', '#coordinacion', '#racimo'];
	dropdowns.forEach(selector => {
		 const value = $(selector).val();
		 if (!value || isNaN(value)) {
			  $(selector).addClass('is-invalid');
			  isValid = false;
		 } else {
			  $(selector).removeClass('is-invalid');
		 }
	});

	// Validar campos de persona
	const personaFields = ['#primerApellido', '#nombrePersona', '#telefono'];
	personaFields.forEach(selector => {
		 if (!$(selector).val()) {
			  $(selector).addClass('is-invalid');
			  isValid = false;
		 } else {
			  $(selector).removeClass('is-invalid');
		 }
	});

	// Validar teléfono
	const telefono = $('#telefono').val();
	if (telefono && !/^\d{10}$/.test(telefono)) {
		 $('#telefono').addClass('is-invalid');
		 isValid = false;
	}

	return isValid;
}

	// Funciones auxiliares
	function loadOptions(action, selector) {
		 $.getJSON(API_BASE, { action })
			  .done(data => {
					if (data.data && data.data.length > 0) {
						 populateDropdown(selector, data.data);
					} else {
						 showEmptyOption(selector);
					}
			  })
			  .fail(handleError);
	}

	function loadCasas() {
		 currentData.id_alcaldia = $('#alcaldia').val();
		 if (currentData.id_alcaldia) {
			  loadDependentOptions('casas', '#casa', currentData);
		 }
	}

	function loadCoordinaciones() {
		 currentData.id_casa = $('#casa').val();
		 if (currentData.id_casa) {
			  loadDependentOptions('coordinaciones', '#coordinacion', currentData);
		 }
	}

	function loadRacimos() {
		 currentData.id_coordinacion = $('#coordinacion').val();
		 if (currentData.id_coordinacion) {
			  loadDependentOptions('racimos', '#racimo', currentData);
		 }
	}

	function loadPersonas() {
		 currentData.id_alcaldia = $('#alcaldia').val();
		 if (currentData.id_alcaldia) {
			  loadDependentOptions('personas', '#persona', currentData);
		 }
	}

	function loadDependentOptions(action, selector, params) {
		 $.getJSON(API_BASE, { action, ...params })
			  .done(data => {
					if (data.data && data.data.length > 0) {
						 populateDropdown(selector, data.data);
						 $(selector).prop('disabled', false);
					} else {
						 showEmptyOption(selector);
					}
			  })
			  .fail(handleError);
	}

	function populateDropdown(selector, data) {
		 const $select = $(selector).html('')
			  .append($('<option>').text('Seleccionar...'));
		 
		 data.forEach(item => {
			  $select.append($('<option>').val(item.id).text(item.nombre));
		 });
	}

	function showEmptyOption(selector) {
		 $(selector).html('')
			  .append($('<option>').text('No hay opciones disponibles'))
			  .prop('disabled', true);
	}

	function validateForm() {
		 let isValid = true;
		 $('#racimoForm select').each(function() {
			  if (!$(this).val() && $(this).prop('required')) {
					$(this).addClass('is-invalid');
					isValid = false;
			  } else {
					$(this).removeClass('is-invalid');
			  }
		 });
		 return isValid;
	}

	function handleSubmission(response) {
		 $('#resultContainer').html(`
			  <div class="alert alert-success alert-dismissible fade show">
					${response.message || 'Registro guardado exitosamente!'}
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			  </div>
		 `);
		 resetForm();
	}

	function handleError(xhr) {
		 const errorMsg = xhr.responseJSON?.error || 'Error en la conexión con el servidor';
		 $('#resultContainer').html(`
			  <div class="alert alert-danger alert-dismissible fade show">
					${errorMsg}
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			  </div>
		 `);
	}

	function showLoading() {
		 $('#resultContainer').html(`
			  <div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Cargando...</span>
			  </div>
		 `);
	}

	function resetForm() {
		 $('#racimoForm')[0].reset();
		 $('select').not('#alcaldia').prop('disabled', true);
		 $('#alcaldia').prop('disabled', false).trigger('change');
	}
});