/**
 * Selection Store
 *
 * Manages selection state for canvas objects.
 * Supports single selection, multi-selection, and marquee selection.
 * Uses Svelte 5 runes for reactive state management.
 */

import { SvelteMap } from 'svelte/reactivity';

// Types of selectable objects
export type SelectionType =
	| 'instrument'
	| 'hanging-position'
	| 'set-piece'
	| 'annotation'
	| 'mixed'
	| null;

/**
 * Represents a selectable object with its type
 */
export interface SelectableItem {
	id: string;
	type: Exclude<SelectionType, 'mixed' | null>;
}

/**
 * Creates a selection store with comprehensive selection operations
 */
function createSelectionStore() {
	// Reactive state using Svelte 5 runes
	// Store selected IDs in a SvelteMap for reactivity and O(1) lookup
	const selectedItems = new SvelteMap<string, Exclude<SelectionType, 'mixed' | null>>();

	// Derived: array of selected IDs
	const selectedIds = $derived([...selectedItems.keys()]);

	// Derived: number of selected items
	const selectionCount = $derived(selectedItems.size);

	// Derived: whether anything is selected
	const hasSelection = $derived(selectedItems.size > 0);

	// Derived: whether exactly one item is selected
	const isSingleSelection = $derived(selectedItems.size === 1);

	// Derived: current selection type (for type-specific operations)
	const selectionType = $derived.by((): SelectionType => {
		if (selectedItems.size === 0) return null;

		const types = new Set(selectedItems.values());
		if (types.size === 1) {
			return [...types][0];
		}
		return 'mixed';
	});

	/**
	 * Check if a specific item is selected
	 * @param id - ID of the item to check
	 * @returns true if the item is selected
	 */
	function isSelected(id: string): boolean {
		return selectedItems.has(id);
	}

	/**
	 * Clear all selections and select a single item
	 * @param id - ID of the item to select
	 * @param type - Type of the item being selected
	 */
	function select(id: string, type: Exclude<SelectionType, 'mixed' | null>) {
		selectedItems.clear();
		selectedItems.set(id, type);
	}

	/**
	 * Add an item to the existing selection (shift+click behavior)
	 * @param id - ID of the item to add
	 * @param type - Type of the item being added
	 */
	function addToSelection(id: string, type: Exclude<SelectionType, 'mixed' | null>) {
		selectedItems.set(id, type);
	}

	/**
	 * Remove an item from the selection
	 * @param id - ID of the item to remove
	 */
	function removeFromSelection(id: string) {
		selectedItems.delete(id);
	}

	/**
	 * Toggle an item's selection state (ctrl/cmd+click behavior)
	 * @param id - ID of the item to toggle
	 * @param type - Type of the item (required for adding to selection)
	 */
	function toggleSelection(id: string, type: Exclude<SelectionType, 'mixed' | null>) {
		if (selectedItems.has(id)) {
			selectedItems.delete(id);
		} else {
			selectedItems.set(id, type);
		}
	}

	/**
	 * Select multiple items (marquee select behavior)
	 * @param items - Array of items to select
	 * @param additive - If true, add to existing selection; if false, replace
	 */
	function selectMultiple(items: SelectableItem[], additive = false) {
		if (!additive) {
			selectedItems.clear();
		}
		for (const item of items) {
			selectedItems.set(item.id, item.type);
		}
	}

	/**
	 * Clear all selections
	 */
	function clearSelection() {
		selectedItems.clear();
	}

	/**
	 * Select all items from a provided list
	 * This should be called with items from the currently visible layers
	 * @param items - Array of all items to select
	 */
	function selectAll(items: SelectableItem[]) {
		selectedItems.clear();
		for (const item of items) {
			selectedItems.set(item.id, item.type);
		}
	}

	/**
	 * Get the type of a selected item
	 * @param id - ID of the item
	 * @returns The type of the item, or null if not selected
	 */
	function getSelectedType(id: string): Exclude<SelectionType, 'mixed' | null> | null {
		return selectedItems.get(id) ?? null;
	}

	return {
		// Derived state getters
		get selectedIds() {
			return selectedIds;
		},
		get selectionCount() {
			return selectionCount;
		},
		get hasSelection() {
			return hasSelection;
		},
		get isSingleSelection() {
			return isSingleSelection;
		},
		get selectionType() {
			return selectionType;
		},

		// Query methods
		isSelected,
		getSelectedType,

		// Actions
		select,
		addToSelection,
		removeFromSelection,
		toggleSelection,
		selectMultiple,
		selectAll,
		clearSelection
	};
}

// Export singleton instance
export const selection = createSelectionStore();
