<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];

	let chartContainer;
	let debugInfo = '';

	onMount(() => {
		console.log('Chart mounting...');
		console.log('Raw data received:', data);
		console.log('Data length:', data.length);

		if (data.length === 0) {
			debugInfo = 'No data received';
			return;
		}

		// Check what the first item looks like
		console.log('First data item:', data[0]);
		console.log('time_tag format:', data[0].time_tag);

		const margin = { top: 20, right: 20, bottom: 50, left: 50 };
		const width = 600 - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Try parsing the time - this is where it usually breaks
		const parseTime = (str) => new Date(str);

		// Take last 24 and prepare data
		const recentData = data.slice(-24).map((d) => {
			const parsedTime = parseTime(d.time_tag);
			console.log('Parsing:', d.time_tag, '→', parsedTime); // DEBUG LINE

			return {
				time: parsedTime,
				value: +d.kp_index,
				originalTime: d.time_tag // Keep original for debugging
			};
		});

		// Check if any times are null
		const nullTimes = recentData.filter((d) => d.time === null);
		if (nullTimes.length > 0) {
			debugInfo = `ERROR: ${nullTimes.length} dates failed to parse!`;
			console.error('Failed to parse these dates:', nullTimes);
			return;
		}

		console.log('Processed data:', recentData);

		// Set up scales
		const xExtent = d3.extent(recentData, (d) => d.time);
		console.log('X extent (time range):', xExtent);

		const x = d3.scaleTime().domain(xExtent).range([0, width]);

		const y = d3.scaleLinear().domain([0, 9]).range([height, 0]);

		// Test the scales
		console.log('First point maps to:', {
			x: x(recentData[0].time),
			y: y(recentData[0].value)
		});

		// Add axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

		// Y axis label
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

		// Add dots
		svg
			.selectAll('circle')
			.data(recentData)
			.enter()
			.append('circle')
			.attr('cx', (d) => {
				const xPos = x(d.time);
				console.log('Circle at time', d.time, '→ x =', xPos); // DEBUG
				return xPos;
			})
			.attr('cy', (d) => y(d.value))
			.attr('r', 4)
			.attr('fill', '#2563eb')
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		debugInfo = `Chart rendered with ${recentData.length} points`;
	});
</script>

<div>
	{#if debugInfo}
		<p style="color: red; font-weight: bold;">{debugInfo}</p>
	{/if}
	<div bind:this={chartContainer}></div>
</div>
