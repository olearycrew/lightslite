/**
 * Symbol SVG Paths
 *
 * SVG path definitions for each lighting instrument type.
 * All symbols are centered at origin (0,0) for easy rotation.
 * Symbols are approximately 40-50 units wide for standard fixtures.
 *
 * USITT standard symbol conventions are followed where possible:
 * - ERS: Rounded rectangle with lens indication, body tapers
 * - PAR: Circle with internal parallel lines
 * - Fresnel: Circle with concentric rings
 * - Cyc Light: Asymmetric elongated shape
 * - Moving Light: Circle with yoke/base indication
 * - LED Par: Circle with LED dot pattern
 */

import type { SymbolDefinition, SymbolRegistry } from './types';

/**
 * ERS (Ellipsoidal) symbol - Leko-style fixture
 * Rounded rectangle body with tapering toward lens end
 * Width: 44, Height: 24
 * Front (lens) is at the top (negative Y)
 */
const ERS_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Body shape: rounded rectangle that tapers toward lens
	path: `
		M -18 12 
		L -18 -4
		Q -18 -8 -14 -8
		L -10 -8
		L -8 -12
		L 8 -12
		L 10 -8
		L 14 -8
		Q 18 -8 18 -4
		L 18 12
		Q 18 14 14 14
		L -14 14
		Q -18 14 -18 12
		Z
	`,
	// Detail: lens barrel indication
	detailPaths: [
		// Lens opening
		'M -6 -12 L -6 -16 L 6 -16 L 6 -12',
		// Focus knob suggestion
		'M -12 0 L -16 0',
		'M 12 0 L 16 0'
	],
	width: 44,
	height: 32,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 24 },
	frontIndicator: { x: 0, y: -18 },
	showFrontIndicator: true,
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * PAR can symbol
 * Circle with parallel lines indicating lamp orientation
 * Width/Height: 40
 */
const PAR_SYMBOL: Omit<SymbolDefinition, 'category'> = {
	// Main circle
	path: 'M 0 -18 A 18 18 0 1 1 0 18 A 18 18 0 1 1 0 -18 Z',
	// Parallel lines for lamp orientation
	detailPaths: ['M -10 -10 L -10 10', 'M 0 -14 L 0 14', 'M 10 -10 L 10 10'],
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
	// Concentric rings
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
 * Asymmetric elongated shape, wider at top for light spread
 * Width: 50, Height: 36
 */
const CYC_LIGHT_SYMBOL: SymbolDefinition = {
	// Asymmetric body - wider at front (output)
	path: `
		M -24 -12
		L -20 -18
		L 20 -18
		L 24 -12
		L 24 14
		Q 24 18 20 18
		L -20 18
		Q -24 18 -24 14
		Z
	`,
	// Internal reflector detail
	detailPaths: ['M -16 -14 L -16 10', 'M 16 -14 L 16 10', 'M -10 -14 L -10 6', 'M 10 -14 L 10 6'],
	width: 52,
	height: 40,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 28 },
	frontIndicator: { x: 0, y: -22 },
	showFrontIndicator: true,
	category: 'cyc',
	defaultFill: '#ffffff',
	defaultStroke: '#000000'
};

/**
 * Moving Light (Spot) symbol
 * Circle with yoke indication and "M" marking
 * Width/Height: 48
 */
const MOVING_SPOT_SYMBOL: SymbolDefinition = {
	// Main head (circle)
	path: 'M 0 -16 A 16 16 0 1 1 0 16 A 16 16 0 1 1 0 -16 Z',
	// Yoke arms and cross
	detailPaths: [
		// Yoke arms
		'M -20 -6 L -16 -6 L -16 6 L -20 6',
		'M 20 -6 L 16 -6 L 16 6 L 20 6',
		// "M" indicator in center
		'M -6 6 L -6 -4 L 0 2 L 6 -4 L 6 6'
	],
	width: 44,
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
		'M -20 -6 L -16 -6 L -16 6 L -20 6',
		'M 20 -6 L 16 -6 L 16 6 L 20 6',
		// "W" indicator in center
		'M -6 -4 L -3 6 L 0 0 L 3 6 L 6 -4'
	],
	width: 44,
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
		'M -20 -6 L -16 -6 L -16 6 L -20 6',
		'M 20 -6 L 16 -6 L 16 6 L 20 6',
		// "B" indicator
		`M -4 -6 L -4 6 M -4 -6 Q 5 -6 5 0 Q 5 6 -4 6 M -4 0 Q 2 0 2 -3`
	],
	width: 44,
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
 * Circle with LED dot pattern
 */
