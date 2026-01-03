/**
 * Geometry Types
 *
 * Type definitions for basic geometric shapes used in the canvas.
 * All coordinates are in world space (pixels at 1x zoom).
 */

/**
 * A 2D point in world space
 */
export interface Point {
	x: number;
	y: number;
}

/**
 * Line geometry - defined by two endpoints
 */
export interface LineGeometry {
	type: 'line';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

/**
 * Rectangle geometry - defined by position, size, and optional rotation
 */
export interface RectGeometry {
	type: 'rect';
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number; // in degrees
}

/**
 * Circle geometry - defined by center and radius
 */
export interface CircleGeometry {
	type: 'circle';
	cx: number;
	cy: number;
	radius: number;
}

/**
 * Polygon geometry - defined by an array of points
 */
export interface PolygonGeometry {
	type: 'polygon';
	points: Point[];
}

/**
 * Union type of all geometry types
 */
export type Geometry = LineGeometry | RectGeometry | CircleGeometry | PolygonGeometry;

/**
 * Calculate the bounding box of a geometry
 */
export function getGeometryBounds(geometry: Geometry): {
	x: number;
	y: number;
	width: number;
	height: number;
} {
	switch (geometry.type) {
		case 'line': {
			const minX = Math.min(geometry.x1, geometry.x2);
			const minY = Math.min(geometry.y1, geometry.y2);
			const maxX = Math.max(geometry.x1, geometry.x2);
			const maxY = Math.max(geometry.y1, geometry.y2);
			return {
				x: minX,
				y: minY,
				width: maxX - minX || 1, // Ensure minimum size
				height: maxY - minY || 1
			};
		}
		case 'rect': {
			// For rotated rectangles, calculate the axis-aligned bounding box
			if (geometry.rotation && geometry.rotation !== 0) {
				const rad = (geometry.rotation * Math.PI) / 180;
				const cos = Math.abs(Math.cos(rad));
				const sin = Math.abs(Math.sin(rad));
				const w = geometry.width * cos + geometry.height * sin;
				const h = geometry.width * sin + geometry.height * cos;
				const cx = geometry.x + geometry.width / 2;
				const cy = geometry.y + geometry.height / 2;
				return {
					x: cx - w / 2,
					y: cy - h / 2,
					width: w,
					height: h
				};
			}
			return {
				x: geometry.x,
				y: geometry.y,
				width: geometry.width,
				height: geometry.height
			};
		}
		case 'circle':
			return {
				x: geometry.cx - geometry.radius,
				y: geometry.cy - geometry.radius,
				width: geometry.radius * 2,
				height: geometry.radius * 2
			};
		case 'polygon': {
			if (geometry.points.length === 0) {
				return { x: 0, y: 0, width: 0, height: 0 };
			}
			const xs = geometry.points.map((p) => p.x);
			const ys = geometry.points.map((p) => p.y);
			const minX = Math.min(...xs);
			const minY = Math.min(...ys);
			const maxX = Math.max(...xs);
			const maxY = Math.max(...ys);
			return {
				x: minX,
				y: minY,
				width: maxX - minX || 1,
				height: maxY - minY || 1
			};
		}
	}
}

/**
 * Check if a point is inside or near a geometry
 * @param point - Point to test
 * @param geometry - Geometry to test against
 * @param tolerance - Hit tolerance in pixels
 */
export function hitTestGeometry(point: Point, geometry: Geometry, tolerance = 5): boolean {
	switch (geometry.type) {
		case 'line': {
			// Distance from point to line segment
			const dx = geometry.x2 - geometry.x1;
			const dy = geometry.y2 - geometry.y1;
			const lengthSq = dx * dx + dy * dy;

			if (lengthSq === 0) {
				// Line is a point
				const dist = Math.sqrt((point.x - geometry.x1) ** 2 + (point.y - geometry.y1) ** 2);
				return dist <= tolerance;
			}

			// Project point onto line
			const t = Math.max(
				0,
				Math.min(1, ((point.x - geometry.x1) * dx + (point.y - geometry.y1) * dy) / lengthSq)
			);
			const projX = geometry.x1 + t * dx;
			const projY = geometry.y1 + t * dy;
			const dist = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
			return dist <= tolerance;
		}
		case 'rect': {
			// For simplicity, only handle non-rotated rectangles
			// TODO: Handle rotated rectangles
			const bounds = getGeometryBounds(geometry);
			return (
				point.x >= bounds.x - tolerance &&
				point.x <= bounds.x + bounds.width + tolerance &&
				point.y >= bounds.y - tolerance &&
				point.y <= bounds.y + bounds.height + tolerance
			);
		}
		case 'circle': {
			const dist = Math.sqrt((point.x - geometry.cx) ** 2 + (point.y - geometry.cy) ** 2);
			return dist <= geometry.radius + tolerance;
		}
		case 'polygon': {
			// Point in polygon test using ray casting
			if (geometry.points.length < 3) return false;

			let inside = false;
			for (let i = 0, j = geometry.points.length - 1; i < geometry.points.length; j = i++) {
				const xi = geometry.points[i].x;
				const yi = geometry.points[i].y;
				const xj = geometry.points[j].x;
				const yj = geometry.points[j].y;

				if (
					yi > point.y !== yj > point.y &&
					point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
				) {
					inside = !inside;
				}
			}
			return inside;
		}
	}
}

/**
 * Calculate the center point of a geometry
 */
export function getGeometryCenter(geometry: Geometry): Point {
	switch (geometry.type) {
		case 'line':
			return {
				x: (geometry.x1 + geometry.x2) / 2,
				y: (geometry.y1 + geometry.y2) / 2
			};
		case 'rect':
			return {
				x: geometry.x + geometry.width / 2,
				y: geometry.y + geometry.height / 2
			};
		case 'circle':
			return {
				x: geometry.cx,
				y: geometry.cy
			};
		case 'polygon': {
			if (geometry.points.length === 0) {
				return { x: 0, y: 0 };
			}
			const sumX = geometry.points.reduce((sum, p) => sum + p.x, 0);
			const sumY = geometry.points.reduce((sum, p) => sum + p.y, 0);
			return {
				x: sumX / geometry.points.length,
				y: sumY / geometry.points.length
			};
		}
	}
}

/**
 * Translate a geometry by a delta
 */
export function translateGeometry(geometry: Geometry, dx: number, dy: number): Geometry {
	switch (geometry.type) {
		case 'line':
			return {
				...geometry,
				x1: geometry.x1 + dx,
				y1: geometry.y1 + dy,
				x2: geometry.x2 + dx,
				y2: geometry.y2 + dy
			};
		case 'rect':
			return {
				...geometry,
				x: geometry.x + dx,
				y: geometry.y + dy
			};
		case 'circle':
			return {
				...geometry,
				cx: geometry.cx + dx,
				cy: geometry.cy + dy
			};
		case 'polygon':
			return {
				...geometry,
				points: geometry.points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
			};
	}
}
