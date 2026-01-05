/**
 * Snap Utilities
 *
 * Functions for snapping objects to various targets:
 * - Hanging positions (electrics, booms, etc.)
 * - Grid points
 * - Other objects
 *
 * Used primarily for instrument placement.
 */

import type { HangingPositionObject } from '$lib/stores/project.svelte';

/**
 * Result of a snap operation to a hanging position
 */
export interface HangingPositionSnapResult {
	/** ID of the snapped hanging position */
	id: string;
	/** Position along the bar (0 = start, 1 = end) */
	positionOnBar: number;
	/** World X coordinate of the snap point */
	x: number;
	/** World Y coordinate of the snap point */
	y: number;
	/** Distance from the original point to the snap point */
	distance: number;
	/** The hanging position object (for rendering highlights) */
	hangingPosition: HangingPositionObject;
}

/**
 * Default snap threshold in pixels (at zoom 1.0)
 * This will be divided by zoom level to maintain consistent screen distance
 */
export const DEFAULT_SNAP_THRESHOLD = 30;

/**
 * Calculate the closest point on a line segment to a given point
 */
export function closestPointOnLineSegment(
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): { x: number; y: number; t: number } {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const lengthSq = dx * dx + dy * dy;

	// Handle degenerate line segment (point)
	if (lengthSq === 0) {
		return { x: x1, y: y1, t: 0 };
	}

	// Project point onto line segment (clamped to 0-1)
	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));

	// Calculate the closest point on the line
	return {
		x: x1 + t * dx,
		y: y1 + t * dy,
		t
	};
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest hanging position to a given point
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param hangingPositions - Array of hanging positions to search
 * @returns Snap result or null if no hanging positions
 */
export function findNearestHangingPosition(
	x: number,
	y: number,
	hangingPositions: HangingPositionObject[]
): HangingPositionSnapResult | null {
	let nearest: HangingPositionSnapResult | null = null;

	for (const hp of hangingPositions) {
		// Calculate the closest point on the hanging position line segment
		const closest = closestPointOnLineSegment(x, y, hp.x1, hp.y1, hp.x2, hp.y2);

		// Calculate distance
		const dist = distance(x, y, closest.x, closest.y);

		if (!nearest || dist < nearest.distance) {
			nearest = {
				id: hp.id,
				positionOnBar: closest.t,
				x: closest.x,
				y: closest.y,
				distance: dist,
				hangingPosition: hp
			};
		}
	}

	return nearest;
}

/**
 * Check if a point should snap to a hanging position
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param hangingPositions - Array of hanging positions to search
 * @param threshold - Snap threshold in world coordinates (already adjusted for zoom)
 * @returns Snap result if within threshold, null otherwise
 */
export function snapToHangingPosition(
	x: number,
	y: number,
	hangingPositions: HangingPositionObject[],
	threshold: number
): HangingPositionSnapResult | null {
	const nearest = findNearestHangingPosition(x, y, hangingPositions);

	if (nearest && nearest.distance < threshold) {
		return nearest;
	}

	return null;
}

/**
 * Snap endpoints configuration
 */
export interface EndpointSnapOptions {
	/** Snap to line segment endpoints */
	snapToEndpoints?: boolean;
	/** Snap to center point of segments */
	snapToCenter?: boolean;
	/** Endpoint snap has priority over line snap within this threshold multiplier */
	endpointPriorityMultiplier?: number;
}

/**
 * Find nearest position with endpoint snapping
 *
 * This enhanced version prioritizes snapping to:
 * 1. Hanging position endpoints (start/end)
 * 2. Hanging position center point
 * 3. Closest point on the line segment
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param hangingPositions - Array of hanging positions to search
 * @param threshold - Snap threshold in world coordinates
 * @param options - Endpoint snap options
 * @returns Snap result or null
 */
