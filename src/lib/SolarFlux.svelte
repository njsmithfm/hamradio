<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];

	let chartContainer;

	onMount(() => {
		if (data.length === 0) return;

		const margin = { top: 20, right: 20, bottom: 30, left: 50 };
		const width = 600 - margin.left - margin.right;
		const height = 250 - margin.top - margin.bottom;

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Parse and prepare data (last 30 days)
		const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
		const recentData = data.slice(-30).map((d) => ({
			time: parseTime(d.time_tag),
			flux: +d.flux
		}));

		// Scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(recentData, (d) => d.time))
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(recentData, (d) => d.flux) * 1.1])
			.range([height, 0]);

		// Axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(5))
			.style('font-size', '12px');

		svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text('Solar Flux (SFU)');

		// Area under the line
		const area = d3
			.area()
			.x((d) => x(d.time))
			.y0(height)
			.y1((d) => y(d.flux))
			.curve(d3.curveMonotoneX);

		svg.append('path').datum(recentData).attr('fill', 'rgba(37, 99, 235, 0.2)').attr('d', area);

		// Line
		const line = d3
			.line()
			.x((d) => x(d.time))
			.y((d) => y(d.flux))
			.curve(d3.curveMonotoneX);

		svg
			.append('path')
			.datum(recentData)
			.attr('fill', 'none')
			.attr('stroke', '#2563eb')
			.attr('stroke-width', 2)
			.attr('d', line);

		// Reference lines for band conditions
		// 70+ = Good, 150+ = Excellent
		svg
			.append('line')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', y(150))
			.attr('y2', y(150))
			.attr('stroke', 'green')
			.attr('stroke-dasharray', '5,5')
			.attr('opacity', 0.5);

		svg
			.append('text')
			.attr('x', width - 5)
			.attr('y', y(150) - 5)
			.attr('text-anchor', 'end')
			.style('font-size', '11px')
			.style('fill', 'green')
			.text('Excellent (150+)');
	});
</script>

<div bind:this={chartContainer}></div>
