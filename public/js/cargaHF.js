$(function() {
	// Carga el header
	$.get('/../include/header.html')
		.done(function(headerData) {
			$('#header-container').html(headerData);
		})
		.fail(function() {
			$('#header-container').html('<p>Encabezado no disponible</p>');
		});

	// Carga el footer
	$.get('/../include/footer.html')
		.done(function(footerData) {
			$('#footer-container').html(footerData);
		})
		.fail(function() {
			$('#footer-container').html('<p>Pie de página no disponible</p>');
		});
});