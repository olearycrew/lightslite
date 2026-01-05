/**
 * Utils Index
 *
 * Re-exports all utility functions.
 */

export {
	type HangingPositionSnapResult,
	type EndpointSnapOptions,
	DEFAULT_SNAP_THRESHOLD,
	closestPointOnLineSegment,
	distance,
	findNearestHangingPosition,
	snapToHangingPosition,
	findNearestWithEndpoints,
	calculateInstrumentRotation
} from './snap';

export {
	// Types
	type ShortcutConfig,
	type ShortcutHandler,
	type ShortcutHandlers,
	// Platform utilities
	isMac,
	getModifierLabel,
	getModifierSymbol,
	// Input detection
	isInputFocused,
	// Modifier key detection
	isModifierPressed,
	isOnlyModifierPressed,
	// Shortcut definitions and lookup
	SHORTCUTS,
	getShortcutDisplayString,
	getShortcut,
	getShortcutsByCategory,
	// Shortcut matching
	matchesShortcut,
	findMatchingShortcuts,
	// Space key handling
	registerSpaceKeyHandlers,
	resetSpaceKeyState,
	// Keyboard manager
	createKeyboardManager
} from './keyboard';
