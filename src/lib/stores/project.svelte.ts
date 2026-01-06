/**
 * Project Store
 *
 * Central state management for all project data including:
 * - Canvas objects (shapes, annotations)
 * - Hanging positions (electrics, trusses, ladders, booms)
 * - Instruments
 * - Set pieces
 *
 * Uses Svelte 5 runes for reactive state management.
 */

import { SvelteMap } from 'svelte/reactivity';
import type { Geometry, LineGeometry, RectGeometry, CircleGeometry } from '$lib/types';
import { getGeometryBounds, translateGeometry } from '$lib/types';
import type { SelectionType } from './selection.svelte';

// ============================================================================
// Types
// ============================================================================

/** Venue configuration - defines the stage/venue space */
export interface Venue {
	/** Venue name */
	name: string;
	/** Stage boundary rectangle (in world coordinates, pixels) */
	stageBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	} | null;
	/** Proscenium width in feet (null if no proscenium) */
	prosceniumWidth: number | null;
	/** Proscenium height in feet (null if no proscenium) */
	prosceniumHeight: number | null;
	/** Y coordinate of plaster line (reference point) - typically 0 */
	plasterLine: number;
	/** X coordinate of center line - typically 0 */
	centerLine: number;
	/** Whether to show the stage bounds rectangle */
	showStageBounds: boolean;
}

/** Default venue configuration */
const DEFAULT_VENUE: Venue = {
	name: '',
	stageBounds: null,
	prosceniumWidth: null,
	prosceniumHeight: null,
	plasterLine: 0,
	centerLine: 0,
	showStageBounds: true
};

/** Hanging position types */
export type HangingPositionType =
	| 'electric'
	| 'truss'
	| 'ladder'
	| 'boom'
	| 'box-boom'
	| 'ground-row';

/** Base properties for all canvas objects */
export interface BaseCanvasObject {
	id: string;
	name: string;
	locked: boolean;
	visible: boolean;
}

/** A basic shape on the canvas */
export interface ShapeObject extends BaseCanvasObject {
	objectType: 'shape';
	geometry: Geometry;
	fill?: string;
	fillOpacity?: number; // 0-1, default 1.0
	stroke?: string;
	strokeWidth?: number;
}

/** Label position options for hanging positions */
export type LabelPosition = 'left' | 'right' | 'above' | 'below';

/** A hanging position (electric, truss, ladder, boom, etc.) */
export interface HangingPositionObject extends BaseCanvasObject {
	objectType: 'hanging-position';
	positionType: HangingPositionType;
	/** Start point for line-based positions */
	x1: number;
	y1: number;
	/** End point for line-based positions */
	x2: number;
	y2: number;
	/** Trim height in feet (for electrics, trusses) */
	trimHeight?: number;
	/** For booms: height above floor */
	height?: number;
	/** Label position relative to the line (left, right, above, below) */
	labelPosition?: LabelPosition;
	/** Label position offset (additional adjustment) */
	labelOffsetX?: number;
	labelOffsetY?: number;
}

/** An instrument on a hanging position or free-floating on canvas */
export interface InstrumentObject extends BaseCanvasObject {
	objectType: 'instrument';
	/** ID of the hanging position this instrument is on (null if free-floating) */
	hangingPositionId: string | null;
	/** Position along the hanging position (0-1), only used if on a hanging position */
	positionOnBar: number;
	/** World X coordinate (only used for free-floating instruments) */
	x?: number;
	/** World Y coordinate (only used for free-floating instruments) */
	y?: number;
	/** Instrument type/symbol ID */
	instrumentType: string;
	/** Channel number */
	channel?: number;
	/** Dimmer number */
	dimmer?: number;
	/** Color/gel information */
	color?: string;
	/** Focus notes */
	focus?: string;
	/** Rotation in degrees */
	rotation: number;
}

/** A set piece (scenic element) */
export interface SetPieceObject extends BaseCanvasObject {
	objectType: 'set-piece';
	geometry: Geometry;
	fill?: string;
	fillOpacity?: number; // 0-1, default 1.0
	stroke?: string;
	strokeWidth?: number;
	/** Optional layer for organization */
	layer?: string;
}

