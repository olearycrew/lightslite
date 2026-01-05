/**
 * Symbol SVG Paths
 *
 * SVG path definitions for each lighting instrument type.
 * All symbols are centered at origin (0,0) for easy rotation.
 * Symbols are designed to match professional theatrical lighting plot standards.
 *
 * USITT standard symbol conventions:
 * - ERS: Tapered body (wider at lamp housing, narrower at lens), with lens-end indicators for beam angle
 * - PAR: Rounded bucket/can shape
 * - Fresnel: Similar to PAR but with concentric rings for fresnel lens
 * - Moving Light: Circle with yoke arms and dashed pan/tilt range circle
 */

import type { SymbolDefinition, SymbolRegistry } from './types';

// =============================================================================
// ERS (Ellipsoidal) Symbols - USITT Standard
// Tapered body with specific lens-end indicators for each beam angle
// =============================================================================

/**
 * ERS 14° - Narrow beam, long "snoot" lens extension
 * Very tight beam angle, represented by elongated lens barrel
 */
const ERS_14_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Tapered body - wide at back (lamp), narrow at front (lens)
	path: `
		M -15 16
		L -15 4
		L -10 -6
		L -6 -10
		L 6 -10
		L 10 -6
		L 15 4
		L 15 16
		Q 15 20 10 20
		L -10 20
		Q -15 20 -15 16
		Z
	`,
	// Long narrow lens barrel for 14° (very tight beam)
	detailPaths: [
		// Long lens barrel extension
		'M -4 -10 L -4 -28 L 4 -28 L 4 -10',
		// Lens cap line
		'M -4 -28 L 4 -28',
		// Focus knobs
		'M -15 8 L -18 8',
		'M 15 8 L 18 8'
	],
	width: 40,
	height: 52,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -32 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * ERS 19° - Narrow beam with X pattern at lens end
 */
const ERS_19_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	path: `
		M -15 16
		L -15 4
		L -10 -6
		L -6 -10
		L 6 -10
		L 10 -6
		L 15 4
		L 15 16
		Q 15 20 10 20
		L -10 20
		Q -15 20 -15 16
		Z
	`,
	// X pattern at lens end for 19°
	detailPaths: [
		// Lens barrel
		'M -5 -10 L -5 -16 L 5 -16 L 5 -10',
		// X pattern inside lens
		'M -4 -11 L 4 -15',
		'M 4 -11 L -4 -15',
		// Focus knobs
		'M -15 8 L -18 8',
		'M 15 8 L 18 8'
	],
	width: 40,
	height: 40,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * ERS 26° - Medium beam with curved line indicators
 */
const ERS_26_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	path: `
		M -15 16
		L -15 4
		L -10 -6
		L -6 -10
		L 6 -10
		L 10 -6
		L 15 4
		L 15 16
		Q 15 20 10 20
		L -10 20
		Q -15 20 -15 16
		Z
	`,
	// Curved lines at lens end for 26° (standard theatrical beam)
	detailPaths: [
		// Lens barrel (shorter than 19°)
		'M -6 -10 L -6 -14 L 6 -14 L 6 -10',
		// Curved beam angle indicators
		'M -5 -12 Q 0 -15 5 -12',
		'M -5 -14 Q 0 -17 5 -14',
		// Focus knobs
		'M -15 8 L -18 8',
		'M 15 8 L 18 8'
	],
	width: 40,
	height: 38,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -18 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * ERS 36° - Wide beam with small chevron indicator
 */
const ERS_36_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	path: `
		M -15 16
		L -15 4
		L -10 -6
		L -6 -10
		L 6 -10
		L 10 -6
		L 15 4
		L 15 16
		Q 15 20 10 20
		L -10 20
		Q -15 20 -15 16
		Z
	`,
	// Small chevron at lens end for 36°
	detailPaths: [
		// Short lens barrel
		'M -6 -10 L -6 -13 L 6 -13 L 6 -10',
		// Chevron indicator (pointing outward for wider beam)
		'M -4 -12 L 0 -15 L 4 -12',
		// Focus knobs
		'M -15 8 L -18 8',
		'M 15 8 L 18 8'
	],
	width: 40,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -17 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * ERS 50° - Very wide beam with simple rounded lens end
 */
const ERS_50_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	path: `
		M -15 16
		L -15 4
		L -10 -6
		L -6 -10
		L 6 -10
		L 10 -6
		L 15 4
		L 15 16
		Q 15 20 10 20
		L -10 20
		Q -15 20 -15 16
		Z
	`,
	// Simple rounded end for 50° (widest beam)
	detailPaths: [
		// Short rounded lens cap
		'M -6 -10 Q -6 -14 0 -14 Q 6 -14 6 -10',
		// Focus knobs
		'M -15 8 L -18 8',
		'M 15 8 L 18 8'
	],
	width: 40,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -16 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// PAR Symbol - USITT Standard
