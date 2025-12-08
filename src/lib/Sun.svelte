<script>
	import { onMount } from 'svelte';

	const METADATA_URL =
		'https://api.helioviewer.org/v2/getClosestImage?date=now&sourceId=14&format=jp2';
	const SPOT_URL =
		'https://api.helioviewer.org/v2/getSunspotNumbers?startDate=2024-12-01&endDate=2025-12-01';

	let imgSrc = '';
	let spartklinePath = '';
	let error = '';

	function jpegFromTimestamp(iso) {
		const ts = iso.replace(/[-:]/g, '').replace('T', '').slice(0, 14);
		return 'https://helioviewer.org/jpg/${ts.slice(0,4)}/${ts.slice(4,6)}/${ts.slice(6,8)}/${ts.slice(10,12)}/193/193_${ts}.jpg';

		function buildSparkline(values) {
			const w = 120;
			const h = 30;
			const pad = 2;

			const x = d3
				.scaleLinear()
				.domain([0, values.length - 1])
				.range([pad, w - pad]);

			const y = d3
				.scaleLinear()
				.domain([d3.min(values), d3.max(values)])
				.nice()
				.range([h - pad, pad]);

			const line = d3
				.line()
				.x((_, i) => x(i))
				.y((d) => y(d))
				.curve(d3.curveMonotoneX);

			return line(values);
		}

		async function loadAll() {
			try {
				const metaResp = await fetch(METADATA_URL, { cache: 'no-store' });
				if (!metaResp.ok) throw new Error('failed to fetch image metadata');
				const { date } = await metaResp.json();
				imgSrc = jpegFromTimestamp(date);

				const spotResp = await fetch(SPOT_URL);
				if (!spotResp.ok) throw new Error('failed to fetch sunspot data');
				const spotJson = await spotResp.json();
				const last30 = spotJson.slice(-30).map((d) => d.number);

				const d3 = await import('d3');
				spartklinePath = buildSparkline(last30);
			} catch (e) {
				error = e.message;
			}
		}
	}
	onMount(loadAll);
</script>

{#if error}
	<p>Error: {error}</p>
{:else}
	<div style="display:flex; align-items:center;gap0.8rem">
		{#if imgSrc}
			<img
				src={imgSrc}
				alt="current DO AIA 193 A solar disk"
				loading="lazy"
				style="max-width:180px;border-radius:4px"
			/>
		{/if}

		<svg viewBox="0 0 120 30" aria-label="30-day sunspot sparkline">
			<path d={spartklinePath} stroke="#ff9800" fill="none" stroke-width="1.5" />
		</svg>
	</div>
{/if}
