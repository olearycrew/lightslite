/**
 * Grid Store
 *
 * Manages grid settings for the canvas viewport.
 * Supports configurable spacing, units, and snap-to-grid functionality.
 */

// Unit types for grid measurements
export type GridUnit = 'feet' | 'meters';

// Default configuration
const DEFAULT_SPACING = 1; // 1 foot or 1 meter
const DEFAULT_UNIT: GridUnit = 'feet';
const PIXELS_PER_FOOT = 48; // Base scale: 48 pixels = 1 foot at zoom 1x
const PIXELS_PER_METER = PIXELS_PER_FOOT * 3.28084; // ~157.5 pixels per meter

// Grid spacing presets (in base units)
export const GRID_SPACING_PRESETS = [
	{ label: '6"', value: 0.5, unit: 'feet' as GridUnit },
	{ label: "1'", value: 1, unit: 'feet' as GridUnit },
	{ label: "2'", value: 2, unit: 'feet' as GridUnit },
	{ label: "5'", value: 5, unit: 'feet' as GridUnit },
	{ label: '0.5m', value: 0.5, unit: 'meters' as GridUnit },
	{ label: '1m', value: 1, unit: 'meters' as GridUnit },
	{ label: '2m', value: 2, unit: 'meters' as GridUnit }
];

/**
 * Grid state interface for external consumption
 */
export interface GridState {
	spacing: number;
	unit: GridUnit;
	showGrid: boolean;
	showCenterLine: boolean;
	showPlasterLine: boolean;
	snapToGrid: boolean;
	pixelsPerUnit: number;
	gridSpacingPixels: number;
}

/**
 * Creates a grid store with configurable settings
 */
function createGridStore() {
	// Reactive state using Svelte 5 runes
	let spacing = $state(DEFAULT_SPACING);
	let unit = $state<GridUnit>(DEFAULT_UNIT);
	let showGrid = $state(true);
	let showCenterLine = $state(true);
	let showPlasterLine = $state(true);
	let snapToGrid = $state(true);

	// Derived: pixels per unit based on current unit type
	const pixelsPerUnit = $derived(unit === 'feet' ? PIXELS_PER_FOOT : PIXELS_PER_METER);

	// Derived: grid spacing in pixels
	const gridSpacingPixels = $derived(spacing * pixelsPerUnit);

	// Derived: major grid interval (every 5 units for feet, every 5 units for meters)
	const majorGridInterval = $derived(unit === 'feet' ? 5 : 5);

	// Derived: major grid spacing in pixels
	const majorGridSpacingPixels = $derived(majorGridInterval * pixelsPerUnit);

	/**
	 * Set grid spacing value
	 * @param newSpacing - Spacing in current units (e.g., 1 = 1 foot or 1 meter)
	 */
	function setSpacing(newSpacing: number) {
		if (newSpacing > 0) {
			spacing = newSpacing;
		}
	}

	/**
	 * Set grid unit type
	 * @param newUnit - Unit type ('feet' or 'meters')
	 */
	function setUnit(newUnit: GridUnit) {
		unit = newUnit;
	}

	/**
	 * Toggle grid visibility
	 */
	function toggleGrid() {
		showGrid = !showGrid;
	}

	/**
	 * Toggle snap to grid
	 */
	function toggleSnap() {
		snapToGrid = !snapToGrid;
	}

	/**
	 * Toggle center line visibility
	 */
	function toggleCenterLine() {
		showCenterLine = !showCenterLine;
	}

	/**
	 * Toggle plaster line visibility
	 */
	function togglePlasterLine() {
		showPlasterLine = !showPlasterLine;
	}

	/**
	 * Snap a point to the grid if snapping is enabled
	 * @param x - X coordinate in world space
	 * @param y - Y coordinate in world space
	 * @returns Snapped coordinates (or original if snap disabled)
	 */
	function snapPoint(x: number, y: number): { x: number; y: number } {
		if (!snapToGrid) {
			return { x, y };
		}

		// Snap to nearest grid intersection
		const gridSize = gridSpacingPixels;
		return {
			x: Math.round(x / gridSize) * gridSize,
			y: Math.round(y / gridSize) * gridSize
		};
	}

	/**
	 * Snap a point to grid, center line, or plaster line with magnetism
	 * @param x - X coordinate in world space
	 * @param y - Y coordinate in world space
	 * @param magnetDistance - Distance in pixels for magnetic snap (default 10)
	 * @returns Snapped coordinates with info about what it snapped to
	 */
	function snapPointWithGuides(
		x: number,
		y: number,
		magnetDistance = 10
	): { x: number; y: number; snappedToCenter: boolean; snappedToPlaster: boolean } {
		let snappedX = x;
		let snappedY = y;
		let snappedToCenter = false;
		let snappedToPlaster = false;

		// Magnetic snap to center line (x = 0)
		if (showCenterLine && Math.abs(x) < magnetDistance) {
			snappedX = 0;
			snappedToCenter = true;
		}

		// Magnetic snap to plaster line (y = 0)
		if (showPlasterLine && Math.abs(y) < magnetDistance) {
			snappedY = 0;
			snappedToPlaster = true;
		}

		// If not snapped to guides and grid snap is enabled, snap to grid
		if (!snappedToCenter && snapToGrid) {
			const gridSize = gridSpacingPixels;
			snappedX = Math.round(x / gridSize) * gridSize;
		}

		if (!snappedToPlaster && snapToGrid) {
			const gridSize = gridSpacingPixels;
			snappedY = Math.round(y / gridSize) * gridSize;
		}

		return { x: snappedX, y: snappedY, snappedToCenter, snappedToPlaster };
	}

	/**
	 * Get the current grid state as a plain object
	 */
	function getState(): GridState {
		return {
			spacing,
			unit,
			showGrid,
			showCenterLine,
			showPlasterLine,
			snapToGrid,
			pixelsPerUnit,
			gridSpacingPixels
		};
	}

	return {
		// State getters
		get spacing() {
			return spacing;
		},
		get unit() {
			return unit;
		},
		get showGrid() {
			return showGrid;
		},
		get showCenterLine() {
			return showCenterLine;
		},
		get showPlasterLine() {
			return showPlasterLine;
		},
		get snapToGrid() {
			return snapToGrid;
		},
		get pixelsPerUnit() {
			return pixelsPerUnit;
		},
		get gridSpacingPixels() {
			return gridSpacingPixels;
		},
		get majorGridInterval() {
			return majorGridInterval;
		},
		get majorGridSpacingPixels() {
			return majorGridSpacingPixels;
		},

		// Actions
		setSpacing,
		setUnit,
		toggleGrid,
		toggleSnap,
		toggleCenterLine,
		togglePlasterLine,

		// Snapping utilities
		snapPoint,
		snapPointWithGuides,

		// State export
		getState,

		// Constants for external use
		PIXELS_PER_FOOT,
		PIXELS_PER_METER
	};
}

// Export singleton instance
export const grid = createGridStore();