// Rounded bucket/can shape (like a coffee can)
// =============================================================================

/**
 * PAR can symbol - rounded bucket shape
 * No internal lines needed - just a simple can outline
 */
const PAR_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Rounded rectangle (bucket/can shape)
	path: `
		M -12 -16
		Q -12 -20 0 -20
		Q 12 -20 12 -16
		L 12 16
		Q 12 20 0 20
		Q -12 20 -12 16
		Z
	`,
	// Simple internal lines showing lamp direction
	detailPaths: [
		// Top and bottom curves to emphasize the can shape
		'M -10 -16 Q 0 -14 10 -16',
		'M -10 16 Q 0 14 10 16'
	],
	width: 28,
	height: 44,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -24 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// Fresnel Symbol - USITT Standard
// Similar to PAR but with concentric rings indicating fresnel lens
// =============================================================================

/**
 * Fresnel symbol
 * Bucket shape with concentric rings inside to indicate fresnel lens
 */
const FRESNEL_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Rounded bucket shape (similar to PAR)
	path: `
		M -14 -16
		Q -14 -20 0 -20
		Q 14 -20 14 -16
		L 14 16
		Q 14 20 0 20
		Q -14 20 -14 16
		Z
	`,
	// Concentric rings (characteristic of Fresnel lens)
	detailPaths: [
		// Three concentric rings
		'M 0 -10 A 10 10 0 1 1 0 10 A 10 10 0 1 1 0 -10 Z',
		'M 0 -6 A 6 6 0 1 1 0 6 A 6 6 0 1 1 0 -6 Z',
		'M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z'
	],
	width: 32,
	height: 44,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -24 },
	showFrontIndicator: false,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// Moving Light Symbols - USITT Standard
// Circle with yoke indication and dashed pan/tilt range circle
// =============================================================================

/**
 * Moving Light (Spot) symbol
 * Circle representing the head with yoke arms on sides
 * Small square in center, dashed circle around for pan/tilt range
 */
const MOVING_SPOT_SYMBOL: SymbolDefinition = {
	// Main head (circle)
	path: 'M 0 -14 A 14 14 0 1 1 0 14 A 14 14 0 1 1 0 -14 Z',
	// Yoke arms and center indicator
	detailPaths: [
		// Left yoke arm (horizontal bar)
		'M -14 0 L -22 0',
		'M -22 -4 L -22 4',
		// Right yoke arm (horizontal bar)
		'M 14 0 L 22 0',
		'M 22 -4 L 22 4',
		// Small square in center
		'M -4 -4 L 4 -4 L 4 4 L -4 4 Z'
	],
	// Additional element for dashed circle - will be handled specially in renderer
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 32 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: false,
	category: 'moving',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Wash) symbol
 * Circle with yoke indication and "W" marking
 */
const MOVING_WASH_SYMBOL: SymbolDefinition = {
	path: 'M 0 -14 A 14 14 0 1 1 0 14 A 14 14 0 1 1 0 -14 Z',
	detailPaths: [
		// Yoke arms
		'M -14 0 L -22 0',
		'M -22 -4 L -22 4',
		'M 14 0 L 22 0',
		'M 22 -4 L 22 4',
		// "W" indicator in center
		'M -6 -4 L -3 6 L 0 0 L 3 6 L 6 -4'
	],
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 32 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: false,
	category: 'moving',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Beam) symbol
 * Circle with yoke and "B" marking
 */
