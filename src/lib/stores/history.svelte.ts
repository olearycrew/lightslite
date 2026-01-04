/**
 * History Store
 *
 * Manages undo/redo state for project operations.
 * Uses Svelte 5 runes for reactive state management.
 *
 * Provides:
 * - Undo/redo stack management
 * - Command execution
 * - recordAction helper for undoable operations
 * - Keyboard shortcut setup
 */

import { SvelteMap } from 'svelte/reactivity';
import type { UndoableCommand } from './commands/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Types of operations that can be undone/redone
 */
export type HistoryActionType =
	| 'create'
	| 'delete'
	| 'update'
	| 'move'
	| 'bulk-create'
	| 'bulk-delete'
	| 'bulk-update'
	| 'bulk-move';

/**
 * A single history entry representing an undoable action
 */
export interface HistoryEntry {
	/** Unique ID for this history entry */
	id: string;
	/** Type of action performed */
	type: HistoryActionType;
	/** Human-readable description of the action */
	description: string;
	/** Timestamp when the action was performed */
	timestamp: number;
	/** Data needed to undo this action (previous state) */
	undoData: unknown;
	/** Data needed to redo this action (new state) */
	redoData: unknown;
	/** IDs of objects affected by this action */
	affectedObjectIds: string[];
}

/**
 * Configuration options for the history store
 */
