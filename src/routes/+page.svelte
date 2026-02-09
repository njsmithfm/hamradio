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
	let outcome = 'FAVORABLE';
	let activeTab = 0;

	let quote = randomQuote();
	let stardate = toStardate();

	onMount(async () => {
		try {
			// Order matters – the array indices must line‑up with the variables
			const [
				kRes, // planetary_k_index_1m.json
				fRes // f107_cm_flux.json
			] = await Promise.all([
				fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
				fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json')
			]);

			// Parse each response
			kIndexData = await kRes.json();
			solarFluxData = await fRes.json();

			// Pull the latest values (optional, for the dashboard cards)
			currentKIndex = kIndexData.at(-1)[1]; // Kp value is in column 1
			currentSolarFlux = solarFluxData.at(-1).flux;
		} catch (e) {
			console.error('Failed to load space‑weather data:', e);
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<p>Loading space‑weather data…</p>
{:else}
	<div class="dashboard-grid">
		<audio id="audio1" src="/LCARSassets/beep1.mp3" preload="auto"></audio>
		<audio id="audio2" src="/LCARSassets/beep2.mp3" preload="auto"></audio>
		<audio id="audio3" src="/LCARSassets/beep3.mp3" preload="auto"></audio>
		<audio id="audio4" src="/LCARSassets/beep4.mp3" preload="auto"></audio>
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
								<button class:selected={activeTab === 0} on:click={() => (activeTab = 0)}>
									Space Weather
								</button>

								<button class:selected={activeTab === 1} on:click={() => (activeTab = 1)}>
									Earth Weather
								</button>
							</nav>

							<div class="banner">ROCHESTER MN</div>
							<div class="title‑wrapper">
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
										PLANETARY IONOSPHERIC QUANTA PERMIT {outcome} PROPOGATION.
										{#if outcome == 'FAVORABLE'}<strong>QAPLA!</strong>{/if}
									</h2>
									<div class="card wide">
										<Bands solarFlux={currentSolarFlux} kIndex={currentKIndex} />
									</div>
									<div class="card">
										<h4>
											K‑Index: {currentKIndex},
											{#if currentKIndex <= 3}
												Quiet
											{:else if currentKIndex <= 5}
												Unsettled
											{:else}
												Storm
											{/if}
										</h4>
										<KIndex data={kIndexData} />
									</div>

									<div class="card">
										<h4>
											Solar Flux Units: {currentSolarFlux.toFixed(0)},
											{#if currentSolarFlux > 150}
												Optimal
											{:else if currentSolarFlux > 100}
												Adequate
											{:else}
												Fair
											{/if}
										</h4>
										<SolarFlux data={solarFluxData} />
									</div>
								</div>
							</div>
						{:else}
							<div class="dashboard-grid">
								<div class="card">
									<h2>
										PLANETARY IONOSPHERIC QUANTA PERMIT {outcome} PROPOGATION.
										{#if outcome == 'FAVORABLE'}<strong>QAPLA!</strong>{/if}
									</h2>

									<div class="card wide">
										<Map />
									</div>
									<div class="card wide">
										<Weather />
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

	.njsmithfm:hover {
		color: rgb(255, 0, 212);
	}

	.title‑wrapper {
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
	}
</style>
