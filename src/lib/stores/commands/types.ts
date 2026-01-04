/**
 * Command Types
 *
 * Defines the interfaces and types for the command pattern
 * used in the undo/redo system.
 */

import type {
	ShapeObject,
	HangingPositionObject,
	InstrumentObject,
	SetPieceObject,
	AnnotationObject,
	CanvasObject
} from '$lib/stores/project.svelte';
import type { HistoryActionType } from '$lib/stores/history.svelte';

// ============================================================================
// Command Interface
// ============================================================================

/**
 * Base interface for all undoable commands
 */
export interface UndoableCommand {
	/** Type of the command (maps to HistoryActionType) */
	type: HistoryActionType;
	/** Human-readable description of the action */
	description: string;
	/** IDs of objects affected by this command */
	affectedObjectIds: string[];
	/** Execute the command (apply the change) */
	execute(): void;
	/** Undo the command (reverse the change) */
	undo(): void;
}

// ============================================================================
// Object Snapshots (for storing state before/after changes)
// ============================================================================

/**
 * A snapshot of an object's state for undo/redo
 */
export type ObjectSnapshot =
	| { type: 'shape'; data: ShapeObject }
	| { type: 'hanging-position'; data: HangingPositionObject }
	| { type: 'instrument'; data: InstrumentObject }
	| { type: 'set-piece'; data: SetPieceObject }
	| { type: 'annotation'; data: AnnotationObject };

/**
 * Partial update to an object (for update commands)
 */
export interface ObjectUpdate {
	id: string;
	objectType: CanvasObject['objectType'];
	changes: Record<string, unknown>;
}

// ============================================================================
// Command Data Types (for serialization in history entries)
// ============================================================================

/**
 * Data for create operations
 */
export interface CreateCommandData {
	objectType: CanvasObject['objectType'];
	object: CanvasObject;
}

/**
 * Data for delete operations
 */
export interface DeleteCommandData {
	objectType: CanvasObject['objectType'];
	object: CanvasObject;
	/** For hanging positions, also store any deleted instruments */
	deletedInstruments?: InstrumentObject[];
}

/**
 * Data for update operations
 */
export interface UpdateCommandData {
	id: string;
	objectType: CanvasObject['objectType'];
	previousValues: Record<string, unknown>;
	newValues: Record<string, unknown>;
}

/**
 * Data for move operations
 */
export interface MoveCommandData {
	id: string;
	objectType: CanvasObject['objectType'];
	/** Previous position state */
	previousPosition: Record<string, unknown>;
	/** New position state */
	newPosition: Record<string, unknown>;
}

/**
 * Data for bulk operations
 */
export interface BulkCommandData {
	/** Individual operations in the batch */
	operations: Array<
		| { action: 'create'; data: CreateCommandData }
		| { action: 'delete'; data: DeleteCommandData }
		| { action: 'update'; data: UpdateCommandData }
		| { action: 'move'; data: MoveCommandData }
	>;
}

// ============================================================================
// Command Factory Options
// ============================================================================

/**
 * Options for creating an instrument
 */
export interface AddInstrumentOptions {
	hangingPositionId: string | null;
	positionOnBar: number;
	instrumentType: string;
	x?: number;
	y?: number;
	channel?: number;
	dimmer?: number;
	color?: string;
	focus?: string;
	rotation?: number;
	name?: string;
}

/**
 * Options for creating a hanging position
 */
export interface AddHangingPositionOptions {
	positionType: HangingPositionObject['positionType'];
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	name?: string;
	trimHeight?: number;
	height?: number;
}

/**
 * Position update for move commands
 */
export interface PositionUpdate {
	id: string;
	/** Delta x movement */
	dx: number;
	/** Delta y movement */
	dy: number;
}
