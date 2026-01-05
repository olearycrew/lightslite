/**
 * Channel Hookup Report Generator
 *
 * Generates a channel hookup report from project data.
 * A channel hookup lists all instruments sorted by channel number,
 * showing key information lighting electricians need for patching and maintenance.
 */

import type { InstrumentObject, HangingPositionObject } from '$lib/stores/project.svelte';

/**
 * Human-readable names for instrument types
 */
const INSTRUMENT_TYPE_NAMES: Record<string, string> = {
	'ers-14': 'ERS 14°',
	'ers-19': 'ERS 19°',
	'ers-26': 'ERS 26°',
	'ers-36': 'ERS 36°',
	'ers-50': 'ERS 50°',
	'par-64': 'PAR 64',
	'par-56': 'PAR 56',
	'par-38': 'PAR 38',
	'fresnel-6': '6" Fresnel',
	'fresnel-8': '8" Fresnel',
	'cyc-light': 'Cyc Light',
	'moving-spot': 'Moving Spot',
	'moving-wash': 'Moving Wash',
	'moving-beam': 'Moving Beam',
	'led-par': 'LED PAR',
	'led-wash': 'LED Wash',
	'led-strip': 'LED Strip',
	followspot: 'Followspot',
	practical: 'Practical',
	custom: 'Custom'
};

/**
 * A single row in the channel hookup report
 */
export interface ChannelHookupRow {
	/** The instrument's unique ID */
	instrumentId: string;
	/** Lighting console channel number */
	channel: number | null;
	/** Dimmer number or address */
	dimmer: number | string | null;
	/** Name of the hanging position */
	position: string;
	/** Unit number on the position */
	unitNumber: number | null;
	/** Instrument type (human-readable) */
	instrumentType: string;
	/** Color/gel information */
	color: string | null;
	/** Gobo name or pattern */
	gobo: string | null;
	/** Purpose/focus area */
	purpose: string | null;
	/** Additional notes */
	notes: string | null;
}

/**
 * The complete channel hookup report data
 */
export interface ChannelHookupReport {
	/** Project name */
	projectName: string;
	/** Date the report was generated */
	generatedAt: string;
	/** Report rows sorted by channel number */
	rows: ChannelHookupRow[];
	/** Summary statistics */
	summary: {
		totalInstruments: number;
		instrumentsWithChannel: number;
		instrumentsWithoutChannel: number;
	};
}

/**
 * Project layers data structure as stored in the database
 */
export interface ProjectLayers {
	shapes?: unknown[];
	hangingPositions?: HangingPositionObject[];
	instruments?: InstrumentObject[];
	setPieces?: unknown[];
	annotations?: unknown[];
}

/**
 * Generate a channel hookup report from project data
 *
 * @param projectName - The name of the project
 * @param layers - The project layers JSONB data
 * @returns The complete channel hookup report
 */
export function generateChannelHookup(
	projectName: string,
	layers: ProjectLayers | null
): ChannelHookupReport {
	const instruments = layers?.instruments ?? [];
	const hangingPositions = layers?.hangingPositions ?? [];

	// Create a lookup map for hanging positions by ID
	const positionMap = new Map<string, HangingPositionObject>();
	for (const hp of hangingPositions) {
		positionMap.set(hp.id, hp);
	}

	// Transform instruments to report rows
	const rows: ChannelHookupRow[] = instruments.map((instrument) => {
		// Look up the hanging position name
		const hangingPosition = instrument.hangingPositionId
			? positionMap.get(instrument.hangingPositionId)
			: null;
		const positionName = hangingPosition?.name ?? 'Free-floating';

		return {
			instrumentId: instrument.id,
			channel: instrument.channel ?? null,
			dimmer: instrument.dimmer ?? null,
			position: positionName,
			unitNumber: getUnitNumber(instrument),
			instrumentType: getInstrumentTypeName(instrument.instrumentType),
			color: instrument.color ?? null,
			gobo: getGobo(instrument),
			purpose: getPurpose(instrument),
			notes: getNotes(instrument)
		};
	});

	// Sort by channel number (nulls at the end)
	rows.sort((a, b) => {
		if (a.channel === null && b.channel === null) return 0;
		if (a.channel === null) return 1;
		if (b.channel === null) return -1;
		return a.channel - b.channel;
	});

	// Calculate summary statistics
	const instrumentsWithChannel = rows.filter((r) => r.channel !== null).length;

	return {
		projectName,
		generatedAt: new Date().toISOString(),
		rows,
		summary: {
			totalInstruments: rows.length,
			instrumentsWithChannel,
			instrumentsWithoutChannel: rows.length - instrumentsWithChannel
		}
	};
}

/**
 * Get human-readable instrument type name
 */
function getInstrumentTypeName(typeId: string): string {
	return INSTRUMENT_TYPE_NAMES[typeId] ?? typeId;
}

/**
 * Get unit number from instrument, handling various data shapes
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getUnitNumber(_instrument: InstrumentObject): number | null {
	// The InstrumentObject uses 'name' but might have unitNumber in extended data
	// For now, return null - unit numbers are typically derived from position on bar
	return null;
}

/**
 * Get gobo information from instrument
 */
function getGobo(instrument: InstrumentObject): string | null {
	// InstrumentObject doesn't have gobo in its interface yet
	// Return null for now, but check for extended properties
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.gobo === 'string') {
		return extended.gobo;
	}
	return null;
}

/**
 * Get purpose/focus from instrument
 */
function getPurpose(instrument: InstrumentObject): string | null {
	// InstrumentObject has 'focus' which serves as purpose
	return instrument.focus ?? null;
}

/**
 * Get notes from instrument
 */
function getNotes(instrument: InstrumentObject): string | null {
	// InstrumentObject might have notes in extended properties
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.notes === 'string') {
		return extended.notes;
	}
	return null;
}
