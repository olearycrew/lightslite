/**
 * Positions (Hanging Positions) Derived Store
 *
 * Provides derived state and utilities for working with hanging positions.
 * Derives data from the project store for efficient access and filtering.
 *
 * Uses Svelte 5 runes for reactive state management.
 */

import {
	project,
	type HangingPositionObject,
	type HangingPositionType,
	type InstrumentObject
} from '../project.svelte';

// ============================================================================
// Types
// ============================================================================

/**
 * Hanging position with computed information
 */
export interface HangingPositionWithDetails extends HangingPositionObject {
	/** Length of the position in pixels */
	length: number;
	/** Angle of the position in degrees (0 = horizontal) */
	angle: number;
	/** Center point of the position */
	centerX: number;
	centerY: number;
	/** Number of instruments on this position */
	instrumentCount: number;
	/** Instruments on this position */
	instruments: InstrumentObject[];
}

/**
 * Grouping of positions by type
 */
export interface PositionsByType {
	type: HangingPositionType;
	typeName: string;
	positions: HangingPositionObject[];
}

// ============================================================================
// Constants
// ============================================================================

const POSITION_TYPE_NAMES: Record<HangingPositionType, string> = {
	electric: 'Electrics',
	truss: 'Trusses',
	ladder: 'Ladders',
	boom: 'Booms',
	'box-boom': 'Box Booms',
	'ground-row': 'Ground Rows'
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Creates the positions derived store
 */
function createPositionsDerivedStore() {
	// ========================================================================
	// Helper Functions
	// ========================================================================

	/**
	 * Calculate the length of a hanging position
	 */
	function calculateLength(position: HangingPositionObject): number {
		const dx = position.x2 - position.x1;
		const dy = position.y2 - position.y1;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Calculate the angle of a hanging position in degrees
	 */
	function calculateAngle(position: HangingPositionObject): number {
		const dx = position.x2 - position.x1;
		const dy = position.y2 - position.y1;
		return (Math.atan2(dy, dx) * 180) / Math.PI;
	}

	/**
	 * Get instruments for a hanging position
	 */
	function getInstrumentsForPosition(positionId: string): InstrumentObject[] {
		return project.instruments.filter((inst) => inst.hangingPositionId === positionId);
	}

	// ========================================================================
	// Derived Values
	// ========================================================================

	// All positions with computed details
	const positionsWithDetails = $derived.by((): HangingPositionWithDetails[] => {
		return project.hangingPositions.map((pos) => {
			const instruments = getInstrumentsForPosition(pos.id);
			return {
				...pos,
				length: calculateLength(pos),
				angle: calculateAngle(pos),
				centerX: (pos.x1 + pos.x2) / 2,
				centerY: (pos.y1 + pos.y2) / 2,
				instrumentCount: instruments.length,
				instruments
			};
		});
	});

	// Total position count
	const count = $derived(project.hangingPositions.length);

	// Positions grouped by type
	const byType = $derived.by((): PositionsByType[] => {
		const groups: Record<HangingPositionType, HangingPositionObject[]> = {
			electric: [],
			truss: [],
			ladder: [],
			boom: [],
			'box-boom': [],
			'ground-row': []
		};

		for (const pos of project.hangingPositions) {
			groups[pos.positionType] = [...groups[pos.positionType], pos];
		}

		// Convert to array format, only including non-empty groups
		const result: PositionsByType[] = [];

		for (const [type, positions] of Object.entries(groups)) {
			if (positions.length > 0) {
				result.push({
					type: type as HangingPositionType,
					typeName: POSITION_TYPE_NAMES[type as HangingPositionType],
					positions
				});
			}
		}

		return result;
	});

	// Count by type
	const countByType = $derived.by((): Record<HangingPositionType, number> => {
		const counts: Record<HangingPositionType, number> = {
			electric: 0,
			truss: 0,
			ladder: 0,
			boom: 0,
			'box-boom': 0,
			'ground-row': 0
		};

		for (const pos of project.hangingPositions) {
			counts[pos.positionType]++;
		}

		return counts;
	});

	// All electrics (most commonly used)
	const electrics = $derived(
		project.hangingPositions.filter((pos) => pos.positionType === 'electric')
	);

	// All trusses
	const trusses = $derived(project.hangingPositions.filter((pos) => pos.positionType === 'truss'));

	// All booms (includes box booms)
	const booms = $derived(
		project.hangingPositions.filter(
			(pos) => pos.positionType === 'boom' || pos.positionType === 'box-boom'
		)
	);

	// Total instrument count across all positions
	const totalInstrumentCount = $derived(
		project.instruments.filter((inst) => inst.hangingPositionId !== null).length
	);

	// ========================================================================
	// Query Functions
	// ========================================================================

	/**
	 * Get a position by ID
	 */
	function getById(id: string): HangingPositionObject | undefined {
		return project.hangingPositions.find((pos) => pos.id === id);
	}

	/**
	 * Get a position with details by ID
	 */
	function getWithDetails(id: string): HangingPositionWithDetails | undefined {
		return positionsWithDetails.find((pos) => pos.id === id);
	}

	/**
	 * Get positions of a specific type
	 */
	function getByType(type: HangingPositionType): HangingPositionObject[] {
		return project.hangingPositions.filter((pos) => pos.positionType === type);
	}

	/**
	 * Find the nearest position to a point
	 */
	function findNearest(
		x: number,
		y: number,
		maxDistance?: number
	): HangingPositionWithDetails | null {
		let nearest: HangingPositionWithDetails | null = null;
		let nearestDistance = maxDistance ?? Infinity;

		for (const pos of positionsWithDetails) {
			// Calculate distance to the line segment
			const dist = distanceToLineSegment(x, y, pos.x1, pos.y1, pos.x2, pos.y2);
			if (dist < nearestDistance) {
				nearestDistance = dist;
				nearest = pos;
			}
		}

		return nearest;
	}

	/**
	 * Find positions within a bounding box
	 */
	function findInBounds(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number
	): HangingPositionWithDetails[] {
		return positionsWithDetails.filter((pos) => {
			// Check if either endpoint is in bounds, or if the line crosses the bounds
			const x1InBounds = pos.x1 >= minX && pos.x1 <= maxX;
			const y1InBounds = pos.y1 >= minY && pos.y1 <= maxY;
			const x2InBounds = pos.x2 >= minX && pos.x2 <= maxX;
			const y2InBounds = pos.y2 >= minY && pos.y2 <= maxY;

			return (x1InBounds && y1InBounds) || (x2InBounds && y2InBounds);
		});
	}

	/**
	 * Get the position along a hanging position for a world point
	 * Returns a value from 0 to 1 (or outside this range if point is off the ends)
	 */
	function getPositionOnBar(positionId: string, worldX: number, worldY: number): number {
		const pos = getById(positionId);
		if (!pos) return 0;

		const dx = pos.x2 - pos.x1;
		const dy = pos.y2 - pos.y1;
		const lengthSquared = dx * dx + dy * dy;

		if (lengthSquared === 0) return 0;

		// Project the point onto the line
		const t = ((worldX - pos.x1) * dx + (worldY - pos.y1) * dy) / lengthSquared;

		// Clamp to [0, 1]
		return Math.max(0, Math.min(1, t));
	}

	// ========================================================================
	// Helper: Distance to Line Segment
	// ========================================================================

	function distanceToLineSegment(
		px: number,
		py: number,
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): number {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const lengthSquared = dx * dx + dy * dy;

		if (lengthSquared === 0) {
			// Line segment is actually a point
			return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
		}

		// Project point onto line, clamped to segment
		const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));

		const projX = x1 + t * dx;
		const projY = y1 + t * dy;

		return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
	}

	// ========================================================================
	// Return Store Interface
	// ========================================================================

	return {
		// Derived state getters
		get all() {
			return project.hangingPositions;
		},
		get withDetails() {
			return positionsWithDetails;
		},
		get count() {
			return count;
		},
		get byType() {
			return byType;
		},
		get countByType() {
			return countByType;
		},
		get electrics() {
			return electrics;
		},
		get trusses() {
			return trusses;
		},
		get booms() {
			return booms;
		},
		get totalInstrumentCount() {
			return totalInstrumentCount;
		},

		// Query functions
		getById,
		getWithDetails,
		getByType,
		findNearest,
		findInBounds,
		getPositionOnBar,

		// Helper exports
		calculateLength,
		calculateAngle,

		// Constants
		POSITION_TYPE_NAMES,

		// Pass-through to project store for mutations
		add: project.addHangingPosition,
		addElectric: project.addElectric,
		update: project.updateHangingPosition,
		delete: project.deleteHangingPosition
	};
}

// Export singleton instance
export const positions = createPositionsDerivedStore();
