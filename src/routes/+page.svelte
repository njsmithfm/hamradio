<script>
	import { onMount } from 'svelte';
	import KIndex from '$lib/KIndex.svelte';
	import SolarFlux from '$lib/SolarFlux.svelte';
	import Bands from '$lib/Bands.svelte';
	import Weather from '$lib/Weather.svelte';
	import Map from '$lib/Map.svelte';
	import ISS from '$lib/ISS.svelte';
	import { randomQuote } from '$lib/quotes.js';

	let kIndexData = [];
	let solarFluxData = [];
	let currentKIndex = 0;
	let currentSolarFlux = 0;
	let loading = true;

	let quote = 'Live long and prosper';

	onMount(async () => {
		try {
			const [kRes, fRes] = await Promise.all([
				fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'),
				fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json')
			]);

			kIndexData = await kRes.json();
			currentKIndex = kIndexData.at(-1).kp_index;

			solarFluxData = await fRes.json();
			currentSolarFlux = solarFluxData.at(-1).flux;
			quote = randomQuote();
		} catch (e) {
			console.error(e);
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
					<div class="panel-2">02<span class="hop">-262000</span></div>
				</div>
				<div class="right-frame-top">
					<div class="banner">
						ROCHESTER MN &#149 LCARS V. 24.2

						<p class="go-big">{quote}</p>
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
					<!--
					** SCROLL TO TOP OF PAGE BUTTON **
					This button is initially hidden, and is styled like a panel in the sidebar. It appears at the bottom of the page after vertical scrolling. If you don't want the sound effect, replace with this:
					<button onclick="topFunction()" id="topBtn"><span class="hop">screen</span> top</button>
					-->
					<!-- <button onclick="topFunction(); playSoundAndRedirect('audio4', '#')" id="topBtn"> -->

					<!-- <span class="hop">screen</span> top</button> -->

					<div>
						<div class="panel-3">03<span class="hop">-111968</span></div>
						<div class="panel-4">04<span class="hop">-041969</span></div>
						<div class="panel-5">05<span class="hop">-1701D</span></div>
						<div class="panel-6">06<span class="hop">-071984</span></div>
						<div class="panel-7">07<span class="hop">-081940</span></div>
						<div class="panel-8">08<span class="hop">-47148</span></div>
						<div class="panel-9">09<span class="hop">-081966</span></div>
					</div>
					<div>
						<div class="panel-10">10<span class="hop">-31</span></div>
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
						<!-- Start your content here. -->

						<div class="dashboard-grid">
							<!-- Top metrics -->
							<div class="card wide">
								<h2>IONOSPHERIC QUANTA</h2>
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
											{currentSolarFlux > 150
												? 'Excellent'
												: currentSolarFlux > 100
													? 'Good'
													: 'Fair'}
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

						<!-- End content area. -->
					</main>
					<footer>
						<!-- Your copyright information is only a suggestion and you can choose to delete it. -->

						<!-- The following attribution must not be removed: -->
						LCARS Inspired Website Template by
						<a href="https://www.thelcars.com">www.TheLCARS.com</a>.
					</footer>
				</div>
			</div>
		</section>
		<div class="headtrim"></div>
		<div class="baseboard"></div>
	</div>{/if}
