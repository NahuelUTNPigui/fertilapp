//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender:{
			entries:[
				"/",
				"/animales",
				"/animales/1",
				"/animales/estadisticas",
				"/animales/historial",
				"/animales/geneologia",
				"/inicio",
				"/inicio/cab",
				"/inicio/vet",
				"/login",
				"/nacimientos",
				"/nacimientos/reporte",
				"/rodeos",
				"/rol",
				"/notfind",
				"/opciones",
				"/tactos/cab",
				"/tactos/cab/movimiento",
				"/tactos/vet",
				"/user/config",
				"/inseminaciones",
				"/observaciones",
				"/tareas",
				"/tratamientos",
				"/importar",
				"/lotes",
				"/movimientos",
				"/user/new",
				"/reportes",
				"/pesajes",
				"/establecimiento",
				"/pesajes/lista",
				"/colaboradores/asociar",
				"/colaboradores/1",
				"/establecimientos",
				"/establecimientos/nuevo",
				"/inseminaciones/movimiento",
				"/tratamientos/movimiento",
				"/recover",
				"/recover/token",
				"/user/nivel",
				"/servicios",
				"/servicios/movimiento",
				"/pesajes/historial",
				"/manual",
				"/pagos/exito",
				"/pagos/fail",
				"/pagos/pending"

			]
		}
	}
};

export default config;