const MOVING_BEAM_SYMBOL: SymbolDefinition = {
	path: 'M 0 -14 A 14 14 0 1 1 0 14 A 14 14 0 1 1 0 -14 Z',
	detailPaths: [
		// Yoke arms
		'M -14 0 L -22 0',
		'M -22 -4 L -22 4',
		'M 14 0 L 22 0',
		'M 22 -4 L 22 4',
		// "B" indicator - vertical line with two bumps
		'M -3 -6 L -3 6',
		'M -3 -6 C 6 -6 6 0 -3 0',
		'M -3 0 C 6 0 6 6 -3 6'
	],
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 32 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: false,
	category: 'moving',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// Cyc Light Symbol
// =============================================================================

/**
 * Cyc Light symbol
 * Asymmetric elongated shape - significantly wider at front (output) than back
 */
const CYC_LIGHT_SYMBOL: SymbolDefinition = {
	// Asymmetric body - much wider at front (light output), narrow at back
	path: `
		M -10 18
		L -10 8
		L -26 -10
		L -26 -16
		L 26 -16
		L 26 -10
		L 10 8
		L 10 18
		Z
	`,
	// Internal baffles / reflector cells
	detailPaths: ['M -18 -14 L -6 6', 'M 0 -16 L 0 12', 'M 18 -14 L 6 6'],
	width: 56,
	height: 38,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: false,
	category: 'cyc',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// LED Fixtures
// =============================================================================

/**
 * LED PAR symbol
 * Circle with LED dot pattern (honeycomb-style arrangement)
 */
const LED_PAR_SYMBOL: SymbolDefinition = {
	// Main circle
	path: 'M 0 -18 A 18 18 0 1 1 0 18 A 18 18 0 1 1 0 -18 Z',
	// LED dot pattern - honeycomb layout using full circles
	detailPaths: [
		// Center LED
		'M 0 -3 A 3 3 0 1 1 0 3 A 3 3 0 1 1 0 -3 Z',
		// Ring of 6 LEDs around center
		'M 0 -13 A 2.5 2.5 0 1 1 0 -8 A 2.5 2.5 0 1 1 0 -13 Z',
		'M 9 -8 A 2.5 2.5 0 1 1 9 -3 A 2.5 2.5 0 1 1 9 -8 Z',
		'M 9 3 A 2.5 2.5 0 1 1 9 8 A 2.5 2.5 0 1 1 9 3 Z',
		'M 0 8 A 2.5 2.5 0 1 1 0 13 A 2.5 2.5 0 1 1 0 8 Z',
		'M -9 3 A 2.5 2.5 0 1 1 -9 8 A 2.5 2.5 0 1 1 -9 3 Z',
		'M -9 -8 A 2.5 2.5 0 1 1 -9 -3 A 2.5 2.5 0 1 1 -9 -8 Z'
	],
	width: 40,
	height: 40,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 26 },
	frontIndicator: { x: 0, y: -22 },
	showFrontIndicator: false,
	category: 'led',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * LED Wash symbol
 * Rounded square with LED grid pattern
 */
const LED_WASH_SYMBOL: SymbolDefinition = {
	// Rounded square body
	path: `
		M -16 -20
		Q -20 -20 -20 -16
		L -20 16
		Q -20 20 -16 20
		L 16 20
		Q 20 20 20 16
		L 20 -16
		Q 20 -20 16 -20
		Z
	`,
	// 3x3 LED grid pattern using proper circles
	detailPaths: [
		'M -10 -13 A 3 3 0 1 1 -10 -7 A 3 3 0 1 1 -10 -13 Z',
		'M 0 -13 A 3 3 0 1 1 0 -7 A 3 3 0 1 1 0 -13 Z',
		'M 10 -13 A 3 3 0 1 1 10 -7 A 3 3 0 1 1 10 -13 Z',
		'M -10 -3 A 3 3 0 1 1 -10 3 A 3 3 0 1 1 -10 -3 Z',
		'M 0 -3 A 3 3 0 1 1 0 3 A 3 3 0 1 1 0 -3 Z',
		'M 10 -3 A 3 3 0 1 1 10 3 A 3 3 0 1 1 10 -3 Z',
		'M -10 7 A 3 3 0 1 1 -10 13 A 3 3 0 1 1 -10 7 Z',
		'M 0 7 A 3 3 0 1 1 0 13 A 3 3 0 1 1 0 7 Z',
		'M 10 7 A 3 3 0 1 1 10 13 A 3 3 0 1 1 10 7 Z'
	],
	width: 44,
	height: 44,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 30 },
	frontIndicator: { x: 0, y: -26 },
	showFrontIndicator: false,
	category: 'led',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * LED Strip symbol
 * Elongated rectangle with dots in a row
 */
const LED_STRIP_SYMBOL: SymbolDefinition = {
	// Long thin rectangle
	path: `
		M -40 -6
		Q -44 -6 -44 -2
		L -44 2
		Q -44 6 -40 6
		L 40 6
		Q 44 6 44 2
		L 44 -2
		Q 44 -6 40 -6
		Z
	`,
	// Row of LED dots using proper circles
	detailPaths: [
		'M -34 -2 A 2 2 0 1 1 -34 2 A 2 2 0 1 1 -34 -2 Z',
		'M -22 -2 A 2 2 0 1 1 -22 2 A 2 2 0 1 1 -22 -2 Z',
		'M -10 -2 A 2 2 0 1 1 -10 2 A 2 2 0 1 1 -10 -2 Z',
		'M 2 -2 A 2 2 0 1 1 2 2 A 2 2 0 1 1 2 -2 Z',
		'M 14 -2 A 2 2 0 1 1 14 2 A 2 2 0 1 1 14 -2 Z',
		'M 26 -2 A 2 2 0 1 1 26 2 A 2 2 0 1 1 26 -2 Z',
		'M 38 -2 A 2 2 0 1 1 38 2 A 2 2 0 1 1 38 -2 Z'
	],
	width: 92,
	height: 16,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 16 },
	frontIndicator: { x: 0, y: -10 },
	showFrontIndicator: false, // Strips typically don't have a "front"
	category: 'led',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

// =============================================================================
// Special Fixtures
// =============================================================================

/**
 * Followspot symbol
 * Large elongated oval (barrel) with tripod stand indication
 */
const FOLLOWSPOT_SYMBOL: SymbolDefinition = {
	// Body: elongated oval/barrel shape
	path: `
		M -10 -36
		Q -10 -44 0 -44
		Q 10 -44 10 -36
		L 10 8
		Q 10 16 0 16
		Q -10 16 -10 8
		Z
	`,
	// Stand legs (tripod style)
	detailPaths: [
		// Lens indication at top
		'M -7 -44 L -7 -50 L 7 -50 L 7 -44',
		// Left leg
		'M -6 16 L -20 42',
		// Right leg
		'M 6 16 L 20 42',
		// Center rear leg
		'M 0 16 L 0 42',
		// Cross brace
		'M -14 32 L 14 32',
		// Handle/sight
		'M -10 -20 L -14 -20',
		'M 10 -20 L 14 -20'
	],
	width: 44,
	height: 96,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 28, y: 0 },
	frontIndicator: { x: 0, y: -54 },
	showFrontIndicator: false,
	category: 'other',
	defaultFill: '#f0f0f0',
	defaultStroke: '#000000'
};

/**
 * Practical symbol
 * Simple lightbulb icon representing practical/decorative fixture
 */
const PRACTICAL_SYMBOL: SymbolDefinition = {
	// Lightbulb shape
	path: `
		M 0 -16
		A 10 10 0 1 0 0 4
		L -6 4
		L -6 10
		L 6 10
		L 6 4
		L 0 4
	`,
	// Base threads
	detailPaths: ['M -6 12 L 6 12', 'M -5 14 L 5 14', 'M -4 16 L 4 16'],
	width: 24,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 24 },
	showFrontIndicator: false,
	category: 'other',
	defaultFill: '#fffacd',
	defaultStroke: '#000000'
};