/** An annotation (text, dimension, note) */
export interface AnnotationObject extends BaseCanvasObject {
	objectType: 'annotation';
	annotationType: 'text' | 'dimension' | 'note';
	x: number;
	y: number;
	text: string;
	fontSize?: number;
	fontFamily?: string;
	color?: string;
	/** For dimension annotations */
	endX?: number;
	endY?: number;
}

/** Union type for all canvas objects */
export type CanvasObject =
	| ShapeObject
	| HangingPositionObject
	| InstrumentObject
	| SetPieceObject
	| AnnotationObject;

/** Map object type to selection type */
const OBJECT_TYPE_TO_SELECTION_TYPE: Record<
	CanvasObject['objectType'],
	Exclude<SelectionType, 'mixed' | null>
> = {
	shape: 'annotation', // Shapes are treated as annotations for selection
	'hanging-position': 'hanging-position',
	instrument: 'instrument',
	'set-piece': 'set-piece',
	annotation: 'annotation'
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Creates the project store for managing all canvas objects
 */
function createProjectStore() {
	// Use SvelteMap for reactive collections with O(1) lookup
	const shapes = new SvelteMap<string, ShapeObject>();
	const hangingPositions = new SvelteMap<string, HangingPositionObject>();
	const instruments = new SvelteMap<string, InstrumentObject>();
	const setPieces = new SvelteMap<string, SetPieceObject>();
	const annotations = new SvelteMap<string, AnnotationObject>();

	// ID counter for generating unique IDs
	let idCounter = $state(0);

	// Project metadata
	let projectName = $state('Untitled Project');
	let projectId = $state<string | null>(null);

	// Venue configuration
	let venue = $state<Venue>({ ...DEFAULT_VENUE });

	// ========================================================================
	// ID Generation
	// ========================================================================

	/**
	 * Generate a unique ID for a new object
	 */
	function generateId(prefix: string): string {
		idCounter++;
		return `${prefix}-${idCounter}-${Date.now().toString(36)}`;
	}

	// ========================================================================
	// Shape Operations
	// ========================================================================

	/**
	 * Add a new shape to the canvas
	 */
	function addShape(
		geometry: Geometry,
		options: Partial<Omit<ShapeObject, 'id' | 'objectType' | 'geometry'>> = {}
	): ShapeObject {
		const shape: ShapeObject = {
			id: generateId('shape'),
			objectType: 'shape',
			name: options.name ?? 'Shape',
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			geometry,
			fill: options.fill ?? 'transparent',
			stroke: options.stroke ?? '#cdd6f4', // Catppuccin Mocha text color - visible on dark bg
			strokeWidth: options.strokeWidth ?? 2
		};
		shapes.set(shape.id, shape);
		console.log('[ProjectStore] addShape called', {
			shapeId: shape.id,
			projectId,
			totalShapes: shapes.size,
			geometry: shape.geometry
		});
		return shape;
	}

	/**
	 * Add a line shape
	 */
	function addLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		options: Partial<Omit<ShapeObject, 'id' | 'objectType' | 'geometry'>> = {}
	): ShapeObject {
		const geometry: LineGeometry = { type: 'line', x1, y1, x2, y2 };
		return addShape(geometry, { name: 'Line', ...options });
	}

	/**
	 * Add a rectangle shape
	 */
	function addRectangle(
		x: number,
		y: number,
		width: number,
		height: number,
		options: Partial<Omit<ShapeObject, 'id' | 'objectType' | 'geometry'>> = {}
	): ShapeObject {
		const geometry: RectGeometry = { type: 'rect', x, y, width, height };
		return addShape(geometry, { name: 'Rectangle', ...options });
	}

	/**
	 * Add a circle shape
	 */
	function addCircle(
		cx: number,
		cy: number,
		radius: number,
		options: Partial<Omit<ShapeObject, 'id' | 'objectType' | 'geometry'>> = {}
	): ShapeObject {
		const geometry: CircleGeometry = { type: 'circle', cx, cy, radius };
		return addShape(geometry, { name: 'Circle', ...options });
	}

	/**
	 * Update a shape
	 */
	function updateShape(id: string, updates: Partial<Omit<ShapeObject, 'id' | 'objectType'>>): void {
		const shape = shapes.get(id);
		if (shape) {
			shapes.set(id, { ...shape, ...updates });
		}
	}

	/**
	 * Delete a shape
	 */
	function deleteShape(id: string): void {
		shapes.delete(id);
	}

	// ========================================================================
	// Hanging Position Operations
	// ========================================================================

	/**
	 * Add a new hanging position
	 */
	function addHangingPosition(
		positionType: HangingPositionType,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		options: Partial<
			Omit<HangingPositionObject, 'id' | 'objectType' | 'positionType' | 'x1' | 'y1' | 'x2' | 'y2'>
		> = {}
	): HangingPositionObject {
		const position: HangingPositionObject = {
			id: generateId('hp'),
			objectType: 'hanging-position',
			positionType,
			name: options.name ?? getDefaultHangingPositionName(positionType),
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			x1,
			y1,
			x2,
			y2,
			trimHeight: options.trimHeight,
			height: options.height,
			labelOffsetX: options.labelOffsetX ?? 0,
			labelOffsetY: options.labelOffsetY ?? -20
		};
		hangingPositions.set(position.id, position);
		return position;
	}

	/**
	 * Add an electric (horizontal pipe)
	 */
	function addElectric(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		options: Partial<
			Omit<HangingPositionObject, 'id' | 'objectType' | 'positionType' | 'x1' | 'y1' | 'x2' | 'y2'>
		> = {}
	): HangingPositionObject {
		return addHangingPosition('electric', x1, y1, x2, y2, { name: 'Electric', ...options });
	}

	/**
	 * Add a boom (vertical stand)
	 */
	function addBoom(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		options: Partial<
			Omit<HangingPositionObject, 'id' | 'objectType' | 'positionType' | 'x1' | 'y1' | 'x2' | 'y2'>
		> = {}
	): HangingPositionObject {
		return addHangingPosition('boom', x1, y1, x2, y2, { name: 'Boom', ...options });
	}

	/**
	 * Get a default name for a hanging position type
	 */
	function getDefaultHangingPositionName(positionType: HangingPositionType): string {
		const count =
			[...hangingPositions.values()].filter((hp) => hp.positionType === positionType).length + 1;
		const typeNames: Record<HangingPositionType, string> = {
			electric: 'Electric',
			truss: 'Truss',
			ladder: 'Ladder',
			boom: 'Boom',
			'box-boom': 'Box Boom',
			'ground-row': 'Ground Row'
		};
		return `${typeNames[positionType]} ${count}`;
	}

	/**
	 * Update a hanging position
	 */
	function updateHangingPosition(
		id: string,
		updates: Partial<Omit<HangingPositionObject, 'id' | 'objectType'>>
	): void {
		const position = hangingPositions.get(id);
		if (position) {
			hangingPositions.set(id, { ...position, ...updates });
		}
	}

	/**
	 * Delete a hanging position
	 */
	function deleteHangingPosition(id: string): void {
		// Also delete any instruments on this position
		for (const [instrumentId, instrument] of instruments) {
			if (instrument.hangingPositionId === id) {
				instruments.delete(instrumentId);
			}
		}
		hangingPositions.delete(id);
	}

	/**
	 * Resize a hanging position by dragging one end
	 */
	function resizeHangingPosition(
		id: string,
		end: 'start' | 'end',
		deltaX: number,
		deltaY: number
	): void {
		const position = hangingPositions.get(id);
		if (position) {
			if (end === 'start') {
				hangingPositions.set(id, {
					...position,
					x1: position.x1 + deltaX,
					y1: position.y1 + deltaY
				});
			} else {
				hangingPositions.set(id, {
					...position,
					x2: position.x2 + deltaX,
					y2: position.y2 + deltaY
				});
			}
		}
	}

	// ========================================================================
	// Instrument Operations
	// ========================================================================

	/**
	 * Add a new instrument on a hanging position
	 */
	function addInstrument(
		hangingPositionId: string,
		positionOnBar: number,
		instrumentType: string,
		options: Partial<
			Omit<
				InstrumentObject,
				'id' | 'objectType' | 'hangingPositionId' | 'positionOnBar' | 'instrumentType'
			>
		> = {}
	): InstrumentObject | null {
		// Verify hanging position exists
		if (!hangingPositions.has(hangingPositionId)) {
			console.warn(`Hanging position ${hangingPositionId} not found`);
			return null;
		}

		const instrument: InstrumentObject = {
			id: generateId('inst'),
			objectType: 'instrument',
			name: options.name ?? 'Instrument',
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			hangingPositionId,
			positionOnBar,
			instrumentType,
			channel: options.channel,
			dimmer: options.dimmer,
			color: options.color,
			focus: options.focus,
			rotation: options.rotation ?? 0
		};
		instruments.set(instrument.id, instrument);
		return instrument;
	}

	/**
	 * Add a free-floating instrument at a specific position on the canvas
	 */
	function addFreeInstrument(
		x: number,
		y: number,
		instrumentType: string,
		options: Partial<
			Omit<
				InstrumentObject,
				'id' | 'objectType' | 'hangingPositionId' | 'x' | 'y' | 'instrumentType'
			>
		> = {}
	): InstrumentObject {
		const instrument: InstrumentObject = {
			id: generateId('inst'),
			objectType: 'instrument',
			name: options.name ?? 'Instrument',
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			hangingPositionId: null,
			positionOnBar: 0,
			x,
			y,
			instrumentType,
			channel: options.channel,
			dimmer: options.dimmer,
			color: options.color,
			focus: options.focus,
			rotation: options.rotation ?? 0
		};
		instruments.set(instrument.id, instrument);
		return instrument;
	}

	/**
	 * Update an instrument
	 */
	function updateInstrument(
		id: string,
		updates: Partial<Omit<InstrumentObject, 'id' | 'objectType'>>
	): void {
		const instrument = instruments.get(id);
		if (instrument) {
			instruments.set(id, { ...instrument, ...updates });
		}
	}

	/**
	 * Delete an instrument
	 */
	function deleteInstrument(id: string): void {
		instruments.delete(id);
	}

	// ========================================================================
	// Set Piece Operations
	// ========================================================================

	/**
	 * Add a new set piece
	 */
	function addSetPiece(
		geometry: Geometry,
		options: Partial<Omit<SetPieceObject, 'id' | 'objectType' | 'geometry'>> = {}
	): SetPieceObject {
		const setPiece: SetPieceObject = {
			id: generateId('sp'),
			objectType: 'set-piece',
			name: options.name ?? 'Set Piece',
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			geometry,
			fill: options.fill ?? 'transparent',
			stroke: options.stroke ?? '#cdd6f4', // Catppuccin Mocha text color - visible on dark bg
			strokeWidth: options.strokeWidth ?? 2,
			layer: options.layer
		};
		setPieces.set(setPiece.id, setPiece);
		console.log('[ProjectStore] addSetPiece called', {
			setPieceId: setPiece.id,
			projectId,
			totalSetPieces: setPieces.size,
			geometry: setPiece.geometry
		});
		return setPiece;
	}

	/**
	 * Add a line set piece (drawn with line tool)
	 */
	function addSetPieceLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		options: Partial<Omit<SetPieceObject, 'id' | 'objectType' | 'geometry'>> = {}
	): SetPieceObject {
		const geometry: LineGeometry = { type: 'line', x1, y1, x2, y2 };
		return addSetPiece(geometry, { name: 'Line', ...options });
	}

	/**
	 * Add a rectangle set piece (drawn with rectangle tool)
	 */
	function addSetPieceRectangle(
		x: number,
		y: number,
		width: number,
		height: number,
		options: Partial<Omit<SetPieceObject, 'id' | 'objectType' | 'geometry'>> = {}
	): SetPieceObject {
		const geometry: RectGeometry = { type: 'rect', x, y, width, height };
		return addSetPiece(geometry, { name: 'Rectangle', ...options });
	}

	/**
	 * Add a circle set piece (drawn with circle tool)
	 */
	function addSetPieceCircle(
		cx: number,
		cy: number,
		radius: number,
		options: Partial<Omit<SetPieceObject, 'id' | 'objectType' | 'geometry'>> = {}
	): SetPieceObject {
		const geometry: CircleGeometry = { type: 'circle', cx, cy, radius };
		return addSetPiece(geometry, { name: 'Circle', ...options });
	}

	/**
	 * Update a set piece
	 */
	function updateSetPiece(
		id: string,
		updates: Partial<Omit<SetPieceObject, 'id' | 'objectType'>>
	): void {
		const setPiece = setPieces.get(id);
		if (setPiece) {
			setPieces.set(id, { ...setPiece, ...updates });
		}
	}

	/**
	 * Delete a set piece
	 */
	function deleteSetPiece(id: string): void {
		setPieces.delete(id);
	}

	// ========================================================================
	// Annotation Operations
	// ========================================================================

	/**
	 * Add a new annotation
	 */
	function addAnnotation(
		annotationType: AnnotationObject['annotationType'],
		x: number,
		y: number,
		text: string,
		options: Partial<
			Omit<AnnotationObject, 'id' | 'objectType' | 'annotationType' | 'x' | 'y' | 'text'>
		> = {}
	): AnnotationObject {
		const annotation: AnnotationObject = {
			id: generateId('ann'),
			objectType: 'annotation',
			annotationType,
			name: options.name ?? 'Annotation',
			locked: options.locked ?? false,
			visible: options.visible ?? true,
			x,
			y,
			text,
			fontSize: options.fontSize ?? 12,
			fontFamily: options.fontFamily ?? 'sans-serif',
			color: options.color ?? '#000000',
			endX: options.endX,
			endY: options.endY
		};
		annotations.set(annotation.id, annotation);
		return annotation;
	}

	/**
	 * Update an annotation
	 */
	function updateAnnotation(
		id: string,
		updates: Partial<Omit<AnnotationObject, 'id' | 'objectType'>>
	): void {
		const annotation = annotations.get(id);
		if (annotation) {
			annotations.set(id, { ...annotation, ...updates });
		}
	}

	/**
	 * Delete an annotation
	 */
	function deleteAnnotation(id: string): void {
		annotations.delete(id);
	}

	// ========================================================================
	// Generic Object Operations
	// ========================================================================

	/**
	 * Get any object by ID
	 */
	function getObject(id: string): CanvasObject | null {
		return (
			shapes.get(id) ??
			hangingPositions.get(id) ??
			instruments.get(id) ??
			setPieces.get(id) ??
			annotations.get(id) ??
			null
		);
	}

	/**
	 * Delete any object by ID
	 */
	function deleteObject(id: string): void {
		if (shapes.has(id)) {
			deleteShape(id);
		} else if (hangingPositions.has(id)) {
			deleteHangingPosition(id);
		} else if (instruments.has(id)) {
			deleteInstrument(id);
		} else if (setPieces.has(id)) {
			deleteSetPiece(id);
		} else if (annotations.has(id)) {
			deleteAnnotation(id);
		}
	}

	/**
	 * Delete multiple objects by ID
	 */
	function deleteObjects(ids: string[]): void {
		for (const id of ids) {
			deleteObject(id);
		}
	}

	/**
	 * Get the selection type for an object
	 */
	function getObjectSelectionType(id: string): Exclude<SelectionType, 'mixed' | null> | null {
		const obj = getObject(id);
		if (!obj) return null;
		return OBJECT_TYPE_TO_SELECTION_TYPE[obj.objectType];
	}

	/**
	 * Move an object by a delta
	 */
	function moveObject(id: string, dx: number, dy: number): void {
		const obj = getObject(id);
		if (!obj || obj.locked) return;

		switch (obj.objectType) {
			case 'shape':
				updateShape(id, { geometry: translateGeometry(obj.geometry, dx, dy) });
				break;
			case 'hanging-position':
				updateHangingPosition(id, {
					x1: obj.x1 + dx,
					y1: obj.y1 + dy,
					x2: obj.x2 + dx,
					y2: obj.y2 + dy
				});
				break;
			case 'set-piece':
				updateSetPiece(id, { geometry: translateGeometry(obj.geometry, dx, dy) });
				break;
			case 'annotation':
				updateAnnotation(id, {
					x: obj.x + dx,
					y: obj.y + dy,
					...(obj.endX !== undefined && obj.endY !== undefined
						? {
								endX: obj.endX + dx,
								endY: obj.endY + dy
							}
						: {})
				});
				break;
			case 'instrument':
				// Instruments are positioned relative to their hanging position
				// Moving them independently would require different logic
				break;
		}
	}

	/**
	 * Move multiple objects by a delta
	 */
	function moveObjects(ids: string[], dx: number, dy: number): void {
		for (const id of ids) {
			moveObject(id, dx, dy);
		}
	}

	/**
	 * Get bounding box of an object
	 */
	function getObjectBounds(
		id: string
	): { x: number; y: number; width: number; height: number } | null {
		const obj = getObject(id);
		if (!obj) return null;

		switch (obj.objectType) {
			case 'shape':
				return getGeometryBounds(obj.geometry);
			case 'hanging-position': {
				const minX = Math.min(obj.x1, obj.x2);
				const minY = Math.min(obj.y1, obj.y2);
				const maxX = Math.max(obj.x1, obj.x2);
				const maxY = Math.max(obj.y1, obj.y2);
				return {
					x: minX,
					y: minY,
					width: maxX - minX || 4,
					height: maxY - minY || 4
				};
			}
			case 'set-piece':
				return getGeometryBounds(obj.geometry);
			case 'annotation':
				// Approximate bounds for text
				return {
					x: obj.x,
					y: obj.y - (obj.fontSize ?? 12),
					width: obj.text.length * (obj.fontSize ?? 12) * 0.6,
					height: obj.fontSize ?? 12
				};
			case 'instrument':
				// Need to calculate based on hanging position
				return { x: 0, y: 0, width: 20, height: 20 }; // Placeholder
		}
	}

	// ========================================================================
	// Venue Operations
	// ========================================================================

	/**
	 * Update venue configuration
	 */
	function updateVenue(updates: Partial<Venue>): void {
		venue = { ...venue, ...updates };
	}

	/**
	 * Set stage bounds
	 */
	function setStageBounds(
		bounds: { x: number; y: number; width: number; height: number } | null
	): void {
		venue = { ...venue, stageBounds: bounds };
	}

	/**
	 * Set proscenium dimensions
	 */
	function setProscenium(width: number | null, height: number | null): void {
		venue = { ...venue, prosceniumWidth: width, prosceniumHeight: height };
	}

	/**
	 * Toggle stage bounds visibility
	 */
	function toggleStageBounds(): void {
		venue = { ...venue, showStageBounds: !venue.showStageBounds };
	}

	// ========================================================================
	// Project Operations
	// ========================================================================

	/**
	 * Clear all objects from the project
	 */
	function clearProject(): void {
		console.log('[ProjectStore] clearProject called', {
			previousProjectId: projectId,
			shapesCleared: shapes.size,
			hangingPositionsCleared: hangingPositions.size,
			instrumentsCleared: instruments.size
		});
		shapes.clear();
		hangingPositions.clear();
		instruments.clear();
		setPieces.clear();
		annotations.clear();
		idCounter = 0;
		venue = { ...DEFAULT_VENUE };
	}

	/**
	 * Set project metadata
	 */
	function setProjectInfo(name: string, id?: string): void {
		console.log('[ProjectStore] setProjectInfo called', {
			name,
			id,
			previousProjectId: projectId
		});
		projectName = name;
		if (id) projectId = id;
	}

	// ========================================================================
	// Return Store Interface
	// ========================================================================

	return {
		// Collections (read-only reactive arrays)
		get shapes() {
			return [...shapes.values()];
		},
		get hangingPositions() {
			return [...hangingPositions.values()];
		},
		get instruments() {
			return [...instruments.values()];
		},
		get setPieces() {
			return [...setPieces.values()];
		},
		get annotations() {
			return [...annotations.values()];
		},

		// Project metadata
		get projectName() {
			return projectName;
		},
		get projectId() {
			return projectId;
		},

		// Venue configuration
		get venue() {
			return venue;
		},

		// Shape operations
		addShape,
		addLine,
		addRectangle,
		addCircle,
		updateShape,
		deleteShape,

		// Hanging position operations
		addHangingPosition,
		addElectric,
		addBoom,
		updateHangingPosition,
		deleteHangingPosition,
		resizeHangingPosition,

		// Instrument operations
		addInstrument,
		addFreeInstrument,
		updateInstrument,
		deleteInstrument,

		// Set piece operations
		addSetPiece,
		addSetPieceLine,
		addSetPieceRectangle,
		addSetPieceCircle,
		updateSetPiece,
		deleteSetPiece,

		// Annotation operations
		addAnnotation,
		updateAnnotation,
		deleteAnnotation,

		// Venue operations
		updateVenue,
		setStageBounds,
		setProscenium,
		toggleStageBounds,

		// Generic operations
		getObject,
		deleteObject,
		deleteObjects,
		getObjectSelectionType,
		moveObject,
		moveObjects,
		getObjectBounds,

		// Project operations
		clearProject,
		setProjectInfo,

		// ID generation (for external use if needed)
		generateId
	};
}

// Export singleton instance
export const project = createProjectStore();
