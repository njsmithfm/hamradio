<script>
	export let solarFlux = 0;
	export let kIndex = 0;

	// Calculate band conditions based on solar flux and K-index
	const bands = [
		{ name: '160m', freq: '1.8-2.0 MHz', nightBand: true },
		{ name: '80m', freq: '3.5-4.0 MHz', nightBand: true },
		{ name: '40m', freq: '7.0-7.3 MHz', allDay: true },
		{ name: '20m', freq: '14.0-14.35 MHz', dayBand: true },
		{ name: '15m', freq: '21.0-21.45 MHz', dayBand: true },
		{ name: '10m', freq: '28.0-29.7 MHz', dayBand: true }
	];

	function getCondition(band) {
		// Simple heuristic for band conditions
		if (kIndex > 5) return 'poor';

		if (band.dayBand) {
			if (solarFlux > 150) return 'excellent';
			if (solarFlux > 100) return 'good';
			if (solarFlux > 70) return 'fair';
			return 'poor';
		}

		if (band.nightBand) {
			if (kIndex < 3) return 'good';
			if (kIndex < 5) return 'fair';
			return 'poor';
		}

		// 40m works day and night
		if (kIndex < 3 && solarFlux > 80) return 'excellent';
		if (kIndex < 4) return 'good';
		return 'fair';
	}

	function getConditionColor(condition) {
		const colors = {
			excellent: '#10b981',
			good: '#84cc16',
			fair: '#f59e0b',
			poor: '#ef4444'
		};
		return colors[condition] || '#6b7280';
	}
</script>

<div class="bands-container">
	<h3>HF Band Conditions</h3>
	<p class="subtitle">Based on Solar Flux: {solarFlux.toFixed(0)} SFU, K-Index: {kIndex}</p>

	<div class="bands-grid">
		{#each bands as band}
			{@const condition = getCondition(band)}
			<div class="band-card" style="border-left-color: {getConditionColor(condition)}">
				<div class="band-name">{band.name}</div>
				<div class="band-freq">{band.freq}</div>
				<div class="band-condition" style="color: {getConditionColor(condition)}">
					{condition.toUpperCase()}
				</div>
				<div class="band-time">
					{#if band.dayBand}
						Best daytime
					{:else if band.nightBand}
						Best nighttime
					{:else}
						Good 24/7
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.bands-container {
		padding: 1rem;
	}

	.subtitle {
		color: #000000;
		margin-bottom: 1rem;
	}

	.bands-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.band-card {
		background: rgb(25, 103, 139);
		padding: 1rem;
		border-radius: 6px;
		border-left: 4px solid;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.band-name {
		font-size: 1.5rem;
		font-weight: bold;
		color: #1fe63a;
	}

	.band-freq {
		color: #111825;
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}

	.band-condition {
		font-weight: bold;
		margin: 0.5rem 0;
	}

	.band-time {
		font-size: 0.85rem;
		color: #e9ff26;
	}
</style>
