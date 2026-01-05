<script lang="ts">
	/**
	 * KeyboardShortcuts Component
	 *
	 * Global keyboard shortcut handler for the lighting plot editor.
	 * Integrates with stores for tool switching, undo/redo, delete, etc.
	 *
	 * This is a renderless component - it only manages keyboard events.
	 */
	import { onMount } from 'svelte';
	import {
		createKeyboardManager,
		registerSpaceKeyHandlers,
		type ShortcutHandlers
	} from '$lib/utils/keyboard';
	import { tool } from '$lib/stores/tool.svelte';
	import { history } from '$lib/stores/history.svelte';
	import { selection } from '$lib/stores/selection.svelte';
	import { project } from '$lib/stores/project.svelte';
	import { viewport } from '$lib/stores/viewport.svelte';

	interface Props {
		/** Optional callback when save is triggered */
		onSave?: () => void;
		/** Optional callback when export is triggered */
		onExport?: () => void;
	}

	let { onSave, onExport }: Props = $props();

	// Get viewport dimensions for zoom operations
	function getViewportDimensions(): { width: number; height: number } {
		const container = document.querySelector('.canvas-area');
		if (container) {
			const rect = container.getBoundingClientRect();
			return { width: rect.width, height: rect.height };
		}
		return { width: window.innerWidth, height: window.innerHeight };
	}

	// All shortcut handlers
	const handlers: ShortcutHandlers = {
		// ====================================================================
		// Tool Shortcuts
		// ====================================================================
		'tool-select': () => {
			tool.setTool('select');
		},
		'tool-pan': () => {
			tool.setTool('pan');
		},
		'tool-draw-line': () => {
			tool.setTool('draw-line');
		},
		'tool-draw-rect': () => {
			tool.setTool('draw-rect');
		},
		'tool-draw-circle': () => {
			tool.setTool('draw-circle');
		},
		'tool-instrument': () => {
			tool.setTool('add-instrument');
		},
		'tool-electric': () => {
			tool.setTool('add-electric');
		},
		'tool-boom': () => {
			tool.setTool('add-boom');
		},

		// ====================================================================
		// Edit Shortcuts
		// ====================================================================
		'edit-undo': () => {
			history.undo();
		},
		'edit-redo': () => {
			history.redo();
		},
		'edit-delete': () => {
			if (selection.hasSelection) {
				// Delete all selected objects
				project.deleteObjects(selection.selectedIds);
				selection.clearSelection();
			}
		},
		'edit-delete-backspace': () => {
			if (selection.hasSelection) {
				// Delete all selected objects
				project.deleteObjects(selection.selectedIds);
				selection.clearSelection();
			}
		},
		'edit-duplicate': () => {
			// TODO: Implement duplicate when the project store supports it
			// For now, just log
			console.log('[KeyboardShortcuts] Duplicate not yet implemented');
			return false; // Don't prevent default if not handled
		},

		// ====================================================================
		// Selection Shortcuts
		// ====================================================================
		'select-all': () => {
			// Get all selectable objects from the project
			const allItems = [
				...project.hangingPositions.map((hp) => ({
					id: hp.id,
					type: 'hanging-position' as const
				})),
				...project.instruments.map((inst) => ({
					id: inst.id,
					type: 'instrument' as const
				})),
				...project.shapes.map((shape) => ({
					id: shape.id,
					type: 'annotation' as const
				})),
				...project.annotations.map((ann) => ({
					id: ann.id,
					type: 'annotation' as const
				}))
			];
			selection.selectAll(allItems);
		},

		// ====================================================================
		// View Shortcuts
		// ====================================================================
		'view-zoom-in': () => {
			const { width, height } = getViewportDimensions();
			viewport.zoomBy(1.2, width / 2, height / 2);
		},
		'view-zoom-in-plus': () => {
			const { width, height } = getViewportDimensions();
			viewport.zoomBy(1.2, width / 2, height / 2);
		},
		'view-zoom-out': () => {
			const { width, height } = getViewportDimensions();
			viewport.zoomBy(0.8, width / 2, height / 2);
		},
		'view-fit-all': () => {
			const { width, height } = getViewportDimensions();
			// Reset to default zoom and center on origin (0,0)
			viewport.resetView(width, height);
		},

		// ====================================================================
		// File Shortcuts
		// ====================================================================
		'file-save': () => {
			if (onSave) {
				onSave();
			} else {
				console.log('[KeyboardShortcuts] Save triggered (no handler provided)');
			}
		},
		'file-export': () => {
			if (onExport) {
				onExport();
			} else {
				console.log('[KeyboardShortcuts] Export triggered (no handler provided)');
			}
			return false; // Let it bubble if no handler
		}
	};

	onMount(() => {
		// Register space key handlers for temporary pan mode
		const unregisterSpace = registerSpaceKeyHandlers(
			// On space down: switch to temporary pan
			() => {
				tool.setTemporaryTool('pan');
			},
			// On space up: restore previous tool
			() => {
				tool.restorePreviousTool();
			}
		);

		// Create and start the keyboard manager
		const cleanup = createKeyboardManager(handlers);

		// Cleanup on destroy
		return () => {
			cleanup();
			unregisterSpace();
		};
	});
</script>

<!-- This is a renderless component - no DOM output -->
