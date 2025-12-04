<script>
	import { onMount } from 'svelte';
	import KIndex from '$lib/KIndex.svelte';
	import SolarFlux from '$lib/SolarFlux.svelte';
	import Bands from '$lib/Bands.svelte';
	import Weather from '$lib/Weather.svelte';
	import Map from '$lib/Map.svelte';

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
		// 	let time;
		// 	const interval = setInterval(() => {
		// 		time = new Date();
		// 	}, 1000);

		// 	return () => {
		// 		clearInterval(interval);
		// 	};
	});

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'charts', label: 'Charts' },
		{ id: 'bands', label: 'Band Conditions' },
		{ id: 'map', label: 'Map' },
		{ id: 'weather', label: 'Weather' }
	];
	let activeTab = 'overview';
</script>

<main>
	<header>
		<h1>Rochester HAM Radio Dashboard</h1>
		<p class="location">Rochester, MN</p>
	</header>

	<!-- Tab bar -->
	<nav class="tabs">
		{#each tabs as t}
			<button class:selected={activeTab === t.id} on:click={() => (activeTab = t.id)}>
				{t.label}
			</button>
		{/each}
	</nav>

	{#if loading}
		<div class="loading">Loading conditions...</div>
	{:else}
		<!-- ── CONTENT BY TAB ──────────────────────── -->
		{#if activeTab === 'overview'}
			<section class="card wide">
				<h2>Space Weather</h2>
				<div class="metrics-row">
					<div class="metric">
						<div class="metric-label">K‑Index</div>
						<div class="metric-value">{currentKIndex}</div>
						<div class="metric-status">
							{currentKIndex <= 3 ? '✅ Quiet' : currentKIndex <= 5 ? '⚠️ Unsettled' : '❌ Storm'}
						</div>
					</div>
					<div class="metric">
						<div class="metric-label">Solar Flux</div>
						<div class="metric-value">{currentSolarFlux.toFixed(0)}</div>
						<div class="metric-status">
							{currentSolarFlux > 150
								? '✅ Excellent'
								: currentSolarFlux > 100
									? '👍 Good'
									: '📉 Fair'}
						</div>
					</div>
				</div>
			</section>
		{/if}

		{#if activeTab === 'charts'}
			<div class="dashboard-grid">
				<div class="card">
					<h2>K‑Index Trend</h2>
					<KIndex data={kIndexData} />
				</div>
				<div class="card">
					<h2>Solar Flux (30 Days)</h2>
					<SolarFlux data={solarFluxData} />
				</div>
			</div>
		{/if}

		{#if activeTab === 'bands'}
			<section class="card wide">
				<Bands solarFlux={currentSolarFlux} kIndex={currentKIndex} />
			</section>
		{/if}

		{#if activeTab === 'map'}
			<section class="card wide">
				<Map />
			</section>
		{/if}

		{#if activeTab === 'weather'}
			<section class="card wide">
				<h2>Local Weather</h2>
				<Weather />
			</section>
		{/if}
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		background: #f3f4f6;
	}
	main {
		max-width: 1400px;
		margin: auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
	header {
		text-align: center;
		margin-bottom: 2rem;
	}
	h1 {
		color: #1e40af;
		margin-bottom: 0.5rem;
	}
	.location {
		color: #6b7280;
		font-size: 1.1rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		font-size: 1.2rem;
		color: #6b7280;
	}

	/* ── TAB BAR ──────────────────────── */
	.tabs {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin-bottom: 1.5rem;
	}
	.tabs button {
		padding: 0.5rem 1rem;
		border: none;
		background: #e5e7eb;
		cursor: pointer;
		border-radius: 4px;
		font-weight: 600;
	}
	.tabs button.selected {
		background: #2563eb;
		color: white;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 1.5rem;
	}
	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.card.wide {
		grid-column: 1/-1;
	}
	.card h2 {
		margin-top: 0;
		color: #1f2937;
	}

	.metrics-row {
		display: flex;
		gap: 3rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
	.metric {
		text-align: center;
	}
	.metric-label {
		font-size: 0.9rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.metric-value {
		font-size: 3rem;
		font-weight: bold;
		color: #2563eb;
		margin: 0.5rem 0;
	}
	.metric-status {
		font-size: 1.1rem;
	}
</style>
