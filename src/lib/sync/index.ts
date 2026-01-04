/**
 * Sync Module
 *
 * Re-exports all sync-related functionality:
 * - IndexedDB persistence layer for local storage
 * - SyncManager for orchestrating server sync
 */

// IndexedDB persistence layer
export {
	// Types
	type Project,
	type ProjectMeta,
	type ProjectMetadata,
	type RecoverySnapshot,
	type CrashedSession,
	type AppMetadata,
	// Database initialization
	initDB,
	closeDB,
	// Project operations
	saveProject,
	loadProject,
	deleteProject,
	listProjects,
	createEmptyProject,
	// Auto-save
	createAutoSaver,
	// Crash recovery
	saveRecoverySnapshot,
	getRecoverySnapshots,
	detectCrashedSession,
	clearRecoveryData,
	markSessionActive,
	markSessionClean,
	recoverFromSnapshot,
	// Export/Import
	exportProjectAsJSON,
	importProjectFromJSON,
	// Metadata
	getLastProjectId,
	setLastProjectId
} from './indexeddb';

// SyncManager for server synchronization
export {
	// Types
	type SyncStatus,
	type SyncResult,
	// Class
	SyncManager,
	// Factory function
	createSyncManager,
	// Singleton helpers
	getSyncManager,
	disposeSyncManager
} from './manager';
