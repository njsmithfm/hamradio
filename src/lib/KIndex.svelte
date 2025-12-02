<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	/** --------------------------------------------------------------
	 *  INPUT
	 * -------------------------------------------------------------- */
	export let data = []; // raw NOAA JSON array

	/** --------------------------------------------------------------
	 *  DOM references
	 * -------------------------------------------------------------- */
	let chartContainer; // <div bind:this={chartContainer}>
	let tooltip; // <div class="tooltip" bind:this={tooltip}>
	let debugInfo = '';

	/** --------------------------------------------------------------
	 *  Colour scale – **must be defined before we draw anything**
	 * -------------------------------------------------------------- */
	const color = d3
		.scaleLinear()
		.domain([0, 5, 9]) // low → medium → high K‑index
		.range(['#00ff00', '#ffff00', '#ff0000']); // green → yellow → red

	/** --------------------------------------------------------------
	 *  Mount & draw
	 * -------------------------------------------------------------- */
	onMount(() => {
		console.log('Chart mounting...');
		console.log('Raw data received:', data);
		console.log('Data length:', data.length);

		if (!data?.length) {
			debugInfo = 'No data received';
			return;
		}

		// -----------------------------------------------------------------
		// Basic sanity checks (helpful while you develop)
		// -----------------------------------------------------------------
		console.log('First data item:', data[0]);
		console.log('time_tag format:', data[0].time_tag);

		// -----------------------------------------------------------------
		// Layout
		// -----------------------------------------------------------------
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

		// -----------------------------------------------------------------
		// Parse dates – using native Date (works for the ISO‑like strings we get)
		// -----------------------------------------------------------------
		const parseTime = (str) => new Date(str);

		// -----------------------------------------------------------------
		// Prepare the last 24 points (or fewer if the dataset is short)
		// -----------------------------------------------------------------
		const recentData = data.slice(-24).map((d) => {
			const parsed = parseTime(d.time_tag);
			console.log('Parsing:', d.time_tag, '→', parsed); // DEBUG
			return {
				time: parsed,
				value: +d.kp_index,
				originalTime: d.time_tag // keep for debugging if needed
			};
		});

		// -----------------------------------------------------------------
		// Guard against failed parses (null dates)
		// -----------------------------------------------------------------
		const nullTimes = recentData.filter((d) => d.time === null);
		if (nullTimes.length) {
			debugInfo = `ERROR: ${nullTimes.length} dates failed to parse!`;
			console.error('Failed to parse these dates:', nullTimes);
			return;
		}

		console.log('Processed data:', recentData);

		// -----------------------------------------------------------------
		// Scales
		// -----------------------------------------------------------------
		const xExtent = d3.extent(recentData, (d) => d.time);
		console.log('X extent (time range):', xExtent);

		const x = d3.scaleTime().domain(xExtent).range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, 9]) // K‑index range
			.nice()
			.range([height, 0]);

		// -----------------------------------------------------------------
		// Axes
		// -----------------------------------------------------------------
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

		// Y‑axis label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text('K‑Index');

		// -----------------------------------------------------------------
		// Line (trend)
		// -----------------------------------------------------------------
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

		// -----------------------------------------------------------------
		// Circles – **use the colour scale for the fill**
		// -----------------------------------------------------------------
		const circles = svg
			.selectAll('circle')
			.data(recentData)
			.enter()
			.append('circle')
			.attr('cx', (d) => {
				const xPos = x(d.time);
				console.log('Circle at time', d.time, '→ x =', xPos); // debug
				return xPos;
			})
			.attr('cy', (d) => y(d.value))
			.attr('r', 4)
			.attr('fill', (d) => color(d.value)) // <-- colour scale
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		// -----------------------------------------------------------------
		// Tooltip handling
		// -----------------------------------------------------------------
		circles
			.on('mouseover', (event, d) => {
				const html = `
			<strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
			K‑Index: <span style="color:${color(d.value)}">${d.value}</span>
		  `;
				tooltip.innerHTML = html;
				tooltip.style.opacity = 1; // fade‑in
			})
			.on('mousemove', (event) => {
				// Keep tooltip inside the viewport
				const { innerWidth, innerHeight } = window;
				const rect = tooltip.getBoundingClientRect();

				let left = event.pageX + 10;
				let top = event.pageY - 28;

				if (left + rect.width > innerWidth) left = event.pageX - rect.width - 10;
				if (top + rect.height > innerHeight) top = event.pageY - rect.height - 10;

				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
			})
			.on('mouseout', () => {
				tooltip.style.opacity = 0; // fade‑out
			});
	});
</script>

<div>
	<!-- D3 will inject the SVG here -->
	<div bind:this={chartContainer}></div>
</div>

<!-- Tooltip element (styled below) -->
<div class="tooltip" bind:this={tooltip}></div>

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
