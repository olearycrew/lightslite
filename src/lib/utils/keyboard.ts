/**
 * Keyboard Shortcuts Utility
 *
 * Comprehensive keyboard shortcut system for the lighting plot editor.
 * Handles tool switching, editing operations, and view controls.
 *
 * Key features:
 * - Cross-platform modifier key support (Ctrl on Windows/Linux, Cmd on Mac)
 * - Input field detection to prevent shortcuts firing while typing
 * - Shortcut configuration type for documentation and UI hints
 */

import { browser } from '$app/environment';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a keyboard shortcut configuration
 */
export interface ShortcutConfig {
	/** Unique identifier for the shortcut */
	id: string;
	/** The key to press (case-insensitive for letters) */
	key: string;
	/** Human-readable description of the action */
	description: string;
	/** Whether the shortcut requires the modifier key (Ctrl/Cmd) */
	modifier?: boolean;
	/** Whether the shortcut requires Shift */
	shift?: boolean;
	/** Category for grouping in UI */
	category: 'tool' | 'edit' | 'view' | 'file' | 'selection';
	/** Display string for the shortcut (e.g., "⌘Z" or "Ctrl+Z") */
	displayString?: string;
}

/**
 * Shortcut handler function
 */
export type ShortcutHandler = (event: KeyboardEvent) => void | boolean;

/**
 * Map of shortcut IDs to their handlers
 */
export type ShortcutHandlers = Record<string, ShortcutHandler>;

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Detect if we're on macOS
 */
export function isMac(): boolean {
	if (!browser) return false;
	return navigator.platform.toLowerCase().includes('mac');
}

/**
 * Get the correct modifier key label for the current platform
 */
