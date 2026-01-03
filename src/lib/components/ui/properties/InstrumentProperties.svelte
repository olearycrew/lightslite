<script lang="ts">
	/**
	 * InstrumentProperties Component
	 *
	 * Properties panel for editing lighting instruments.
	 * Shows all editable fields for a selected instrument.
	 */
	import { project, type InstrumentObject } from '$lib/stores/project.svelte';
	import {
		FormField,
		NumberInput,
		TextInput,
		SelectDropdown,
		ColorInput,
		Checkbox,
		Slider,
		CollapsibleSection
	} from '../forms';
	import { INSTRUMENT_TYPE_NAMES, type InstrumentType } from '$lib/types/instrument';

	interface Props {
		instrument: InstrumentObject;
	}

	let { instrument }: Props = $props();

	// Build options for instrument type dropdown
	const instrumentTypeOptions = Object.entries(INSTRUMENT_TYPE_NAMES).map(([value, label]) => ({
		value: value as InstrumentType,
		label
	}));

	// Local state for editing
	let instrumentType = $state(instrument.instrumentType as InstrumentType);
	let channel = $state(instrument.channel ?? null);
	let dimmer = $state(instrument.dimmer ?? null);
	let color = $state(instrument.color ?? null);
	let focus = $state(instrument.focus ?? null);
	let rotation = $state(instrument.rotation);
	let name = $state(instrument.name);

	// Additional fields not in InstrumentObject but from Instrument type
	let circuit = $state<string | null>(null);
	let universe = $state<number | null>(null);
	let address = $state<number | null>(null);
	let gobo = $state<string | null>(null);
	let accessory = $state<string | null>(null);
	let unitNumber = $state<number | null>(null);
	let purpose = $state<string | null>(null);
	let notes = $state<string | null>(null);

	// Label display options
	let showChannel = $state(true);
	let showUnitNumber = $state(false);
	let showColor = $state(false);
	let showPurpose = $state(false);
	let showDimmer = $state(false);
	let showGobo = $state(false);

	// Update instrument when values change
	function updateInstrument<K extends keyof InstrumentObject>(key: K, value: InstrumentObject[K]) {
		project.updateInstrument(instrument.id, { [key]: value });
	}

	// Watchers to update store when local state changes
	$effect(() => {
		if (instrumentType !== instrument.instrumentType) {
			updateInstrument('instrumentType', instrumentType);
		}
	});

	$effect(() => {
		if (channel !== instrument.channel) {
			updateInstrument('channel', channel ?? undefined);
		}
	});

	$effect(() => {
		if (dimmer !== instrument.dimmer) {
			updateInstrument('dimmer', dimmer ?? undefined);
		}
	});

	$effect(() => {
		if (color !== instrument.color) {
			updateInstrument('color', color ?? undefined);
		}
	});

	$effect(() => {
		if (focus !== instrument.focus) {
			updateInstrument('focus', focus ?? undefined);
		}
	});

	$effect(() => {
		if (rotation !== instrument.rotation) {
			updateInstrument('rotation', rotation);
		}
	});

	$effect(() => {
		if (name !== instrument.name) {
			updateInstrument('name', name);
		}
	});
</script>

<div class="instrument-properties">
	<CollapsibleSection title="Instrument">
		<FormField label="Type">
			<SelectDropdown
				bind:value={instrumentType}
				options={instrumentTypeOptions}
				placeholder="Select type..."
			/>
		</FormField>

		<FormField label="Name">
			<TextInput bind:value={name} placeholder="Instrument name" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Control">
		<FormField label="Channel">
			<NumberInput bind:value={channel} placeholder="Ch #" min={1} max={9999} />
		</FormField>

		<FormField label="Dimmer">
			<NumberInput bind:value={dimmer} placeholder="Dim #" min={1} />
		</FormField>

		<FormField label="Circuit">
			<TextInput bind:value={circuit} placeholder="Circuit #" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="DMX" defaultOpen={false}>
		<FormField label="Universe">
			<NumberInput bind:value={universe} placeholder="Univ" min={1} />
		</FormField>

		<FormField label="Address">
			<NumberInput bind:value={address} placeholder="Addr" min={1} max={512} />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Accessories">
		<FormField label="Color" layout="vertical">
			<ColorInput bind:value={color} placeholder="e.g., R33, L201" />
		</FormField>

		<FormField label="Gobo">
			<TextInput bind:value={gobo} placeholder="Gobo name/pattern" />
		</FormField>

		<FormField label="Accessory">
			<TextInput bind:value={accessory} placeholder="Barn doors, top hat, etc." />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Identification">
		<FormField label="Unit #">
			<NumberInput bind:value={unitNumber} placeholder="#" min={1} />
		</FormField>

		<FormField label="Purpose">
			<TextInput bind:value={purpose} placeholder="e.g., DSC warm" />
		</FormField>

		<FormField label="Focus">
			<TextInput bind:value={focus} placeholder="Focus notes" />
		</FormField>

		<FormField label="Notes" layout="vertical">
			<TextInput bind:value={notes} placeholder="Additional notes" multiline rows={3} />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Transform">
		<FormField label="Rotation">
			<Slider bind:value={rotation} min={0} max={360} step={1} unit="°" />
		</FormField>
	</CollapsibleSection>

	<CollapsibleSection title="Label Display" defaultOpen={false}>
		<div class="checkbox-grid">
			<Checkbox bind:checked={showChannel} label="Channel" />
			<Checkbox bind:checked={showUnitNumber} label="Unit Number" />
			<Checkbox bind:checked={showColor} label="Color" />
			<Checkbox bind:checked={showPurpose} label="Purpose" />
			<Checkbox bind:checked={showDimmer} label="Dimmer" />
			<Checkbox bind:checked={showGobo} label="Gobo" />
		</div>
	</CollapsibleSection>
</div>

<style>
	.instrument-properties {
		display: flex;
		flex-direction: column;
	}

	.checkbox-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}
</style>
