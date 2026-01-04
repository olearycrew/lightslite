/**
 * IndexedDB Persistence Layer
 *
 * Provides local persistence for LightsLite using IndexedDB.
 * Features:
 * - Auto-save with debounce (~500ms)
 * - Crash recovery (last 50 state snapshots)
 * - Full project export as JSON
 *
 * Uses the `idb` library for a promise-based IndexedDB API.
 */

import { openDB, type IDBPDatabase } from 'idb';
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

/**
 * Full project state that can be serialized and stored
 */
export interface Project {
	/** Unique project identifier */
	id: string;
	/** Project name */
	name: string;
	/** Version for sync (incremented on each save) */
	version: number;
	/** Canvas shapes */
	shapes: ShapeObject[];
	/** Hanging positions (electrics, trusses, etc.) */
	hangingPositions: HangingPositionObject[];
	/** Instruments on positions or free-floating */
	instruments: InstrumentObject[];
	/** Set pieces (scenic elements) */
	setPieces: SetPieceObject[];
	/** Annotations (text, dimensions, notes) */
	annotations: AnnotationObject[];
	/** Project metadata (venue, scale, etc.) */
	metadata?: ProjectMetadata;
	/** Last modified timestamp */
	updatedAt: number;
	/** Created timestamp */
	createdAt: number;
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
	/** Venue name */
	venue?: string;
	/** Designer name */
	designer?: string;
	/** Production name */
	production?: string;
	/** Scale (e.g., "1/4 inch = 1 foot") */
	scale?: string;
	/** Additional notes */
	notes?: string;
}

/**
 * Project metadata for listing (without full data)
 */
export interface ProjectMeta {
	id: string;
	name: string;
	version: number;
	updatedAt: number;
	createdAt: number;
	metadata?: ProjectMetadata;
}

/**
 * Recovery snapshot for crash recovery
 */
export interface RecoverySnapshot {
	/** Unique snapshot identifier */
	id: string;
	/** Project ID this snapshot belongs to */
	projectId: string;
	/** Full project state at this point */
	state: Project;
	/** Timestamp when snapshot was taken */
	timestamp: number;
	/** Session ID to track browser sessions */
	sessionId: string;
}

/**
 * Crashed session information
 */
export interface CrashedSession {
	/** Project ID from the crashed session */
	projectId: string;
	/** Project name */
	projectName: string;
	/** Session ID that crashed */
	sessionId: string;
	/** When the crash was detected */
	detectedAt: number;
	/** Number of available recovery snapshots */
	snapshotCount: number;
	/** Most recent snapshot timestamp */
	latestSnapshot: number;
}

/**
 * App metadata stored in IndexedDB
 */
export interface AppMetadata {
	/** Key for the metadata entry */
	key: string;
	/** Last opened project ID */
	lastProjectId?: string;
	/** Current session ID */
	currentSessionId?: string;
	/** Session start timestamp */
	sessionStartedAt?: number;
	/** Whether the last session ended cleanly */
	cleanShutdown?: boolean;
}

/**
 * Database schema interface
 */
interface LightsLiteDB {
	projects: {
		key: string;
		value: Project;
		indexes: { 'by-updated': number };
	};
	recovery: {
		key: string;
		value: RecoverySnapshot;
		indexes: {
			'by-project': string;
			'by-timestamp': number;
			'by-session': string;
		};
	};
	metadata: {
		key: string;
		value: AppMetadata;
	};
}

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'lightslite';
const DB_VERSION = 1;
const MAX_RECOVERY_SNAPSHOTS = 50;
const AUTO_SAVE_DEBOUNCE_MS = 500;

// Generate a unique session ID for this browser session
let currentSessionId: string | null = null;

function getSessionId(): string {
	if (!currentSessionId) {
		currentSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}
	return currentSessionId;
}

// ============================================================================
// Database Initialization
// ============================================================================

let dbInstance: IDBPDatabase<LightsLiteDB> | null = null;

/**
 * Initialize and return the IndexedDB database
 */
export async function initDB(): Promise<IDBPDatabase<LightsLiteDB>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<LightsLiteDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion) {
			// Projects store
			if (!db.objectStoreNames.contains('projects')) {
				const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
				projectStore.createIndex('by-updated', 'updatedAt');
			}

			// Recovery snapshots store
			if (!db.objectStoreNames.contains('recovery')) {
				const recoveryStore = db.createObjectStore('recovery', { keyPath: 'id' });
				recoveryStore.createIndex('by-project', 'projectId');
				recoveryStore.createIndex('by-timestamp', 'timestamp');
				recoveryStore.createIndex('by-session', 'sessionId');
			}

			// Metadata store
			if (!db.objectStoreNames.contains('metadata')) {
				db.createObjectStore('metadata', { keyPath: 'key' });
			}

			// Future migrations can be handled here based on oldVersion
			if (oldVersion < 1) {
				// Initial schema - nothing additional needed
			}
		},
		blocked() {
			console.warn('IndexedDB upgrade blocked - close other tabs');
		},
		blocking() {
			console.warn('This tab is blocking IndexedDB upgrade');
		}
	});

	return dbInstance;
}

