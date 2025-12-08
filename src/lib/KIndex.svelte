<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	// -------------------------------------------------
	// Props & locals
	// -------------------------------------------------
	export let data = []; // raw NOAA JSON array
	let chartContainer; // bound to the wrapper <div>
	let tooltip; // bound to the tooltip <div>

	// -------------------------------------------------
	// Settings
	// -------------------------------------------------
	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const visibleR = 7; // radius of the visible dot
	const hoverBuffer = 3; // extra radius for the hover area
	const maxPoints = 24; // how many recent points to show

	const color = d3.scaleLinear().domain([0, 5, 9]).range(['#00ff00', '#ffff00', '#ff0000']);

	// -------------------------------------------------
	// Size tracking – updates whenever the wrapper resizes
	// -------------------------------------------------
	let containerW = 0;
	let containerH = 0;
	let ro; // ResizeObserver instance

	onMount(() => {
		ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				containerW = cr.width;
				containerH = cr.height;
			}
		});
		ro.observe(chartContainer);
		return () => ro.disconnect();
	});

	// -------------------------------------------------
	// Redraw when data arrives OR wrapper size changes
	// -------------------------------------------------
	$: if (data?.length && containerW && containerH) drawChart();

	// -------------------------------------------------
	// Draw / redraw the chart
	// -------------------------------------------------
	function drawChart() {
		// ---- 1️⃣ Prepare the most‑recent points (newest → oldest) ----
		const recent = data
			.map((d) => ({
				time: new Date(d.time_tag), // parse once
				value: +d.kp_index
			}))
			.filter((d) => d.time <= new Date()) // drop stray future dates
			.sort((a, b) => b.time - a.time) // newest first
			.slice(0, maxPoints); // keep freshest N

		// ---- 2️⃣ Inner drawing dimensions (subtract margins) ----
		const innerW = containerW - margin.left - margin.right;
		const innerH = containerH - margin.top - margin.bottom;

		// ---- 3️⃣ Remove any old SVG (important on updates) ----
		d3.select(chartContainer).selectAll('svg').remove();

		// ---- 4️⃣ Create responsive SVG with viewBox ----
		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('class', 'chart-svg')
			.attr(
				'viewBox',
				`0 0 ${innerW + margin.left + margin.right} ${innerH + margin.top + margin.bottom}`
			)
			.attr('preserveAspectRatio', 'xMidYMid meet')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// ---- 5️⃣ Scales ----
		const x = d3
			.scaleTime()
			.domain(d3.extent(recent, (d) => d.time))
			.range([0, innerW]);

		const y = d3
			.scaleLinear()
			.domain([0, 9]) // K‑index range is always 0‑9
			.nice()
			.range([innerH, 0]);

		// ---- 6️⃣ Axes ----
		svg
			.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y).ticks(5)).style('font-size', '12px');

		// Y‑axis label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -margin.left + 12)
			.attr('x', -innerH / 2)
			.attr('dy', '-1em')
			.style('text-anchor', 'middle')
			.text('K‑Index');

		// ---- 7️⃣ Line ----
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

		// ---- 8️⃣ Visible circles (purely cosmetic) ----
		svg
			.selectAll('.dot')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', visibleR)
			.attr('fill', (d) => color(d.value))
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		// ---- 9️⃣ Invisible overlay circles (hover buffer) ----
		const overlay = svg
			.selectAll('.overlay')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'overlay')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', visibleR + hoverBuffer) // 4 px + 3 px = 7 px total
			.style('fill', 'transparent')
			.style('pointer-events', 'all');

		// -------------------------------------------------
		// Overlay mouse events (K‑Index)
		// -------------------------------------------------
		overlay
			.on('mouseover', (_, d) => {
				// 1️⃣ Set tooltip content
				tooltip.innerHTML = `
      <strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
      K‑Index: <span style="color:${color(d.value)}">${d.value}</span>`;
				tooltip.style.opacity = 1; // make it visible so it gets a size

				// 2️⃣ Desired position (right of the point)
				const cx = x(d.time);
				const cy = y(d.value);
				let left = cx + margin.left + 8; // 8 px to the right of the point
				let top = cy + margin.top - 12; // 12 px above the point

				// 3️⃣ Get actual sizes (wrapper width & tooltip width)
				const wrapperW = chartContainer.clientWidth; // width of the .chart-wrapper
				const tipW = tooltip.getBoundingClientRect().width; // tooltip’s rendered width

				// 4️⃣ Flip horizontally if it would overflow the wrapper
				if (left + tipW > wrapperW) {
					// place it on the left side of the point, keep the same 8 px gap
					left = cx + margin.left - tipW - 8;
				}

				// 5️⃣ (Optional) keep it from going above the wrapper
				if (top < 0) {
					top = cy + margin.top + 8; // put it below the point instead
				}

				// 6️⃣ Apply the final coordinates (they are relative to the wrapper)
				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
			})
			.on('mousemove', () => (tooltip.style.opacity = 1))
			.on('mouseout', () => (tooltip.style.opacity = 0));
	}
</script>

<!-- Wrapper that holds BOTH the SVG and the tooltip.
     `position:relative` gives the tooltip a positioning context. -->
<div class="chart-wrapper" bind:this={chartContainer}>
	<div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
	.chart-wrapper {
		position: relative; /* essential – tooltip is positioned inside */
		width: 100%;
		height: 45vh; /* or any height you like */
		min-height: 250px; /* fallback for tiny screens */
	}

	/* SVG fills the wrapper (viewBox handles scaling) */
	:global(.chart-svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* Tooltip styling (unchanged) */
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
