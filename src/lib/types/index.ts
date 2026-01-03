/**
 * Types
 *
 * Re-exports all type definitions for cleaner imports.
 */

export type {
	Point,
	LineGeometry,
	RectGeometry,
	CircleGeometry,
	PolygonGeometry,
	Geometry
} from './geometry';

export {
	getGeometryBounds,
	hitTestGeometry,
	getGeometryCenter,
	translateGeometry
} from './geometry';