export function getModifierLabel(): string {
	return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Get the modifier key label for display (shorter version)
 */
export function getModifierSymbol(): string {
	return isMac() ? '⌘' : '^';
}

// ============================================================================
// Input Detection
// ============================================================================

/**
 * Check if an input element is currently focused
 * Prevents shortcuts from firing while typing in form fields
 */
export function isInputFocused(): boolean {
	if (!browser) return false;

	const active = document.activeElement;
	if (!active) return false;

	const tagName = active.tagName.toLowerCase();
	return (
		tagName === 'input' ||
		tagName === 'textarea' ||
		tagName === 'select' ||
		active.hasAttribute('contenteditable')
	);
}

// ============================================================================
// Modifier Key Detection
// ============================================================================

/**
 * Check if the platform-appropriate modifier key is pressed
 * Mac: metaKey (Cmd), Others: ctrlKey
 */
export function isModifierPressed(event: KeyboardEvent): boolean {
	return isMac() ? event.metaKey : event.ctrlKey;
}

/**
 * Check if only the modifier key is pressed (no other modifiers)
 */
export function isOnlyModifierPressed(event: KeyboardEvent): boolean {
	const modPressed = isModifierPressed(event);
	const otherMods = isMac() ? event.ctrlKey || event.altKey : event.metaKey || event.altKey;
	return modPressed && !otherMods;
}

// ============================================================================
// Shortcut Definitions
// ============================================================================

/**
 * All keyboard shortcuts in the application
 */
export const SHORTCUTS: ShortcutConfig[] = [
	// Tool shortcuts
	{ id: 'tool-select', key: 'v', description: 'Select tool', category: 'tool' },
	{ id: 'tool-pan', key: 'h', description: 'Pan tool', category: 'tool' },
	{ id: 'tool-pan-space', key: ' ', description: 'Pan (hold)', category: 'tool' },
	{ id: 'tool-draw-line', key: 'l', description: 'Draw Line', category: 'tool' },
	{ id: 'tool-draw-rect', key: 'r', description: 'Draw Rectangle', category: 'tool' },
	{ id: 'tool-draw-circle', key: 'c', description: 'Draw Circle', category: 'tool' },
	{ id: 'tool-instrument', key: 'i', description: 'Add Instrument', category: 'tool' },
	{ id: 'tool-electric', key: 'e', description: 'Add Electric', category: 'tool' },
	{ id: 'tool-boom', key: 'b', description: 'Add Boom', category: 'tool' },

	// Edit shortcuts
	{
		id: 'edit-undo',
		key: 'z',
		description: 'Undo',
		modifier: true,
		category: 'edit'
	},
	{
		id: 'edit-redo',
		key: 'z',
		description: 'Redo',
		modifier: true,
		shift: true,
		category: 'edit'
	},
	{ id: 'edit-delete', key: 'Delete', description: 'Delete selected', category: 'edit' },
	{
		id: 'edit-delete-backspace',
		key: 'Backspace',
		description: 'Delete selected',
		category: 'edit'
	},
	{
		id: 'edit-duplicate',
		key: 'd',
		description: 'Duplicate',
		modifier: true,
		category: 'edit'
	},

	// Selection shortcuts
	{
		id: 'select-all',
		key: 'a',
		description: 'Select All',
		modifier: true,
		category: 'selection'
	},

	// View shortcuts
	{
		id: 'view-zoom-in',
		key: '=',
		description: 'Zoom In',
		modifier: true,
		category: 'view'
	},
	{
		id: 'view-zoom-in-plus',
		key: '+',
		description: 'Zoom In',
		modifier: true,
		category: 'view'
	},
	{
		id: 'view-zoom-out',
		key: '-',
		description: 'Zoom Out',
		modifier: true,
		category: 'view'
	},
	{
		id: 'view-fit-all',
		key: '0',
		description: 'Fit All',
		modifier: true,
		category: 'view'
	},

	// File shortcuts
	{
		id: 'file-save',
		key: 's',
		description: 'Save',
		modifier: true,
		category: 'file'
	},
	{
		id: 'file-export',
		key: 'e',
		description: 'Export',
		modifier: true,
		shift: true,
		category: 'file'
	}
];

/**
 * Get display string for a shortcut
 */
export function getShortcutDisplayString(shortcut: ShortcutConfig): string {
	const parts: string[] = [];

	if (shortcut.modifier) {
		parts.push(getModifierSymbol());
	}
	if (shortcut.shift) {
		parts.push(isMac() ? '⇧' : 'Shift+');
	}

	// Format the key for display
	let keyDisplay = shortcut.key.toUpperCase();
	if (shortcut.key === ' ') {
		keyDisplay = 'Space';
	} else if (shortcut.key === 'Delete') {
		keyDisplay = isMac() ? '⌫' : 'Del';
	} else if (shortcut.key === 'Backspace') {
		keyDisplay = '⌫';
	} else if (shortcut.key === '=') {
		keyDisplay = '+';
	}

	if (isMac() && !shortcut.shift) {
		// Mac style: symbols together without +
		return parts.join('') + keyDisplay;
	} else if (parts.length > 0 && !parts[parts.length - 1].endsWith('+')) {
		// Non-Mac: add + between parts
		return parts.join('') + '+' + keyDisplay;
	}
	return parts.join('') + keyDisplay;
}

/**
 * Get a shortcut by ID
 */
export function getShortcut(id: string): ShortcutConfig | undefined {
	return SHORTCUTS.find((s) => s.id === id);
}

/**
 * Get shortcuts by category
 */
export function getShortcutsByCategory(category: ShortcutConfig['category']): ShortcutConfig[] {
	return SHORTCUTS.filter((s) => s.category === category);
}

// ============================================================================
// Shortcut Matching
// ============================================================================

/**
 * Check if a keyboard event matches a shortcut configuration
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
	// Check modifier requirement
	const modRequired = shortcut.modifier ?? false;
	const modPressed = isModifierPressed(event);

	if (modRequired !== modPressed) {
		return false;
	}

	// Check shift requirement
	const shiftRequired = shortcut.shift ?? false;
	if (shiftRequired !== event.shiftKey) {
		return false;
	}

	// Check key match (case-insensitive for letters)
	const eventKey = event.key.toLowerCase();
	const shortcutKey = shortcut.key.toLowerCase();

	return eventKey === shortcutKey;
}

/**
 * Find matching shortcuts for a keyboard event
 */
export function findMatchingShortcuts(event: KeyboardEvent): ShortcutConfig[] {
	return SHORTCUTS.filter((shortcut) => matchesShortcut(event, shortcut));
}

// ============================================================================
// Keyboard Manager
// ============================================================================

/**
 * State for space key handling (temporary pan mode)
 */
interface SpaceKeyState {
	isHeld: boolean;
	handlers: {
		onDown?: () => void;
		onUp?: () => void;
	};
}

const spaceKeyState: SpaceKeyState = {
	isHeld: false,
	handlers: {}
};

/**
 * Register handlers for space key (temporary pan mode)
 */
export function registerSpaceKeyHandlers(onDown: () => void, onUp: () => void): () => void {
	spaceKeyState.handlers.onDown = onDown;
	spaceKeyState.handlers.onUp = onUp;

	return () => {
		spaceKeyState.handlers.onDown = undefined;
		spaceKeyState.handlers.onUp = undefined;
	};
}

/**
 * Process keydown event for space key
 */
function handleSpaceKeyDown(event: KeyboardEvent): boolean {
	if (event.code === 'Space' && !isInputFocused() && !spaceKeyState.isHeld) {
		event.preventDefault();
		spaceKeyState.isHeld = true;
		spaceKeyState.handlers.onDown?.();
		return true;
	}
	return false;
}

/**
 * Process keyup event for space key
 */
function handleSpaceKeyUp(event: KeyboardEvent): boolean {
	if (event.code === 'Space' && spaceKeyState.isHeld) {
		spaceKeyState.isHeld = false;
		spaceKeyState.handlers.onUp?.();
		return true;
	}
	return false;
}

/**
 * Reset space key state (for window blur)
 */
export function resetSpaceKeyState(): void {
	if (spaceKeyState.isHeld) {
		spaceKeyState.isHeld = false;
		spaceKeyState.handlers.onUp?.();
	}
}

/**
 * Main keyboard shortcut manager
 * Creates global event listeners and routes to handlers
 */
export function createKeyboardManager(handlers: ShortcutHandlers): () => void {
	if (!browser) {
		return () => {};
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Skip if input is focused (except for some shortcuts)
		const inputActive = isInputFocused();

		// Handle space key separately (for temporary pan)
		if (event.code === 'Space') {
			if (handleSpaceKeyDown(event)) {
				return;
			}
		}

		// Skip other shortcuts if input is focused
		if (inputActive) {
			return;
		}

		// Find matching shortcuts and execute handlers
		const matches = findMatchingShortcuts(event);

		for (const shortcut of matches) {
			const handler = handlers[shortcut.id];
			if (handler) {
				// Handler can return false to indicate it didn't handle the event
				const result = handler(event);
				if (result !== false) {
					event.preventDefault();
					return;
				}
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		// Handle space key release
		if (event.code === 'Space') {
			handleSpaceKeyUp(event);
		}
	}

	function handleWindowBlur() {
		// Reset space key state when window loses focus
		resetSpaceKeyState();
	}

	// Register global listeners
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
	window.addEventListener('blur', handleWindowBlur);

	// Return cleanup function
	return () => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
		window.removeEventListener('blur', handleWindowBlur);
	};
}