export function findNearestWithEndpoints(
	x: number,
	y: number,
	hangingPositions: HangingPositionObject[],
	threshold: number,
	options: EndpointSnapOptions = {}
): HangingPositionSnapResult | null {
	const {
		snapToEndpoints = true,
		snapToCenter = true,
		endpointPriorityMultiplier = 0.5 // Endpoints are "closer" by this factor
	} = options;

	let nearest: HangingPositionSnapResult | null = null;

	for (const hp of hangingPositions) {
		// Check endpoints first if enabled
		if (snapToEndpoints) {
			const startDist = distance(x, y, hp.x1, hp.y1);
			const endDist = distance(x, y, hp.x2, hp.y2);

			// Apply priority multiplier - makes endpoints easier to snap to
			const adjustedStartDist = startDist * endpointPriorityMultiplier;
			const adjustedEndDist = endDist * endpointPriorityMultiplier;

			if (startDist < threshold && (!nearest || adjustedStartDist < nearest.distance)) {
				nearest = {
					id: hp.id,
					positionOnBar: 0,
					x: hp.x1,
					y: hp.y1,
					distance: adjustedStartDist, // Use adjusted for comparison
					hangingPosition: hp
				};
			}

			if (endDist < threshold && (!nearest || adjustedEndDist < nearest.distance)) {
				nearest = {
					id: hp.id,
					positionOnBar: 1,
					x: hp.x2,
					y: hp.y2,
					distance: adjustedEndDist, // Use adjusted for comparison
					hangingPosition: hp
				};
			}
		}

		// Check center point if enabled
		if (snapToCenter) {
			const centerX = (hp.x1 + hp.x2) / 2;
			const centerY = (hp.y1 + hp.y2) / 2;
			const centerDist = distance(x, y, centerX, centerY);
			const adjustedCenterDist = centerDist * endpointPriorityMultiplier;

			if (centerDist < threshold && (!nearest || adjustedCenterDist < nearest.distance)) {
				nearest = {
					id: hp.id,
					positionOnBar: 0.5,
					x: centerX,
					y: centerY,
					distance: adjustedCenterDist,
					hangingPosition: hp
				};
			}
		}

		// Also check closest point on line (no priority adjustment)
		const closest = closestPointOnLineSegment(x, y, hp.x1, hp.y1, hp.x2, hp.y2);
		const dist = distance(x, y, closest.x, closest.y);

		if (dist < threshold && (!nearest || dist < nearest.distance)) {
			nearest = {
				id: hp.id,
				positionOnBar: closest.t,
				x: closest.x,
				y: closest.y,
				distance: dist,
				hangingPosition: hp
			};
		}
	}

	return nearest;
}

/**
 * Calculate the rotation angle for an instrument placed on a hanging position
 *
 * By default, instruments point perpendicular to the hanging position
 * (e.g., lights on an electric point toward the audience)
 *
 * @param hangingPosition - The hanging position
 * @param facingDirection - 'downstage' (toward y+), 'upstage' (toward y-), or 'auto'
 * @returns Rotation angle in degrees
 */
export function calculateInstrumentRotation(
	hangingPosition: HangingPositionObject,
	facingDirection: 'downstage' | 'upstage' | 'auto' = 'downstage'
): number {
	const dx = hangingPosition.x2 - hangingPosition.x1;
	const dy = hangingPosition.y2 - hangingPosition.y1;

	// Calculate angle of the hanging position
	const hpAngle = Math.atan2(dy, dx) * (180 / Math.PI);

	// Perpendicular to the hanging position
	let rotation = hpAngle + 90;

	// Adjust based on facing direction
	if (facingDirection === 'upstage') {
		rotation += 180;
	} else if (facingDirection === 'auto') {
		// Auto: point downstage (positive Y direction in stage coordinates)
		// If perpendicular points upstage, flip it
		const perpY = Math.sin((rotation * Math.PI) / 180);
		if (perpY < 0) {
			rotation += 180;
		}
	}

	// Normalize to 0-360
	while (rotation < 0) rotation += 360;
	while (rotation >= 360) rotation -= 360;

	return rotation;
}
