/**
 * Viewport Store
 *
 * Manages pan/zoom state for the SVG canvas viewport.
 * Uses Svelte 5 runes for reactive state management.
 */

// Viewport state bounds
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const DEFAULT_ZOOM = 1;

/**
 * Bounds type for fitToContent calculations
 */
export interface Bounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Viewport state interface
 */
export interface ViewportState {
	/** X offset for panning */
	panX: number;
	/** Y offset for panning */
	panY: number;
	/** Zoom scale factor (0.1 to 10) */
	zoom: number;
}

/**
 * Creates a viewport store with pan/zoom state management
 */
function createViewportStore() {
	// Reactive state using Svelte 5 runes
	let panX = $state(0);
	let panY = $state(0);
	let zoom = $state(DEFAULT_ZOOM);

	// Derived transform string for SVG
	const transform = $derived(`translate(${panX}, ${panY}) scale(${zoom})`);

	// Derived zoom percentage for display
	const zoomPercent = $derived(Math.round(zoom * 100));

	/**
	 * Pan the viewport by a delta amount
	 * @param dx - Delta X in screen coordinates
	 * @param dy - Delta Y in screen coordinates
	 */
	function pan(dx: number, dy: number) {
		panX += dx;
		panY += dy;
	}

	/**
	 * Zoom the viewport by a factor, centered on a point
	 * @param factor - Zoom multiplier (e.g., 1.1 to zoom in 10%)
	 * @param centerX - X coordinate to zoom towards (screen space)
	 * @param centerY - Y coordinate to zoom towards (screen space)
	 */
	function zoomBy(factor: number, centerX: number, centerY: number) {
		const oldZoom = zoom;
		const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * factor));

		// Calculate the actual zoom factor applied (may differ due to clamping)
		const actualFactor = newZoom / oldZoom;

		// Adjust pan to keep the center point stationary
		// Transform: point_screen = point_world * zoom + pan
		// We want the world point under centerX,centerY to stay there after zoom
		// worldPoint = (centerX - panX) / zoom
		// newPanX = centerX - worldPoint * newZoom
		panX = centerX - (centerX - panX) * actualFactor;
		panY = centerY - (centerY - panY) * actualFactor;
		zoom = newZoom;
	}

	/**
	 * Set zoom to an absolute value, centered on a point
	 * @param newZoom - Target zoom level
	 * @param centerX - X coordinate to zoom towards (screen space)
	 * @param centerY - Y coordinate to zoom towards (screen space)
	 */
	function setZoom(newZoom: number, centerX: number, centerY: number) {
		const factor = newZoom / zoom;
		zoomBy(factor, centerX, centerY);
	}

	/**
	 * Set zoom to an absolute value, centered on the viewport center
	 * Used for zoom presets when no cursor position is available
	 * @param newZoom - Target zoom level
	 * @param viewportWidth - Width of the viewport
	 * @param viewportHeight - Height of the viewport
	 */
	function setZoomPreset(newZoom: number, viewportWidth: number, viewportHeight: number) {
		setZoom(newZoom, viewportWidth / 2, viewportHeight / 2);
	}

	/**
	 * Reset the viewport to default state (100% zoom, centered)
	 */
	function resetView() {
		panX = 0;
		panY = 0;
		zoom = DEFAULT_ZOOM;
	}

	/**
	 * Fit the viewport to show all content within the given bounds
	 * @param bounds - Content bounds to fit
	 * @param viewportWidth - Width of the viewport
	 * @param viewportHeight - Height of the viewport
	 * @param padding - Padding in screen pixels (default 50)
	 */
	function fitToContent(
		bounds: Bounds,
		viewportWidth: number,
		viewportHeight: number,
		padding = 50
	) {
		if (bounds.width === 0 || bounds.height === 0) {
			resetView();
			return;
		}

		// Calculate available viewport space after padding
		const availableWidth = viewportWidth - padding * 2;
		const availableHeight = viewportHeight - padding * 2;

		// Calculate zoom to fit content
		const scaleX = availableWidth / bounds.width;
		const scaleY = availableHeight / bounds.height;
		const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(scaleX, scaleY)));

		// Calculate pan to center the content
		// Content center in world coordinates
		const contentCenterX = bounds.x + bounds.width / 2;
		const contentCenterY = bounds.y + bounds.height / 2;

		// Viewport center in screen coordinates
		const viewportCenterX = viewportWidth / 2;
		const viewportCenterY = viewportHeight / 2;

		// Calculate pan so that content center maps to viewport center
		// screenX = worldX * zoom + panX
		// viewportCenterX = contentCenterX * newZoom + panX
		// panX = viewportCenterX - contentCenterX * newZoom
		zoom = newZoom;
		panX = viewportCenterX - contentCenterX * newZoom;
		panY = viewportCenterY - contentCenterY * newZoom;
	}

	/**
	 * Convert screen coordinates to world coordinates
	 * @param screenX - X coordinate in screen space
	 * @param screenY - Y coordinate in screen space
	 * @returns World coordinates
	 */
	function screenToWorld(screenX: number, screenY: number) {
		return {
			x: (screenX - panX) / zoom,
			y: (screenY - panY) / zoom
		};
	}

	/**
	 * Convert world coordinates to screen coordinates
	 * @param worldX - X coordinate in world space
	 * @param worldY - Y coordinate in world space
	 * @returns Screen coordinates
	 */
	function worldToScreen(worldX: number, worldY: number) {
		return {
			x: worldX * zoom + panX,
			y: worldY * zoom + panY
		};
	}

	return {
		// State getters
		get panX() {
			return panX;
		},
		get panY() {
			return panY;
		},
		get zoom() {
			return zoom;
		},
		get transform() {
			return transform;
		},
		get zoomPercent() {
			return zoomPercent;
		},

		// Actions
		pan,
		zoomBy,
		setZoom,
		setZoomPreset,
		resetView,
		fitToContent,

		// Coordinate conversion utilities
		screenToWorld,
		worldToScreen,

		// Constants for external use
		MIN_ZOOM,
		MAX_ZOOM
	};
}

// Export singleton instance
export const viewport = createViewportStore();
