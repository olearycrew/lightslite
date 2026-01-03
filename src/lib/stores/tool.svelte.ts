/**
 * Tool Store
 *
 * Manages the currently active tool for the canvas.
 * Different tools determine how mouse/touch interactions are handled.
 * Uses Svelte 5 runes for reactive state management.
 */

// Available tool types
export type ToolType =
	| 'select'
	| 'pan'
	| 'draw-line'
	| 'draw-rect'
	| 'draw-circle'
	| 'add-electric'
	| 'add-instrument';

// Default tool
const DEFAULT_TOOL: ToolType = 'select';

/**
 * Cursor styles for each tool
 */
const TOOL_CURSORS: Record<ToolType, string> = {
	select: 'default',
	pan: 'grab',
	'draw-line': 'crosshair',
	'draw-rect': 'crosshair',
	'draw-circle': 'crosshair',
	'add-electric': 'copy',
	'add-instrument': 'copy'
};

/**
 * Display names for tools (for UI)
 */
export const TOOL_NAMES: Record<ToolType, string> = {
	select: 'Select',
	pan: 'Pan',
	'draw-line': 'Draw Line',
	'draw-rect': 'Draw Rectangle',
	'draw-circle': 'Draw Circle',
	'add-electric': 'Add Electric',
	'add-instrument': 'Add Instrument'
};

/**
 * Creates a tool store for managing the active tool state
 */
function createToolStore() {
	// Reactive state using Svelte 5 runes
	let activeTool = $state<ToolType>(DEFAULT_TOOL);

	// Track whether we're in a temporary tool state (e.g., spacebar pan)
	let previousTool = $state<ToolType | null>(null);

	// Derived cursor style based on active tool
	const cursor = $derived(TOOL_CURSORS[activeTool]);

	// Derived: whether the current tool is a drawing tool
	const isDrawingTool = $derived(
		activeTool === 'draw-line' || activeTool === 'draw-rect' || activeTool === 'draw-circle'
	);

	// Derived: whether the current tool is an object placement tool
	const isPlacementTool = $derived(
		activeTool === 'add-electric' || activeTool === 'add-instrument'
	);

	// Derived: whether the current tool is the select tool
	const isSelectTool = $derived(activeTool === 'select');

	// Derived: whether the current tool is the pan tool
	const isPanTool = $derived(activeTool === 'pan');

	/**
	 * Set the active tool
	 * @param tool - The tool to activate
	 */
	function setTool(tool: ToolType) {
		previousTool = null; // Clear any temporary state
		activeTool = tool;
	}

	/**
	 * Reset to the default select tool
	 */
	function resetToSelect() {
		previousTool = null;
		activeTool = DEFAULT_TOOL;
	}

	/**
	 * Temporarily switch to a tool (e.g., spacebar pan)
	 * Stores the current tool to restore later
	 * @param tool - The tool to temporarily activate
	 */
	function setTemporaryTool(tool: ToolType) {
		if (previousTool === null) {
			previousTool = activeTool;
		}
		activeTool = tool;
	}

	/**
	 * Restore the previous tool after a temporary switch
	 */
	function restorePreviousTool() {
		if (previousTool !== null) {
			activeTool = previousTool;
			previousTool = null;
		}
	}

	/**
	 * Check if we're in a temporary tool state
	 */
	function isTemporaryState(): boolean {
		return previousTool !== null;
	}

	return {
		// State getters
		get activeTool() {
			return activeTool;
		},
		get cursor() {
			return cursor;
		},
		get isDrawingTool() {
			return isDrawingTool;
		},
		get isPlacementTool() {
			return isPlacementTool;
		},
		get isSelectTool() {
			return isSelectTool;
		},
		get isPanTool() {
			return isPanTool;
		},

		// Actions
		setTool,
		resetToSelect,
		setTemporaryTool,
		restorePreviousTool,
		isTemporaryState,

		// Constants for external use
		TOOL_CURSORS,
		TOOL_NAMES
	};
}

// Export singleton instance
export const tool = createToolStore();
