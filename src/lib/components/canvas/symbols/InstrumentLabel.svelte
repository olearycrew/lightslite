<script lang="ts">
	/**
	 * InstrumentLabel Component
	 *
	 * Displays information about an instrument (channel, unit number, color, purpose).
	 * The channel number is shown in a circle below the instrument (industry standard).
	 * Other information is shown in a separate label area.
	 */
	import { viewport } from '$lib/stores/viewport.svelte';
	import type { LabelConfig } from '$lib/types/instrument';

	interface Props {
		/** World X position (center of instrument) */
		x: number;
		/** World Y position (center of instrument) */
		y: number;
		/** Offset from instrument center */
		offsetX?: number;
		offsetY?: number;
		/** Label configuration */
		config: LabelConfig;
		/** Channel number */
		channel?: number | null;
		/** Unit number */
		unitNumber?: number | null;
		/** Color/gel */
		color?: string | null;
		/** Purpose/focus area */
		purpose?: string | null;
		/** Dimmer/circuit info */
		dimmer?: number | string | null;
		/** Gobo info */
		gobo?: string | null;
	}

	let {
		x,
		y,
		offsetX = 0,
		offsetY = 28,
		config,
		channel = null,
		unitNumber = null,
		color = null,
		purpose = null,
		dimmer = null,
		gobo = null
	}: Props = $props();

	// Check if we should show the channel circle
	const showChannelCircle = $derived(config.showChannel && channel !== null);

	// Build the additional label lines based on config (excluding channel which gets the circle)
	const additionalLines = $derived.by(() => {
		const lines: string[] = [];

		// Unit number (if shown)
		if (config.showUnitNumber && unitNumber !== null) {
			lines.push(`#${unitNumber}`);
		}

		// Color and Dimmer
		const secondaryParts: string[] = [];
		if (config.showColor && color) {
			secondaryParts.push(color);
		}
		if (config.showDimmer && dimmer !== null) {
			secondaryParts.push(`D${dimmer}`);
		}
		if (secondaryParts.length > 0) {
			lines.push(secondaryParts.join(' / '));
		}

		// Purpose
		if (config.showPurpose && purpose) {
			lines.push(purpose);
		}

		// Gobo
		if (config.showGobo && gobo) {
			lines.push(`gobo: ${gobo}`);
		}

		return lines;
	});

	// Check if we have additional content to display
	const hasAdditionalContent = $derived(additionalLines.length > 0);

	// Circle radius for channel number
	const circleRadius = $derived(10 / viewport.zoom);

	// Font sizes that scale with zoom
	const channelFontSize = $derived(9 / viewport.zoom);
	const secondaryFontSize = $derived(8 / viewport.zoom);
	const lineHeight = $derived(10 / viewport.zoom);

	// Background padding for additional info
	const paddingX = $derived(3 / viewport.zoom);
	const paddingY = $derived(2 / viewport.zoom);

	// Calculate background dimensions for additional info
	const backgroundWidth = $derived.by(() => {
		if (!hasAdditionalContent) return 0;
		const maxLength = Math.max(...additionalLines.map((line) => line.length));
		return (maxLength * 5.5) / viewport.zoom + paddingX * 2;
	});

	const backgroundHeight = $derived.by(() => {
		if (!hasAdditionalContent) return 0;
		return additionalLines.length * lineHeight + paddingY * 2;
	});

	// Position based on config.position preference
	const channelCirclePosition = $derived.by(() => {
		let lx = x + offsetX;
		let ly = y;

		// Channel circle is usually below the instrument
		switch (config.position) {
			case 'top':
				ly = y + Math.abs(offsetY) + circleRadius;
				break;
			case 'bottom':
				ly = y - Math.abs(offsetY) - circleRadius;
				break;
			case 'left':
				lx = x - Math.abs(offsetX) - circleRadius * 2;
				break;
			case 'right':
				lx = x + Math.abs(offsetX) + circleRadius * 2;
				break;
			case 'auto':
			default:
				// Default: below the instrument
				ly = y - Math.abs(offsetY) - circleRadius;
				break;
		}

		return { x: lx, y: ly };
	});

	// Additional info appears below the channel circle
	const additionalInfoPosition = $derived.by(() => {
		return {
			x: channelCirclePosition.x,
			y: channelCirclePosition.y - circleRadius - lineHeight
		};
	});
</script>

<!-- Channel number in a circle (industry standard) -->
<!-- Note: scale(1, -1) counter-flips since the viewport Y axis is flipped -->
{#if showChannelCircle}
	<g
		class="channel-circle"
		transform="translate({channelCirclePosition.x}, {channelCirclePosition.y}) scale(1, -1)"
	>
		<!-- Circle background -->
		<circle class="channel-circle-bg" cx={0} cy={0} r={circleRadius} />

		<!-- Channel number text -->
		<text
			class="channel-text"
			x={0}
			y={1 / viewport.zoom}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size={channelFontSize}
		>
			{channel}
		</text>
	</g>
{/if}

<!-- Additional information (unit number, color, purpose, etc.) -->
{#if hasAdditionalContent}
	<g
		class="additional-info"
		transform="translate({additionalInfoPosition.x}, {additionalInfoPosition.y}) scale(1, -1)"
	>
		<!-- Background -->
		<rect
			class="info-background"
			x={-backgroundWidth / 2}
			y={-paddingY}
			width={backgroundWidth}
			height={backgroundHeight}
			rx={2 / viewport.zoom}
		/>

		<!-- Info text lines -->
		{#each additionalLines as line, index (index)}
			<text
				class="info-text"
				x={0}
				y={index * lineHeight + lineHeight / 2}
				text-anchor="middle"
				dominant-baseline="middle"
				font-size={secondaryFontSize}
			>
				{line}
			</text>
		{/each}
	</g>
{/if}

<style>
	.channel-circle-bg {
		fill: #ffffff;
		stroke: #000000;
		stroke-width: 1;
	}

	.channel-text {
		font-family: system-ui, sans-serif;
		font-weight: 600;
		fill: #000000;
		pointer-events: none;
		user-select: none;
	}

	.info-background {
		fill: rgba(255, 255, 255, 0.9);
		stroke: rgba(0, 0, 0, 0.15);
		stroke-width: 0.5;
	}

	.info-text {
		font-family: system-ui, sans-serif;
		fill: #444444;
		font-weight: 400;
		pointer-events: none;
		user-select: none;
	}
</style>
