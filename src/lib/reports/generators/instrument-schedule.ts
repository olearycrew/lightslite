/**
 * Instrument Schedule Report Generator
 *
 * Generates an instrument schedule report from project data.
 * An instrument schedule lists all instruments sorted by hanging position,
 * then by unit number - giving a position-by-position breakdown.
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
 * A single instrument row in the schedule
 */
export interface InstrumentScheduleRow {
	/** The instrument's unique ID */
	instrumentId: string;
	/** Unit number on the position */
	unitNumber: number | null;
	/** Instrument type (human-readable) */
	instrumentType: string;
	/** Lighting console channel number */
	channel: number | null;
	/** Dimmer number or address */
	dimmer: number | string | null;
	/** Circuit number */
	circuit: string | null;
	/** Color/gel information */
	color: string | null;
	/** Gobo name or pattern */
	gobo: string | null;
	/** Accessory information */
	accessory: string | null;
	/** Purpose/focus area */
	purpose: string | null;
	/** Additional notes */
	notes: string | null;
}

/**
 * A position group containing instruments at that position
 */
export interface InstrumentSchedulePosition {
	/** Position ID */
	positionId: string;
	/** Position name */
	positionName: string;
	/** Sort order for the position (if available) */
	sortOrder: number | null;
	/** Instruments at this position */
	instruments: InstrumentScheduleRow[];
}

/**
 * The complete instrument schedule report data
 */
export interface InstrumentScheduleReport {
	/** Project name */
	projectName: string;
	/** Date the report was generated */
	generatedAt: string;
	/** Positions with their instruments */
	positions: InstrumentSchedulePosition[];
	/** Instruments without a position */
	unassignedInstruments: InstrumentScheduleRow[];
	/** Summary statistics */
	summary: {
		totalInstruments: number;
		totalPositions: number;
		unassignedCount: number;
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
 * Generate an instrument schedule report from project data
 *
 * @param projectName - The name of the project
 * @param layers - The project layers JSONB data
 * @returns The complete instrument schedule report
 */
export function generateInstrumentSchedule(
	projectName: string,
	layers: ProjectLayers | null
): InstrumentScheduleReport {
	const instruments = layers?.instruments ?? [];
	const hangingPositions = layers?.hangingPositions ?? [];

	// Create a lookup map for hanging positions by ID
	const positionMap = new Map<string, HangingPositionObject>();
	for (const hp of hangingPositions) {
		positionMap.set(hp.id, hp);
	}

	// Group instruments by position
	const positionInstruments = new Map<string, InstrumentObject[]>();
	const unassigned: InstrumentObject[] = [];

	for (const instrument of instruments) {
		if (instrument.hangingPositionId && positionMap.has(instrument.hangingPositionId)) {
			const existing = positionInstruments.get(instrument.hangingPositionId) ?? [];
			existing.push(instrument);
			positionInstruments.set(instrument.hangingPositionId, existing);
		} else {
			unassigned.push(instrument);
		}
	}

	// Transform positions with their instruments
	const positions: InstrumentSchedulePosition[] = [];
	for (const [positionId, positionInsts] of positionInstruments) {
		const hp = positionMap.get(positionId)!;

		// Sort instruments by unit number
		const sortedInstruments = positionInsts.sort((a, b) => {
			const aUnit = getUnitNumber(a);
			const bUnit = getUnitNumber(b);
			if (aUnit === null && bUnit === null) return 0;
			if (aUnit === null) return 1;
			if (bUnit === null) return -1;
			return aUnit - bUnit;
		});

		positions.push({
			positionId,
			positionName: hp.name ?? 'Unnamed Position',
			sortOrder: getSortOrder(hp),
			instruments: sortedInstruments.map(transformInstrumentRow)
		});
	}

	// Sort positions by sort_order (if available) then by name
	positions.sort((a, b) => {
		// First compare by sort order if both have it
		if (a.sortOrder !== null && b.sortOrder !== null) {
			return a.sortOrder - b.sortOrder;
		}
		// Put items with sort order first
		if (a.sortOrder !== null) return -1;
		if (b.sortOrder !== null) return 1;
		// Fall back to alphabetical by name
		return a.positionName.localeCompare(b.positionName);
	});

	// Transform unassigned instruments
	const unassignedInstruments = unassigned
		.sort((a, b) => {
			const aUnit = getUnitNumber(a);
			const bUnit = getUnitNumber(b);
			if (aUnit === null && bUnit === null) return 0;
			if (aUnit === null) return 1;
			if (bUnit === null) return -1;
			return aUnit - bUnit;
		})
		.map(transformInstrumentRow);

	return {
		projectName,
		generatedAt: new Date().toISOString(),
		positions,
		unassignedInstruments,
		summary: {
			totalInstruments: instruments.length,
			totalPositions: positions.length,
			unassignedCount: unassignedInstruments.length
		}
	};
}

/**
 * Transform an instrument to a schedule row
 */
function transformInstrumentRow(instrument: InstrumentObject): InstrumentScheduleRow {
	return {
		instrumentId: instrument.id,
		unitNumber: getUnitNumber(instrument),
		instrumentType: getInstrumentTypeName(instrument.instrumentType),
		channel: instrument.channel ?? null,
		dimmer: instrument.dimmer ?? null,
		circuit: getCircuit(instrument),
		color: instrument.color ?? null,
		gobo: getGobo(instrument),
		accessory: getAccessory(instrument),
		purpose: getPurpose(instrument),
		notes: getNotes(instrument)
	};
}

/**
 * Get human-readable instrument type name
 */
function getInstrumentTypeName(typeId: string): string {
	return INSTRUMENT_TYPE_NAMES[typeId] ?? typeId;
}

/**
 * Get unit number from instrument
 */
function getUnitNumber(instrument: InstrumentObject): number | null {
	// Check for unitNumber in extended properties
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.unitNumber === 'number') {
		return extended.unitNumber;
	}
	return null;
}

/**
 * Get sort order from hanging position
 */
function getSortOrder(hp: HangingPositionObject): number | null {
	const extended = hp as unknown as Record<string, unknown>;
	if (typeof extended.sortOrder === 'number') {
		return extended.sortOrder;
	}
	if (typeof extended.sort_order === 'number') {
		return extended.sort_order;
	}
	return null;
}

/**
 * Get circuit information from instrument
 */
function getCircuit(instrument: InstrumentObject): string | null {
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.circuit === 'string') {
		return extended.circuit;
	}
	if (typeof extended.circuit === 'number') {
		return String(extended.circuit);
	}
	return null;
}

/**
 * Get gobo information from instrument
 */
function getGobo(instrument: InstrumentObject): string | null {
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.gobo === 'string') {
		return extended.gobo;
	}
	return null;
}

/**
 * Get accessory information from instrument
 */
function getAccessory(instrument: InstrumentObject): string | null {
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.accessory === 'string') {
		return extended.accessory;
	}
	return null;
}

/**
 * Get purpose/focus from instrument
 */
function getPurpose(instrument: InstrumentObject): string | null {
	return instrument.focus ?? null;
}

/**
 * Get notes from instrument
 */
function getNotes(instrument: InstrumentObject): string | null {
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.notes === 'string') {
		return extended.notes;
	}
	return null;
}
