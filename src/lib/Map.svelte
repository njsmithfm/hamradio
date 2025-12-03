<script>
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css'; // Leaflet CSS – safe for SSR

	let mapDiv; // bound to the <div> that becomes the map
	let L; // Leaflet namespace (filled after dynamic import)

	// ------------ Configuration (you can tweak) -------------------------
	const BASE_URL = 'https://tiles.stadiamaps.com/tiles/stamen_toner_blacklite/{z}/{x}/{y}{r}.{ext}';
	const BASE_ATTRIB =
		'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
		'&copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> ' +
		'&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
		'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

	// Put your OpenWeatherMap API key in a .env file as VITE_OWM_KEY,
	// or replace the placeholder with a literal string for a quick test.
	const OWM_KEY = import.meta.env.VITE_OWM_KEY ?? 'YOUR_API_KEY';
	const WEATHER_URL = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const WEATHER_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	// -----------------------------------------------------------------
	onMount(async () => {
		// 1️⃣ Load Leaflet **only in the browser**
		const leaf = await import('leaflet');
		L = leaf.default;

		// 2️⃣ Verify the container exists (helps debugging)
		console.log('🗺️ mapDiv:', mapDiv);
		if (!mapDiv) {
			console.error('Map container not found – aborting Leaflet init.');
			return;
		}

		// 3️⃣ Build the tile layers (now they are in the same scope as the map)
		const baseLayer = L.tileLayer(BASE_URL, {
			minZoom: 0,
			maxZoom: 20,
			attribution: BASE_ATTRIB,
			ext: 'png'
		});

		const weatherLayer = L.tileLayer(WEATHER_URL, {
			opacity: 0.5,
			attribution: WEATHER_ATTRIB
		});

		// 4️⃣ Initialise the Leaflet map
		const map = L.map(mapDiv, {
			center: [44.0121, -92.4802], // Rochester, MN
			zoom: 10,
			layers: [baseLayer, weatherLayer]
		});

		// 5️⃣ Optional UI to toggle the weather overlay
		const overlays = { 'Current Weather': weatherLayer };
		L.control.layers(null, overlays, { collapsed: false }).addTo(map);
	});
</script>

<!-- This div becomes the Leaflet canvas -->
<div bind:this={mapDiv} class="leaflet-container"></div>

<style>
	/* Give the map a definite size – change as you wish */
	.leaflet-container {
		width: 100%;
		height: 500px; /* or 100% if the parent .card has a fixed height */
	}
</style>
