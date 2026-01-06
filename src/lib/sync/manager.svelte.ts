/**
 * SyncManager - Orchestrates synchronization between Svelte stores, IndexedDB, and server API
 *
 * Responsibilities:
 * - Immediate local persistence to IndexedDB on store changes
 * - Debounced server sync (500ms) for remote persistence
 * - Version tracking for conflict detection
 * - Online/offline handling with change queuing
 * - Dirty state tracking for UI indicators
 * - Conflict detection and resolution with ConflictManager
 */

import {
	saveProject,
	loadProject,
	createEmptyProject,
	type Project,
	type ProjectMetadata,
	type RecoveryInfo,
	markSessionActive,
	markSessionClean,
	getProjectRecoveryInfo,
	clearProjectCache,
	markSessionUnloadSync,
	markSessionCleanSync,
	updateSessionActivitySync
} from './indexeddb';
import {
	createConflictManager,
	type ConflictManager,
	type ConflictInfo,
	type ConflictResolution
} from './conflict.svelte';
import { project } from '$lib/stores/project.svelte';
import { connection } from '$lib/stores/connection.svelte';
import type {
	ShapeObject,
	HangingPositionObject,
	InstrumentObject,
	SetPieceObject,
	AnnotationObject
} from '$lib/stores/project.svelte';

// ============================================================================
// Types
// ============================================================================

/** Sync status states */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

/** Result of a sync operation */
export interface SyncResult {
	success: boolean;
	localVersion: number;
	serverVersion?: number;
	error?: string;
	conflictDetected?: boolean;
}

/** Server project response structure */
interface ServerProjectResponse {
	project: {
		id: string;
		name: string;
		venue: unknown;
		scale: unknown;
		layers: unknown;
		metadata: unknown;
		version: number;
		createdAt: string;
		updatedAt: string;
	};
}

/** Server error response structure */
interface ServerErrorResponse {
	error: string;
}

// ============================================================================
// Constants
// ============================================================================

const SERVER_SYNC_DEBOUNCE_MS = 500;
const RETRY_DELAY_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;

// ============================================================================
// SyncManager Implementation
// ============================================================================

/**
 * SyncManager class - manages synchronization between local and remote storage
 */
export class SyncManager {
	// ========================================================================
	// State
	// ========================================================================

	/** Whether there are unsaved changes */
	private _isDirty = $state(false);

	/** Current sync status */
	private _syncStatus = $state<SyncStatus>('idle');

	/** Last successful sync time */
	private _lastSyncTime = $state<Date | null>(null);

	/** Local version number (incremented on each save) */
	private _localVersion = $state(0);

	/** Server version number (from last fetch) */
	private _serverVersion = $state(0);

	/** Last sync error message */
	private _lastError = $state<string | null>(null);

	/** Current project ID being managed */
	private _projectId: string | null = null;

	/** Whether we're currently online */
	private _isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

	/** Debounce timer for server sync */
	private serverSyncTimer: ReturnType<typeof setTimeout> | null = null;

	/** Whether the manager is actively watching for changes */
	private isRunning = false;

	/** Pending server sync flag */
	private pendingServerSync = false;

	/** Retry attempt counter */
	private retryAttempts = 0;

	/** Retry timer */
	private retryTimer: ReturnType<typeof setTimeout> | null = null;

	/** Cleanup functions for effects */
	private cleanupFunctions: (() => void)[] = [];

	/** Conflict manager for handling version conflicts */
	private _conflictManager: ConflictManager = createConflictManager();

	// ========================================================================
	// Connection Store Integration
	// ========================================================================

	/** Notify the connection store of state changes */
	private notifyConnectionStore(): void {
		connection.updateFromSyncManager({
			isOnline: this._isOnline,
			syncStatus: this._syncStatus,
			isDirty: this._isDirty,
			lastSyncTime: this._lastSyncTime,
			lastError: this._lastError
		});
	}

	// ========================================================================
	// Reactive Getters
	// ========================================================================

	/** Whether there are unsaved changes */
	get isDirty(): boolean {
		return this._isDirty;
	}

	/** Current sync status */
	get syncStatus(): SyncStatus {
		return this._syncStatus;
	}

