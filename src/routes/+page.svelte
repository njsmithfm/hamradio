<script>
	import { onMount } from 'svelte';
	import KIndex from '$lib/KIndex.svelte';

	import SolarFlux from '$lib/SolarFlux.svelte';
	import Bands from '$lib/Bands.svelte';
	import Weather from '$lib/Weather.svelte';
	import Map from '$lib/Map.svelte';
	import Sun from '$lib/Sun.svelte';
	import { randomQuote, toStardate } from '$lib/trekEphemera.js';

	let kIndexData = [];
	let solarFluxData = [];
	let currentKIndex = 0;
	let currentSolarFlux = 0;
	let loading = true;
	let hamRadioConditionsFavorable = false;
	let hamRadioImpact = 'Loading weather impact...';
	let chartEndTime;
	let chartStartTime;
	let activeTab = 0;
	let weatherIsFavorable = false;

	let quote = randomQuote();
	let stardate = toStardate();

	let audio1;
	let audio2;
	let audio3;
	let audio4;

	function playBeep(audio) {
		if (!audio) return;
		audio.pause();
		audio.currentTime = 0;
		audio.play().catch(() => {});
	}

	function playTabBeep() {
		playBeep(audio1);
	}

	function playPanelBeep() {
		playBeep(audio2);
	}

	function handleImpactChange(impact) {
		weatherIsFavorable = impact === 'Weather conditions favorable';
	}

	// Combined conditions: both space weather AND local weather must be favorable
	$: spaceWeatherFavorable = currentKIndex <= 3 && currentSolarFlux > 100;
	$: hamRadioConditionsFavorable = spaceWeatherFavorable && weatherIsFavorable;
	$: degradationReason = (() => {
		if (!spaceWeatherFavorable && !weatherIsFavorable) {
			return 'SOLAR INTERFERENCE AND POOR EARTH WEATHER';
		} else if (!spaceWeatherFavorable) {
			return 'SOLAR INTERFERENCE';
		} else if (!weatherIsFavorable) {
			return 'POOR EARTH WEATHER';
		}
		return '';
	})();
	$: hamRadioImpact = hamRadioConditionsFavorable
		? 'Radio propagation favorable'
		: `Conditions are not favorable for radio propagation (${degradationReason})`;

	onMount(async () => {
		try {
			// Order matters – the array indices must line‑up with the variables
			const [kRes, fRes] = await Promise.all([
				fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
				fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json')
			]);

			const pointResponse = await fetch('https://api.weather.gov/points/44.0121,-92.4802');
			const pointData = await pointResponse.json();
			const forecastResponse = await fetch(pointData.properties.forecast);
			const forecastData = await forecastResponse.json();
			const currentWeather = forecastData.properties.periods[0];
			const weatherConditionsFavorable = !(
				currentWeather.shortForecast.toLowerCase().includes('storm') ||
				currentWeather.shortForecast.toLowerCase().includes('thunder') ||
				currentWeather.windSpeed.includes('30') ||
				currentWeather.windSpeed.includes('40')
			);

			// Set weather favorability based on fetched data
			weatherIsFavorable = weatherConditionsFavorable;

			// Store weather info but don't use it for ham radio propagation conditions
			hamRadioImpact = weatherConditionsFavorable
				? 'Weather conditions favorable'
				: 'Conditions are not favorable';

			// Parse each response
			kIndexData = await kRes.json();
			solarFluxData = await fRes.json();
			chartEndTime = new Date();
			chartStartTime = new Date(chartEndTime.getTime() - 72 * 60 * 60 * 1000);

			// Pull the latest values (optional, for the dashboard cards)
			try {
				const kValue = parseFloat(kIndexData.at(-1)?.[1]);
				currentKIndex = isNaN(kValue) ? 0 : kValue;
			} catch (err) {
				console.error('Failed to parse K-index:', err);
				currentKIndex = 0;
			}
			try {
				const fValue = parseFloat(solarFluxData.at(-1)?.flux);
				currentSolarFlux = isNaN(fValue) ? 0 : fValue;
			} catch (err) {
				console.error('Failed to parse solar flux:', err);
				currentSolarFlux = 0;
			}
			// Reactive declarations will automatically update hamRadioConditionsFavorable
			// based on both space weather and local weather conditions
		} catch (e) {
			console.error('Failed to load space‑weather data:', e);
			chartEndTime = new Date();
			chartStartTime = new Date(chartEndTime.getTime() - 72 * 60 * 60 * 1000);
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<p>Loading space‑weather data…</p>
{:else}
	<div class="dashboard-grid">
		<audio bind:this={audio1} src="/LCARSassets/beep1.mp3" preload="auto"></audio>
		<audio bind:this={audio2} src="/LCARSassets/beep2.mp3" preload="auto"></audio>
		<audio bind:this={audio3} src="/LCARSassets/beep3.mp3" preload="auto"></audio>
		<audio bind:this={audio4} src="/LCARSassets/beep4.mp3" preload="auto"></audio>
		<section class="wrap-standard" id="column-3">
			<div class="wrap">
				<div class="left-frame-top">
					<!--
					*** LCARS PANEL BUTTON ***
					Replace the hashtag '#' with a real URL (or not) in the following <button> tag. If you do not want a sound effect for this link, replace the <button> element with the following <div> + <a> elements:
						
					<div class="panel-1">
						<a href="#">LCARS</a>
					</div>
					-->
					<!-- <button onclick="playSoundAndRedirect('audio2', '#')" class="panel-1-button">LCARS</button> -->
					<div class="panel-2">
						<span class="hop">STARDATE <br />{stardate}</span>
					</div>
				</div>

				<div class="right-frame-top">
					<div>
						<div class="nav-row">
							<nav class="tab-bar">
								<button
									class:selected={activeTab === 0}
									on:click={() => {
										activeTab = 0;
										playTabBeep();
									}}
								>
									Space Weather
								</button>

								<button
									class:selected={activeTab === 1}
									on:click={() => {
										activeTab = 1;
										playTabBeep();
									}}
								>
									Earth Weather
								</button>
							</nav>

							<div class="banner">ROCHESTER MN</div>

							<div class="title-wrapper">
								<div style="text-align:left; font-size:1.5rem">LCARS V. 24.2</div>
								<p class="quote">{quote}</p>
							</div>
						</div>
					</div>

					<div class="bar-panel first-bar-panel">
						<div class="bar-1"></div>

						<div class="bar-2"></div>
						<div class="bar-3"></div>
						<div class="bar-4"></div>
						<div class="bar-5"></div>
					</div>
				</div>
			</div>
			<div class="wrap" id="gap">
				<div class="left-frame">
					<div>
						<div class="panel-3">04<span class="hop">-111968</span></div>
						<div class="panel-4">08<span class="hop">-041969</span></div>
						<div class="panel-5">15<span class="hop">-1701D</span></div>
						<div class="panel-6">16<span class="hop">-071984</span></div>
						<div class="panel-7">23<span class="hop">-081940</span></div>
						<div class="panel-8">42<span class="hop">-47148</span></div>
						<div class="panel-9">13<span class="hop">-12Z07</span></div>
					</div>
					<div>
						<div class="panel-10">
							<span class="hop"
								><a class="njsmithfm" href="https://njsmithfm.github.io" target="_blank"
									>njsmith.fm</a
								></span
							>
						</div>
					</div>
				</div>
				<div class="right-frame">
					<div class="bar-panel">
						<div class="bar-6"></div>
						<div class="bar-7"></div>
						<div class="bar-8"></div>
						<div class="bar-9"></div>
						<div class="bar-10"></div>
					</div>
					<main>
						{#if activeTab === 0}
							<div class="dashboard-grid">
								<div class="card">
									<h2>
										{#if hamRadioConditionsFavorable}
											PLANETARY IONOSPHERIC QUANTA PERMIT <strong>FAVORABLE</strong> PROPOGATION.
											<strong>QAPLA!</strong>
										{:else}
											PLANETARY IONOSPHERIC QUANTA PERMIT <strong>UNFAVORABLE</strong> PROPOGATION.
											<strong>CONDITIONS DEGRADED DUE TO {degradationReason}.</strong>
										{/if}
									</h2>
									<div class="card" style="margin-bottom: -0.5rem;">
										<h4>
											Radio Impact: {hamRadioImpact}
										</h4>
									</div>
									<div class="card wide" style="margin-bottom: 0;">
										<Bands solarFlux={currentSolarFlux} kIndex={currentKIndex} />
									</div>

									<div class="charts-grid">
										<div class="card">
											<h4 style="margin-top: 1rem; font-weight: 600;">
												K‑Index: {currentKIndex},
												{#if currentKIndex <= 3}
													Quiet
												{:else if currentKIndex <= 5}
													Unsettled
												{:else}
													Storm
												{/if}
											</h4>
											<KIndex
												data={kIndexData}
												xDomainStart={chartStartTime}
												xDomainEnd={chartEndTime}
											/>
										</div>

										<div class="card">
											<h4 style="margin-top: 1rem; font-weight: 600;">
												Solar Flux Units: {currentSolarFlux.toFixed(0)},
												{#if currentSolarFlux > 150}
													Optimal
												{:else if currentSolarFlux > 100}
													Adequate
												{:else}
													Fair
												{/if}
											</h4>
											<SolarFlux
												data={solarFluxData}
												xDomainStart={chartStartTime}
												xDomainEnd={chartEndTime}
											/>
										</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="dashboard-grid">
								<div class="card">
									<h2>
										{#if hamRadioConditionsFavorable}
											PLANETARY IONOSPHERIC QUANTA PERMIT <strong>FAVORABLE</strong> PROPOGATION.
											<strong>QAPLA!</strong>
										{:else}
											PLANETARY IONOSPHERIC QUANTA PERMIT <strong>UNFAVORABLE</strong> PROPOGATION.
											<strong>CONDITIONS DEGRADED DUE TO {degradationReason}.</strong>
										{/if}
									</h2>

									<div class="card wide">
										<Map />
									</div>
									<div class="card wide">
										<Weather onImpactChange={handleImpactChange} />
									</div>
								</div>
							</div>
						{/if}
					</main>
					<footer>
						<!-- The following attribution must not be removed: -->
						LCARS Inspired Website Template by
						<a href="https://www.thelcars.com">www.TheLCARS.com</a>.
					</footer>
				</div>
			</div>
		</section>
		<div class="headtrim"></div>
		<div class="baseboard"></div>
	</div>
{/if}

<style>
	.nav-row {
		margin: 1rem;
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.tab-bar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.nav-row {
			margin: 0.5rem;
			gap: 0.5rem;
		}

		.tab-bar {
			width: 100%;
			gap: 0.25rem;
		}

		.tab-bar button {
			flex: 1;
			min-width: auto;
			padding: 0.6rem 0.8rem;
			font-size: 0.9rem;
			min-height: 44px;
		}
	}

	@media (max-width: 525px) {
		.tab-bar button {
			padding: 0.5rem 0.6rem;
			font-size: 0.85rem;
		}
	}

	.njsmithfm:hover {
		color: rgb(255, 0, 212);
	}

	.title-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem; /* space between heading and quote */
	}

	.quote {
		margin: 0;
		font-size: 0.85rem;
		color: #89f;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		word-wrap: break-word;
		hyphens: auto;
	}

	@media (max-width: 768px) {
		.quote {
			font-size: 0.75rem;
		}
	}

	.dashboard-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.dashboard-grid {
			gap: 0.5rem;
		}
	}

	.card {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.5rem;
		border-radius: 8px;
		word-break: break-word;
		overflow-wrap: break-word;
	}

	@media (max-width: 768px) {
		.card {
			padding: 1rem;
			margin: 0.5rem;
		}

		.card h2 {
			font-size: 1.2rem;
			line-height: 1.3;
		}

		.card h4 {
			font-size: 1rem;
		}
	}

	@media (max-width: 525px) {
		.card {
			padding: 0.75rem;
			margin: 0.25rem;
		}

		.card h2 {
			font-size: 1rem;
		}

		.card h4 {
			font-size: 0.9rem;
		}
	}

	.card.wide {
		width: 100%;
	}

	.card h2,
	.card h4 {
		margin-top: 0;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 980px) {
		.charts-grid {
			grid-template-columns: 1fr 1fr;
			align-items: stretch;
		}
	}
</style>
