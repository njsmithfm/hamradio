<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	export let data = [];

	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const width = 600 - margin.left - margin.right;
	const height = 300 - margin.top - margin.bottom;

	const x = d3.scaleTime().range([0, width]);
	const y = d3.scaleLinear().domain([0, 400]).nice().range([height, 0]);

	const color = d3.scaleLinear().domain([0, 200, 400]).range(['#00ff00', '#ffff00', '#ff0000']);

	const line = d3
		.line()
		.x((d) => x(d.time))
		.y((d) => y(d.value))
		.curve(d3.curveMonotoneX);

	let recent = [];
	$: recent = data.slice(-24).map((d) => ({
		time: new Date(d.time_tag),
		value: +d.a_index
	}));
	$: x.domain(d3.extent(recent, (d) => d.time));

	let tipVisible = false,
		tipX = 0,
		tipY = 0,
		tipHtml = '';
	function show(d) {
		tipHtml = `<strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong>
        <br/>A-Index: <span style="color:${color(d.value)}">${d.value} nT</span>`;
		tipX = x(d.time) + margin.left + 8;
		tipY = y(d.value) + margin.top - 12;
		tipVisible = true;
	}
	function hide() {
		tipVisible = false;
	}
</script>

<svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
	<g transform="translate({margin.left},{margin.top})">
		<!-- x-axis -->
		<g transform="translate(0,{height})">
			{#each x.ticks(6) as t}
				<g transform="translate({x(t)}, 0)">
					<line y2={height} stroke="#ccc" />
					<text y="15" text-anchor="middle" font-size="12"
						>{t}
						{d3.timeFormat('%b %d')(t)}</text
					>
				</g>
			{/each}
		</g>

		<g>
			{#each y.ticks(5) as t}
				<g transform="translate(0,{y(t)})">
					<line x2={width} stroke="#ccc" />
					<text x="-8" dy="0.32em" text-anchor="end" font-size="12">{t}</text>
				</g>
			{/each}
			<text
				transform="rotate(-90)"
				y={-margin.left + 12}
				x={-height / 2}
				dy="-1em"
				text-anchor="middle"
				font-size="12">A-Index (nT)</text
			>
		</g>

		<!-- line -->
		<path d={line(recent)} fill="none" stroke="#2563eb" stroke-width="2" />

		<!-- points with hover -->
		{#each recent as d}
			<circle
				role="img"
				aria-label={`Data point ${d.time}: ${d.value}`}
				cx={x(d.time)}
				cy={y(d.value)}
				r="4"
				fill={color(d.value)}
				stroke="#1e40af"
				stroke-width="1"
				on:mouseenter={() => show(d)}
				on:mouseleave={hide}
			/>
		{/each}
	</g>
</svg>

<div class="tooltip" style="left:{tipX}px; top:{tipY}px; opacity:{tipVisible ? 1 : 0};">
	{@html tipHtml}
</div>

<style>
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;

		transition: opacity 0.15s ease;
	}
</style>
