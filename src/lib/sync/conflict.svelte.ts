/**
 * Conflict Detection and Resolution
 *
 * Handles version conflicts between local and server states during synchronization.
 * Uses a server-authoritative approach by default, with options for user override.
 *
 * Resolution Strategies:
 * - accept-server (default): Server version wins, local changes discarded
 * - keep-local: Local version wins, will overwrite server on next sync
 * - merge: Attempt to merge changes (basic implementation)
 */

// Using standard Map - these are plain data objects, not reactive state
/* eslint-disable svelte/prefer-svelte-reactivity */

import type { Project } from './indexeddb';
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
 * Information about a detected conflict
 */
export interface ConflictInfo {
	/** Project ID with the conflict */
	projectId: string;
	/** Local version number */
	localVersion: number;
	/** Server version number */
	serverVersion: number;
	/** Local project state */
	localState: Project;
	/** Server project state */
	serverState: Project;
	/** When the conflict was detected */
	detectedAt: number;
}

/**
 * Resolution strategy for conflicts
 */
export type ConflictResolution = 'keep-local' | 'accept-server' | 'merge';

/**
 * Difference between two project states
 */
export interface ProjectDiff {
	/** Changes in shapes */
	shapes: {
		added: ShapeObject[];
		removed: ShapeObject[];
		modified: Array<{ id: string; local: ShapeObject; server: ShapeObject }>;
	};
	/** Changes in hanging positions */
	hangingPositions: {
		added: HangingPositionObject[];
		removed: HangingPositionObject[];
		modified: Array<{
			id: string;
			local: HangingPositionObject;
			server: HangingPositionObject;
		}>;
	};
	/** Changes in instruments */
	instruments: {
		added: InstrumentObject[];
		removed: InstrumentObject[];
		modified: Array<{
			id: string;
			local: InstrumentObject;
			server: InstrumentObject;
		}>;
	};
	/** Changes in set pieces */
	setPieces: {
		added: SetPieceObject[];
		removed: SetPieceObject[];
		modified: Array<{ id: string; local: SetPieceObject; server: SetPieceObject }>;
	};
	/** Changes in annotations */
	annotations: {
		added: AnnotationObject[];
		removed: AnnotationObject[];
		modified: Array<{
			id: string;
			local: AnnotationObject;
			server: AnnotationObject;
		}>;
	};
	/** Summary statistics */
	summary: {
		totalAdded: number;
		totalRemoved: number;
		totalModified: number;
		hasConflicts: boolean;
	};
}

/**
 * ConflictManager interface for external use
 */
export interface ConflictManager {
	/** Whether there is currently a conflict */
	readonly hasConflict: boolean;
	/** Current conflict information, if any */
	readonly conflictInfo: ConflictInfo | null;

	/** Detect if there's a conflict between local and server states */
	detectConflict(
		localState: Project,
		serverState: Project,
		localVersion: number,
		serverVersion: number
	): boolean;

	/** Set conflict information */
	setConflict(info: ConflictInfo): void;

	/** Resolve the current conflict with the specified strategy */
	resolve(resolution: ConflictResolution): Promise<Project>;

	/** Clear the current conflict state */
	clearConflict(): void;

	/** Get a diff between local and server states */
	getDiff(local: Project, server: Project): ProjectDiff;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * ConflictManager implementation using Svelte 5 runes
 */
class ConflictManagerImpl implements ConflictManager {
	// ========================================================================
	// State
	// ========================================================================

	/** Whether there is currently a conflict */
	private _hasConflict = $state(false);

	/** Current conflict information */
	private _conflictInfo = $state<ConflictInfo | null>(null);

	// ========================================================================
	// Getters
	// ========================================================================

	get hasConflict(): boolean {
		return this._hasConflict;
	}

	get conflictInfo(): ConflictInfo | null {
		return this._conflictInfo;
	}

	// ========================================================================
	// Conflict Detection
	// ========================================================================

