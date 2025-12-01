<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];

	let chartContainer;
	let debugInfo = '';
	let tooltip;

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

		//

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
		const circles = svg
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

		circles
			.on('mouseover', (event, d) => {
				// Populate tooltip HTML – customize to your needs
				const html = `
        
        K‑Index: <span >${d.value}</span>
      `;
				tooltip.innerHTML = html;
				tooltip.style.opacity = 1; // fade‑in
			})
			.on('mousemove', (event) => {
				// `event.pageX/Y` are relative to the whole page
				const [xPos, yPos] = [event.pageX, event.pageY];
				tooltip.style.left = `${xPos + 10}px`; // offset a few px so cursor isn’t on top
				tooltip.style.top = `${yPos - 28}px`;
			})
			.on('mouseout', () => {
				tooltip.style.opacity = 0; // fade‑out
			});

		debugInfo = `Chart rendered with ${recentData.length} points`;
	});
</script>

<div>
	{#if debugInfo}
		<p style="color: red; font-weight: bold;">{debugInfo}</p>
	{/if}
	<div bind:this={chartContainer}></div>
</div>

<!-- tooltip -->
<div class="tooltip" bind:this={tooltip}></div>

<div bind:this={chartContainer}></div>

<style>
	.tooltip {
		position: absolute;
		pointer-events: none; /* mouse events pass through */
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
		opacity: 0; /* start hidden */
		transition: opacity 0.15s ease;
		z-index: 10;
	}
</style>
