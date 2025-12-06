<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = []; // raw NOAA JSON array

	let chartContainer;
	let tooltip;

	const colour = d3.scaleLinear().domain([0, 5, 9]).range(['#00ff00', '#ffff00', '#ff0000']);

	onMount(() => {
		const margin = { top: 20, right: 20, bottom: 50, left: 50 };
		const width = 600 - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		// Take the last 24 points and turn them into usable objects
		const recent = data.slice(-24).map((d) => ({ time: new Date(d.time_tag), value: +d.kp_index }));

		const x = d3
			.scaleTime()
			.domain(d3.extent(recent, (d) => d.time))
			.range([0, width]);

		const y = d3.scaleLinear().domain([0, 9]).nice().range([height, 0]);

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y).ticks(5)).style('font-size', '12px');

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -margin.left + 12)
			.attr('x', -height / 2)
			.attr('dy', '-1em')
			.style('text-anchor', 'middle')
			.text('K‑Index');

		// Line
		const line = d3
			.line()
			.x((d) => x(d.time))
			.y((d) => y(d.value))
			.curve(d3.curveMonotoneX);

		svg
			.append('path')
			.datum(recent)
			.attr('fill', 'none')
			.attr('stroke', '#2563eb')
			.attr('stroke-width', 2)
			.attr('d', line);

		// Visible circles
		svg
			.selectAll('.dot')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', 4)
			.attr('fill', (d) => colour(d.value))
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		// Invisible overlay circles (3 px extra radius)
		const overlay = svg
			.selectAll('.overlay')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'overlay')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', 7) // 4 px + 3 px buffer
			.style('fill', 'transparent')
			.style('pointer-events', 'all');

		// Tooltip – snap to circle
		overlay
			.on('mouseover', (_, d) => {
				tooltip.innerHTML = `
          <strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
          K‑Index: <span style="color:${colour(d.value)}">${d.value}</span>`;
				tooltip.style.opacity = 1;

				const cx = x(d.time);
				const cy = y(d.value);
				tooltip.style.left = `${cx + margin.left + 8}px`;
				tooltip.style.top = `${cy + margin.top - 12}px`;
			})
			.on('mousemove', () => (tooltip.style.opacity = 1))
			.on('mouseout', () => (tooltip.style.opacity = 0));
	});
</script>

<div style="position:relative;">
	<div bind:this={chartContainer}></div>
	<div class="tooltip" bind:this={tooltip}></div>
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
		opacity: 0;
		transition: opacity 0.15s ease;
		z-index: 10;
	}
</style>
