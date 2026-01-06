<script lang="ts">
	/**
	 * PositionProperties Component
	 *
	 * Properties panel for editing hanging positions (electrics, trusses, ladders, etc.).
	 */
	import {
		project,
		type HangingPositionObject,
		type HangingPositionType,
		type LabelPosition
	} from '$lib/stores/project.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { FormField, NumberInput, TextInput, SelectDropdown, CollapsibleSection } from '../forms';

	interface Props {
		position: HangingPositionObject;
	}

	let { position }: Props = $props();

	// Build options for position type dropdown
	const positionTypeOptions: Array<{ value: HangingPositionType; label: string }> = [
		{ value: 'electric', label: 'Electric' },
		{ value: 'truss', label: 'Truss' },
		{ value: 'ladder', label: 'Ladder' },
		{ value: 'boom', label: 'Boom' },
		{ value: 'box-boom', label: 'Box Boom' },
		{ value: 'ground-row', label: 'Ground Row' }
	];

	// Build options for label position dropdown
	const labelPositionOptions: Array<{ value: LabelPosition; label: string }> = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'above', label: 'Above' },
		{ value: 'below', label: 'Below' }
	];

	// Local state for notes (not stored in position object)
	let notes = $state<string | null>(null);

	// Get instruments on this position - use $derived to track position.id properly
	const instrumentsOnPosition = $derived(
		project.instruments.filter((i) => i.hangingPositionId === position.id)
	);

	// Update position when values change
	function updatePosition<K extends keyof HangingPositionObject>(
		key: K,
		value: HangingPositionObject[K]
	) {
		project.updateHangingPosition(position.id, { [key]: value });
	}

	// Handler functions to update store directly without $effect loops
	function handleNameChange(value: string | null) {
		if (value !== null) {
			updatePosition('name', value);
		}
	}

	function handlePositionTypeChange(value: HangingPositionType | null) {
		if (value !== null) {
			updatePosition('positionType', value);
		}
	}

	function handleTrimHeightChange(value: number | null) {
		updatePosition('trimHeight', value ?? undefined);
	}

	function handleHeightChange(value: number | null) {
		updatePosition('height', value ?? undefined);
	}

	function handleLabelOffsetXChange(value: number | null) {
		updatePosition('labelOffsetX', value ?? undefined);
	}

	function handleLabelOffsetYChange(value: number | null) {
		updatePosition('labelOffsetY', value ?? undefined);
	}

	function handleLabelPositionChange(value: LabelPosition | null) {
		if (value !== null) {
			updatePosition('labelPosition', value);
		}
	}

	/**
	 * Select an instrument on this position
	 */
	function selectInstrument(instrumentId: string) {
		selection.select(instrumentId, 'instrument');
	}

	/**
	 * Add a new instrument to this position
	 */
	function addInstrument() {
		const newInstrument = project.addInstrument(position.id, 0.5, 'ers-26');
		if (newInstrument) {
			selection.select(newInstrument.id, 'instrument');
		}
	}

	/**
	 * Delete this position
	 */
	function deletePosition() {
		selection.clearSelection();
		project.deleteHangingPosition(position.id);
	}
</script>

