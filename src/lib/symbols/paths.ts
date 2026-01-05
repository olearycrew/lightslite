/**
 * Symbol SVG Paths
 *
 * SVG path definitions for each lighting instrument type.
 * All symbols are centered at origin (0,0) for easy rotation.
 * Symbols are approximately 40-50 units wide for standard fixtures.
 *
 * USITT standard symbol conventions are followed where possible:
 * - ERS: Rounded rectangle with lens indication, body tapers toward front
 * - PAR: Circle with internal parallel lines indicating lamp direction
 * - Fresnel: Circle with concentric rings
 * - Cyc Light: Asymmetric elongated shape, wider output at front
 * - Moving Light: Circle with yoke/base indication
 * - LED Par: Circle with LED dot pattern
 * - Followspot: Large elongated oval with stand indication
 */

import type { SymbolDefinition, SymbolRegistry } from './types';

/**
 * ERS (Ellipsoidal) symbol - Leko-style fixture
 * Rounded rectangle body that tapers toward the lens end
 * The front (lens) is at negative Y (pointing "up" when rotation=0)
 * Width: 40, Height: 32
 */
const ERS_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Body shape: tapered body with rounded back, narrower lens housing at front
	path: `
		M -18 14
		L -18 0
		L -14 -8
		L -8 -12
		L 8 -12
		L 14 -8
		L 18 0
		L 18 14
		Q 18 18 14 18
		L -14 18
		Q -18 18 -18 14
		Z
	`,
	// Detail: lens barrel at front
	detailPaths: [
		// Lens barrel opening (narrower)
		'M -6 -12 L -6 -18 L 6 -18 L 6 -12',
		// Focus knobs on sides
		'M -18 6 L -22 6',
		'M 18 6 L 22 6'
	],
	width: 48,
	height: 40,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -22 },
	showFrontIndicator: true,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * PAR can symbol
 * Circle with parallel lines indicating lamp orientation
 * The lines span the full diameter to clearly show lamp direction
 * Width/Height: 40
 */
const PAR_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Main circle
	path: 'M 0 -18 A 18 18 0 1 1 0 18 A 18 18 0 1 1 0 -18 Z',
	// Parallel lines spanning full diameter for lamp orientation
	detailPaths: ['M -12 -14 L -12 14', 'M 0 -18 L 0 18', 'M 12 -14 L 12 14'],
	width: 40,
	height: 40,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 26 },
	frontIndicator: { x: 0, y: -22 },
	showFrontIndicator: true,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Fresnel symbol
 * Circle with concentric rings indicating lens type
 * Width/Height: 44
 */
const FRESNEL_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Outer circle
	path: 'M 0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20 Z',
	// Concentric rings (characteristic of Fresnel lens)
	detailPaths: [
		'M 0 -14 A 14 14 0 1 1 0 14 A 14 14 0 1 1 0 -14 Z',
		'M 0 -8 A 8 8 0 1 1 0 8 A 8 8 0 1 1 0 -8 Z',
		'M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z'
	],
	width: 44,
	height: 44,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -24 },
	showFrontIndicator: true,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Cyc Light symbol
 * Asymmetric elongated shape - significantly wider at front (output) than back
 * The asymmetry indicates the broad beam spread
 * Width: 52, Height: 36
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
	showFrontIndicator: true,
	category: 'cyc',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Spot) symbol
 * Circle representing the head with yoke arms on sides
 * "M" marking in center indicates Moving light
 * Width/Height: 48
 */
const MOVING_SPOT_SYMBOL: SymbolDefinition = {
	// Main head (circle)
	path: 'M 0 -16 A 16 16 0 1 1 0 16 A 16 16 0 1 1 0 -16 Z',
	// Yoke arms (distinctive for moving lights)
	detailPaths: [
		// Left yoke arm
		'M -16 -8 L -24 -8 L -24 8 L -16 8',
		// Right yoke arm
		'M 16 -8 L 24 -8 L 24 8 L 16 8',
		// "M" indicator in center
		'M -7 7 L -7 -5 L 0 3 L 7 -5 L 7 7'
	],
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: true,
	category: 'moving',
	defaultFill: '#e8e8e8',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Wash) symbol
 * Circle with yoke indication and "W" marking
 */
const MOVING_WASH_SYMBOL: SymbolDefinition = {
	path: 'M 0 -16 A 16 16 0 1 1 0 16 A 16 16 0 1 1 0 -16 Z',
	detailPaths: [
		// Yoke arms
		'M -16 -8 L -24 -8 L -24 8 L -16 8',
		'M 16 -8 L 24 -8 L 24 8 L 16 8',
		// "W" indicator in center
		'M -7 -5 L -4 7 L 0 0 L 4 7 L 7 -5'
	],
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: true,
	category: 'moving',
	defaultFill: '#e8e8e8',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Beam) symbol
 * Circle with yoke and "B" marking
 */
const MOVING_BEAM_SYMBOL: SymbolDefinition = {
	path: 'M 0 -16 A 16 16 0 1 1 0 16 A 16 16 0 1 1 0 -16 Z',
	detailPaths: [
		// Yoke arms
		'M -16 -8 L -24 -8 L -24 8 L -16 8',
		'M 16 -8 L 24 -8 L 24 8 L 16 8',
		// "B" indicator - vertical line with two bumps
		'M -4 -7 L -4 7',
		'M -4 -7 C 6 -7 6 0 -4 0',
		'M -4 0 C 6 0 6 7 -4 7'
	],
	width: 52,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -20 },
	showFrontIndicator: true,
	category: 'moving',
	defaultFill: '#e8e8e8',
	defaultStroke: '#000000'
};

/**
 * LED PAR symbol
 * Circle with LED dot pattern (honeycomb-style arrangement)
 * Smaller filled circles represent individual LEDs
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
	showFrontIndicator: true,
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
	showFrontIndicator: true,
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

/**
 * Followspot symbol
 * Large elongated oval (barrel) with tripod stand indication
 * The shape should suggest a long barrel mounted on a stand
 * Width: 36, Height: 88
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
	showFrontIndicator: true,
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
	showFrontIndicator: true,
	category: 'other',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Complete symbol registry
 * Maps each instrument type to its symbol definition
 */
export const SYMBOLS: SymbolRegistry = {
	// Ellipsoidals - all use the same base shape
	'ers-19': { ...ERS_SYMBOL, category: 'ellipsoidal' },
	'ers-26': { ...ERS_SYMBOL, category: 'ellipsoidal' },
	'ers-36': { ...ERS_SYMBOL, category: 'ellipsoidal' },
	'ers-50': { ...ERS_SYMBOL, category: 'ellipsoidal' },

	// PARs - same shape, could vary by size
	'par-64': { ...PAR_SYMBOL, category: 'par' },
	'par-56': { ...PAR_SYMBOL, category: 'par', width: 36, height: 36 },
	'par-38': { ...PAR_SYMBOL, category: 'par', width: 30, height: 30 },

	// Fresnels
	'fresnel-6': { ...FRESNEL_SYMBOL, category: 'fresnel' },
	'fresnel-8': { ...FRESNEL_SYMBOL, category: 'fresnel', width: 50, height: 50 },

	// Cyc light
	'cyc-light': CYC_LIGHT_SYMBOL,

	// Moving lights
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
