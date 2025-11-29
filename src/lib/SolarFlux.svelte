<!-- src/lib/SolarFluxChart.svelte -->
<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];

	let chartContainer;
	let debugInfo = '';

	onMount(() => {
		console.log('=== SOLAR FLUX CHART DEBUG ===');
		console.log('Raw data received:', data);
		console.log('Data length:', data.length);

		if (data.length === 0) {
			debugInfo = 'No data received';
			return;
		}

		// Check what the data looks like
		console.log('First item:', data[0]);
		console.log('Last item:', data[data.length - 1]);

		// Check what fields exist
		console.log('Available fields:', Object.keys(data[0]));

		const margin = { top: 20, right: 20, bottom: 50, left: 50 };
		const width = 600 - margin.left - margin.right;
		const height = 250 - margin.top - margin.bottom;

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Parse time - CHECK THE FORMAT
		const parseTime = (str) => new Date(str);

		// Get last 30 days and prepare
		const recentData = data.slice(-30).map((d) => {
			const parsedTime = parseTime(d.time_tag);
			console.log('Parsing:', d.time_tag, '→', parsedTime);

			return {
				time: parsedTime,
				flux: +d.flux,
				originalTime: d.time_tag
			};
		});

		// Check for parsing failures
		const nullTimes = recentData.filter((d) => d.time === null);
		const invalidFlux = recentData.filter((d) => isNaN(d.flux));

		if (nullTimes.length > 0) {
			debugInfo = `ERROR: ${nullTimes.length} dates failed to parse`;
			console.error('Failed dates:', nullTimes);
			return;
		}

		if (invalidFlux.length > 0) {
			debugInfo = `ERROR: ${invalidFlux.length} flux values are not numbers`;
			console.error('Invalid flux:', invalidFlux);
			return;
		}

		console.log('Processed data (first 3):', recentData.slice(0, 3));

		// Scales
		const xExtent = d3.extent(recentData, (d) => d.time);
		const yExtent = d3.extent(recentData, (d) => d.flux);

		console.log('X extent (time):', xExtent);
		console.log('Y extent (flux):', yExtent);

		const x = d3.scaleTime().domain(xExtent).range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(recentData, (d) => d.flux) * 1.1])
			.range([height, 0]);

		// Test scale output
		console.log('First point maps to:', {
			x: x(recentData[0].time),
			y: y(recentData[0].flux),
			flux: recentData[0].flux
		});

		// Axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(5))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text('Solar Flux (SFU)');

		// Area
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
			.x((d) => {
				const xPos = x(d.time);
				return xPos;
			})
			.y((d) => {
				const yPos = y(d.flux);
				return yPos;
			})
			.curve(d3.curveMonotoneX);

		svg
			.append('path')
			.datum(recentData)
			.attr('fill', 'none')
			.attr('stroke', '#2563eb')
			.attr('stroke-width', 2)
			.attr('d', line);

		debugInfo = `Chart rendered with ${recentData.length} points. Flux range: ${yExtent[0].toFixed(1)} - ${yExtent[1].toFixed(1)}`;
	});
</script>

<div>
	{#if debugInfo}
		<p style="padding: 0.5rem; background: #fef3c7; border-left: 4px solid #f59e0b;">
			{debugInfo}
		</p>
	{/if}
	<div bind:this={chartContainer}></div>
</div>