	/**
	 * Detect if there's a conflict between local and server states
	 *
	 * A conflict occurs when:
	 * 1. Server version is greater than local's known server version
	 * 2. Local has changes that haven't been synced to server
	 */
	detectConflict(
		localState: Project,
		serverState: Project,
		localVersion: number,
		serverVersion: number
	): boolean {
		// No conflict if versions match
		if (localVersion === serverVersion) {
			return false;
		}

		// No conflict if local is ahead and server hasn't changed
		if (localVersion > serverVersion) {
			return false;
		}

		// Server is ahead - check if local has meaningful changes
		// by comparing the actual content, not just versions
		const localContent = this.getContentHash(localState);
		const serverContent = this.getContentHash(serverState);

		// If content is the same, no conflict (versions may differ due to metadata)
		if (localContent === serverContent) {
			return false;
		}

		// Check if local has any changes compared to what we last synced
		// If server is ahead AND local has changes, we have a conflict
		return true;
	}

	// ========================================================================
	// Conflict Management
	// ========================================================================

	/**
	 * Set conflict information
	 */
	setConflict(info: ConflictInfo): void {
		this._conflictInfo = info;
		this._hasConflict = true;
	}

	/**
	 * Clear the current conflict state
	 */
	clearConflict(): void {
		this._conflictInfo = null;
		this._hasConflict = false;
	}

	/**
	 * Resolve the current conflict with the specified strategy
	 */
	async resolve(resolution: ConflictResolution): Promise<Project> {
		if (!this._conflictInfo) {
			throw new Error('No conflict to resolve');
		}

		const { localState, serverState, serverVersion } = this._conflictInfo;
		let resolvedProject: Project;

		switch (resolution) {
			case 'accept-server':
				// Server wins - use server state as-is
				resolvedProject = { ...serverState };
				break;

			case 'keep-local':
				// Local wins - use local state but increment version past server's
				resolvedProject = {
					...localState,
					version: serverVersion + 1
				};
				break;

			case 'merge':
				// Attempt to merge changes
				resolvedProject = this.mergeProjects(localState, serverState);
				resolvedProject.version = serverVersion + 1;
				break;

			default:
				throw new Error(`Unknown resolution strategy: ${resolution}`);
		}

		// Update timestamps
		resolvedProject.updatedAt = Date.now();

		// Clear conflict state
		this.clearConflict();

		return resolvedProject;
	}

	// ========================================================================
	// Diff Calculation
	// ========================================================================

	/**
	 * Get a diff between local and server states
	 */
	getDiff(local: Project, server: Project): ProjectDiff {
		const shapes = this.diffArray(local.shapes, server.shapes);
		const hangingPositions = this.diffArray(local.hangingPositions, server.hangingPositions);
		const instruments = this.diffArray(local.instruments, server.instruments);
		const setPieces = this.diffArray(local.setPieces, server.setPieces);
		const annotations = this.diffArray(local.annotations, server.annotations);

		const totalAdded =
			shapes.added.length +
			hangingPositions.added.length +
			instruments.added.length +
			setPieces.added.length +
			annotations.added.length;

		const totalRemoved =
			shapes.removed.length +
			hangingPositions.removed.length +
			instruments.removed.length +
			setPieces.removed.length +
			annotations.removed.length;

		const totalModified =
			shapes.modified.length +
			hangingPositions.modified.length +
			instruments.modified.length +
			setPieces.modified.length +
			annotations.modified.length;

		return {
			shapes,
			hangingPositions,
			instruments,
			setPieces,
			annotations,
			summary: {
				totalAdded,
				totalRemoved,
				totalModified,
				hasConflicts: totalModified > 0
			}
		};
	}

	// ========================================================================
	// Private Helpers
	// ========================================================================

