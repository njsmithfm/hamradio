<script>
	import { onMount } from 'svelte';
	import KIndexChart from '$lib/KIndexChart.svelte';

	let kIndexData = [];
	let currentKIndex = null;
	let loading = true;

	onMount(async () => {
		try {
			// Fetch K-index data
			const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
			kIndexData = await response.json();
			currentKIndex = kIndexData[kIndexData.length - 1].kp_index;
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			loading = false;
		}
	});
</script>

<main>
	<h1>HAM Radio Conditions - Rochester, MN</h1>

	{#if loading}
		<p>Loading conditions...</p>
	{:else if kIndexData.length > 0}
		<div class="metric-card">
			<h2>Current K-Index: <span class="value">{currentKIndex}</span></h2>
			<p class="status">
				{#if currentKIndex <= 3}
					✅ Excellent conditions for HF propagation
				{:else if currentKIndex <= 5}
					⚠️ Fair conditions
				{:else}
					❌ Poor conditions - geomagnetic storm in progress
				{/if}
			</p>
		</div>

		<div class="chart-card">
			<h2>K-Index Trend (Last 24 Hours)</h2>
			<KIndexChart data={kIndexData} />
		</div>
	{:else}
		<p>Unable to load data</p>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		color: #1e40af;
		margin-bottom: 2rem;
	}

	.metric-card,
	.chart-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.value {
		font-size: 2rem;
		font-weight: bold;
		color: #2563eb;
	}

	.status {
		font-size: 1.1rem;
		margin-top: 0.5rem;
	}
</style>
