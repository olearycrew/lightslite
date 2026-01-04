/**
 * Stores
 *
 * Re-exports all Svelte stores for cleaner imports.
 */

// Core stores
export { viewport, type ViewportState, type Bounds } from './viewport.svelte';
export { grid, GRID_SPACING_PRESETS, type GridUnit, type GridState } from './grid.svelte';
export { selection, type SelectionType, type SelectableItem } from './selection.svelte';
export { tool, TOOL_NAMES, type ToolType } from './tool.svelte';
export {
	project,
	type HangingPositionType,
	type BaseCanvasObject,
	type ShapeObject,
	type HangingPositionObject,
	type InstrumentObject,
	type SetPieceObject,
	type AnnotationObject,
	type CanvasObject
} from './project.svelte';

// History store (for undo/redo)
export {
	history,
	type HistoryActionType,
	type HistoryEntry,
	type HistoryConfig
} from './history.svelte';

// Derived stores
export {
	instruments,
	type InstrumentWithPosition,
	type InstrumentsByPosition
} from './derived/instruments.svelte';

export {
	positions,
	type HangingPositionWithDetails,
	type PositionsByType
} from './derived/positions.svelte';

export { layers, type Layer, type LayerType, type LayerWithCounts } from './derived/layers.svelte';

// Re-export derived stores index for convenience
export * from './derived';
