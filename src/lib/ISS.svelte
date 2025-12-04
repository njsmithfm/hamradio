<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	// ----- Config -------------------------------------------------
	const NASA_KEY = import.meta.env.VITE_NASA_API_KEY ?? 'DEMO_KEY';
	const ISS_ENDPOINT = `https://api.nasa.gov/iss-now?api_key=${NASA_KEY}`;
	const UPDATE_MS = 10_000; // refresh every 10 s

	// ----- State --------------------------------------------------
	let lat: number | null = null;
	let lon: number | null = null;
	let alt: number | null = null; // altitude in km (optional)
	let timestamp: number | null = null;
	let error = '';

	// ----- Leaflet ------------------------------------------------
	let mapDiv: HTMLDivElement;
	let L; // Leaflet namespace (dynamic import)
	let map; // Leaflet map instance
	let marker; // Moving marker

	// ----- Functions -----------------------------------------------
	async function fetchISS() {
		try {
			const res = await fetch(ISS_ENDPOINT);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();

			// NASA returns numbers already, but guard against missing fields
			lat = data.latitude ?? null;
			lon = data.longitude ?? null;
			alt = data.altitude ?? null; // km
			timestamp = data.timestamp ?? null;
			error = '';

			if (marker) marker.setLatLng([lat!, lon!]);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	async function initMap() {
		const leaf = await import('leaflet');
		L = leaf.default;

		const base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		});

		map = L.map(mapDiv, {
			center: [0, 0],
			zoom: 2,
			layers: [base],
			attributionControl: false
		});

		// A bright orange circle works well on dark LCARS backgrounds
		marker = L.circleMarker([0, 0], {
			radius: 6,
			color: '#ff6600',
			fillColor: '#ff6600',
			fillOpacity: 0.9
		}).addTo(map);
	}

	// ----- Lifecycle -----------------------------------------------
	let timer: ReturnType<typeof setInterval>;

	onMount(() => {
		fetchISS(); // initial fetch
		timer = setInterval(fetchISS, UPDATE_MS);

		if (typeof window !== 'undefined') initMap();

		return () => {
			clearInterval(timer);
			if (map) map.remove();
		};
	});

	onDestroy(() => clearInterval(timer));
</script>

<div class="iss-card">
	<h3>International Space Station</h3>

	{#if error}
		<div class="error">⚠️ {error}</div>
	{:else if lat !== null && lon !== null}
		<p><strong>Latitude:</strong> {lat!.toFixed(3)}°</p>
		<p><strong>Longitude:</strong> {lon!.toFixed(3)}°</p>
		{#if alt !== null}
			<p><strong>Altitude:</strong> {alt!.toFixed(1)} km</p>
		{/if}
		<p>
			<small>Updated: {timestamp ? new Date(timestamp * 1000).toLocaleTimeString() : ''}</small>
		</p>

		<!-- Map (optional – comment out if you don’t need it) -->
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
		max-width: 340px;
	}
	.iss-map {
		width: 100%;
		height: 260px;
		margin-top: 0.75rem;
		border: 2px solid var(--panel-border, #444);
		border-radius: 6px;
	}
	.error {
		color: var(--red, #f55);
		margin-top: 0.5rem;
	}
</style>
