/**
 * Batch Commands
 *
 * Command implementation for batch/composite operations.
 * Used when multiple operations should be treated as a single undo/redo step.
 */

import type { UndoableCommand } from './types';
import type { HistoryActionType } from '$lib/stores/history.svelte';

// ============================================================================
// Batch Command
// ============================================================================

/**
 * Create a batch command that wraps multiple commands into one undo/redo step
 * Commands are executed in order and undone in reverse order
 */
export function createBatchCommand(
	commands: UndoableCommand[],
	description?: string
): UndoableCommand {
	if (commands.length === 0) {
		throw new Error('Batch command requires at least one command');
	}

	// Collect all affected IDs
	const allAffectedIds = [...new Set(commands.flatMap((c) => c.affectedObjectIds))];

	// Determine the batch type based on contained commands
	const type = determineBatchType(commands);

	// Generate description if not provided
	const finalDescription = description ?? generateBatchDescription(commands);

	return {
		type,
		description: finalDescription,
		affectedObjectIds: allAffectedIds,
		execute() {
			// Execute commands in forward order
			for (const command of commands) {
				command.execute();
			}
		},
		undo() {
			// Undo commands in reverse order
			for (let i = commands.length - 1; i >= 0; i--) {
				commands[i].undo();
			}
		}
	};
}

// ============================================================================
// Sequential Command Helper
// ============================================================================

/**
 * Execute multiple operations as a single undoable action
 * This is a convenience function for manually defined execute/undo functions
 */
export function createCompositeCommand(
	description: string,
	affectedObjectIds: string[],
	execute: () => void,
	undo: () => void
): UndoableCommand {
	return {
		type: 'bulk-update',
		description,
		affectedObjectIds,
		execute,
		undo
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine the batch type from contained commands
 */
function determineBatchType(commands: UndoableCommand[]): HistoryActionType {
	const types = new Set(commands.map((c) => c.type));

	// If all same type, use the bulk version
	if (types.size === 1) {
		const type = commands[0].type;
		switch (type) {
			case 'create':
				return 'bulk-create';
			case 'delete':
				return 'bulk-delete';
			case 'update':
				return 'bulk-update';
			case 'move':
				return 'bulk-move';
			default:
				return type;
		}
	}

	// Mixed types - use bulk-update as a catch-all
	return 'bulk-update';
}

/**
 * Generate a description for a batch command
 */
function generateBatchDescription(commands: UndoableCommand[]): string {
	const count = commands.length;

	if (count === 1) {
		return commands[0].description;
	}

	// Check if all same type
	const types = new Set(commands.map((c) => c.type));
	if (types.size === 1) {
		const type = commands[0].type;
		switch (type) {
			case 'create':
			case 'bulk-create':
				return `Create ${count} objects`;
			case 'delete':
			case 'bulk-delete':
				return `Delete ${count} objects`;
			case 'update':
			case 'bulk-update':
				return `Update ${count} objects`;
			case 'move':
			case 'bulk-move':
				return `Move ${count} objects`;
		}
	}

	return `${count} operations`;
}

// ============================================================================
// Command Builder for Multi-Select Operations
// ============================================================================

/**
 * Builder class for constructing batch commands
 * Useful for accumulating operations before committing
 */
export class BatchCommandBuilder {
	private commands: UndoableCommand[] = [];
	private customDescription?: string;

	/**
	 * Add a command to the batch
	 */
	add(command: UndoableCommand): this {
		this.commands.push(command);
		return this;
	}

	/**
	 * Add multiple commands to the batch
	 */
	addAll(commands: UndoableCommand[]): this {
		this.commands.push(...commands);
		return this;
	}

	/**
	 * Set a custom description for the batch
	 */
	describe(description: string): this {
		this.customDescription = description;
		return this;
	}

	/**
	 * Check if the builder has any commands
	 */
	isEmpty(): boolean {
		return this.commands.length === 0;
	}

	/**
	 * Get the number of commands
	 */
	count(): number {
		return this.commands.length;
	}

	/**
	 * Build the final batch command
	 * Returns null if no commands were added
	 */
	build(): UndoableCommand | null {
		if (this.commands.length === 0) {
			return null;
		}

		if (this.commands.length === 1 && !this.customDescription) {
			// Single command doesn't need batching
			return this.commands[0];
		}

		return createBatchCommand(this.commands, this.customDescription);
	}

	/**
	 * Clear the builder
	 */
	clear(): void {
		this.commands = [];
		this.customDescription = undefined;
	}
}
