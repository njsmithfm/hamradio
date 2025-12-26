<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];
	let chartContainer;
	let tooltip;

	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const visibleR = 4;
	const hoverBuffer = 3;

	const color = d3.scaleLinear().domain([0, 5, 9]).range(['#00ff00', '#ffff00', '#ff0000']);

	let containerW = 0;
	let containerH = 0;

	let ro;
	onMount(() => {
		ro = new ResizeObserver((entries) => {
			const cr = entries[0].contentRect;
			containerW = cr.width;
			containerH = cr.height;
		});
		ro.observe(chartContainer);
		return () => ro.disconnect();
	});

	$: if (data?.length && containerW && containerH) drawChart();

	function drawChart() {
		// Parse CSV-style data (skip header row)
		const recent = data
			.slice(1)
			.map((row) => ({
				time: new Date(row[0]),
				value: +row[1]
			}))
			.filter((d) => !isNaN(d.value));

		if (!recent.length) return;

		const innerW = containerW - margin.left - margin.right;
		const innerH = containerH - margin.top - margin.bottom;

		d3.select(chartContainer).selectAll('svg').remove();

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('class', 'chart-svg')
			.attr('viewBox', `0 0 ${containerW} ${containerH}`)
			.attr('preserveAspectRatio', 'xMidYMid meet')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const x = d3
			.scaleTime()
			.domain(d3.extent(recent, (d) => d.time))
			.range([0, innerW]);
		const y = d3.scaleLinear().domain([0, 9]).range([innerH, 0]);

		// X-axis
		svg
			.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat('%m/%d %H:%M')))
			.selectAll('text')
			.style('font-size', '10px')
			.style('fill', '#ffffff')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		// Y-axis
		svg
			.append('g')
			.call(d3.axisLeft(y).ticks(10))
			.selectAll('text')
			.style('font-size', '12px')
			.style('fill', '#ffffff');
		// Area fill
		const area = d3
			.area()
			.x((d) => x(d.time))
			.y0(innerH)
			.y1((d) => y(d.value))
			.curve(d3.curveMonotoneX);

		svg.append('path').datum(recent).attr('fill', 'rgba(37,99,235,0.2)').attr('d', area);

		// Line (existing code)
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
		// Data points
		svg
			.selectAll('.dot')
			.data(recent)
			.enter()
			.append('circle')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', visibleR)
			.attr('fill', (d) => color(d.value))
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		// Hover overlays
		svg
			.selectAll('.overlay')
			.data(recent)
			.enter()
			.append('circle')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.value))
			.attr('r', visibleR + hoverBuffer)
			.style('fill', 'transparent')
			.style('pointer-events', 'all')
			.on('mouseover', (_, d) => {
				tooltip.innerHTML = `
					<strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
					K‑Index: <span style="color:${color(d.value)}">${d.value}</span>`;

				const cx = x(d.time);
				const cy = y(d.value);
				let left = cx + margin.left + 8;
				let top = cy + margin.top - 12;

				const tipW = tooltip.getBoundingClientRect().width;
				if (left + tipW > containerW) left = cx + margin.left - tipW - 8;
				if (top < 0) top = cy + margin.top + 8;

				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
				tooltip.style.opacity = 1;
			})
			.on('mouseout', () => (tooltip.style.opacity = 0));
	}
</script>

<div class="chart-wrapper" bind:this={chartContainer}>
	<div class="tooltip" bind:this={tooltip}></div>
</div>

<style>
	.chart-wrapper {
		position: relative;
		width: 100%;
		height: 45vh;
		min-height: 250px;
	}

	:global(.chart-svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

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
		white-space: nowrap;
	}
</style>