export interface HistoryConfig {
	/** Maximum number of history entries to keep */
	maxEntries: number;
	/** Whether to group rapid operations together */
	groupRapidOperations: boolean;
	/** Time window in ms for grouping rapid operations */
	groupingWindowMs: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: HistoryConfig = {
	maxEntries: 100,
	groupRapidOperations: true,
	groupingWindowMs: 200
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Creates the history store for managing undo/redo state
 */
function createHistoryStore() {
	// Reactive state using Svelte 5 runes
	let undoStack = $state<HistoryEntry[]>([]);
	let redoStack = $state<HistoryEntry[]>([]);
	let config = $state<HistoryConfig>({ ...DEFAULT_CONFIG });
	let idCounter = $state(0);

	// Track whether we're currently executing an undo/redo operation
	let isExecutingHistory = $state(false);

	// Derived: whether undo is available
	const canUndo = $derived(undoStack.length > 0);

	// Derived: whether redo is available
	const canRedo = $derived(redoStack.length > 0);

	// Derived: number of undo steps available
	const undoCount = $derived(undoStack.length);

	// Derived: number of redo steps available
	const redoCount = $derived(redoStack.length);

	// Derived: description of the next undo action
	const nextUndoDescription = $derived(
		undoStack.length > 0 ? undoStack[undoStack.length - 1].description : null
	);

	// Derived: description of the next redo action
	const nextRedoDescription = $derived(redoStack.length > 0 ? redoStack[0].description : null);

	// ========================================================================
	// Helper Functions
	// ========================================================================

	/**
	 * Generate a unique ID for a history entry
	 */
	function generateEntryId(): string {
		idCounter++;
		return `history-${idCounter}-${Date.now().toString(36)}`;
	}

	/**
	 * Trim the undo stack to the maximum allowed entries
	 */
	function trimUndoStack(): void {
		if (undoStack.length > config.maxEntries) {
			undoStack = undoStack.slice(undoStack.length - config.maxEntries);
		}
	}

	// ========================================================================
	// Public API
	// ========================================================================

	/**
	 * Push a new entry onto the history stack
	 * This is called after performing an action that should be undoable
	 *
	 * @param entry - The history entry to record (without id and timestamp)
	 */
	function push(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
		// Don't record during undo/redo execution
		if (isExecutingHistory) return;

		const fullEntry: HistoryEntry = {
			...entry,
			id: generateEntryId(),
			timestamp: Date.now()
		};

		// Check if we should merge with the previous entry (for rapid operations)
		if (config.groupRapidOperations && undoStack.length > 0) {
			const lastEntry = undoStack[undoStack.length - 1];
			const timeSinceLastEntry = fullEntry.timestamp - lastEntry.timestamp;

			// Merge if it's the same type of operation on the same objects within the time window
			if (
				timeSinceLastEntry < config.groupingWindowMs &&
				lastEntry.type === entry.type &&
				lastEntry.affectedObjectIds.length === entry.affectedObjectIds.length &&
				lastEntry.affectedObjectIds.every((id) => entry.affectedObjectIds.includes(id))
			) {
				// Update the last entry instead of creating a new one
				undoStack[undoStack.length - 1] = {
					...lastEntry,
					redoData: entry.redoData, // Keep the latest redo data
					timestamp: fullEntry.timestamp // Update timestamp
				};
				// Clear redo stack since we modified history
				redoStack = [];
				return;
			}
		}

		// Add the new entry to the undo stack
		undoStack = [...undoStack, fullEntry];
		trimUndoStack();

		// Clear the redo stack since we've made a new change
		redoStack = [];
	}

	/**
	 * Get the next undo entry without removing it
	 * Used to retrieve the undo data for executing the undo
	 *
	 * @returns The next undo entry, or null if none available
	 */
	function peekUndo(): HistoryEntry | null {
		return undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;
	}

	/**
	 * Get the next redo entry without removing it
	 * Used to retrieve the redo data for executing the redo
	 *
	 * @returns The next redo entry, or null if none available
	 */
	function peekRedo(): HistoryEntry | null {
		return redoStack.length > 0 ? redoStack[0] : null;
	}

	/**
	 * Move an entry from the undo stack to the redo stack
	 * Call this after successfully executing an undo operation
	 */
	function commitUndo(): void {
		if (undoStack.length === 0) return;

		const entry = undoStack[undoStack.length - 1];
		undoStack = undoStack.slice(0, -1);
		redoStack = [entry, ...redoStack];
	}

	/**
	 * Move an entry from the redo stack to the undo stack
	 * Call this after successfully executing a redo operation
	 */
	function commitRedo(): void {
		if (redoStack.length === 0) return;

		const entry = redoStack[0];
		redoStack = redoStack.slice(1);
		undoStack = [...undoStack, entry];
	}

	/**
	 * Begin an undo/redo operation
	 * Prevents recording during the operation
	 */
	function beginHistoryOperation(): void {
		isExecutingHistory = true;
	}

	/**
	 * End an undo/redo operation
	 */
	function endHistoryOperation(): void {
		isExecutingHistory = false;
	}

	/**
	 * Check if we're currently executing a history operation
	 */
	function isInHistoryOperation(): boolean {
		return isExecutingHistory;
	}

	/**
	 * Clear all history (undo and redo stacks)
	 */
	function clear(): void {
		undoStack = [];
		redoStack = [];
	}

	/**
	 * Clear only the redo stack
	 */
	function clearRedo(): void {
		redoStack = [];
	}

	/**
	 * Update history configuration
	 *
	 * @param newConfig - Partial configuration to update
	 */
	function setConfig(newConfig: Partial<HistoryConfig>): void {
		config = { ...config, ...newConfig };
		trimUndoStack();
	}

	/**
	 * Get all undo entries (for debugging/display)
	 */
	function getUndoEntries(): HistoryEntry[] {
		return [...undoStack];
	}

	/**
	 * Get all redo entries (for debugging/display)
	 */
	function getRedoEntries(): HistoryEntry[] {
		return [...redoStack];
	}

	// ========================================================================
	// Command Execution
	// ========================================================================

	// Store for command references (keyed by entry ID)
	const commandMap = new SvelteMap<string, UndoableCommand>();

	/**
	 * Execute a command and record it for undo/redo
	 * This is the primary way to perform undoable operations
	 *
	 * @param command - The command to execute
	 */
	function executeCommand(command: UndoableCommand): void {
		// Don't record during undo/redo execution
		if (isExecutingHistory) return;

		// Execute the command
		command.execute();

		// Create history entry
		const entryId = generateEntryId();
		const entry: HistoryEntry = {
			id: entryId,
			type: command.type,
			description: command.description,
			timestamp: Date.now(),
			undoData: null, // Command handles its own data
			redoData: null, // Command handles its own data
			affectedObjectIds: command.affectedObjectIds
		};

		// Store command reference
		commandMap.set(entryId, command);

		// Check if we should merge with the previous entry
		if (config.groupRapidOperations && undoStack.length > 0) {
			const lastEntry = undoStack[undoStack.length - 1];
			const timeSinceLastEntry = entry.timestamp - lastEntry.timestamp;

			if (
				timeSinceLastEntry < config.groupingWindowMs &&
				lastEntry.type === command.type &&
				lastEntry.affectedObjectIds.length === command.affectedObjectIds.length &&
				lastEntry.affectedObjectIds.every((id) => command.affectedObjectIds.includes(id))
			) {
				// Get the previous command to create a merged command
				const previousCommand = commandMap.get(lastEntry.id);
				if (previousCommand) {
					// Create a merged command that undoes to original state
					// but executes to latest state
					const mergedCommand: UndoableCommand = {
						type: command.type,
						description: command.description,
						affectedObjectIds: command.affectedObjectIds,
						execute: command.execute,
						undo: previousCommand.undo // Use original undo
					};

					// Update the entry with new timestamp
					undoStack[undoStack.length - 1] = {
						...lastEntry,
						timestamp: entry.timestamp
					};

					// Update command reference
					commandMap.set(lastEntry.id, mergedCommand);

					// Clean up new entry's command reference
					commandMap.delete(entryId);

					// Clear redo stack
					redoStack = [];
					return;
				}
			}
		}

		// Add new entry
		undoStack = [...undoStack, entry];
		trimUndoStack();
		redoStack = [];
	}

	/**
	 * Undo the last action
	 *
	 * @returns true if undo was successful, false if nothing to undo
	 */
	function undo(): boolean {
		if (undoStack.length === 0) return false;

		const entry = undoStack[undoStack.length - 1];
		const command = commandMap.get(entry.id);

		if (!command) {
			console.warn('No command found for history entry:', entry.id);
			// Still remove from stack to prevent infinite loop
			undoStack = undoStack.slice(0, -1);
			return false;
		}

		try {
			beginHistoryOperation();
			command.undo();
			commitUndo();
			return true;
		} catch (error) {
			console.error('Undo failed:', error);
			return false;
		} finally {
			endHistoryOperation();
		}
	}

	/**
	 * Redo the last undone action
	 *
	 * @returns true if redo was successful, false if nothing to redo
	 */
	function redo(): boolean {
		if (redoStack.length === 0) return false;

		const entry = redoStack[0];
		const command = commandMap.get(entry.id);

		if (!command) {
			console.warn('No command found for history entry:', entry.id);
			// Still remove from stack
			redoStack = redoStack.slice(1);
			return false;
		}

		try {
			beginHistoryOperation();
			command.execute();
			commitRedo();
			return true;
		} catch (error) {
			console.error('Redo failed:', error);
			return false;
		} finally {
			endHistoryOperation();
		}
	}

	// ========================================================================
	// Return Store Interface
	// ========================================================================

	return {
		// Derived state getters
		get canUndo() {
			return canUndo;
		},
		get canRedo() {
			return canRedo;
		},
		get undoCount() {
			return undoCount;
		},
		get redoCount() {
			return redoCount;
		},
		get nextUndoDescription() {
			return nextUndoDescription;
		},
		get nextRedoDescription() {
			return nextRedoDescription;
		},

		// Command execution
		executeCommand,
		undo,
		redo,

		// Stack operations
		push,
		peekUndo,
		peekRedo,
		commitUndo,
		commitRedo,

		// History operation guards
		beginHistoryOperation,
		endHistoryOperation,
		isInHistoryOperation,

		// Management
		clear,
		clearRedo,
		setConfig,

		// Debug/display helpers
		getUndoEntries,
		getRedoEntries
	};
}

// Export singleton instance
export const history = createHistoryStore();

// ============================================================================
// Helper Functions (exported)
// ============================================================================

/**
 * Record an action as undoable with simple execute/undo functions
 * This is a convenience wrapper for simple operations
 *
 * @param description - Human-readable description of the action
 * @param affectedObjectIds - IDs of objects affected by this action
 * @param execute - Function to execute/redo the action
 * @param undo - Function to undo the action
 */
export function recordAction(
	description: string,
	affectedObjectIds: string[],
	execute: () => void,
	undo: () => void
): void {
	const command: UndoableCommand = {
		type: 'update',
		description,
		affectedObjectIds,
		execute,
		undo
	};

	// Execute and record
	history.executeCommand(command);
}

/**
 * Record a simple action that just needs execute/undo functions
 * Executes immediately and records for undo
 *
 * @param description - Human-readable description
 * @param execute - Function to execute (called immediately)
 * @param undo - Function to undo
 */
export function recordSimpleAction(
	description: string,
	execute: () => void,
	undo: () => void
): void {
	recordAction(description, [], execute, undo);
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

/**
 * Set up keyboard shortcuts for undo/redo
 * Call this from a component's onMount to enable shortcuts
 *
 * @returns Cleanup function to remove event listeners
 */
export function setupUndoRedoShortcuts(): () => void {
	function handleKeydown(event: KeyboardEvent): void {
		// Check for Ctrl/Cmd key
		const isCtrlOrCmd = event.ctrlKey || event.metaKey;
		if (!isCtrlOrCmd) return;

		// Check for Z key
		if (event.key === 'z' || event.key === 'Z') {
			// Prevent default browser undo/redo
			event.preventDefault();

			if (event.shiftKey) {
				// Ctrl+Shift+Z = Redo
				history.redo();
			} else {
				// Ctrl+Z = Undo
				history.undo();
			}
		}

		// Also support Ctrl+Y for redo (Windows convention)
		if (event.key === 'y' || event.key === 'Y') {
			event.preventDefault();
			history.redo();
		}
	}

	// Check if we're in a browser environment
	if (typeof window !== 'undefined') {
		window.addEventListener('keydown', handleKeydown);

		// Return cleanup function
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	}

	// SSR: return no-op cleanup
	return () => {};
}

// Re-export command type for convenience
export type { UndoableCommand };