	/** Last successful sync time */
	get lastSyncTime(): Date | null {
		return this._lastSyncTime;
	}

	/** Local version number */
	get localVersion(): number {
		return this._localVersion;
	}

	/** Server version number */
	get serverVersion(): number {
		return this._serverVersion;
	}

	/** Last error message */
	get lastError(): string | null {
		return this._lastError;
	}

	/** Whether currently online */
	get isOnline(): boolean {
		return this._isOnline;
	}

	/** Whether there is a version conflict pending resolution */
	get hasConflict(): boolean {
		return this._conflictManager.hasConflict;
	}

	/** Current conflict information, if any */
	get conflictInfo(): ConflictInfo | null {
		return this._conflictManager.conflictInfo;
	}

	/** The conflict manager instance for advanced conflict handling */
	get conflictManager(): ConflictManager {
		return this._conflictManager;
	}

	// ========================================================================
	// Initialization
	// ========================================================================

	/**
	 * Initialize the SyncManager for a specific project
	 * Loads from IndexedDB first, then attempts server sync
	 */
	async initialize(projectId: string): Promise<void> {
		this._projectId = projectId;
		this._isDirty = false;
		this._lastError = null;
		this.retryAttempts = 0;

		// Mark session as active for crash recovery (both sync and async)
		updateSessionActivitySync(projectId);
		await markSessionActive(projectId);

		// Try to load from IndexedDB first (faster, works offline)
		const localProject = await loadProject(projectId);

		if (localProject) {
			// Load local data into store
			this.loadProjectIntoStore(localProject);
			this._localVersion = localProject.version;
			this._serverVersion = localProject.version;
		} else {
			// Create new empty project locally
			const emptyProject = createEmptyProject(projectId, project.projectName || 'Untitled Project');
			await saveProject(emptyProject);
			this._localVersion = 1;
			this._serverVersion = 0;
		}

		// Try to sync from server if online
		if (this._isOnline) {
			await this.syncFromServer();
		} else {
			this._syncStatus = 'offline';
		}
	}

	// ========================================================================
	// Sync Operations
	// ========================================================================

