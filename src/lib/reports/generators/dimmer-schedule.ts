/**
 * Dimmer Schedule Report Generator
 *
 * Generates a dimmer schedule report from project data.
 * A dimmer schedule lists all instruments sorted by dimmer number,
 * showing what's patched to each dimmer - useful for load planning
 * and power distribution.
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
 * Default wattages for common instrument types (for load estimation)
 */
const INSTRUMENT_WATTAGES: Record<string, number> = {
	'ers-14': 750,
	'ers-19': 750,
	'ers-26': 575,
	'ers-36': 575,
	'ers-50': 575,
	'par-64': 1000,
	'par-56': 500,
	'par-38': 150,
	'fresnel-6': 750,
	'fresnel-8': 1000,
	'cyc-light': 1000,
	'moving-spot': 250, // LED moving lights typically
	'moving-wash': 200,
	'moving-beam': 230,
	'led-par': 100,
	'led-wash': 150,
	'led-strip': 75,
	followspot: 1200,
	practical: 60,
	custom: 575
};

/**
 * A single row in the dimmer schedule report
 */
export interface DimmerScheduleRow {
	/** The instrument's unique ID */
	instrumentId: string;
	/** Dimmer number or address */
	dimmer: number | string;
	/** Lighting console channel number */
	channel: number | null;
	/** Name of the hanging position */
	position: string;
	/** Unit number on the position */
	unitNumber: number | null;
	/** Instrument type (human-readable) */
	instrumentType: string;
	/** Circuit number */
	circuit: string | null;
	/** Purpose/focus area */
	purpose: string | null;
	/** Estimated wattage */
	wattage: number | null;
}

/**
 * A group of instruments sharing the same dimmer
 */
export interface DimmerGroup {
	/** The dimmer identifier */
	dimmer: string;
	/** Numeric sort key for the dimmer (for proper ordering) */
	sortKey: number;
	/** Instruments patched to this dimmer */
	instruments: DimmerScheduleRow[];
	/** Total estimated load in watts */
	totalLoad: number | null;
}

/**
 * The complete dimmer schedule report data
 */
