<script lang="ts">
	/**
	 * InstrumentsLayer Component
	 *
	 * Renders all instruments from the project store.
	 * Groups instruments by hanging position for organization.
	 * Handles selection, hover states, and drag operations.
	 */
	import { SvelteMap } from 'svelte/reactivity';
	import { project } from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import SelectableObject from '../SelectableObject.svelte';
	import { InstrumentSymbol, InstrumentLabel } from '../symbols';
	import { getSymbol, getSymbolBounds } from '$lib/symbols';
	import type { InstrumentType } from '$lib/types/instrument';

	// Local hover tracking
	let hoveredId = $state<string | null>(null);

	/**
	 * Calculate instrument position based on its hanging position
	 * Instruments are positioned along the hanging position line
	 */
	function getInstrumentWorldPosition(
		hangingPositionId: string,
		positionOnBar: number
	): { x: number; y: number } | null {
		const hp = project.hangingPositions.find((p) => p.id === hangingPositionId);
		if (!hp) return null;

		// Interpolate position along the hanging position line
		const x = hp.x1 + (hp.x2 - hp.x1) * positionOnBar;
		const y = hp.y1 + (hp.y2 - hp.y1) * positionOnBar;

		return { x, y };
	}

	/**
	 * Handle drag for an instrument
	 * Instruments move along their hanging position when dragged horizontally
	 */
	function handleDrag(instrumentId: string, deltaX: number, deltaY: number) {
		const instrument = project.instruments.find((i) => i.id === instrumentId);
		if (!instrument || !instrument.hangingPositionId) return;

		const hp = project.hangingPositions.find((p) => p.id === instrument.hangingPositionId);
		if (!hp) return;

		// Calculate the length of the hanging position
		const dx = hp.x2 - hp.x1;
		const dy = hp.y2 - hp.y1;
		const length = Math.sqrt(dx * dx + dy * dy);
		if (length === 0) return;

		// Calculate how much the position should change based on drag
		// Project the drag vector onto the hanging position direction
		const dirX = dx / length;
		const dirY = dy / length;
		const projectedDelta = (deltaX * dirX + deltaY * dirY) / length;

		// Update the position on bar (clamped to 0-1)
		const newPosition = Math.max(0, Math.min(1, instrument.positionOnBar + projectedDelta));
		project.updateInstrument(instrumentId, { positionOnBar: newPosition });
	}

	/**
	 * Get instrument bounds for SelectableObject
	 */
	function getInstrumentBounds(
		type: string,
		x: number,
		y: number,
		rotation: number
	): { x: number; y: number; width: number; height: number } {
		const symbol = getSymbol(type);
		return getSymbolBounds(symbol, x, y, rotation, 1);
	}

	// Group instruments by hanging position for rendering
	const instrumentsByPosition = $derived.by(() => {
		const grouped = new SvelteMap<string | null, typeof project.instruments>();

		for (const instrument of project.instruments) {
			const key = instrument.hangingPositionId;
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(instrument);
		}

		return grouped;
	});

	// Instruments without a hanging position (free-floating)
	const freeInstruments = $derived(instrumentsByPosition.get(null) ?? []);

	// Hanging positions that have instruments
	const positionsWithInstruments = $derived(
		project.hangingPositions.filter((hp) => instrumentsByPosition.has(hp.id))
	);
</script>

<g class="instruments-layer">
	<!-- Render instruments grouped by hanging position -->
	{#each positionsWithInstruments as position (position.id)}
		{@const positionInstruments = instrumentsByPosition.get(position.id) ?? []}
		<g class="position-instruments" data-position-id={position.id}>
			{#each positionInstruments as instrument (instrument.id)}
				{@const worldPos = getInstrumentWorldPosition(
					instrument.hangingPositionId!,
					instrument.positionOnBar
				)}
				{#if worldPos && instrument.visible}
					{@const bounds = getInstrumentBounds(
						instrument.instrumentType,
						worldPos.x,
						worldPos.y,
						instrument.rotation
					)}
					<SelectableObject
						id={instrument.id}
						type="instrument"
						x={bounds.x}
						y={bounds.y}
						width={bounds.width}
						height={bounds.height}
						locked={instrument.locked}
						visible={instrument.visible}
						ondrag={(dx, dy) => handleDrag(instrument.id, dx, dy)}
					>
						<InstrumentSymbol
							type={instrument.instrumentType as InstrumentType}
							x={worldPos.x}
							y={worldPos.y}
							rotation={instrument.rotation}
							fill={instrument.color ? undefined : undefined}
							isSelected={selection.isSelected(instrument.id)}
							isHovered={hoveredId === instrument.id}
							channelLabel={instrument.channel}
						/>

						<!-- Render label if instrument has metadata -->
						{#if instrument.channel || instrument.color || instrument.focus}
							<InstrumentLabel
								x={worldPos.x}
								y={worldPos.y}
								offsetY={getSymbol(instrument.instrumentType).labelOffset.y}
								config={{
									showChannel: true,
									showUnitNumber: false,
									showColor: !!instrument.color,
									showPurpose: !!instrument.focus,
									showDimmer: !!instrument.dimmer,
									showGobo: false,
									position: 'auto'
								}}
								channel={instrument.channel}
								color={instrument.color}
								purpose={instrument.focus}
								dimmer={instrument.dimmer}
							/>
						{/if}
					</SelectableObject>
				{/if}
			{/each}
		</g>
	{/each}

	<!-- Render free-floating instruments (not attached to a hanging position) -->
	<g class="free-instruments">
		{#each freeInstruments as instrument (instrument.id)}
			{#if instrument.visible}
				<!-- Free instruments would need their own position storage -->
				<!-- For now, we skip them as they require extended data model -->
			{/if}
		{/each}
	</g>
</g>

<style>
	.instruments-layer {
		pointer-events: none;
	}

	.instruments-layer :global(.selectable-object) {
		pointer-events: auto;
	}
</style>