	/**
	 * Sync current state to server
	 * Called on a debounced schedule after changes
	 */
	async syncToServer(): Promise<SyncResult> {
		if (!this._projectId) {
			return { success: false, localVersion: this._localVersion, error: 'No project initialized' };
		}

		if (!this._isOnline) {
			this.pendingServerSync = true;
			return {
				success: false,
				localVersion: this._localVersion,
				error: 'Offline - sync queued'
			};
		}

		this._syncStatus = 'syncing';
		this._lastError = null;
		this.notifyConnectionStore();

		try {
			const projectState = this.getProjectState();

			const response = await fetch(`/api/projects/${this._projectId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: projectState.name,
					venue: projectState.venue,
					layers: {
						shapes: projectState.shapes,
						hangingPositions: projectState.hangingPositions,
						instruments: projectState.instruments,
						setPieces: projectState.setPieces,
						annotations: projectState.annotations
					},
					metadata: {
						...projectState.metadata,
						localVersion: this._localVersion,
						lastSyncedAt: new Date().toISOString()
					}
				})
			});

			if (!response.ok) {
				const errorData = (await response.json()) as ServerErrorResponse;
				throw new Error(errorData.error || `Server error: ${response.status}`);
			}

			const data = (await response.json()) as ServerProjectResponse;
			this._serverVersion = data.project.version;
			this._lastSyncTime = new Date();
			this._syncStatus = 'idle';
			this._isDirty = false;
			this.retryAttempts = 0;

			// Also save to IndexedDB with updated version
			await this.saveToIndexedDB();

			// Notify connection store of successful sync
			this.notifyConnectionStore();

			return {
				success: true,
				localVersion: this._localVersion,
				serverVersion: this._serverVersion
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
			this._lastError = errorMessage;
			this._syncStatus = 'error';

			// Notify connection store of error
			this.notifyConnectionStore();

			// Schedule retry if we haven't exceeded attempts
			if (this.retryAttempts < MAX_RETRY_ATTEMPTS) {
				this.scheduleRetry();
			}

			return {
				success: false,
				localVersion: this._localVersion,
				error: errorMessage
			};
		}
	}

	/**
	 * Sync from server to local
	 * Used to fetch latest server state
	 */
	async syncFromServer(): Promise<SyncResult> {
		if (!this._projectId) {
			return { success: false, localVersion: this._localVersion, error: 'No project initialized' };
		}

		if (!this._isOnline) {
			return {
				success: false,
				localVersion: this._localVersion,
				error: 'Offline'
			};
		}

		this._syncStatus = 'syncing';
		this._lastError = null;

		try {
			const response = await fetch(`/api/projects/${this._projectId}`);

			if (!response.ok) {
				if (response.status === 404) {
					// Project doesn't exist on server yet - that's OK for new projects
					this._syncStatus = 'idle';
					return {
						success: true,
						localVersion: this._localVersion,
						serverVersion: 0
					};
				}
				const errorData = (await response.json()) as ServerErrorResponse;
				throw new Error(errorData.error || `Server error: ${response.status}`);
			}

			const data = (await response.json()) as ServerProjectResponse;
			const serverProject = data.project;

			// Check for version conflict
			if (serverProject.version > this._serverVersion) {
				const localState = this.getProjectState();
				const serverState = this.serverProjectToLocal(serverProject);

				// Server has newer data - check if we have conflicting local changes
				if (this._isDirty) {
					// Use ConflictManager to detect if there's a real conflict
					const hasConflict = this._conflictManager.detectConflict(
						localState,
						serverState,
						this._localVersion,
						serverProject.version
					);

					if (hasConflict) {
						// Set conflict state for UI to handle
						this._conflictManager.setConflict({
							projectId: this._projectId!,
							localVersion: this._localVersion,
							serverVersion: serverProject.version,
							localState,
							serverState,
							detectedAt: new Date()
						});

						this._syncStatus = 'idle';
						return {
							success: true,
							localVersion: this._localVersion,
							serverVersion: serverProject.version,
							conflictDetected: true
						};
					}
				}

				// Safe to update local with server data
				const projectForStore = serverState;
				this.loadProjectIntoStore(projectForStore);
				await saveProject(projectForStore);
				this._localVersion = serverProject.version;
				this._serverVersion = serverProject.version;
			}

			this._lastSyncTime = new Date();
			this._syncStatus = 'idle';
			this.retryAttempts = 0;

			return {
				success: true,
				localVersion: this._localVersion,
				serverVersion: this._serverVersion
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
			this._lastError = errorMessage;
			this._syncStatus = 'error';

			return {
				success: false,
				localVersion: this._localVersion,
				error: errorMessage
			};
		}
	}

	/**
	 * Mark the current state as dirty (has unsaved changes)
	 * Triggers debounced save to IndexedDB and server
	 */
	markDirty(): void {
		this._isDirty = true;
		this._localVersion++;

		// Notify connection store of dirty state
		this.notifyConnectionStore();

		// Save to IndexedDB immediately
		this.saveToIndexedDBDebounced();

		// Schedule debounced server sync
		this.scheduleServerSync();
	}

	/**
	 * Set offline mode manually
	 */
	setOfflineMode(offline: boolean): void {
		const wasOffline = !this._isOnline;
		this._isOnline = !offline;

		if (offline) {
			this._syncStatus = 'offline';
			this.cancelServerSync();
			this.notifyConnectionStore();
		} else if (wasOffline && !offline) {
			// Coming back online
			this._syncStatus = 'idle';
			this.notifyConnectionStore();
			if (this.pendingServerSync || this._isDirty) {
				this.scheduleServerSync();
			}
		}
	}

	// ========================================================================
	// Conflict Resolution
	// ========================================================================

	/**
	 * Resolve a version conflict using the specified strategy
	 *
	 * @param resolution - How to resolve the conflict:
	 *   - 'accept-server': Use server version (default, server-authoritative)
	 *   - 'keep-local': Keep local changes, will overwrite server
	 *   - 'merge': Attempt to merge changes (basic implementation)
	 * @returns The resolved project state
	 */
	async resolveConflict(resolution: ConflictResolution): Promise<SyncResult> {
		if (!this._conflictManager.hasConflict) {
			return {
				success: false,
				localVersion: this._localVersion,
				error: 'No conflict to resolve'
			};
		}

		try {
			// Resolve the conflict using the ConflictManager
			const resolvedProject = await this._conflictManager.resolve(resolution);

			// Load the resolved state into the store
			this.loadProjectIntoStore(resolvedProject);

			// Update version tracking
			this._localVersion = resolvedProject.version;

			// If we kept local or merged, we need to sync to server
			if (resolution !== 'accept-server') {
				this._isDirty = true;
				// Save to IndexedDB immediately
				await this.saveToIndexedDB();
				// Schedule server sync
				this.scheduleServerSync();
			} else {
				// Accepting server - save to IndexedDB and update server version
				this._serverVersion = resolvedProject.version;
				this._isDirty = false;
				await this.saveToIndexedDB();
			}

			return {
				success: true,
				localVersion: this._localVersion,
				serverVersion: this._serverVersion
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Conflict resolution failed';
			this._lastError = errorMessage;

			return {
				success: false,
				localVersion: this._localVersion,
				error: errorMessage
			};
		}
	}

	/**
	 * Clear the current conflict without resolving it
	 * Useful if the user cancels the conflict dialog
	 */
	clearConflict(): void {
		this._conflictManager.clearConflict();
	}

	// ========================================================================
	// Crash Recovery
	// ========================================================================

	/**
	 * Check if there is recoverable data for a project
	 * Call this before initialize() to detect crash scenarios
	 *
	 * @param projectId - The project ID to check
	 * @param serverVersion - The current server version
	 * @param serverUpdatedAt - The server's last updated timestamp
	 * @returns RecoveryInfo if local data is newer than server, null otherwise
	 */
	async checkForRecoveryData(
		projectId: string,
		serverVersion: number,
		serverUpdatedAt: number
	): Promise<RecoveryInfo | null> {
		return await getProjectRecoveryInfo(projectId, serverVersion, serverUpdatedAt);
	}

	/**
	 * Restore project from cached IndexedDB data
	 * Use this when user chooses to recover from a crash
	 *
	 * @param projectId - The project ID to restore
	 * @returns True if restoration succeeded
	 */
	async restoreFromCache(projectId: string): Promise<boolean> {
		try {
			const localProject = await loadProject(projectId);
			if (!localProject) {
				return false;
			}

			// Load the cached project into the store
			this.loadProjectIntoStore(localProject);
			this._localVersion = localProject.version;
			this._projectId = projectId;

			// Mark as dirty so it syncs to server
			this._isDirty = true;

			// Save to IndexedDB to ensure consistency
			await this.saveToIndexedDB();

			// Schedule server sync
			this.scheduleServerSync();

			return true;
		} catch (error) {
			console.error('[SyncManager] Failed to restore from cache:', error);
			return false;
		}
	}

	/**
	 * Discard cached data and use server version
	 * Use this when user chooses to discard local changes after crash
	 *
	 * @param projectId - The project ID to discard cache for
	 */
	async discardCache(projectId: string): Promise<void> {
		// Clear the cached project data
		await clearProjectCache(projectId);

		// Reset local state
		this._isDirty = false;
		this._localVersion = 0;
	}

	// ========================================================================
	// Lifecycle
	// ========================================================================

	/**
	 * Start watching for changes and network status
	 */
	start(): void {
		if (this.isRunning) return;
		this.isRunning = true;

		// Listen for online/offline events
		if (typeof window !== 'undefined') {
			window.addEventListener('online', this.handleOnline);
			window.addEventListener('offline', this.handleOffline);
			window.addEventListener('beforeunload', this.handleBeforeUnload);
		}
	}

	/**
	 * Stop watching for changes (pause syncing)
	 */
	stop(): void {
		if (!this.isRunning) return;
		this.isRunning = false;

		// Cancel any pending syncs
		this.cancelServerSync();
		this.cancelRetry();

		// Remove event listeners
		if (typeof window !== 'undefined') {
			window.removeEventListener('online', this.handleOnline);
			window.removeEventListener('offline', this.handleOffline);
			window.removeEventListener('beforeunload', this.handleBeforeUnload);
		}
	}

	/**
	 * Full cleanup - stop and release resources
	 */
	async dispose(): Promise<void> {
		this.stop();

		// Flush any pending changes
		if (this._isDirty && this._projectId) {
			await this.saveToIndexedDB();
		}

		// Mark session as clean (both sync and async)
		markSessionCleanSync();
		await markSessionClean();

		// Clear state
		this._projectId = null;
		this._isDirty = false;
		this._syncStatus = 'idle';
		this._lastError = null;

		// Run any cleanup functions
		for (const cleanup of this.cleanupFunctions) {
			cleanup();
		}
		this.cleanupFunctions = [];
	}

	// ========================================================================
	// Private Methods - Event Handlers
	// ========================================================================

	/** Handler for online event */
	private handleOnline = (): void => {
		this._isOnline = true;
		this._syncStatus = 'idle';

		// Sync any pending changes
		if (this.pendingServerSync || this._isDirty) {
			this.scheduleServerSync();
		}
	};

	/** Handler for offline event */
	private handleOffline = (): void => {
		this._isOnline = false;
		this._syncStatus = 'offline';
		this.cancelServerSync();
	};

	/** Handler for beforeunload - save any dirty data synchronously */
	private handleBeforeUnload = (): void => {
		// Use synchronous localStorage to mark session state
		// because async IndexedDB won't complete before page unloads
		markSessionUnloadSync(this._projectId);

		// Still try to save to IndexedDB (may or may not complete)
		if (this._isDirty) {
			this.saveToIndexedDB();
		}
	};

	// ========================================================================
	// Private Methods - Sync Scheduling
	// ========================================================================

	/** Schedule a debounced server sync */
	private scheduleServerSync(): void {
		if (!this.isRunning || !this._isOnline) return;

		this.cancelServerSync();
		this.serverSyncTimer = setTimeout(() => {
			this.serverSyncTimer = null;
			this.syncToServer();
		}, SERVER_SYNC_DEBOUNCE_MS);
	}

	/** Cancel any pending server sync */
	private cancelServerSync(): void {
		if (this.serverSyncTimer) {
			clearTimeout(this.serverSyncTimer);
			this.serverSyncTimer = null;
		}
	}

	/** Schedule a retry after a failed sync */
	private scheduleRetry(): void {
		this.cancelRetry();
		this.retryAttempts++;

		this.retryTimer = setTimeout(() => {
			this.retryTimer = null;
			if (this._isOnline && this._isDirty) {
				this.syncToServer();
			}
		}, RETRY_DELAY_MS * this.retryAttempts);
	}

	/** Cancel any pending retry */
	private cancelRetry(): void {
		if (this.retryTimer) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}
	}

	// ========================================================================
	// Private Methods - IndexedDB Operations
	// ========================================================================

	/** IndexedDB save debounce timer */
	private indexedDBTimer: ReturnType<typeof setTimeout> | null = null;

	/** Save to IndexedDB with debounce (for rapid changes) */
	private saveToIndexedDBDebounced(): void {
		if (this.indexedDBTimer) {
			clearTimeout(this.indexedDBTimer);
		}

		// Very short debounce for IndexedDB - just to batch rapid changes
		this.indexedDBTimer = setTimeout(() => {
			this.indexedDBTimer = null;
			this.saveToIndexedDB();
		}, 50);
	}

	/** Save current project state to IndexedDB */
	private async saveToIndexedDB(): Promise<void> {
		if (!this._projectId) return;

		const projectState = this.getProjectState();
		await saveProject(projectState);
	}

	// ========================================================================
	// Private Methods - State Conversion
	// ========================================================================

	/** Get current project state for persistence */
	private getProjectState(): Project {
		const now = Date.now();

		return {
			id: this._projectId!,
			name: project.projectName,
			version: this._localVersion,
			shapes: project.shapes,
			hangingPositions: project.hangingPositions,
			instruments: project.instruments,
			setPieces: project.setPieces,
			annotations: project.annotations,
			venue: project.venue,
			metadata: undefined,
			updatedAt: now,
			createdAt: now
		};
	}

	/** Convert server project format to local Project format */
	private serverProjectToLocal(serverProject: ServerProjectResponse['project']): Project {
		const layers = serverProject.layers as {
			shapes?: ShapeObject[];
			hangingPositions?: HangingPositionObject[];
			instruments?: InstrumentObject[];
			setPieces?: SetPieceObject[];
			annotations?: AnnotationObject[];
		} | null;

		return {
			id: serverProject.id,
			name: serverProject.name,
			version: serverProject.version,
			shapes: layers?.shapes ?? [],
			hangingPositions: layers?.hangingPositions ?? [],
			instruments: layers?.instruments ?? [],
			setPieces: layers?.setPieces ?? [],
			annotations: layers?.annotations ?? [],
			venue: (serverProject.venue as import('$lib/stores/project.svelte').Venue) ?? null,
			metadata: serverProject.metadata as ProjectMetadata | undefined,
			updatedAt: new Date(serverProject.updatedAt).getTime(),
			createdAt: new Date(serverProject.createdAt).getTime()
		};
	}

	/** Load a Project into the Svelte store */
	private loadProjectIntoStore(projectData: Project): void {
		// Clear existing data
		project.clearProject();

		// Set project info
		project.setProjectInfo(projectData.name, projectData.id);

		// Load venue configuration
		if (projectData.venue) {
			project.updateVenue(projectData.venue);
		}

		// Load shapes
		for (const shape of projectData.shapes) {
			project.addShape(shape.geometry, {
				...shape
				// Don't pass id - let store generate new IDs
			});
		}

		// Load hanging positions
		for (const hp of projectData.hangingPositions) {
			project.addHangingPosition(hp.positionType, hp.x1, hp.y1, hp.x2, hp.y2, {
				name: hp.name,
				locked: hp.locked,
				visible: hp.visible,
				trimHeight: hp.trimHeight,
				height: hp.height,
				labelOffsetX: hp.labelOffsetX,
				labelOffsetY: hp.labelOffsetY
			});
		}

		// Load instruments (need to map to new hanging position IDs)
		// For now, load as free-floating instruments
		for (const inst of projectData.instruments) {
			if (inst.hangingPositionId === null && inst.x !== undefined && inst.y !== undefined) {
				project.addFreeInstrument(inst.x, inst.y, inst.instrumentType, {
					name: inst.name,
					locked: inst.locked,
					visible: inst.visible,
					channel: inst.channel,
					dimmer: inst.dimmer,
					color: inst.color,
					focus: inst.focus,
					rotation: inst.rotation
				});
			}
		}

		// Load set pieces
		for (const sp of projectData.setPieces) {
			project.addSetPiece(sp.geometry, {
				name: sp.name,
				locked: sp.locked,
				visible: sp.visible,
				fill: sp.fill,
				stroke: sp.stroke,
				strokeWidth: sp.strokeWidth,
				layer: sp.layer
			});
		}

		// Load annotations
		for (const ann of projectData.annotations) {
			project.addAnnotation(ann.annotationType, ann.x, ann.y, ann.text, {
				name: ann.name,
				locked: ann.locked,
				visible: ann.visible,
				fontSize: ann.fontSize,
				fontFamily: ann.fontFamily,
				color: ann.color,
				endX: ann.endX,
				endY: ann.endY
			});
		}
	}
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new SyncManager instance
 */
export function createSyncManager(): SyncManager {
	return new SyncManager();
}

// ============================================================================
// Singleton Instance (optional - for simple usage)
// ============================================================================

/** Default SyncManager instance */
let defaultInstance: SyncManager | null = null;

/**
 * Get or create the default SyncManager instance
 */
export function getSyncManager(): SyncManager {
	if (!defaultInstance) {
		defaultInstance = createSyncManager();
	}
	return defaultInstance;
}

/**
 * Dispose of the default SyncManager instance
 */
export async function disposeSyncManager(): Promise<void> {
	if (defaultInstance) {
		await defaultInstance.dispose();
		defaultInstance = null;
	}
}
