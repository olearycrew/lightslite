/**
 * Instruments Derived Store
 *
 * Provides derived state and utilities for working with instruments.
 * Derives data from the project store for efficient access and filtering.
 *
 * Uses Svelte 5 runes for reactive state management.
 */

import { project, type InstrumentObject, type HangingPositionObject } from '../project.svelte';

// ============================================================================
// Types
// ============================================================================

/**
 * Instrument with computed position information
 */
export interface InstrumentWithPosition extends InstrumentObject {
	/** Computed world X coordinate */
	worldX: number;
	/** Computed world Y coordinate */
	worldY: number;
	/** The hanging position this instrument is on (if any) */
	hangingPosition: HangingPositionObject | null;
}

/**
 * Grouping of instruments by hanging position
 */
export interface InstrumentsByPosition {
	positionId: string | null;
	positionName: string;
	instruments: InstrumentObject[];
}

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Creates the instruments derived store
 */
function createInstrumentsDerivedStore() {
	// ========================================================================
	// Helper Functions
	// ========================================================================

	/**
	 * Calculate world position for an instrument
	 */
	function calculateInstrumentPosition(instrument: InstrumentObject): { x: number; y: number } {
		if (instrument.hangingPositionId === null) {
			// Free-floating instrument
			return {
				x: instrument.x ?? 0,
				y: instrument.y ?? 0
			};
		}

		// Find the hanging position
		const position = project.hangingPositions.find((hp) => hp.id === instrument.hangingPositionId);
		if (!position) {
			return { x: 0, y: 0 };
		}

		// Calculate position along the hanging position line
		const t = instrument.positionOnBar;
		return {
			x: position.x1 + (position.x2 - position.x1) * t,
			y: position.y1 + (position.y2 - position.y1) * t
		};
	}

	// ========================================================================
	// Derived Values
	// ========================================================================

	// All instruments with computed positions
	const instrumentsWithPositions = $derived.by((): InstrumentWithPosition[] => {
		return project.instruments.map((inst) => {
			const pos = calculateInstrumentPosition(inst);
			const hangingPosition = inst.hangingPositionId
				? (project.hangingPositions.find((hp) => hp.id === inst.hangingPositionId) ?? null)
				: null;

			return {
				...inst,
				worldX: pos.x,
				worldY: pos.y,
				hangingPosition
			};
		});
	});

	// Total instrument count
	const count = $derived(project.instruments.length);

	// Instruments grouped by hanging position
	const byHangingPosition = $derived.by((): InstrumentsByPosition[] => {
		// Build a record for grouping (plain object, not Map)
		const groups: Record<string, InstrumentObject[]> = {};
		let freeFloating: InstrumentObject[] = [];

		// Initialize with all hanging positions
		for (const hp of project.hangingPositions) {
			groups[hp.id] = [];
		}

		// Group instruments
		for (const inst of project.instruments) {
			if (inst.hangingPositionId === null) {
				freeFloating = [...freeFloating, inst];
			} else {
				const group = groups[inst.hangingPositionId];
				if (group) {
					groups[inst.hangingPositionId] = [...group, inst];
				} else {
					// Instrument references non-existent position, treat as free-floating
					freeFloating = [...freeFloating, inst];
				}
			}
		}

		// Convert to array format
		const result: InstrumentsByPosition[] = [];

		// Add hanging position groups
		for (const hp of project.hangingPositions) {
			const instruments = groups[hp.id] ?? [];
			if (instruments.length > 0) {
				result.push({
					positionId: hp.id,
					positionName: hp.name,
					instruments
				});
			}
		}

		// Add free-floating group
		if (freeFloating.length > 0) {
			result.push({
				positionId: null,
				positionName: 'Free-floating',
				instruments: freeFloating
			});
		}

		return result;
	});

	// Instruments grouped by channel (returns a Record, not Map)
	const byChannel = $derived.by((): Record<number, InstrumentObject[]> => {
		const groups: Record<number, InstrumentObject[]> = {};

		for (const inst of project.instruments) {
			if (inst.channel !== undefined) {
				const group = groups[inst.channel];
				if (group) {
					groups[inst.channel] = [...group, inst];
				} else {
					groups[inst.channel] = [inst];
				}
			}
		}

		return groups;
	});

	// Instruments grouped by instrument type (returns a Record, not Map)
	const byType = $derived.by((): Record<string, InstrumentObject[]> => {
		const groups: Record<string, InstrumentObject[]> = {};

		for (const inst of project.instruments) {
			const group = groups[inst.instrumentType];
			if (group) {
				groups[inst.instrumentType] = [...group, inst];
			} else {
				groups[inst.instrumentType] = [inst];
			}
		}

		return groups;
	});

	// All unique channels in use
	const usedChannels = $derived.by((): number[] => {
		const channelSet: Record<number, true> = {};
		for (const inst of project.instruments) {
			if (inst.channel !== undefined) {
				channelSet[inst.channel] = true;
			}
		}
		return Object.keys(channelSet)
			.map(Number)
			.sort((a, b) => a - b);
	});

	// All unique instrument types in use
	const usedTypes = $derived.by((): string[] => {
		const typeSet: Record<string, true> = {};
		for (const inst of project.instruments) {
			typeSet[inst.instrumentType] = true;
		}
		return Object.keys(typeSet).sort();
	});

	// Next available channel number
	const nextAvailableChannel = $derived.by((): number => {
		if (usedChannels.length === 0) return 1;
		return Math.max(...usedChannels) + 1;
	});

	// ========================================================================
	// Query Functions
	// ========================================================================

	/**
	 * Get an instrument by ID
	 */
	function getById(id: string): InstrumentObject | undefined {
		return project.instruments.find((inst) => inst.id === id);
	}

	/**
	 * Get instruments on a specific hanging position
	 */
	function getByHangingPosition(positionId: string): InstrumentObject[] {
		return project.instruments.filter((inst) => inst.hangingPositionId === positionId);
	}

	/**
	 * Get instrument with computed position by ID
	 */
	function getWithPosition(id: string): InstrumentWithPosition | undefined {
		return instrumentsWithPositions.find((inst) => inst.id === id);
	}

	/**
	 * Get instruments by channel number
	 */
	function getByChannel(channel: number): InstrumentObject[] {
		return project.instruments.filter((inst) => inst.channel === channel);
	}

	/**
	 * Get instruments by type
	 */
	function getByType(type: string): InstrumentObject[] {
		return project.instruments.filter((inst) => inst.instrumentType === type);
	}

	/**
	 * Find instruments within a bounding box (world coordinates)
	 */
	function findInBounds(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number
	): InstrumentWithPosition[] {
		return instrumentsWithPositions.filter(
			(inst) =>
				inst.worldX >= minX && inst.worldX <= maxX && inst.worldY >= minY && inst.worldY <= maxY
		);
	}

	// ========================================================================
	// Return Store Interface
	// ========================================================================

	return {
		// Derived state getters
		get all() {
			return project.instruments;
		},
		get withPositions() {
			return instrumentsWithPositions;
		},
		get count() {
			return count;
		},
		get byHangingPosition() {
			return byHangingPosition;
		},
		get byChannel(): Record<number, InstrumentObject[]> {
			return byChannel;
		},
		get byType(): Record<string, InstrumentObject[]> {
			return byType;
		},
		get usedChannels() {
			return usedChannels;
		},
		get usedTypes() {
			return usedTypes;
		},
		get nextAvailableChannel() {
			return nextAvailableChannel;
		},

		// Query functions
		getById,
		getByHangingPosition,
		getWithPosition,
		getByChannel,
		getByType,
		findInBounds,

		// Pass-through to project store for mutations
		add: project.addInstrument,
		addFree: project.addFreeInstrument,
		update: project.updateInstrument,
		delete: project.deleteInstrument
	};
}

// Export singleton instance
export const instruments = createInstrumentsDerivedStore();