/**
 * Custom symbol
 * Generic rectangle placeholder with X marking
 */
const CUSTOM_SYMBOL: SymbolDefinition = {
	path: `
		M -16 -12
		L 16 -12
		L 16 12
		L -16 12
		Z
	`,
	// Diagonal X to indicate "custom/unknown"
	detailPaths: ['M -12 -8 L 12 8', 'M -12 8 L 12 -8'],
	width: 36,
	height: 28,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 20 },
	frontIndicator: { x: 0, y: -16 },
	showFrontIndicator: false,
	category: 'other',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Complete symbol registry
 * Maps each instrument type to its symbol definition
 */
export const SYMBOLS: SymbolRegistry = {
	// Ellipsoidals - each has unique lens-end indicator for beam angle
	'ers-14': { ...ERS_14_SYMBOL, category: 'ellipsoidal' },
	'ers-19': { ...ERS_19_SYMBOL, category: 'ellipsoidal' },
	'ers-26': { ...ERS_26_SYMBOL, category: 'ellipsoidal' },
	'ers-36': { ...ERS_36_SYMBOL, category: 'ellipsoidal' },
	'ers-50': { ...ERS_50_SYMBOL, category: 'ellipsoidal' },

	// PARs - rounded bucket shape, same shape but can vary by size
	'par-64': { ...PAR_SYMBOL, category: 'par' },
	'par-56': { ...PAR_SYMBOL, category: 'par', width: 24, height: 38 },
	'par-38': { ...PAR_SYMBOL, category: 'par', width: 20, height: 32 },

	// Fresnels - bucket with concentric rings
	'fresnel-6': { ...FRESNEL_SYMBOL, category: 'fresnel' },
	'fresnel-8': { ...FRESNEL_SYMBOL, category: 'fresnel', width: 38, height: 50 },

	// Cyc light
	'cyc-light': CYC_LIGHT_SYMBOL,

	// Moving lights - circle with yoke arms
	'moving-spot': MOVING_SPOT_SYMBOL,
	'moving-wash': MOVING_WASH_SYMBOL,
	'moving-beam': MOVING_BEAM_SYMBOL,

	// LED fixtures
	'led-par': LED_PAR_SYMBOL,
	'led-wash': LED_WASH_SYMBOL,
	'led-strip': LED_STRIP_SYMBOL,

	// Special
	followspot: FOLLOWSPOT_SYMBOL,
	practical: PRACTICAL_SYMBOL,
	custom: CUSTOM_SYMBOL
};

/**
 * Get the symbol definition for an instrument type
 */
export function getSymbol(type: string): SymbolDefinition {
	return SYMBOLS[type as keyof typeof SYMBOLS] ?? CUSTOM_SYMBOL;
}

/**
 * Get all available instrument types
 */
export function getAvailableInstrumentTypes(): Array<keyof typeof SYMBOLS> {
	return Object.keys(SYMBOLS) as Array<keyof typeof SYMBOLS>;
}