/**
 * Close the database connection (useful for testing)
 */
export async function closeDB(): Promise<void> {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}
}

// ============================================================================
// Project Operations
// ============================================================================

/**
 * Save a project to IndexedDB
 */
export async function saveProject(project: Project): Promise<void> {
	const db = await initDB();
	await db.put('projects', {
		...project,
		updatedAt: Date.now()
	});
}

/**
 * Load a project from IndexedDB by ID
 */
export async function loadProject(id: string): Promise<Project | null> {
	const db = await initDB();
	const project = await db.get('projects', id);
	return project ?? null;
}

/**
 * Delete a project from IndexedDB
 */
export async function deleteProject(id: string): Promise<void> {
	const db = await initDB();
	await db.delete('projects', id);

	// Also clear any recovery data for this project
	await clearRecoveryData(id);
}

/**
 * List all projects (metadata only)
 */
export async function listProjects(): Promise<ProjectMeta[]> {
	const db = await initDB();
	const projects = await db.getAllFromIndex('projects', 'by-updated');

	// Return in reverse order (most recent first)
	return projects.reverse().map((p) => ({
		id: p.id,
		name: p.name,
		version: p.version,
		updatedAt: p.updatedAt,
		createdAt: p.createdAt,
		metadata: p.metadata
	}));
}

/**
 * Create a new empty project
 */
export function createEmptyProject(id: string, name: string): Project {
	const now = Date.now();
	return {
		id,
		name,
		version: 1,
		shapes: [],
		hangingPositions: [],
		instruments: [],
		setPieces: [],
		annotations: [],
		updatedAt: now,
		createdAt: now
	};
}

// ============================================================================
// Auto-Save with Debounce
// ============================================================================

/**
 * Creates a debounced auto-saver for a project
 * @param getState Function that returns the current project state
 * @returns Object with save (debounced) and flush (immediate) methods
 */
export function createAutoSaver(getState: () => Project): {
	save: () => void;
	flush: () => Promise<void>;
	isDirty: () => boolean;
} {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let pendingSave: Promise<void> | null = null;
	let dirty = false;

	const doSave = async (): Promise<void> => {
		const state = getState();
		await saveProject(state);
		await saveRecoverySnapshot(state);
		dirty = false;
	};

	const save = (): void => {
		dirty = true;

		// Clear any existing timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Set up a new debounced save
		timeoutId = setTimeout(() => {
			timeoutId = null;
			pendingSave = doSave().finally(() => {
				pendingSave = null;
			});
		}, AUTO_SAVE_DEBOUNCE_MS);
	};

	const flush = async (): Promise<void> => {
		// Clear any pending debounced save
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		// Wait for any in-progress save
		if (pendingSave) {
			await pendingSave;
		}

		// Save if dirty
		if (dirty) {
			await doSave();
		}
	};

	const isDirty = (): boolean => dirty;

	return { save, flush, isDirty };
}

// ============================================================================
// Crash Recovery
// ============================================================================

/**
 * Save a recovery snapshot for crash recovery
 */