	/**
	 * Generate a simple content hash for comparison
	 * This is used to detect if actual content has changed vs just metadata
	 */
	private getContentHash(project: Project): string {
		// Create a simplified representation of the project content
		const content = {
			name: project.name,
			shapesCount: project.shapes.length,
			hangingPositionsCount: project.hangingPositions.length,
			instrumentsCount: project.instruments.length,
			setPiecesCount: project.setPieces.length,
			annotationsCount: project.annotations.length,
			// Include IDs to detect additions/removals
			shapeIds: project.shapes.map((s) => s.id).sort(),
			hpIds: project.hangingPositions.map((hp) => hp.id).sort(),
			instIds: project.instruments.map((i) => i.id).sort(),
			spIds: project.setPieces.map((sp) => sp.id).sort(),
			annIds: project.annotations.map((a) => a.id).sort()
		};
		return JSON.stringify(content);
	}

	/**
	 * Diff two arrays of objects by ID
	 */
	private diffArray<T extends { id: string }>(
		local: T[],
		server: T[]
	): {
		added: T[];
		removed: T[];
		modified: Array<{ id: string; local: T; server: T }>;
	} {
		const localMap = new Map(local.map((item) => [item.id, item]));
		const serverMap = new Map(server.map((item) => [item.id, item]));

		const added: T[] = [];
		const removed: T[] = [];
		const modified: Array<{ id: string; local: T; server: T }> = [];

		// Find items in local but not in server (added locally)
		for (const [id, item] of localMap) {
			if (!serverMap.has(id)) {
				added.push(item);
			}
		}

		// Find items in server but not in local (removed locally, or added on server)
		for (const [id, item] of serverMap) {
			if (!localMap.has(id)) {
				removed.push(item);
			}
		}

		// Find items that exist in both but have different content
		for (const [id, localItem] of localMap) {
			const serverItem = serverMap.get(id);
			if (serverItem) {
				if (JSON.stringify(localItem) !== JSON.stringify(serverItem)) {
					modified.push({ id, local: localItem, server: serverItem });
				}
			}
		}

		return { added, removed, modified };
	}

	/**
	 * Merge two projects using a simple strategy:
	 * - For modified items, use the one with more recent changes (or server by default)
	 * - Keep all additions from both sides
	 * - Only remove if both agree on removal
	 */
	private mergeProjects(local: Project, server: Project): Project {
		const diff = this.getDiff(local, server);

		// Start with server state as base (server-authoritative)
		const merged: Project = {
			...server,
			shapes: this.mergeArray(local.shapes, server.shapes, diff.shapes),
			hangingPositions: this.mergeArray(
				local.hangingPositions,
				server.hangingPositions,
				diff.hangingPositions
			),
			instruments: this.mergeArray(local.instruments, server.instruments, diff.instruments),
			setPieces: this.mergeArray(local.setPieces, server.setPieces, diff.setPieces),
			annotations: this.mergeArray(local.annotations, server.annotations, diff.annotations)
		};

		return merged;
	}

	/**
	 * Merge two arrays, keeping additions from both sides
	 */
	private mergeArray<T extends { id: string }>(
		local: T[],
		server: T[],
		diff: {
			added: T[];
			removed: T[];
			modified: Array<{ id: string; local: T; server: T }>;
		}
	): T[] {
		// Start with server items (server-authoritative for conflicts)
		/* eslint-disable svelte/prefer-svelte-reactivity */
		const merged = new Map(server.map((item) => [item.id, item]));
		/* eslint-enable svelte/prefer-svelte-reactivity */

		// Add items that were added locally (not in server)
		for (const item of diff.added) {
			merged.set(item.id, item);
		}

		// For modified items, keep server version (server-authoritative)
		// This is already the case since we started with server

		return Array.from(merged.values());
	}
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a new ConflictManager instance
 */
export function createConflictManager(): ConflictManager {
	return new ConflictManagerImpl();
}

// ============================================================================
// Singleton
// ============================================================================

/** Default ConflictManager instance */
let defaultInstance: ConflictManager | null = null;

/**
 * Get or create the default ConflictManager instance
 */
export function getConflictManager(): ConflictManager {
	if (!defaultInstance) {
		defaultInstance = createConflictManager();
	}
	return defaultInstance;
}

/**
 * Clear the default ConflictManager instance (for testing)
 */
export function clearConflictManager(): void {
	if (defaultInstance) {
		defaultInstance.clearConflict();
		defaultInstance = null;
	}
}
