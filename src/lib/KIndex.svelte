<script>
	/* -------------------------------------------------
	   Imports & props
	   ------------------------------------------------- */
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = []; // raw NOAA JSON array

	/* -------------------------------------------------
	   Layout constants (same as before)
	   ------------------------------------------------- */
	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const width = 600 - margin.left - margin.right;
	const height = 300 - margin.top - margin.bottom;

	/* -------------------------------------------------
	   Scales – created once, reused later
	   ------------------------------------------------- */
	const xScale = d3.scaleTime().range([0, width]);
	const yScale = d3
		.scaleLinear()
		.domain([0, 9]) // K‑index always 0‑9
		.nice()
		.range([height, 0]);

	/* colour scale – same palette you used before */
	const color = d3.scaleLinear().domain([0, 5, 9]).range(['#00ff00', '#ffff00', '#ff0000']);

	/* line generator – pure function, no DOM side‑effects */
	const line = d3
		.line()
		.x((d) => xScale(d.time))
		.y((d) => yScale(d.value))
		.curve(d3.curveMonotoneX);

	/* -------------------------------------------------
	   Reactive data preparation
	   ------------------------------------------------- */
	// Take the most recent N points (newest → oldest) and turn them into
	// {time: Date, value: Number}
	$: recent = data
		.map((d) => ({
			time: new Date(d.time_tag),
			value: +d.kp_index
		}))
		.filter((d) => d.time <= new Date()) // discard stray future timestamps
		.sort((a, b) => b.time - a.time) // newest first
		.slice(0, 24); // keep at most 24 points

	// Update the domains whenever we have data
	$: if (recent.length) {
		xScale.domain(d3.extent(recent, (d) => d.time));
		// yScale domain is fixed (0‑9) – no need to recompute
	}

	/* -------------------------------------------------
	   Tooltip state
	   ------------------------------------------------- */
	let tipVisible = false,
		tipX = 0,
		tipY = 0,
		tipHtml = '';

	function show(d) {
		tipHtml = `
			<strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
			K‑Index: <span style="color:${color(d.value)}">${d.value}</span>`;
		tipX = xScale(d.time) + margin.left + 8;
		tipY = yScale(d.value) + margin.top - 12;
		tipVisible = true;
	}
	function hide() {
		tipVisible = false;
	}
</script>

<div class="chart-wrapper" style="position:relative;">
	<svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<!-- X‑axis -->
			<g transform={`translate(0,${height})`}>
				{#each xScale.ticks(6) as t}
					<g transform={`translate(${xScale(t)},0)`}>
						<line y2={height} />
						<text x="25" y="35" text-anchor="middle" font-size="6" fill="#ffffff">
							{d3.timeFormat('%b %d')(t)}
						</text>
					</g>
				{/each}
			</g>

			<!-- Y‑axis -->
			<g>
				{#each yScale.ticks(5) as t}
					<g transform={`translate(0,${yScale(t)})`}>
						<line x2={width} stroke="#ccc" />
						<text x="-8" dy="0.32em" text-anchor="end" font-size="12" fill="#ffffff">{t}</text>
					</g>
				{/each}
				<text
					transform="rotate(-90)"
					y={-margin.left + 12}
					x={-height / 2}
					dy="-1em"
					text-anchor="middle"
					font-size="12"
				>
					K‑Index
				</text>
			</g>

			<!-- Line path (only if we have data) -->
			{#if recent.length}
				<path d={line(recent)} fill="none" stroke="#2563eb" stroke-width="2" />

				<!-- Points + hover overlay -->
				{#each recent as d}
					<circle
						role="img"
						aria-label={`Data point ${d.time}: ${d.value}`}
						cx={xScale(d.time)}
						cy={yScale(d.value)}
						r="4"
						fill={color(d.value)}
						stroke="#1e40af"
						stroke-width="1"
						on:mouseenter={() => show(d)}
						on:mouseleave={hide}
					/>
				{/each}
			{/if}
		</g>
	</svg>

	<div
		class="tooltip"
		style="
            left:{tipX}px;
            top:{tipY}px;
            opacity:{tipVisible ? 1 : 0};
        "
	>
		{@html tipHtml}
	</div>
</div>

<style>
	.chart-wrapper {
		position: relative;
		width: 100%;
		overflow: visible;
		height: 45vh;
		min-height: 250px;
	}

	.tooltip {
		position: absolute;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
		transition: opacity 0.15s ease;
		z-index: 10;
	}
</style>
