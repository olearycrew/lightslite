/**
 * Hanging Position Commands
 *
 * Command implementations for hanging position-related operations.
 */

import {
	project,
	type HangingPositionObject,
	type InstrumentObject
} from '$lib/stores/project.svelte';
import type { UndoableCommand, UpdateCommandData, MoveCommandData } from './types';

// ============================================================================
// Add Hanging Position Command
// ============================================================================

/**
 * Create a command to add a hanging position
 */
export function createAddHangingPositionCommand(position: HangingPositionObject): UndoableCommand {
	return {
		type: 'create',
		description: `Add ${position.positionType} "${position.name}"`,
		affectedObjectIds: [position.id],
		execute() {
			restoreHangingPosition(position);
		},
		undo() {
			// Delete any instruments on this position before deleting the position
			project.deleteHangingPosition(position.id);
		}
	};
}

// ============================================================================
// Remove Hanging Position Command
// ============================================================================

/**
 * Create a command to remove a hanging position
 * This also captures any instruments on the position for proper undo
 */
export function createRemoveHangingPositionCommand(
	position: HangingPositionObject,
	instrumentsOnPosition: InstrumentObject[] = []
): UndoableCommand {
	// Capture full state
	const savedPosition = { ...position };
	const savedInstruments = instrumentsOnPosition.map((i) => ({ ...i }));

	return {
		type: 'delete',
		description: `Delete ${position.positionType} "${position.name}"`,
		affectedObjectIds: [position.id, ...instrumentsOnPosition.map((i) => i.id)],
		execute() {
			// deleteHangingPosition also deletes instruments on the position
			project.deleteHangingPosition(position.id);
		},
		undo() {
			// First restore the position
			restoreHangingPosition(savedPosition);
			// Then restore the instruments
			for (const instrument of savedInstruments) {
				restoreInstrumentOnPosition(instrument);
			}
		}
	};
}

// ============================================================================
// Update Hanging Position Command
// ============================================================================

/**
 * Create a command to update hanging position properties
 */
export function createUpdateHangingPositionCommand(
	id: string,
	previousValues: Partial<HangingPositionObject>,
	newValues: Partial<HangingPositionObject>
): UndoableCommand {
	const position = project.getObject(id) as HangingPositionObject | null;
	const name = position?.name ?? 'Position';
	const positionType = position?.positionType ?? 'position';

	// Determine a human-readable description
	const changedKeys = Object.keys(newValues);
	let description = `Update ${positionType} "${name}"`;
	if (changedKeys.length === 1) {
		const key = changedKeys[0];
		description = `Change ${positionType} ${key}`;
	}

	const data: UpdateCommandData = {
		id,
		objectType: 'hanging-position',
		previousValues: previousValues as Record<string, unknown>,
		newValues: newValues as Record<string, unknown>
	};

	return {
		type: 'update',
		description,
		affectedObjectIds: [id],
		execute() {
			project.updateHangingPosition(data.id, data.newValues as Partial<HangingPositionObject>);
		},
		undo() {
			project.updateHangingPosition(data.id, data.previousValues as Partial<HangingPositionObject>);
		}
	};
}

// ============================================================================
// Move Hanging Position Command
// ============================================================================

/**
 * Create a command to move a hanging position
 */
export function createMoveHangingPositionCommand(
	id: string,
	previousPosition: { x1: number; y1: number; x2: number; y2: number },
	newPosition: { x1: number; y1: number; x2: number; y2: number }
): UndoableCommand {
	const position = project.getObject(id) as HangingPositionObject | null;
	const name = position?.name ?? 'Position';
	const positionType = position?.positionType ?? 'position';

	const data: MoveCommandData = {
		id,
		objectType: 'hanging-position',
		previousPosition: previousPosition as Record<string, unknown>,
		newPosition: newPosition as Record<string, unknown>
	};

	return {
		type: 'move',
		description: `Move ${positionType} "${name}"`,
		affectedObjectIds: [id],
		execute() {
			project.updateHangingPosition(data.id, data.newPosition as Partial<HangingPositionObject>);
		},
		undo() {
			project.updateHangingPosition(
				data.id,
				data.previousPosition as Partial<HangingPositionObject>
			);
		}
	};
}

// ============================================================================
// Resize Hanging Position Command
// ============================================================================

/**
 * Create a command to resize a hanging position
 * Similar to move but with different description
 */
