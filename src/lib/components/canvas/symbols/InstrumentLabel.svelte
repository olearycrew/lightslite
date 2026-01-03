<script lang="ts">
	/**
	 * InstrumentLabel Component
	 *
	 * Displays information about an instrument (channel, unit number, color, purpose).
	 * Configurable what to show based on LabelConfig.
	 * Automatically positions to avoid overlaps with symbol.
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
		offsetY = 24,
		config,
		channel = null,
		unitNumber = null,
		color = null,
		purpose = null,
		dimmer = null,
		gobo = null
	}: Props = $props();

	// Build the label lines based on config
	const labelLines = $derived.by(() => {
		const lines: string[] = [];

		// Primary line: Channel / Unit Number
		const primaryParts: string[] = [];
		if (config.showChannel && channel !== null) {
			primaryParts.push(`${channel}`);
		}
		if (config.showUnitNumber && unitNumber !== null) {
			primaryParts.push(`(${unitNumber})`);
		}
		if (primaryParts.length > 0) {
			lines.push(primaryParts.join(' '));
		}

		// Secondary line: Color and Dimmer
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

		// Third line: Purpose
		if (config.showPurpose && purpose) {
			lines.push(purpose);
		}

		// Fourth line: Gobo
		if (config.showGobo && gobo) {
			lines.push(`gobo: ${gobo}`);
		}

		return lines;
	});

	// Check if we have anything to display
	const hasContent = $derived(labelLines.length > 0);

	// Font sizes that scale with zoom
	const primaryFontSize = $derived(11 / viewport.zoom);
	const secondaryFontSize = $derived(9 / viewport.zoom);
	const lineHeight = $derived(12 / viewport.zoom);

	// Background padding
	const paddingX = $derived(4 / viewport.zoom);
	const paddingY = $derived(2 / viewport.zoom);

	// Calculate background dimensions
	const backgroundWidth = $derived.by(() => {
		if (!hasContent) return 0;
		const maxLength = Math.max(...labelLines.map((line) => line.length));
		return (maxLength * 6) / viewport.zoom + paddingX * 2;
	});

	const backgroundHeight = $derived.by(() => {
		if (!hasContent) return 0;
		return labelLines.length * lineHeight + paddingY * 2;
	});

	// Position based on config.position preference
	const labelPosition = $derived.by(() => {
		let lx = x + offsetX;
		let ly = y + offsetY;

		// Adjust based on position preference
		switch (config.position) {
			case 'top':
				ly = y - offsetY;
				break;
			case 'bottom':
				ly = y + Math.abs(offsetY);
				break;
			case 'left':
				lx = x - Math.abs(offsetX) - backgroundWidth / 2;
				ly = y;
				break;
			case 'right':
				lx = x + Math.abs(offsetX) + backgroundWidth / 2;
				ly = y;
				break;
			case 'auto':
			default:
				// Default positioning (below the symbol)
				break;
		}

		return { x: lx, y: ly };
	});
</script>

{#if hasContent}
	<g class="instrument-label" transform="translate({labelPosition.x}, {labelPosition.y})">
		<!-- Background -->
		<rect
			class="label-background"
			x={-backgroundWidth / 2}
			y={-paddingY}
			width={backgroundWidth}
			height={backgroundHeight}
			rx={2 / viewport.zoom}
		/>

		<!-- Label text lines -->
		{#each labelLines as line, index (index)}
			<text
				class="label-text"
				class:primary={index === 0}
				class:secondary={index > 0}
				x={0}
				y={index * lineHeight + lineHeight / 2}
				text-anchor="middle"
				dominant-baseline="middle"
				font-size={index === 0 ? primaryFontSize : secondaryFontSize}
			>
				{line}
			</text>
		{/each}
	</g>
{/if}

<style>
	.label-background {
		fill: rgba(255, 255, 255, 0.95);
		stroke: rgba(0, 0, 0, 0.2);
		stroke-width: 0.5;
	}

	.label-text {
		font-family: system-ui, sans-serif;
		pointer-events: none;
		user-select: none;
	}

	.label-text.primary {
		fill: #333333;
		font-weight: 600;
	}

	.label-text.secondary {
		fill: #666666;
		font-weight: 400;
	}
</style>
