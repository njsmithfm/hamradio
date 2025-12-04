<script>
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let mapDiv;
	let L;

	const BASE_URL = 'https://tiles.stadiamaps.com/tiles/stamen_toner_blacklite/{z}/{x}/{y}{r}.{ext}';
	const BASE_ATTRIB =
		'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
		'&copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> ' +
		'&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
		'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

	const OWM_KEY = import.meta.env.VITE_OWM_KEY ?? 'fallback-or-throw-error';

	// ← Change the endpoint to precipitation (rain + snow). You can also use
	//   “precipitation” for a combined layer, or “rain” / “snow” separately.
	const PRECIP_URL = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const PRECIP_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	onMount(async () => {
		const leaf = await import('leaflet');
		L = leaf.default;

		if (!mapDiv) {
			console.error('Map container not found – aborting Leaflet init.');
			return;
		}

		const baseLayer = L.tileLayer(BASE_URL, {
			minZoom: 0,
			maxZoom: 20,
			attribution: BASE_ATTRIB,
			ext: 'png'
		});

		// New precipitation layer (initially hidden)
		const precipLayer = L.tileLayer(PRECIP_URL, {
			opacity: 5,
			attribution: PRECIP_ATTRIB
		});

		const map = L.map(mapDiv, {
			center: [44.0121, -92.4802],
			zoom: 10,
			layers: [baseLayer] // start with only the base map
		});

		// Toggle control – you can keep the old cloud layer if you still want it
		const overlays = {
			Precipitation: precipLayer
			// 'Current Weather (clouds)': weatherLayer   // optional
		};
		L.control.layers(null, overlays, { collapsed: false }).addTo(map);
	});
</script>

<div bind:this={mapDiv} class="leaflet-container"></div>

<style>
	.leaflet-container {
		width: 100%;
		height: 500px;
	}
</style>
