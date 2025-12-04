<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	// ---------- ISS data ----------
	let lat: number | null = null;
	let lon: number | null = null;
	let timestamp: number | null = null;
	let error = '';

	// ---------- Update interval ----------
	const UPDATE_MS = 10_000; // 10 seconds
	let timer: ReturnType<typeof setInterval>;

	// ---------- Fetch the position ----------
	async function fetchISS() {
		try {
			const res = await fetch('http://api.open-notify.org/iss-now.json');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();

			// API returns strings – convert to numbers
			lat = Number(data.iss_position.latitude);
			lon = Number(data.iss_position.longitude);
			timestamp = data.timestamp;
			error = '';
			// update the map marker if it exists
			if (marker) marker.setLatLng([lat, lon]);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	// ---------- Leaflet map (optional) ----------
	let mapDiv: HTMLDivElement;
	let L; // Leaflet namespace (dynamic import)
	let map; // Leaflet map instance
	let marker; // Marker that moves with the ISS

	async function initMap() {
		const leaf = await import('leaflet');
		L = leaf.default;

		// Base map – you can swap the tile URL for any provider you like
		const base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		});

		map = L.map(mapDiv, {
			center: [0, 0],
			zoom: 2,
			layers: [base],
			attributionControl: false
		});

		// Marker – a simple circle; you could use a custom icon if you prefer
		marker = L.circleMarker([0, 0], {
			radius: 6,
			color: '#ff0',
			fillColor: '#ff0',
			fillOpacity: 0.9
		}).addTo(map);
	}

	// ---------- Lifecycle ----------
	onMount(() => {
		fetchISS(); // initial load
		timer = setInterval(fetchISS, UPDATE_MS);

		// initialise the map only in the browser (SSR‑safe)
		if (typeof window !== 'undefined') initMap();

		return () => {
			clearInterval(timer);
			if (map) map.remove(); // clean up Leaflet
		};
	});

	onDestroy(() => clearInterval(timer));
</script>

<div class="iss-card">
	<h3>International Space Station</h3>

	{#if error}
		<div class="error">⚠️ {error}</div>
	{:else if lat !== null && lon !== null}
		<p><strong>Latitude:</strong> {lat.toFixed(3)}°</p>
		<p><strong>Longitude:</strong> {lon.toFixed(3)}°</p>
		<p>
			<small>Last updated: {timestamp ? new Date(timestamp * 1000).toLocaleTimeString() : ''}</small
			>
		</p>

		<!-- Map – comment out the <div class="iss-map"> block if you don’t need a map -->
		<div bind:this={mapDiv} class="iss-map"></div>
	{:else}
		<p>Loading…</p>
	{/if}
</div>

<style>
	.iss-card {
		background: var(--panel-9-color, #222);
		color: var(--font-color, #fff);
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		max-width: 320px;
	}

	.iss-map {
		width: 100%;
		height: 250px;
		margin-top: 0.75rem;
		border: 2px solid var(--panel-border, #444);
		border-radius: 6px;
	}

	.error {
		color: var(--red, #f55);
		margin-top: 0.5rem;
	}
</style>
