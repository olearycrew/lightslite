/**
 * Connection Status Store
 *
 * Tracks network connectivity and sync status for the application.
 * Provides reactive state for UI components like OfflineIndicator.
 *
 * This store bridges the SyncManager's internal state with the UI layer,
 * and adds toast notifications for connection state changes.
 */

import type { SyncStatus } from '$lib/sync/manager.svelte';

// ============================================================================
// Types
// ============================================================================

/** Connection status for UI display */
export type ConnectionStatus =
	| 'online-synced' // Connected and all changes saved
	| 'online-syncing' // Connected and actively syncing
	| 'online-dirty' // Connected but has unsaved changes
	| 'offline' // Not connected to network
	| 'error'; // Sync error occurred

/** Toast notification for connection events */
export interface ConnectionToast {
	id: string;
	type: 'info' | 'success' | 'warning' | 'error';
	message: string;
	timestamp: Date;
	autoDismiss?: boolean;
}

/** Connection state snapshot */
export interface ConnectionState {
	isOnline: boolean;
	syncStatus: SyncStatus;
	isDirty: boolean;
	lastSyncTime: Date | null;
	lastError: string | null;
	connectionStatus: ConnectionStatus;
}

// ============================================================================
// Connection Store Implementation
// ============================================================================

/**
 * Creates a connection status store with reactive state
 */
function createConnectionStore() {
	// ========================================================================
	// Reactive State
	// ========================================================================

	/** Whether browser is online */
	let _isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

	/** Current sync status from SyncManager */
	let _syncStatus = $state<SyncStatus>('idle');

	/** Whether there are unsaved local changes */
	let _isDirty = $state(false);

	/** Timestamp of last successful sync */
	let _lastSyncTime = $state<Date | null>(null);

	/** Last error message if any */
	let _lastError = $state<string | null>(null);

	/** Toast notifications queue */
	let _toasts = $state<ConnectionToast[]>([]);

	/** Whether the store has been initialized */
	let _initialized = $state(false);

	// ========================================================================
	// Derived State
	// ========================================================================

	/** Computed connection status for UI */
	const connectionStatusComputed = $derived.by((): ConnectionStatus => {
		if (!_isOnline) return 'offline';
		if (_lastError) return 'error';
		if (_syncStatus === 'syncing') return 'online-syncing';
		if (_isDirty) return 'online-dirty';
		return 'online-synced';
	});

	// ========================================================================
	// Browser Event Handlers
	// ========================================================================

	let cleanupEventListeners: (() => void) | null = null;

	function setupEventListeners() {
		if (typeof window === 'undefined' || cleanupEventListeners) return;

		const handleOnline = () => {
			const wasOffline = !_isOnline;
			_isOnline = true;

			if (wasOffline) {
				addToast({
					type: 'success',
					message: 'Back online - syncing changes...',
					autoDismiss: true
				});
			}
		};

		const handleOffline = () => {
			_isOnline = false;
			_syncStatus = 'offline';

			addToast({
				type: 'warning',
				message: 'You are offline. Changes are saved locally.',
				autoDismiss: false
			});
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		cleanupEventListeners = () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}

	// ========================================================================
	// Toast Management
	// ========================================================================

	function addToast(toast: Omit<ConnectionToast, 'id' | 'timestamp'>) {
		const newToast: ConnectionToast = {
			...toast,
			id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			timestamp: new Date()
		};

		_toasts = [..._toasts, newToast];

		// Auto-dismiss after 5 seconds if autoDismiss is true
		if (toast.autoDismiss !== false) {
			setTimeout(() => {
				dismissToast(newToast.id);
			}, 5000);
		}
	}

	function dismissToast(id: string) {
		_toasts = _toasts.filter((t) => t.id !== id);
	}

	function clearAllToasts() {
		_toasts = [];
	}

	// ========================================================================
	// State Update Methods
	// ========================================================================

	/**
	 * Update the connection state from SyncManager
	 * Called by SyncManager when state changes
	 */
	function updateFromSyncManager(state: {
		isOnline: boolean;
		syncStatus: SyncStatus;
		isDirty: boolean;
		lastSyncTime: Date | null;
		lastError: string | null;
	}) {
		const prevSyncStatus = _syncStatus;
		const prevError = _lastError;

		_isOnline = state.isOnline;
		_syncStatus = state.syncStatus;
		_isDirty = state.isDirty;
		_lastSyncTime = state.lastSyncTime;
		_lastError = state.lastError;

		// Show toast when sync completes after being dirty/syncing
		if (
			prevSyncStatus === 'syncing' &&
			state.syncStatus === 'idle' &&
			!state.isDirty &&
			!state.lastError
		) {
			addToast({
				type: 'success',
				message: 'All changes saved',
				autoDismiss: true
			});
		}

		// Show toast when sync error occurs
		if (state.lastError && state.lastError !== prevError) {
			addToast({
				type: 'error',
				message: `Sync error: ${state.lastError}`,
				autoDismiss: false
			});
		}
	}

	/**
	 * Initialize the connection store
	 * Sets up browser event listeners
	 */
	function initialize() {
		if (_initialized) return;
		setupEventListeners();
		_initialized = true;
	}

	/**
	 * Cleanup the connection store
	 * Removes event listeners
	 */
	function dispose() {
		if (cleanupEventListeners) {
			cleanupEventListeners();
			cleanupEventListeners = null;
		}
		_initialized = false;
		clearAllToasts();
	}

	// ========================================================================
	// Public API
	// ========================================================================

	return {
		// Reactive getters
		get isOnline() {
			return _isOnline;
		},
		get syncStatus() {
			return _syncStatus;
		},
		get isDirty() {
			return _isDirty;
		},
		get lastSyncTime() {
			return _lastSyncTime;
		},
		get lastError() {
			return _lastError;
		},
		get connectionStatus() {
			return connectionStatusComputed;
		},
		get toasts() {
			return _toasts;
		},
		get initialized() {
			return _initialized;
		},

		// Methods
		initialize,
		dispose,
		updateFromSyncManager,
		addToast,
		dismissToast,
		clearAllToasts,

		// Helper to get full state snapshot
		getState(): ConnectionState {
			return {
				isOnline: _isOnline,
				syncStatus: _syncStatus,
				isDirty: _isDirty,
				lastSyncTime: _lastSyncTime,
				lastError: _lastError,
				connectionStatus: connectionStatusComputed
			};
		}
	};
}

// ============================================================================
// Singleton Export
// ============================================================================

/** Global connection status store instance */
export const connection = createConnectionStore();
