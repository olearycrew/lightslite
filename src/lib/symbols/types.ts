/**
 * Symbol Types
 *
 * Type definitions for instrument symbols used in the lighting plot.
 * These define how each instrument type is visually represented.
 */

import type { InstrumentType, InstrumentCategory } from '$lib/types/instrument';

/**
 * Definition for an instrument symbol
 */
export interface SymbolDefinition {
	/** SVG path d attribute for the symbol shape */
	path: string;
	/** Additional SVG paths for internal details (optional) */
	detailPaths?: string[];
	/** Default width of the symbol in canvas units */
	width: number;
	/** Default height of the symbol in canvas units */
	height: number;
	/** Origin point for rotation (center of the symbol) */
	origin: { x: number; y: number };
	/** Offset for label placement relative to origin */
	labelOffset: { x: number; y: number };
	/** Category for grouping */
	category: InstrumentCategory;
	/** Front indicator offset (where the beam direction indicator should be) */
	frontIndicator?: { x: number; y: number };
	/** Whether this symbol should have a front direction indicator */
	showFrontIndicator: boolean;
	/** Default fill color */
	defaultFill: string;
	/** Default stroke color */
	defaultStroke: string;
}

/**
 * Symbol registry type - maps instrument types to their symbol definitions
 */
export type SymbolRegistry = Record<InstrumentType, SymbolDefinition>;

/**
 * Symbol render context - passed to symbol rendering functions
 */
export interface SymbolRenderContext {
	/** World x position */
	x: number;
	/** World y position */
	y: number;
	/** Rotation in degrees */
	rotation: number;
	/** Scale factor (1.0 = normal size) */
	scale: number;
	/** Fill color override */
	fill?: string;
	/** Stroke color override */
	stroke?: string;
	/** Stroke width */
	strokeWidth: number;
	/** Whether the symbol is selected */
	isSelected: boolean;
	/** Whether the symbol is hovered */
	isHovered: boolean;
	/** Current viewport zoom level */
	zoom: number;
}

/**
 * Calculate the bounding box for a symbol at a given position
 */
export function getSymbolBounds(
	symbol: SymbolDefinition,
	x: number,
	y: number,
	rotation: number,
	scale: number = 1
): { x: number; y: number; width: number; height: number } {
	const width = symbol.width * scale;
	const height = symbol.height * scale;

	// For rotated symbols, calculate the axis-aligned bounding box
	if (rotation !== 0) {
		const rad = (rotation * Math.PI) / 180;
		const cos = Math.abs(Math.cos(rad));
		const sin = Math.abs(Math.sin(rad));
		const rotatedWidth = width * cos + height * sin;
		const rotatedHeight = width * sin + height * cos;
		return {
			x: x - rotatedWidth / 2,
			y: y - rotatedHeight / 2,
			width: rotatedWidth,
			height: rotatedHeight
		};
	}

	return {
		x: x - width / 2,
		y: y - height / 2,
		width,
		height
	};
}

/**
 * Get the front indicator position for a symbol (after rotation)
 */
export function getFrontIndicatorPosition(
	symbol: SymbolDefinition,
	x: number,
	y: number,
	rotation: number,
	scale: number = 1
): { x: number; y: number } | null {
	if (!symbol.showFrontIndicator || !symbol.frontIndicator) {
		return null;
	}

	const rad = (rotation * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	const fx = symbol.frontIndicator.x * scale;
	const fy = symbol.frontIndicator.y * scale;

	return {
		x: x + fx * cos - fy * sin,
		y: y + fx * sin + fy * cos
	};
}