const LED_PAR_SYMBOL: SymbolDefinition = {
	// Main circle
	path: 'M 0 -18 A 18 18 0 1 1 0 18 A 18 18 0 1 1 0 -18 Z',
	// LED dot pattern (honeycomb-style)
	detailPaths: [
		// Center dot
		'M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z',
		// Inner ring of dots
		'M 0 -10 A 2 2 0 1 1 0.01 -10',
		'M 8.66 -5 A 2 2 0 1 1 8.67 -5',
		'M 8.66 5 A 2 2 0 1 1 8.67 5',
		'M 0 10 A 2 2 0 1 1 0.01 10',
		'M -8.66 5 A 2 2 0 1 1 -8.65 5',
		'M -8.66 -5 A 2 2 0 1 1 -8.65 -5'
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
		M -16 -16
		Q -20 -16 -20 -12
		L -20 12
		Q -20 16 -16 16
		L 16 16
		Q 20 16 20 12
		L 20 -12
		Q 20 -16 16 -16
		Z
	`,
	// LED grid pattern
	detailPaths: [
		// 3x3 grid of dots
		'M -8 -8 A 2 2 0 1 1 -7.99 -8',
		'M 0 -8 A 2 2 0 1 1 0.01 -8',
		'M 8 -8 A 2 2 0 1 1 8.01 -8',
		'M -8 0 A 2 2 0 1 1 -7.99 0',
		'M 0 0 A 2 2 0 1 1 0.01 0',
		'M 8 0 A 2 2 0 1 1 8.01 0',
		'M -8 8 A 2 2 0 1 1 -7.99 8',
		'M 0 8 A 2 2 0 1 1 0.01 8',
		'M 8 8 A 2 2 0 1 1 8.01 8'
	],
	width: 44,
	height: 36,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 26 },
	frontIndicator: { x: 0, y: -22 },
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
	// Row of LED dots
	detailPaths: [
		'M -32 0 A 2 2 0 1 1 -31.99 0',
		'M -20 0 A 2 2 0 1 1 -19.99 0',
		'M -8 0 A 2 2 0 1 1 -7.99 0',
		'M 4 0 A 2 2 0 1 1 4.01 0',
		'M 16 0 A 2 2 0 1 1 16.01 0',
		'M 28 0 A 2 2 0 1 1 28.01 0'
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
 * Large elongated oval with stand indication
 * Width: 60, Height: 90 (including stand)
 */
const FOLLOWSPOT_SYMBOL: SymbolDefinition = {
	// Body (elongated oval/barrel)
	path: `
		M -12 -30
		Q -12 -40 0 -40
		Q 12 -40 12 -30
		L 12 10
		Q 12 18 8 18
		L -8 18
		Q -12 18 -12 10
		Z
	`,
	// Stand legs
	detailPaths: [
		// Left leg
		'M -8 18 L -16 40',
		// Right leg
		'M 8 18 L 16 40',
		// Cross brace
		'M -12 30 L 12 30',
		// Lens indication at top
		'M -8 -40 L -8 -44 L 8 -44 L 8 -40'
	],
	width: 36,
	height: 90,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 24, y: 0 },
	frontIndicator: { x: 0, y: -48 },
	showFrontIndicator: true,
	category: 'other',
	defaultFill: '#f0f0f0',
	defaultStroke: '#000000'
};

/**
 * Practical symbol
 * Simple icon representing practical/decorative fixture
 */
const PRACTICAL_SYMBOL: SymbolDefinition = {
	// Lightbulb-esque shape
	path: `
		M 0 -16
		A 12 12 0 1 1 0.01 -16
		M -6 -4 L -6 4 L -8 8 L 8 8 L 6 4 L 6 -4
		M -6 10 L 6 10
		M -4 12 L 4 12
	`,
	detailPaths: [],
	width: 28,
	height: 32,
	origin: { x: 0, y: 0 },
	labelOffset: { x: 0, y: 20 },
	showFrontIndicator: false,
	category: 'other',
	defaultFill: '#fffacd',
	defaultStroke: '#000000'
};

/**
 * Custom symbol
 * Generic rectangle placeholder
 */
const CUSTOM_SYMBOL: SymbolDefinition = {
	path: `
		M -16 -12
		L 16 -12
		L 16 12
		L -16 12
		Z
	`,
	// Diagonal line to indicate "custom"
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
