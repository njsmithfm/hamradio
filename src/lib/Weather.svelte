<script>
	import { onMount } from 'svelte';

	export let lat = 44.0121; // Rochester, MN
	export let lon = -92.4802;

	let weather = null;
	let forecast = null;
	let loading = true;

	onMount(async () => {
		try {
			// First, get the grid point data
			const pointResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
			const pointData = await pointResponse.json();

			// Then get the forecast
			const forecastResponse = await fetch(pointData.properties.forecast);
			const forecastData = await forecastResponse.json();

			// Get current conditions from the first period
			weather = forecastData.properties.periods[0];
			forecast = forecastData.properties.periods.slice(0, 3);
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
		<div class="current-weather">
			<h3>Current Conditions</h3>
			<div class="weather-main">
				<div class="temp">{weather.temperature}°{weather.temperatureUnit}</div>
				<div class="conditions">{weather.shortForecast}</div>
			</div>
			<div class="details">
				<p><strong>Wind:</strong> {weather.windSpeed} {weather.windDirection}</p>
				<p><strong>Forecast:</strong> {weather.detailedForecast}</p>
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

		<div class="forecast-periods">
			<h3>Short-term Forecast</h3>
			{#each forecast as period}
				<div class="period">
					<strong>{period.name}:</strong>
					{period.temperature}°{period.temperatureUnit}, {period.shortForecast}
				</div>
			{/each}
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

	.details {
		background: #f0f4ff;
		padding: 1rem;
		border-radius: 6px;
		margin: 1rem 0;
	}

	.details p {
		margin: 0.5rem 0;
	}

	.ham-impact {
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		padding: 1rem;
		margin-top: 1rem;
	}

	.forecast-periods {
		border-top: 2px solid #e5e7eb;
		padding-top: 1rem;
	}

	.period {
		padding: 0.75rem;
		background: #f9fafb;
		margin: 0.5rem 0;
		border-radius: 4px;
	}
</style>
