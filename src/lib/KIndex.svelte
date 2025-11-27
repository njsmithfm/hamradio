<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = []; // Array of {time, kp_index} objects

	let chartContainer;

	onMount(() => {
		if (data.length === 0) return;

		// Set up dimensions
		const margin = { top: 20, right: 20, bottom: 30, left: 40 };
		const width = 600 - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		// Create SVG
		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Parse time and prepare data (last 24 readings)
		const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
		const recentData = data.slice(-24).map((d) => ({
			time: parseTime(d.time_tag),
			value: +d.kp_index
		}));

		// Set up scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(recentData, (d) => d.time))
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, 9]) // K-index ranges 0-9
			.range([height, 0]);

		// Color scale (green = good, red = bad)
		const color = d3.scaleLinear().domain([0, 5, 9]).range(['#00ff00', '#ffff00', '#ff0000']);

		// Add X axis
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.style('font-size', '12px');

		// Add Y axis
		svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

		// Add Y axis label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text('K-Index');

		// Add the line
		const line = d3
			.line()
			.x((d) => x(d.time))
			.y((d) => y(d.value))
			.curve(d3.curveMonotoneX);

		svg
			.append('path')
			.datum(recentData)
			.attr('fill', 'none')
			.attr('stroke', '#2563eb')
			.attr('stroke-width', 2)
			.attr('d', line);

		// Add dots with color coding
		svg
			.selectAll('circle')
			.data(recentData)
			.enter()
			.append('circle')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', 4)
			.attr('fill', (d) => color(d.value))
			.attr('stroke', '#333')
			.attr('stroke-width', 1);

		// Add reference line at K=4 (when conditions start degrading)
		svg
			.append('line')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', y(4))
			.attr('y2', y(4))
			.attr('stroke', 'red')
			.attr('stroke-dasharray', '5,5')
			.attr('opacity', 0.5);

		svg
			.append('text')
			.attr('x', width - 5)
			.attr('y', y(4) - 5)
			.attr('text-anchor', 'end')
			.style('font-size', '11px')
			.style('fill', 'red')
			.text('Poor conditions threshold');
	});
</script>

<div bind:this={chartContainer}></div>

<style>
	div {
		margin: 1rem 0;
	}
</style>
