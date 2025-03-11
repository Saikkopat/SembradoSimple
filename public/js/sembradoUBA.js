$(document).ready(function() {
	const API_BASE = 'php/api/sembradoUBA.php';
	const toastLive = document.getElementById('liveToast');
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
	let currentData = {};

	// Función para mostrar notificaciones
	function showToast(message, type = 'success') {
		 const toastBody = toastLive.querySelector('.toast-body');
		 const toastHeader = toastLive.querySelector('.toast-header');
		 
		 toastBody.textContent = message;
		 toastHeader.className = `toast-header ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
		 toastBootstrap.show();
	}

	// Cargar alcaldías iniciales
	function loadAlcaldias() {
		 $.getJSON(API_BASE, { action: 'alcaldias' })
			  .done(data => populateDropdown('#alcaldia', data.data))
			  .fail(() => showToast('Error cargando alcaldías', 'error'));
	}

	// Función para poblar dropdowns
	function populateDropdown(selector, data) {
		 const $select = $(selector).html('<option value="">Seleccionar...</option>');
		 if(data && data.length > 0) {
			  data.forEach(item => {
					$select.append($(`<option value="${item.id}">${item.nombre}</option>`));
			  });
			  $(selector).prop('disabled', false);
		 } else {
			  $(selector).html('<option value="">No hay opciones disponibles</option>');
		 }
	}

	// Cargar datos dependientes
	function loadDependentOptions(action, selector, params) {
		 $.getJSON(API_BASE, { action, ...params })
			  .done(data => {
					populateDropdown(selector, data.data);
					enableNextDropdown(selector);
			  })
			  .fail(error => {
					showToast(`Error cargando ${action}`, 'error');
					$(selector).prop('disabled', true);
			  });
	}

	// Habilitar siguiente dropdown
	function enableNextDropdown(currentSelector) {
		 const dropdownsFlow = {
			  '#alcaldia': ['#casa', '#persona'],
			  '#casa': '#coordinacion',
			  '#coordinacion': '#racimo',
			  '#racimo': '#uba'
		 };

		 if(dropdownsFlow[currentSelector]) {
			  $(dropdownsFlow[currentSelector]).prop('disabled', false);
		 }
	}

	// Event handlers para dropdowns
	$('#alcaldia').change(function() {
		 currentData.id_alcaldia = $(this).val();
		 if(currentData.id_alcaldia) {
			  loadDependentOptions('casas', '#casa', { id_alcaldia: currentData.id_alcaldia });
			  loadDependentOptions('personas', '#persona', { id_alcaldia: currentData.id_alcaldia });
		 }
	});

	$('#casa').change(function() {
		 currentData.id_casa = $(this).val();
		 if(currentData.id_casa) {
			  loadDependentOptions('coordinaciones', '#coordinacion', { id_casa: currentData.id_casa });
		 }
	});

	$('#coordinacion').change(function() {
		 currentData.id_coordinacion = $(this).val();
		 if(currentData.id_coordinacion) {
			  loadDependentOptions('racimos', '#racimo', { id_coordinacion: currentData.id_coordinacion });
		 }
	});

	$('#racimo').change(function() {
		 currentData.id_racimo = $(this).val();
		 if(currentData.id_racimo) {
			  loadDependentOptions('ubas', '#uba', { id_racimo: currentData.id_racimo });
		 }
	});

	// Validar formulario
	function validateForm() {
		let isValid = true;
		const requiredFields = [
			 '#alcaldia', '#casa', '#coordinacion', 
			 '#racimo', '#uba', '#primerApellido', 
			 '#nombrePersona', '#telefonoUBA'
		];
  
		requiredFields.forEach(selector => {
			 const value = $(selector).val();
			 if (!value) {
				  $(selector).addClass('is-invalid');
				  isValid = false;
			 } else {
				  $(selector).removeClass('is-invalid');
			 }
		});
  
		// Validación especial para teléfono
		const telefono = $('#telefonoUBA').val();
		if (telefono && !/^\d{10}$/.test(telefono)) {
			 $('#telefonoUBA').addClass('is-invalid');
			 isValid = false;
		}
  
		return isValid;
  }
  

	// Enviar formulario
	$('#formUBA').submit(function(e) {
		e.preventDefault();
		
		if(!validateForm()) {
			 showToast('Verifique todos los campos requeridos', 'error');
			 return;
		}
  
		const formData = {
			 action: 'guardar',
			 id_uba: $('#uba').val(),
			 persona: {
				  primer_apellido: $('#primerApellido').val(),
				  segundo_apellido: $('#segundoApellido').val(),
				  nombre: $('#nombrePersona').val(),
				  telefono: $('#telefonoUBA').val(),
				  id_alcaldia: $('#alcaldia').val(),
				  id_posicion: 4 // ID de posición para UBA
			 }
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
				  if(response.success) {
						showToast('Persona registrada y asignada exitosamente!');
						resetForm();
				  } else {
						showToast(response.error || 'Error en el registro', 'error');
				  }
			 },
			 error: (xhr) => {
				  const errorMsg = xhr.responseJSON?.error || 'Error de conexión';
				  showToast(errorMsg, 'error');
			 },
			 complete: () => $('#submitBtn').prop('disabled', false)
		});
  });
  
  // Actualizar función de reinicio
  function resetForm() {
		$('#formUBA')[0].reset();
		$('select').not('#alcaldia').prop('disabled', true);
		$('#primerApellido, #segundoApellido, #nombrePersona, #telefonoUBA').val('');
		loadAlcaldias();
  }

	// Inicialización
	loadAlcaldias();
});