export interface DimmerScheduleReport {
	/** Project name */
	projectName: string;
	/** Date the report was generated */
	generatedAt: string;
	/** Dimmer groups sorted by dimmer number */
	dimmerGroups: DimmerGroup[];
	/** Instruments without a dimmer assignment */
	unassignedInstruments: DimmerScheduleRow[];
	/** Summary statistics */
	summary: {
		totalInstruments: number;
		assignedCount: number;
		unassignedCount: number;
		totalDimmers: number;
		totalEstimatedLoad: number | null;
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
 * Parse a dimmer value and return a sort key
 * Handles numbers, strings, and ranges like "1-4"
 */
function getDimmerSortKey(dimmer: number | string): number {
	if (typeof dimmer === 'number') {
		return dimmer;
	}

	// Try to parse as a plain number
	const parsed = parseInt(dimmer, 10);
	if (!isNaN(parsed)) {
		return parsed;
	}

	// Handle ranges like "1-4" - use the first number
	const rangeMatch = dimmer.match(/^(\d+)/);
	if (rangeMatch) {
		return parseInt(rangeMatch[1], 10);
	}

	// For non-numeric dimmers, return a high number to sort them last
	return Number.MAX_SAFE_INTEGER;
}

/**
 * Normalize dimmer value to a consistent string representation
 */
function normalizeDimmer(dimmer: number | string): string {
	return String(dimmer).trim();
}

/**
 * Generate a dimmer schedule report from project data
 *
 * @param projectName - The name of the project
 * @param layers - The project layers JSONB data
 * @returns The complete dimmer schedule report
 */
export function generateDimmerSchedule(
	projectName: string,
	layers: ProjectLayers | null
): DimmerScheduleReport {
	const instruments = layers?.instruments ?? [];
	const hangingPositions = layers?.hangingPositions ?? [];

	// Create a lookup map for hanging positions by ID
	const positionMap = new Map<string, HangingPositionObject>();
	for (const hp of hangingPositions) {
		positionMap.set(hp.id, hp);
	}

	// Separate instruments by dimmer assignment
	const dimmerInstruments = new Map<string, InstrumentObject[]>();
	const unassigned: InstrumentObject[] = [];

	for (const instrument of instruments) {
		if (instrument.dimmer !== undefined && instrument.dimmer !== null) {
			const dimmerKey = normalizeDimmer(instrument.dimmer);
			const existing = dimmerInstruments.get(dimmerKey) ?? [];
			existing.push(instrument);
			dimmerInstruments.set(dimmerKey, existing);
		} else {
			unassigned.push(instrument);
		}
	}

	// Transform dimmer groups
	const dimmerGroups: DimmerGroup[] = [];
	for (const [dimmerKey, dimInstruments] of dimmerInstruments) {
		// Sort instruments within the group by channel
		const sortedInstruments = dimInstruments.sort((a, b) => {
			const aChannel = a.channel ?? Number.MAX_SAFE_INTEGER;
			const bChannel = b.channel ?? Number.MAX_SAFE_INTEGER;
			return aChannel - bChannel;
		});

		const rows = sortedInstruments.map((inst) =>
			transformInstrumentRow(inst, positionMap, dimmerKey)
		);

		// Calculate total load
		const totalLoad = rows.reduce(
			(sum, row) => {
				if (row.wattage !== null) {
					return (sum ?? 0) + row.wattage;
				}
				return sum;
			},
			null as number | null
		);

		dimmerGroups.push({
			dimmer: dimmerKey,
			sortKey: getDimmerSortKey(dimmerKey),
			instruments: rows,
			totalLoad
		});
	}

	// Sort dimmer groups by sort key (numeric order)
	dimmerGroups.sort((a, b) => a.sortKey - b.sortKey);

	// Transform unassigned instruments (alphabetically by position)
	const unassignedInstruments = unassigned
		.sort((a, b) => {
			const posA = a.hangingPositionId ? (positionMap.get(a.hangingPositionId)?.name ?? '') : '';
			const posB = b.hangingPositionId ? (positionMap.get(b.hangingPositionId)?.name ?? '') : '';
			return posA.localeCompare(posB);
		})
		.map((inst) => transformInstrumentRow(inst, positionMap, ''));

	// Calculate total estimated load
	const totalEstimatedLoad = dimmerGroups.reduce(
		(sum, group) => {
			if (group.totalLoad !== null) {
				return (sum ?? 0) + group.totalLoad;
			}
			return sum;
		},
		null as number | null
	);

	return {
		projectName,
		generatedAt: new Date().toISOString(),
		dimmerGroups,
		unassignedInstruments,
		summary: {
			totalInstruments: instruments.length,
			assignedCount: instruments.length - unassigned.length,
			unassignedCount: unassigned.length,
			totalDimmers: dimmerGroups.length,
			totalEstimatedLoad
		}
	};
}

/**
 * Transform an instrument to a schedule row
 */
function transformInstrumentRow(
	instrument: InstrumentObject,
	positionMap: Map<string, HangingPositionObject>,
	dimmer: string
): DimmerScheduleRow {
	// Look up the hanging position name
	const hangingPosition = instrument.hangingPositionId
		? positionMap.get(instrument.hangingPositionId)
		: null;
	const positionName = hangingPosition?.name ?? 'Free-floating';

	return {
		instrumentId: instrument.id,
		dimmer: dimmer || instrument.dimmer || '',
		channel: instrument.channel ?? null,
		position: positionName,
		unitNumber: getUnitNumber(instrument),
		instrumentType: getInstrumentTypeName(instrument.instrumentType),
		circuit: getCircuit(instrument),
		purpose: getPurpose(instrument),
		wattage: getWattage(instrument)
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
 * Get purpose/focus from instrument
 */
function getPurpose(instrument: InstrumentObject): string | null {
	return instrument.focus ?? null;
}

/**
 * Get wattage from instrument (either explicit or from type defaults)
 */
function getWattage(instrument: InstrumentObject): number | null {
	// Check for explicit wattage in extended properties
	const extended = instrument as unknown as Record<string, unknown>;
	if (typeof extended.wattage === 'number') {
		return extended.wattage;
	}

	// Fall back to default wattage for the instrument type
	return INSTRUMENT_WATTAGES[instrument.instrumentType] ?? null;
}
