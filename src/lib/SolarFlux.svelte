<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];
	let chartContainer;
	let tooltip;

	const margin = { top: 20, right: 20, bottom: 50, left: 50 };
	const visibleR = 6;
	const hoverBuffer = 3;
	const maxPoints = 30;

	const color = d3.scaleLinear().domain([50, 100, 150]).range(['#ff0000', '#ffff00', '#00ff00']);

	let containerW = 0;
	let containerH = 0;

	// ResizeObserver – updates containerW/H whenever the wrapper resizes
	let ro;
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

	// Whenever data arrives **or** the wrapper size changes, redraw
	$: if (data?.length && containerW && containerH) drawChart();

	function drawChart() {
		const recent = data
			.map((d) => ({
				time: new Date(d.time_tag),
				flux: +d.flux
			}))
			.filter((d) => d.time <= new Date())
			.sort((a, b) => b.time - a.time)
			.slice(0, maxPoints);

		const innerW = containerW - margin.left - margin.right;
		const innerH = containerH - margin.top - margin.bottom;

		// ---- Remove any old SVG (important on updates) ----
		d3.select(chartContainer).selectAll('svg').remove();

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

		const x = d3
			.scaleTime()
			.domain(d3.extent(recent, (d) => d.time))
			.range([0, innerW]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(recent, (d) => d.flux) * 1.1])
			.range([innerH, 0]);

		svg
			.append('g')
			.attr('transform', `translate(0,${innerH})`)
			.call(d3.axisBottom(x).ticks(5))
			.selectAll('text')
			.style('font-size', '12px')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y).ticks(5)).style('font-size', '12px');

		const area = d3
			.area()
			.x((d) => x(d.time))
			.y0(innerH)
			.y1((d) => y(d.flux))
			.curve(d3.curveMonotoneX);

		svg.append('path').datum(recent).attr('fill', 'rgba(37,99,235,0.2)').attr('d', area);

		const line = d3
			.line()
			.x((d) => x(d.time))
			.y((d) => y(d.flux))
			.curve(d3.curveMonotoneX);

		svg
			.append('path')
			.datum(recent)
			.attr('fill', 'none')
			.attr('stroke', '#2563eb')
			.attr('stroke-width', 2)
			.attr('d', line);

		svg
			.selectAll('.dot')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.flux))
			.attr('r', visibleR)
			.attr('fill', '#2563eb')
			.attr('stroke', '#1e40af')
			.attr('stroke-width', 1);

		const overlay = svg
			.selectAll('.overlay')
			.data(recent)
			.enter()
			.append('circle')
			.attr('class', 'overlay')
			.attr('cx', (d) => x(d.time))
			.attr('cy', (d) => y(d.flux))
			.attr('r', visibleR + hoverBuffer) // 4 px + 3 px = 7 px total
			.style('fill', 'transparent')
			.style('pointer-events', 'all');

		overlay
			.on('mouseover', (_, d) => {
				tooltip.innerHTML = `
      <strong>${d3.timeFormat('%b %d %H:%M')(d.time)}</strong><br/>
      SFU: <span style="color:#2563eb">${d.flux.toFixed(1)}</span>`;
				tooltip.style.opacity = 1; // make it visible so we can measure it

				const cx = x(d.time);
				const cy = y(d.flux);
				let left = cx + margin.left + 8; // right‑side default
				let top = cy + margin.top - 12; // above the point

				const wrapperW = chartContainer.clientWidth;
				const tipW = tooltip.getBoundingClientRect().width;

				if (left + tipW > wrapperW) {
					left = cx + margin.left - tipW - 8; // flip to the left side
				}

				if (top < 0) {
					top = cy + margin.top + 8; // move below if too high
				}

				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
			})
			.on('mousemove', () => (tooltip.style.opacity = 1))
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
	}
</style>
