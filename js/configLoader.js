// configLoader.js

// Función para cargar config.json y aplicar rutas dinámicas
const loadConfig = async () => {
	try {
		 const response = await fetch('config.json');
		 if (!response.ok) {
			  throw new Error('No se pudo cargar config.json');
		 }
		 const config = await response.json();
		 const baseUrl = config.base_url;

		 // Aplicar rutas dinámicas a los recursos
		 document.getElementById('main-css').href = `${baseUrl}include/css/main.css`;
		 document.getElementById('favicon').href = `${baseUrl}assets/img/favicon.ico`;

		 // Aplicar rutas dinámicas a los botones
		 document.getElementById('btn-racimo').onclick = () => {
			  window.location.href = `${baseUrl}sembradoRacimo.html`;
		 };
		 document.getElementById('btn-uba').onclick = () => {
			  window.location.href = `${baseUrl}sembradoUBA.html`;
		 };
		 document.getElementById('btn-personas').onclick = () => {
			  window.location.href = `${baseUrl}listadoPersonasDisponibles.html`;
		 };
		 document.getElementById('btn-sembrado-uba').onclick = () => {
			  window.location.href = `${baseUrl}listadoSembradoUBA.html`;
		 };

		 // Aplicar ruta dinámica al script de cargaHF.js
		 document.querySelector('script[src="js/cargaHF.js"]').src = `${baseUrl}js/cargaHF.js`;
	} catch (error) {
		 console.error('Error cargando config.json:', error);
	}
};

// Ejecutar la función al cargar la página
window.onload = loadConfig;