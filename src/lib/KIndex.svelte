<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];
	export let xDomainStart = null;
	export let xDomainEnd = null;
	export let currentReading = 0;
	let chartContainer;
	let tooltip;

	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const visibleR = 6;
	const hoverBuffer = 3;
	const maxPoints = 30;

	const color = d3.scaleLinear().domain([0, 5, 9]).range(['#a1d76a', '#e9a3c9', '#ff0000']);

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

	$: if (data?.length) {
		const parsed = data
			.slice(1)
			.map((row) => {
				if (Array.isArray(row)) return parseFloat(row[1]);
				return parseFloat(row.Kp ?? row.kp_index);
			})
			.filter((v) => !isNaN(v));
		if (parsed.length) {
			currentReading = parsed[parsed.length - 1];
		}
	}

	function drawChart() {
		const domainStart = xDomainStart ? new Date(xDomainStart) : null;
		const domainEnd = xDomainEnd ? new Date(xDomainEnd) : null;
		const hasFixedDomain =
			domainStart && domainEnd && !isNaN(domainStart.getTime()) && !isNaN(domainEnd.getTime());

		const recent = data
			.slice(1)
			.map((row) => {
				if (Array.isArray(row)) {
					return {
						time: new Date(row[0]),
						value: parseFloat(row[1])
					};
				}

				return {
					time: new Date(row.time_tag),
					value: parseFloat(row.Kp ?? row.kp_index)
				};
			})
			.filter((d) => !isNaN(d.value) && !isNaN(d.time.getTime()) && d.time <= new Date())
			.filter((d) => (hasFixedDomain ? d.time >= domainStart && d.time <= domainEnd : true))
			.sort((a, b) => b.time - a.time)
			.slice(0, maxPoints)
			.sort((a, b) => a.time - b.time);
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
			.domain(hasFixedDomain ? [domainStart, domainEnd] : d3.extent(recent, (d) => d.time))
			.range([0, innerW]);
		const y = d3.scaleLinear().domain([0, 9]).range([innerH, 0]);

		// X-axis with day-based ticks
		const xAxis = svg.append('g').attr('transform', `translate(0,${innerH})`);
		xAxis.call(d3.axisBottom(x).ticks(d3.timeDay).tickFormat(d3.timeFormat('%m/%d')));
		xAxis
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		// Y-axis
		svg.append('g').call(d3.axisLeft(y).ticks(10)).selectAll('text').style('font-size', '12px');
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

<div class="chart-container">
	<p class="chart-subtitle">
		8 daily readings in 3-hour intervals (<a
			href="https://www.swpc.noaa.gov/products/planetary-k-index"
			target="_blank">NOAA K-Index</a
		>)
	</p>
	<div class="chart-wrapper" bind:this={chartContainer}>
		<div class="tooltip" bind:this={tooltip}></div>
	</div>
</div>

<style>
	.chart-wrapper {
		position: relative;
		width: 100%;
		height: 45vh;
		min-height: 250px;
		overflow: visible; /* ADD THIS */
	}

	:global(.chart-svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	.chart-container {
		position: relative;
		width: 100%;
	}

	.chart-subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: #fba;
		font-weight: 400;
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
