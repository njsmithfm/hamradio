<script>
	import { onMount } from 'svelte';
	import KIndex from '$lib/KIndex.svelte';
	import SolarFlux from '$lib/SolarFlux.svelte';
	import Bands from '$lib/Bands.svelte';
	import Weather from '$lib/Weather.svelte';
	import Map from '$lib/Map.svelte';
	import ISS from '$lib/ISS.svelte';

	let kIndexData = [];
	let solarFluxData = [];
	let currentKIndex = 0;
	let currentSolarFlux = 0;
	let loading = true;

	onMount(async () => {
		try {
			// Fetch K-index
			const kResponse = await fetch(
				'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
			);
			kIndexData = await kResponse.json();
			currentKIndex = kIndexData[kIndexData.length - 1].kp_index;

			// Fetch Solar Flux
			const fluxResponse = await fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json');
			solarFluxData = await fluxResponse.json();
			currentSolarFlux = solarFluxData[solarFluxData.length - 1].flux;
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			loading = false;
		}
	});
</script>

<main>
	<header>
		<h1>Rochester HAM Radio Dashboard</h1>
		<p class="location">Rochester, MN</p>
	</header>

	{#if loading}
		<div class="loading">Loading conditions...</div>
	{:else}
		<div class="dashboard-grid">
			<!-- Top metrics -->
			<div class="card wide">
				<h2>Space Weather</h2>
				<div class="metrics-row">
					<div class="metric">
						<div class="metric-label">K-Index</div>
						<div class="metric-value">{currentKIndex}</div>
						<div class="metric-status">
							{currentKIndex <= 3 ? 'Quiet' : currentKIndex <= 5 ? 'Unsettled' : 'Storm'}
						</div>
					</div>
					<div class="metric">
						<div class="metric-label">Solar Flux</div>
						<div class="metric-value">{currentSolarFlux.toFixed(0)}</div>
						<div class="metric-status">
							{currentSolarFlux > 150 ? 'Excellent' : currentSolarFlux > 100 ? 'Good' : 'Fair'}
						</div>
					</div>
				</div>
			</div>

			<!-- Charts -->
			<div class="card">
				<h2>K-Index Trend</h2>
				<KIndex data={kIndexData} />
			</div>

			<div class="card">
				<h2>Solar Flux (30 Days)</h2>
				<SolarFlux data={solarFluxData} />
			</div>

			<!-- Band Conditions -->
			<div class="card wide">
				<Bands solarFlux={currentSolarFlux} kIndex={currentKIndex} />
			</div>

			<div class="card wide">
				<Map />
			</div>
			<!-- Weather -->
			<div class="card wide">
				<h2>Local Weather</h2>
				<Weather />
			</div>

			<div class="card wide">
				<ISS />
			</div>
		</div>
	{/if}
</main>
