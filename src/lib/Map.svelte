<script>
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	export let latitude = 44.0121;
	export let longitude = -92.4802;

	let mapDiv; // bound to the <div> that becomes the map
	let L; // Leaflet namespace
	let map;

	const BASE_URL_LIGHT = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}';
	const BASE_URL_DARK =
		'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}';
	const BASE_ATTRIB =
		'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
		'&copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> ' +
		'&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
		'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

	const OWM_KEY = import.meta.env.VITE_OWM_KEY ?? 'YOUR_OWM_KEY_HERE';
	const PRECIP_URL = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const PRECIP_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	const TEMP_URL = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const TEMP_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	const CLOUD_URL = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const CLOUD_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	const WIND_URL = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
	const WIND_ATTRIB =
		'&copy; <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>';

	onMount(async () => {
		const leaf = await import('leaflet');
		L = leaf.default;

		if (!mapDiv) {
			console.error('Map container not found');
			return;
		}

		const baseLayerLight = L.tileLayer(BASE_URL_LIGHT, {
			minZoom: 0,
			maxZoom: 20,
			attribution: BASE_ATTRIB,
			ext: 'png'
		});

		const baseLayerDark = L.tileLayer(BASE_URL_DARK, {
			minZoom: 0,
			maxZoom: 20,
			attribution: BASE_ATTRIB,
			ext: 'png'
		});

		const radarLayer = L.tileLayer(
			'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png',
			{
				attribution: 'NOAA/NWS Radar',
				opacity: 0.6,
				maxZoom: 20
			}
		);

		map = L.map(mapDiv, {
			center: [latitude, longitude],
			zoom: 8,
			layers: [baseLayerDark, radarLayer]
		});

		const overlays = {
			'Weather Radar': radarLayer,
			'Light Mode': baseLayerLight
		};

		// Dark mode toggle handler
		map.on('overlayadd', (e) => {
			if (e.name === 'Light Mode') {
				map.removeLayer(baseLayerDark);
			}
		});

		map.on('overlayremove', (e) => {
			if (e.name === 'Light Mode') {
				map.addLayer(baseLayerDark);
			}
		});

		L.control.layers(null, overlays, { collapsed: false }).addTo(map);
	});

	// Update map center when coordinates change
	$: if (map) {
		map.setView([latitude, longitude], 8);
	}
</script>

<!-- Map container -->
<div bind:this={mapDiv} class="leaflet-container"></div>

<style>
	.leaflet-container {
		width: 100%;
		height: 500px;
		min-height: 400px;
		height: 50vh;
	}
</style>
