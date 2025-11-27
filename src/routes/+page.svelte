<script>
	import { onMount } from 'svelte';

	let kIndex = null;
	let weather = null;
	let loading = true;

	onMount(async () => {
		// Fetch K-index
		const kResponse = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
		const kData = await kResponse.json();
		kIndex = kData[kData.length - 1].kp_index;

		loading = false;
	});
</script>

<main>
	<h1>HAM Radio Conditions - Rochester, MN</h1>

	{#if loading}
		<p>Loading conditions...</p>
	{:else}
		<div class="metric">
			<h2>K-Index</h2>
			<p class="value">{kIndex}</p>
			<p class="status">{kIndex <= 3 ? 'Good' : 'Poor'} conditions</p>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.metric {
		background: #f0f0f0;
		padding: 1.5rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.value {
		font-size: 3rem;
		font-weight: bold;
		margin: 0.5rem 0;
	}
</style>
