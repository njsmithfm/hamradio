<script>
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	let mapDiv; // bound to the <div> that becomes the map
	let L; // Leaflet namespace (filled after dynamic import)

	/* ---------- Base map (black‑tone) ---------- */
	const BASE_URL = 'https://tiles.stadiamaps.com/tiles/stamen_toner_blacklite/{z}/{x}/{y}{r}.{ext}';
	const BASE_ATTRIB =
		'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
		'&copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> ' +
		'&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
		'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

	/* ---------- Precipitation overlay (high contrast) ---------- */
	// 👉 Replace with your own OpenWeatherMap API key
	const OWM_KEY = import.meta.env.VITE_OWM_KEY ?? 'YOUR_OWM_KEY_HERE';
	const PRECIP_URL = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const PRECIP_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	onMount(async () => {
		// 1️⃣ Load Leaflet only in the browser
		const leaf = await import('leaflet');
		L = leaf.default;

		if (!mapDiv) {
			console.error('❌ Map container not found');
			return;
		}

		// 2️⃣ Base layer (black background)
		const baseLayer = L.tileLayer(BASE_URL, {
			minZoom: 0,
			maxZoom: 20,
			attribution: BASE_ATTRIB,
			ext: 'png'
		});

		// 3️⃣ Precipitation layer – start visible, high opacity for contrast
		const precipLayer = L.tileLayer(PRECIP_URL, {
			opacity: 0.85, // make it stand out on the dark base
			attribution: PRECIP_ATTRIB,
			maxZoom: 20
		});

		// 4️⃣ Initialise the map
		const map = L.map(mapDiv, {
			center: [44.0121, -92.4802], // Rochester, MN
			zoom: 10,
			layers: [baseLayer, precipLayer] // both layers loaded initially
		});

		// 5️⃣ Layer control – you can toggle precipitation on/off
		const overlays = {
			Precipitation: precipLayer
		};
		L.control.layers(null, overlays, { collapsed: false }).addTo(map);

		// 6️⃣ OPTIONAL: force the precipitation pane to be on top
		precipLayer.bringToFront();
	});
</script>

<!-- Map container -->
<div bind:this={mapDiv} class="leaflet-container"></div>

<style>
	.leaflet-container {
		width: 100%;
		height: 500px; /* adjust as needed */
	}
</style>