<div class="position-properties">
	<CollapsibleSection title="Position">
		<FormField label="Name">
			<TextInput value={position.name} onchange={handleNameChange} placeholder="Position name" />
		</FormField>

		<FormField label="Type">
			<SelectDropdown
				value={position.positionType}
				onchange={handlePositionTypeChange}
				options={positionTypeOptions}
				placeholder="Select type..."
			/>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Dimensions">
		{#if position.positionType === 'electric' || position.positionType === 'truss'}
			<FormField label="Trim Height">
				<NumberInput
					value={position.trimHeight ?? null}
					onchange={handleTrimHeightChange}
					placeholder="Height"
					unit="ft"
					min={0}
					step={0.5}
				/>
			</FormField>
		{/if}

		{#if position.positionType === 'boom' || position.positionType === 'box-boom'}
			<FormField label="Height">
				<NumberInput
					value={position.height ?? null}
					onchange={handleHeightChange}
					placeholder="Height"
					unit="ft"
					min={0}
					step={0.5}
				/>
			</FormField>
		{/if}
	</CollapsibleSection>

	<CollapsibleSection title="Label Position" defaultOpen={false}>
		<FormField label="Position">
			<SelectDropdown
				value={position.labelPosition ?? null}
				onchange={handleLabelPositionChange}
				options={labelPositionOptions}
				placeholder="Select position..."
			/>
		</FormField>

		<FormField label="X Offset">
			<NumberInput
				value={position.labelOffsetX ?? null}
				onchange={handleLabelOffsetXChange}
				placeholder="0"
				unit="px"
				step={1}
			/>
		</FormField>

		<FormField label="Y Offset">
			<NumberInput
				value={position.labelOffsetY ?? null}
				onchange={handleLabelOffsetYChange}
				placeholder="0"
				unit="px"
				step={1}
			/>
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Notes" defaultOpen={false}>
		<FormField label="Notes" layout="vertical">
			<TextInput bind:value={notes} placeholder="Position notes" multiline rows={3} />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Instruments ({instrumentsOnPosition.length})">
		{#if instrumentsOnPosition.length > 0}
			<div class="instrument-list">
				{#each instrumentsOnPosition as inst (inst.id)}
					<button class="instrument-item" type="button" onclick={() => selectInstrument(inst.id)}>
						<span class="inst-channel">
							{inst.channel ? `Ch ${inst.channel}` : 'No Ch'}
						</span>
						<span class="inst-type">{inst.instrumentType}</span>
						{#if inst.color}
							<span class="inst-color" style:background-color={inst.color}></span>
						{/if}
					</button>
				{/each}
			</div>
		{:else}
			<p class="no-instruments">No instruments on this position</p>
		{/if}

		<button type="button" class="add-instrument-btn" onclick={addInstrument}>
			<span>+</span> Add Instrument
		</button>
	</CollapsibleSection>

	<CollapsibleSection title="Actions" defaultOpen={false}>
		<button type="button" class="delete-btn" onclick={deletePosition}> Delete Position </button>
	</CollapsibleSection>
</div>

<style>
	.position-properties {
		display: flex;
		flex-direction: column;
	}

	.instrument-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.instrument-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
		color: var(--color-text-primary, #fff);
		font-size: 12px;
	}

	.instrument-item:hover {
		border-color: var(--color-accent, #4287f5);
		background: var(--color-bg-hover, rgba(255, 255, 255, 0.05));
	}

	.inst-channel {
		font-weight: 600;
		min-width: 50px;
	}

	.inst-type {
		color: var(--color-text-secondary, #999);
		flex: 1;
	}

	.inst-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.no-instruments {
		font-size: 12px;
		color: var(--color-text-muted, #666);
		margin: 0;
		padding: 8px 0;
	}

	.add-instrument-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 8px 12px;
		margin-top: 8px;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px dashed var(--color-border, #444);
		border-radius: 4px;
		color: var(--color-text-secondary, #999);
		font-size: 12px;
		cursor: pointer;
	}

	.add-instrument-btn:hover {
		border-color: var(--color-accent, #4287f5);
		color: var(--color-accent, #4287f5);
	}

	.delete-btn {
		width: 100%;
		padding: 8px 12px;
		background: rgba(255, 100, 100, 0.1);
		border: 1px solid rgba(255, 100, 100, 0.3);
		border-radius: 4px;
		color: #ff6464;
		font-size: 12px;
		cursor: pointer;
	}

	.delete-btn:hover {
		background: rgba(255, 100, 100, 0.2);
		border-color: rgba(255, 100, 100, 0.5);
	}
</style>