export function createResizeHangingPositionCommand(
	id: string,
	previousPosition: { x1: number; y1: number; x2: number; y2: number },
	newPosition: { x1: number; y1: number; x2: number; y2: number }
): UndoableCommand {
	const position = project.getObject(id) as HangingPositionObject | null;
	const name = position?.name ?? 'Position';
	const positionType = position?.positionType ?? 'position';

	const data: MoveCommandData = {
		id,
		objectType: 'hanging-position',
		previousPosition: previousPosition as Record<string, unknown>,
		newPosition: newPosition as Record<string, unknown>
	};

	return {
		type: 'update',
		description: `Resize ${positionType} "${name}"`,
		affectedObjectIds: [id],
		execute() {
			project.updateHangingPosition(data.id, data.newPosition as Partial<HangingPositionObject>);
		},
		undo() {
			project.updateHangingPosition(
				data.id,
				data.previousPosition as Partial<HangingPositionObject>
			);
		}
	};
}

// ============================================================================
// Bulk Hanging Position Commands
// ============================================================================

/**
 * Create a command to remove multiple hanging positions
 */
export function createBulkRemoveHangingPositionsCommand(
	positions: Array<{
		position: HangingPositionObject;
		instruments: InstrumentObject[];
	}>
): UndoableCommand {
	// Capture full state
	const savedData = positions.map((p) => ({
		position: { ...p.position },
		instruments: p.instruments.map((i) => ({ ...i }))
	}));

	const allIds = positions.flatMap((p) => [p.position.id, ...p.instruments.map((i) => i.id)]);

	return {
		type: 'bulk-delete',
		description: `Delete ${positions.length} positions`,
		affectedObjectIds: allIds,
		execute() {
			for (const { position } of positions) {
				project.deleteHangingPosition(position.id);
			}
		},
		undo() {
			for (const { position, instruments } of savedData) {
				restoreHangingPosition(position);
				for (const instrument of instruments) {
					restoreInstrumentOnPosition(instrument);
				}
			}
		}
	};
}

/**
 * Create a command to update multiple hanging positions
 */
export function createBulkUpdateHangingPositionsCommand(
	updates: Array<{
		id: string;
		previousValues: Partial<HangingPositionObject>;
		newValues: Partial<HangingPositionObject>;
	}>
): UndoableCommand {
	return {
		type: 'bulk-update',
		description: `Update ${updates.length} positions`,
		affectedObjectIds: updates.map((u) => u.id),
		execute() {
			for (const update of updates) {
				project.updateHangingPosition(update.id, update.newValues);
			}
		},
		undo() {
			for (const update of updates) {
				project.updateHangingPosition(update.id, update.previousValues);
			}
		}
	};
}

/**
 * Create a command to move multiple hanging positions
 */
export function createBulkMoveHangingPositionsCommand(
	moves: Array<{
		id: string;
		previousPosition: { x1: number; y1: number; x2: number; y2: number };
		newPosition: { x1: number; y1: number; x2: number; y2: number };
	}>
): UndoableCommand {
	return {
		type: 'bulk-move',
		description: `Move ${moves.length} positions`,
		affectedObjectIds: moves.map((m) => m.id),
		execute() {
			for (const move of moves) {
				project.updateHangingPosition(move.id, move.newPosition);
			}
		},
		undo() {
			for (const move of moves) {
				project.updateHangingPosition(move.id, move.previousPosition);
			}
		}
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Restore a hanging position (used during undo)
 */
function restoreHangingPosition(position: HangingPositionObject): void {
	// For now, we add a new position with the stored properties
	// Ideally, the project store would support restoring with a specific ID
	project.addHangingPosition(
		position.positionType,
		position.x1,
		position.y1,
		position.x2,
		position.y2,
		{
			name: position.name,
			locked: position.locked,
			visible: position.visible,
			trimHeight: position.trimHeight,
			height: position.height,
			labelOffsetX: position.labelOffsetX,
			labelOffsetY: position.labelOffsetY
		}
	);
}

/**
 * Restore an instrument on a position (used during undo of position deletion)
 */
function restoreInstrumentOnPosition(instrument: InstrumentObject): void {
	if (instrument.hangingPositionId) {
		project.addInstrument(
			instrument.hangingPositionId,
			instrument.positionOnBar,
			instrument.instrumentType,
			{
				name: instrument.name,
				locked: instrument.locked,
				visible: instrument.visible,
				channel: instrument.channel,
				dimmer: instrument.dimmer,
				color: instrument.color,
				focus: instrument.focus,
				rotation: instrument.rotation
			}
		);
	} else {
		project.addFreeInstrument(instrument.x ?? 0, instrument.y ?? 0, instrument.instrumentType, {
			name: instrument.name,
			locked: instrument.locked,
			visible: instrument.visible,
			channel: instrument.channel,
			dimmer: instrument.dimmer,
			color: instrument.color,
			focus: instrument.focus,
			rotation: instrument.rotation
		});
	}
}
