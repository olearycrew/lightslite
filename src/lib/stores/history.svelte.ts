/**
 * History Store
 *
 * Manages undo/redo state for project operations.
 * Uses Svelte 5 runes for reactive state management.
 *
 * This provides the foundation for the undo/redo system.
 * The actual history recording will be implemented in lxl-ar4.4.
 */

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
