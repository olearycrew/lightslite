/**
 * Instrument Types
 *
 * Type definitions for lighting instruments/fixtures in the lighting plot.
 * These types represent physical lighting equipment and their properties.
 */

/**
 * All available instrument types
 * - ERS (Ellipsoidal Reflector Spotlight): Standard theatrical fixtures with beam angle variants
 * - PAR: Parabolic Aluminized Reflector cans
 * - Fresnel: Soft-edged wash fixtures
 * - Cyc Light: Fixtures for lighting cycloramas
 * - Moving Lights: Automated fixtures
 * - LED: LED-based fixtures
 * - Special: Followspots, practicals, custom
 */
export type InstrumentType =
	// Ellipsoidal (ERS/Leko) - by beam angle
	| 'ers-14'
	| 'ers-19'
	| 'ers-26'
	| 'ers-36'
	| 'ers-50'
	// PAR cans - by lamp size
	| 'par-64'
	| 'par-56'
	| 'par-38'
	// Fresnels - by lens diameter (inches)
	| 'fresnel-6'
	| 'fresnel-8'
	// Cyc lights
	| 'cyc-light'
	// Moving/Automated lights
	| 'moving-spot'
	| 'moving-wash'
	| 'moving-beam'
	// LED fixtures
	| 'led-par'
	| 'led-wash'
	| 'led-strip'
	// Special fixtures
	| 'followspot'
	| 'practical'
	| 'custom';

/**
 * Instrument categories for grouping in UI
 */
export type InstrumentCategory =
	| 'ellipsoidal'
	| 'par'
	| 'fresnel'
	| 'cyc'
	| 'moving'
	| 'led'
	| 'other';

/**
 * Label display configuration
 * Controls what information is shown in the instrument's label
 */
export interface LabelConfig {
	/** Show the channel number */
	showChannel: boolean;
	/** Show the unit number */
	showUnitNumber: boolean;
	/** Show the color/gel */
	showColor: boolean;
	/** Show the purpose/focus area */
	showPurpose: boolean;
	/** Show the dimmer/circuit info */
	showDimmer: boolean;
	/** Show gobo information */
	showGobo: boolean;
	/** Label position relative to symbol */
	position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

/**
 * Default label configuration
 */
export const DEFAULT_LABEL_CONFIG: LabelConfig = {
	showChannel: true,
	showUnitNumber: false,
	showColor: false,
	showPurpose: false,
	showDimmer: false,
	showGobo: false,
	position: 'auto'
};

/**
 * Full instrument definition
 * Represents a lighting instrument placed on the plot
 */
export interface Instrument {
	/** Unique identifier */
	id: string;
	/** Instrument fixture type */
	type: InstrumentType;
	/** Position in world coordinates */
	position: { x: number; y: number };
	/** Rotation in degrees (0-360), where 0 points "up" (towards upstage) */
	rotation: number;
	/** ID of the hanging position this instrument is attached to */
	hangingPositionId: string | null;
	/** Position along the hanging position (0-1 normalized) */
	positionOnBar: number;

	// ========================================================================
	// Electrical / Control Properties
	// ========================================================================

	/** Lighting console channel number */
	channel: number | null;
	/** Dimmer number or address */
	dimmer: number | string | null;
	/** Circuit label/number */
	circuit: string | null;
	/** DMX universe (for moving lights) */
	universe: number | null;
	/** DMX start address (for moving lights) */
	address: number | null;

	// ========================================================================
	// Physical Properties
	// ========================================================================

	/** Color/gel name or number (e.g., "R33", "L201", "No Color") */
	color: string | null;
	/** Gobo name or pattern number */
	gobo: string | null;
	/** Template/pattern for ERS */
	template: string | null;
	/** Accessory (barn doors, top hat, etc.) */
	accessory: string | null;
	/** Wattage of lamp */
	wattage: number | null;

	// ========================================================================
	// Identification
	// ========================================================================

	/** Unit/instrument number on the position */
	unitNumber: number | null;
	/** Purpose/focus area (e.g., "DSC warm", "balcony rail") */
	purpose: string | null;
	/** Additional notes */
	notes: string | null;
	/** Custom display name */
	name: string | null;

	// ========================================================================
	// Visual Display
	// ========================================================================

	/** Label display configuration */
	labelDisplay: LabelConfig;
	/** Custom fill color override (otherwise uses default for type) */
	customFill: string | null;
	/** Custom stroke color override */
	customStroke: string | null;
}

/**
 * Create a new instrument with default values
 */
export function createInstrument(
	type: InstrumentType,
	position: { x: number; y: number },
	options: Partial<Omit<Instrument, 'id' | 'type' | 'position'>> = {}
): Omit<Instrument, 'id'> {
	return {
		type,
		position,
		rotation: options.rotation ?? 0,
		hangingPositionId: options.hangingPositionId ?? null,
		positionOnBar: options.positionOnBar ?? 0.5,

		// Electrical
		channel: options.channel ?? null,
		dimmer: options.dimmer ?? null,
		circuit: options.circuit ?? null,
		universe: options.universe ?? null,
		address: options.address ?? null,

		// Physical
		color: options.color ?? null,
		gobo: options.gobo ?? null,
		template: options.template ?? null,
		accessory: options.accessory ?? null,
		wattage: options.wattage ?? null,

		// Identification
		unitNumber: options.unitNumber ?? null,
		purpose: options.purpose ?? null,
		notes: options.notes ?? null,
		name: options.name ?? null,

		// Visual
		labelDisplay: options.labelDisplay ?? { ...DEFAULT_LABEL_CONFIG },
		customFill: options.customFill ?? null,
		customStroke: options.customStroke ?? null
	};
}

/**
 * Get the category for an instrument type
 */
export function getInstrumentCategory(type: InstrumentType): InstrumentCategory {
	switch (type) {
		case 'ers-14':
		case 'ers-19':
		case 'ers-26':
		case 'ers-36':
		case 'ers-50':
			return 'ellipsoidal';
		case 'par-64':
		case 'par-56':
		case 'par-38':
			return 'par';
		case 'fresnel-6':
		case 'fresnel-8':
			return 'fresnel';
		case 'cyc-light':
			return 'cyc';
		case 'moving-spot':
		case 'moving-wash':
		case 'moving-beam':
			return 'moving';
		case 'led-par':
		case 'led-wash':
		case 'led-strip':
			return 'led';
		case 'followspot':
		case 'practical':
		case 'custom':
			return 'other';
	}
}

/**
 * Human-readable names for instrument types
 */
export const INSTRUMENT_TYPE_NAMES: Record<InstrumentType, string> = {
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
 * Human-readable names for instrument categories
 */
export const INSTRUMENT_CATEGORY_NAMES: Record<InstrumentCategory, string> = {
	ellipsoidal: 'Ellipsoidals',
	par: 'PARs',
	fresnel: 'Fresnels',
	cyc: 'Cyc Lights',
	moving: 'Moving Lights',
	led: 'LED Fixtures',
	other: 'Other'
};
