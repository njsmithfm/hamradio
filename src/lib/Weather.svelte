<script>
	import { onMount } from 'svelte';

	export let lat = 44.0121; // Rochester, MN
	export let lon = -92.4802;

	let weather = null;
	let forecast = null;
	let loading = true;

	function fToC(f) {
		return Math.round(((f - 32) * 5) / 9);
	}

	onMount(async () => {
		try {
			// First, get the grid point data
			const pointResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
			const pointData = await pointResponse.json();

			// Then get the forecast
			const forecastResponse = await fetch(pointData.properties.forecast);
			const forecastData = await forecastResponse.json();

			const cur = forecastData.properties.periods[0];
			weather = {
				...cur,
				tempC: fToC(cur.temperature) // ← Celsius version
			};

			// next three periods
			forecast = forecastData.properties.periods.slice(0, 3).map((p) => ({
				...p,
				tempC: fToC(p.temperature) // ← Celsius version
			}));
		} catch (error) {
			console.error('Error fetching weather:', error);
		} finally {
			loading = false;
		}
	});
</script>

<div class="weather-container">
	{#if loading}
		<p>Loading weather...</p>
	{:else if weather}
		<div class="panels">
			<section class="current-panel">
				<!-- current‑conditions markup (unchanged) -->

				<div class="current-weather">
					<h3>Current Conditions</h3>
					<div class="weather-main">
						<div class="temp">{weather.tempC}°C</div>
						<div class="conditions">{weather.shortForecast}</div>
					</div>

					<!-- HAM Radio Impact -->
					<div class="ham-impact">
						<strong>Radio Impact:</strong>
						{#if weather.shortForecast.toLowerCase().includes('storm') || weather.shortForecast
								.toLowerCase()
								.includes('thunder')}
							Thunderstorms can cause high noise levels and static
						{:else if weather.windSpeed.includes('30') || weather.windSpeed.includes('40')}
							High winds - secure antennas
						{:else}
							Weather conditions favorable
						{/if}
					</div>
				</div>
			</section>

			<section class="forecast-panel">
				<div class="forecast-periods">
					<h3>Short-term Forecast</h3>
					{#each forecast as period}
						<div class="period">
							<strong>{period.name}:</strong>
							<div style="color: #2563eb; display: inline-block">
								{period.tempC}°C
							</div>
							{period.shortForecast}
						</div>
					{/each}
				</div>
			</section>
		</div>
	{:else}
		<p>Unable to load weather data</p>
	{/if}
</div>

<style>
	.weather-container {
		padding: 1rem;
	}

	.current-weather {
		margin-bottom: 1.5rem;
	}

	.weather-main {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin: 1rem 0;
	}

	.temp {
		font-size: 3rem;
		font-weight: bold;
		color: #2563eb;
	}

	.conditions {
		font-size: 1.5rem;
	}

	.ham-impact {
		border-left: 4px solid #f59e0b;
		padding: 1rem;
		margin-top: 1rem;
	}

	.period {
		border-radius: 4px;
	}

	/* two‑column layout below the hero */
	.panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	/* optional: keep the existing styling for each panel */
	.current-panel,
	.forecast-panel {
	}
</style>