export async function saveRecoverySnapshot(state: Project): Promise<void> {
	const db = await initDB();
	const sessionId = getSessionId();

	const snapshot: RecoverySnapshot = {
		id: `recovery-${state.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		projectId: state.id,
		state: structuredClone(state),
		timestamp: Date.now(),
		sessionId
	};

	await db.put('recovery', snapshot);

	// Prune old snapshots to keep only MAX_RECOVERY_SNAPSHOTS per project
	await pruneRecoverySnapshots(state.id);
}

/**
 * Prune old recovery snapshots to keep only the most recent ones
 */
async function pruneRecoverySnapshots(projectId: string): Promise<void> {
	const db = await initDB();
	const snapshots = await db.getAllFromIndex('recovery', 'by-project', projectId);

	// Sort by timestamp descending
	snapshots.sort((a, b) => b.timestamp - a.timestamp);

	// Delete snapshots beyond the limit
	const toDelete = snapshots.slice(MAX_RECOVERY_SNAPSHOTS);
	const tx = db.transaction('recovery', 'readwrite');

	for (const snapshot of toDelete) {
		await tx.store.delete(snapshot.id);
	}

	await tx.done;
}

/**
 * Get recovery snapshots for a project
 */
export async function getRecoverySnapshots(projectId: string): Promise<RecoverySnapshot[]> {
	const db = await initDB();
	const snapshots = await db.getAllFromIndex('recovery', 'by-project', projectId);

	// Return sorted by timestamp (most recent first)
	return snapshots.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Detect if there was a crashed session
 */
export async function detectCrashedSession(): Promise<CrashedSession | null> {
	const db = await initDB();

	// Get the app metadata
	const metadata = await db.get('metadata', 'app');

	// Check if the last session ended cleanly
	if (metadata && metadata.cleanShutdown === false && metadata.lastProjectId) {
		const snapshots = await getRecoverySnapshots(metadata.lastProjectId);

		if (snapshots.length > 0 && snapshots[0].sessionId !== getSessionId()) {
			const latestSnapshot = snapshots[0];

			return {
				projectId: metadata.lastProjectId,
				projectName: latestSnapshot.state.name,
				sessionId: latestSnapshot.sessionId,
				detectedAt: Date.now(),
				snapshotCount: snapshots.length,
				latestSnapshot: latestSnapshot.timestamp
			};
		}
	}

	return null;
}

/**
 * Clear recovery data for a project
 */
export async function clearRecoveryData(projectId: string): Promise<void> {
	const db = await initDB();
	const snapshots = await db.getAllFromIndex('recovery', 'by-project', projectId);

	const tx = db.transaction('recovery', 'readwrite');
	for (const snapshot of snapshots) {
		await tx.store.delete(snapshot.id);
	}
	await tx.done;
}

/**
 * Mark the current session as active (call on app start)
 */
export async function markSessionActive(projectId?: string): Promise<void> {
	const db = await initDB();
	const sessionId = getSessionId();

	await db.put('metadata', {
		key: 'app',
		lastProjectId: projectId,
		currentSessionId: sessionId,
		sessionStartedAt: Date.now(),
		cleanShutdown: false
	});
}

/**
 * Mark the current session as cleanly ended (call on app close)
 */
export async function markSessionClean(): Promise<void> {
	const db = await initDB();
	const metadata = await db.get('metadata', 'app');

	if (metadata) {
		await db.put('metadata', {
			...metadata,
			cleanShutdown: true
		});
	}
}

/**
 * Recover from a specific snapshot
 */
export async function recoverFromSnapshot(snapshotId: string): Promise<Project | null> {
	const db = await initDB();
	const snapshot = await db.get('recovery', snapshotId);

	if (snapshot) {
		// Save the recovered state as the current project
		await saveProject(snapshot.state);
		return snapshot.state;
	}

	return null;
}

// ============================================================================
// Export
// ============================================================================

/**
 * Export a project as a JSON string
 */
export function exportProjectAsJSON(project: Project): string {
	const exportData = {
		version: '1.0',
		exportedAt: new Date().toISOString(),
		application: 'LightsLite',
		project: {
			...project,
			// Remove internal fields that shouldn't be in export
			id: undefined,
			version: undefined
		}
	};

	return JSON.stringify(exportData, null, 2);
}

/**
 * Import a project from JSON string
 */
export function importProjectFromJSON(
	json: string,
	newId: string
): { project: Project; success: boolean; error?: string } {
	try {
		const data = JSON.parse(json);

		// Validate the import format
		if (!data.project || !data.application) {
			return {
				project: createEmptyProject(newId, 'Imported Project'),
				success: false,
				error: 'Invalid import format'
			};
		}

		const now = Date.now();
		const project: Project = {
			id: newId,
			name: data.project.name || 'Imported Project',
			version: 1,
			shapes: data.project.shapes || [],
			hangingPositions: data.project.hangingPositions || [],
			instruments: data.project.instruments || [],
			setPieces: data.project.setPieces || [],
			annotations: data.project.annotations || [],
			metadata: data.project.metadata,
			updatedAt: now,
			createdAt: now
		};

		return { project, success: true };
	} catch (e) {
		return {
			project: createEmptyProject(newId, 'Imported Project'),
			success: false,
			error: e instanceof Error ? e.message : 'Unknown error parsing JSON'
		};
	}
}

// ============================================================================
// Metadata Operations
// ============================================================================

/**
 * Get the last opened project ID
 */
export async function getLastProjectId(): Promise<string | null> {
	const db = await initDB();
	const metadata = await db.get('metadata', 'app');
	return metadata?.lastProjectId ?? null;
}

/**
 * Set the last opened project ID
 */
export async function setLastProjectId(projectId: string): Promise<void> {
	const db = await initDB();
	const metadata = (await db.get('metadata', 'app')) ?? { key: 'app' };

	await db.put('metadata', {
		...metadata,
		lastProjectId: projectId
	});
}
