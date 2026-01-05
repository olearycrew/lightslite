/**
 * Layers Derived Store
 *
 * Manages layer organization for the canvas.
 * Layers control visibility and rendering order of objects.
 *
 * Uses Svelte 5 runes for reactive state management.
 */

import { SvelteMap } from 'svelte/reactivity';
import { project, type CanvasObject } from '../project.svelte';

// ============================================================================
// Types
// ============================================================================

/**
 * Layer definition
 */
export interface Layer {
	/** Unique layer ID */
	id: string;
	/** Display name */
	name: string;
	/** Whether the layer is visible */
	visible: boolean;
	/** Whether objects on this layer are locked (can't be selected/moved) */
	locked: boolean;
	/** Render order (lower = rendered first, appears below) */
	order: number;
	/** Layer color for UI indication */
	color: string;
	/** Layer type for default behavior */
	type: LayerType;
	/** Opacity level (0-1), for "dimmed" state visualization */
	opacity: number;
}

/**
 * Standard layer types
 */
export type LayerType =
	| 'grid'
	| 'stage'
	| 'set-pieces'
	| 'hanging-positions'
	| 'instruments'
	| 'annotations'
	| 'custom';

/**
 * Layer with object counts
 */
export interface LayerWithCounts extends Layer {
	/** Number of objects on this layer */
	objectCount: number;
}

// ============================================================================
// Default Layers
// ============================================================================

const DEFAULT_LAYERS: Layer[] = [
	{
		id: 'layer-grid',
		name: 'Grid',
		visible: true,
		locked: true,
		order: 0,
		color: '#4a5568',
		type: 'grid',
		opacity: 1
	},
	{
		id: 'layer-stage',
		name: 'Stage',
		visible: true,
		locked: false,
		order: 10,
		color: '#805ad5',
		type: 'stage',
		opacity: 1
	},
	{
		id: 'layer-set-pieces',
		name: 'Set Pieces',
		visible: true,
		locked: false,
		order: 20,
		color: '#38a169',
		type: 'set-pieces',
		opacity: 1
	},
	{
		id: 'layer-positions',
		name: 'Hanging Positions',
		visible: true,
		locked: false,
		order: 30,
		color: '#3182ce',
		type: 'hanging-positions',
		opacity: 1
	},
	{
		id: 'layer-instruments',
		name: 'Instruments',
		visible: true,
		locked: false,
		order: 40,
		color: '#dd6b20',
		type: 'instruments',
		opacity: 1
	},
	{
		id: 'layer-annotations',
		name: 'Annotations',
		visible: true,
		locked: false,
		order: 50,
		color: '#e53e3e',
		type: 'annotations',
		opacity: 1
	}
];

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Creates the layers derived store
 */
