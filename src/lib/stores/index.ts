/**
 * Stores
 *
 * Re-exports all Svelte stores for cleaner imports.
 */

// Core stores
export { viewport, type ViewportState, type Bounds } from './viewport.svelte';
export {
	connection,
	type ConnectionStatus,
	type ConnectionToast,
	type ConnectionState
} from './connection.svelte';
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
	recordAction,
	recordSimpleAction,
	setupUndoRedoShortcuts,
	type HistoryActionType,
	type HistoryEntry,
	type HistoryConfig,
	type UndoableCommand
} from './history.svelte';

// Command pattern implementations
export {
	// Types
	type ObjectSnapshot,
	type ObjectUpdate,
	type CreateCommandData,
	type DeleteCommandData,
	type UpdateCommandData,
	type MoveCommandData,
	type BulkCommandData,
	type AddInstrumentOptions,
	type AddHangingPositionOptions,
	type PositionUpdate,
	// Instrument commands
	createAddInstrumentCommand,
	createRemoveInstrumentCommand,
	createUpdateInstrumentCommand,
	createMoveInstrumentCommand,
	createBulkRemoveInstrumentsCommand,
	createBulkUpdateInstrumentsCommand,
	createBulkMoveInstrumentsCommand,
	// Hanging position commands
	createAddHangingPositionCommand,
	createRemoveHangingPositionCommand,
	createUpdateHangingPositionCommand,
	createMoveHangingPositionCommand,
	createResizeHangingPositionCommand,
	createBulkRemoveHangingPositionsCommand,
	createBulkUpdateHangingPositionsCommand,
	createBulkMoveHangingPositionsCommand,
	// Batch commands
	createBatchCommand,
	createCompositeCommand,
	BatchCommandBuilder
} from './commands';

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