function createLayersDerivedStore() {
	// Reactive state using Svelte 5 runes
	const layerMap = new SvelteMap<string, Layer>();
	let idCounter = $state(0);

	// Initialize with default layers
	for (const layer of DEFAULT_LAYERS) {
		layerMap.set(layer.id, layer);
	}

	// ========================================================================
	// Derived Values
	// ========================================================================

	// All layers sorted by order
	const layers = $derived([...layerMap.values()].sort((a, b) => a.order - b.order));

	// Only visible layers
	const visibleLayers = $derived(layers.filter((layer) => layer.visible));

	// Layer count
	const count = $derived(layerMap.size);

	// Layers with object counts
	const layersWithCounts = $derived.by((): LayerWithCounts[] => {
		return layers.map((layer) => ({
			...layer,
			objectCount: getObjectCountForLayer(layer)
		}));
	});

	// ========================================================================
	// Helper Functions
	// ========================================================================

	/**
	 * Generate a unique layer ID
	 */
	function generateLayerId(): string {
		idCounter++;
		return `layer-custom-${idCounter}-${Date.now().toString(36)}`;
	}

	/**
	 * Get the object count for a specific layer
	 */
	function getObjectCountForLayer(layer: Layer): number {
		switch (layer.type) {
			case 'grid':
				return 0; // Grid isn't an object
			case 'stage':
				return project.shapes.length; // Shapes are typically stage elements
			case 'set-pieces':
				return project.setPieces.length;
			case 'hanging-positions':
				return project.hangingPositions.length;
			case 'instruments':
				return project.instruments.length;
			case 'annotations':
				return project.annotations.length;
			case 'custom':
				// Count objects that reference this layer
				return project.setPieces.filter((obj) => obj.layer === layer.id).length;
			default:
				return 0;
		}
	}

	/**
	 * Get the default layer for an object type
	 */
	function getDefaultLayerForObjectType(objectType: CanvasObject['objectType']): string {
		switch (objectType) {
			case 'shape':
				return 'layer-stage';
			case 'set-piece':
				return 'layer-set-pieces';
			case 'hanging-position':
				return 'layer-positions';
			case 'instrument':
				return 'layer-instruments';
			case 'annotation':
				return 'layer-annotations';
			default:
				return 'layer-annotations';
		}
	}

	// ========================================================================
	// Layer Management
	// ========================================================================

	/**
	 * Add a new custom layer
	 */
	function addLayer(
		name: string,
		options: Partial<Omit<Layer, 'id' | 'name' | 'type'>> = {}
	): Layer {
		const id = generateLayerId();
		const maxOrder = Math.max(...layers.map((l) => l.order), 0);

		const layer: Layer = {
			id,
			name,
			type: 'custom',
			visible: options.visible ?? true,
			locked: options.locked ?? false,
			order: options.order ?? maxOrder + 10,
			color: options.color ?? '#718096',
			opacity: options.opacity ?? 1
		};

		layerMap.set(id, layer);
		return layer;
	}

	/**
	 * Update a layer
	 */
	function updateLayer(id: string, updates: Partial<Omit<Layer, 'id' | 'type'>>): void {
		const layer = layerMap.get(id);
		if (layer) {
			layerMap.set(id, { ...layer, ...updates });
		}
	}

	/**
	 * Delete a custom layer
	 * Note: Cannot delete default layers
	 */
	function deleteLayer(id: string): boolean {
		const layer = layerMap.get(id);
		if (layer && layer.type === 'custom') {
			layerMap.delete(id);
			return true;
		}
		return false;
	}

	/**
	 * Toggle layer visibility
	 */
	function toggleVisibility(id: string): void {
		const layer = layerMap.get(id);
		if (layer) {
			layerMap.set(id, { ...layer, visible: !layer.visible });
		}
	}

	/**
	 * Toggle layer lock
	 */
	function toggleLock(id: string): void {
		const layer = layerMap.get(id);
		if (layer) {
			layerMap.set(id, { ...layer, locked: !layer.locked });
		}
	}

	/**
	 * Set all layers visible
	 */
	function showAll(): void {
		for (const [id, layer] of layerMap) {
			layerMap.set(id, { ...layer, visible: true });
		}
	}

	/**
	 * Hide all layers except grid
	 */
	function hideAll(): void {
		for (const [id, layer] of layerMap) {
			layerMap.set(id, { ...layer, visible: layer.type === 'grid' });
		}
	}

	/**
	 * Unlock all layers
	 */
	function unlockAll(): void {
		for (const [id, layer] of layerMap) {
			if (layer.type !== 'grid') {
				layerMap.set(id, { ...layer, locked: false });
			}
		}
	}

	/**
	 * Set layer opacity (0-1)
	 */
	function setOpacity(id: string, opacity: number): void {
		const layer = layerMap.get(id);
		if (layer) {
			layerMap.set(id, { ...layer, opacity: Math.max(0, Math.min(1, opacity)) });
		}
	}

	/**
	 * Move a layer up or down in the render order
	 */
	function moveLayer(id: string, direction: 'up' | 'down'): void {
		const sortedLayers = layers;
		const layerIndex = sortedLayers.findIndex((l) => l.id === id);

		if (layerIndex === -1) return;

		const targetIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1;

		if (targetIndex < 0 || targetIndex >= sortedLayers.length) return;

		// Swap orders
		const currentLayer = sortedLayers[layerIndex];
		const targetLayer = sortedLayers[targetIndex];

		const currentOrder = currentLayer.order;
		const targetOrder = targetLayer.order;

		layerMap.set(currentLayer.id, { ...currentLayer, order: targetOrder });
		layerMap.set(targetLayer.id, { ...targetLayer, order: currentOrder });
	}

	// ========================================================================
	// Query Functions
	// ========================================================================

	/**
	 * Get a layer by ID
	 */
	function getById(id: string): Layer | undefined {
		return layerMap.get(id);
	}

	/**
	 * Check if a layer is visible
	 */
	function isVisible(id: string): boolean {
		return layerMap.get(id)?.visible ?? false;
	}

	/**
	 * Check if a layer is locked
	 */
	function isLocked(id: string): boolean {
		return layerMap.get(id)?.locked ?? false;
	}

	/**
	 * Check if a layer type is visible
	 */
	function isTypeVisible(type: LayerType): boolean {
		for (const layer of layerMap.values()) {
			if (layer.type === type && layer.visible) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Reset to default layers
	 */
	function reset(): void {
		layerMap.clear();
		for (const layer of DEFAULT_LAYERS) {
			layerMap.set(layer.id, { ...layer });
		}
		idCounter = 0;
	}

	// ========================================================================
	// Return Store Interface
	// ========================================================================

	return {
		// Derived state getters
		get all() {
			return layers;
		},
		get visible() {
			return visibleLayers;
		},
		get count() {
			return count;
		},
		get withCounts() {
			return layersWithCounts;
		},

		// Layer management
		addLayer,
		updateLayer,
		deleteLayer,
		toggleVisibility,
		toggleLock,
		setOpacity,
		showAll,
		hideAll,
		unlockAll,
		moveLayer,
		reset,

		// Query functions
		getById,
		isVisible,
		isLocked,
		isTypeVisible,
		getDefaultLayerForObjectType,

		// Constants
		DEFAULT_LAYERS,
		LAYER_TYPES: [
			'grid',
			'stage',
			'set-pieces',
			'hanging-positions',
			'instruments',
			'annotations',
			'custom'
		] as LayerType[]
	};
}

// Export singleton instance
export const layers = createLayersDerivedStore();
