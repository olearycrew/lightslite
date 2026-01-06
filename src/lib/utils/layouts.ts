/**
 * Generic Layout Templates
 *
 * Pre-defined layout templates for new projects.
 * These provide useful default stage/venue configurations.
 */

/**
 * Generic stage layout with basic shapes
 */
export function createGenericStageLayout(_scale: { unit: string; pixelsPerUnit: number }) {
	return {
		shapes: [
			// Plaster line (reference line at y=0)
			{
				id: 'plaster-line',
				type: 'shape',
				geometry: {
					type: 'line',
					x1: -400,
					y1: 0,
					x2: 400,
					y2: 0
				},
				style: {
					stroke: '#f5c2e7',
					strokeWidth: 2,
					dashArray: '10,5'
				}
			},
			// Center line
			{
				id: 'center-line',
				type: 'shape',
				geometry: {
					type: 'line',
					x1: 0,
					y1: -300,
					x2: 0,
					y2: 600
				},
				style: {
					stroke: '#a6e3a1',
					strokeWidth: 2,
					dashArray: '10,5'
				}
			},
			// Stage edge rectangle
			{
				id: 'stage-edge',
				type: 'shape',
				geometry: {
					type: 'rect',
					x: -400,
					y: 0,
					width: 800,
					height: 100
				},
				style: {
					stroke: '#45475a',
					strokeWidth: 2,
					fill: 'transparent'
				}
			},
			// Apron line
			{
				id: 'apron-line',
				type: 'shape',
				geometry: {
					type: 'line',
					x1: -400,
					y1: 100,
					x2: 400,
					y2: 100
				},
				style: {
					stroke: '#6c7086',
					strokeWidth: 1,
					dashArray: '5,5'
				}
			}
		],
		hangingPositions: [],
		instruments: [],
		setPieces: [],
		annotations: []
	};
}

/**
 * Theater box boom layout
 */
export function createTheaterBoomLayout() {
	return {
		shapes: [],
		hangingPositions: [
			// Left box boom
			{
				id: 'boom-left',
				type: 'hanging-position',
				name: 'Left Box Boom',
				x1: -500,
				y1: 100,
				x2: -350,
				y2: 400,
				barLength: 150,
				unit: 'feet'
			},
			// Right box boom
			{
				id: 'boom-right',
				type: 'hanging-position',
				name: 'Right Box Boom',
				x1: 350,
				y1: 100,
				x2: 500,
				y2: 400,
				barLength: 150,
				unit: 'feet'
			}
		],
		instruments: [
			// Left boom instruments
			{
				id: 'inst-boom-l-1',
				type: 'instrument',
				channel: 1,
				unit: 1,
				focus: 'Booth',
				hangingPositionId: 'boom-left',
				positionOnBar: 0.15
			},
			{
				id: 'inst-boom-l-2',
				type: 'instrument',
				channel: 2,
				unit: 2,
				focus: 'Booth',
				hangingPositionId: 'boom-left',
				positionOnBar: 0.45
			},
			{
				id: 'inst-boom-l-3',
				type: 'instrument',
				channel: 3,
				unit: 3,
				focus: 'Booth',
				hangingPositionId: 'boom-left',
				positionOnBar: 0.75
			},
			// Right boom instruments
			{
				id: 'inst-boom-r-1',
				type: 'instrument',
				channel: 4,
				unit: 4,
				focus: 'Booth',
				hangingPositionId: 'boom-right',
				positionOnBar: 0.15
			},
			{
				id: 'inst-boom-r-2',
				type: 'instrument',
				channel: 5,
				unit: 5,
				focus: 'Booth',
				hangingPositionId: 'boom-right',
				positionOnBar: 0.45
			},
			{
				id: 'inst-boom-r-3',
				type: 'instrument',
				channel: 6,
				unit: 6,
				focus: 'Booth',
				hangingPositionId: 'boom-right',
				positionOnBar: 0.75
			}
		],
		setPieces: [],
		annotations: [
			{
				id: 'ann-boom-l',
				type: 'annotation',
				text: 'LX Booms',
				x: -425,
				y: 250,
				rotation: 90
			},
			{
				id: 'ann-boom-r',
				type: 'annotation',
				text: 'LX Booms',
				x: 425,
				y: 250,
				rotation: -90
			}
		]
	};
}

/**
 * Concert electrics layout
 */
export function createConcertLayout() {
	return {
		shapes: [],
		hangingPositions: [
			// Stage right electric
			{
				id: 'elec-sr',
				type: 'hanging-position',
				name: 'SR Electric',
				x1: 300,
				y1: 0,
				x2: 500,
				y2: 0,
				barLength: 200,
				unit: 'feet'
			},
			// Stage left electric
			{
				id: 'elec-sl',
				type: 'hanging-position',
				name: 'SL Electric',
				x1: -500,
				y1: 0,
				x2: -300,
				y2: 0,
				barLength: 200,
				unit: 'feet'
			},
			// Center electric
			{
				id: 'elec-center',
				type: 'hanging-position',
				name: 'Center Electric',
				x1: -100,
				y1: -50,
				x2: 100,
				y2: -50,
				barLength: 200,
				unit: 'feet'
			},
			// Back electric
			{
				id: 'elec-back',
				type: 'hanging-position',
				name: 'Back Electric',
				x1: -400,
				y1: 300,
				x2: 400,
				y2: 300,
				barLength: 800,
				unit: 'feet'
			}
		],
		instruments: [
			// SR Electric (8 instruments)
			...Array.from({ length: 8 }, (_, i) => ({
				id: `inst-sr-${i + 1}`,
				type: 'instrument' as const,
				channel: i + 1,
				unit: i + 1,
				focus: 'Side Wash',
				hangingPositionId: 'elec-sr',
				positionOnBar: (i + 1) / 9
			})),
			// SL Electric (8 instruments)
			...Array.from({ length: 8 }, (_, i) => ({
				id: `inst-sl-${i + 1}`,
				type: 'instrument' as const,
				channel: i + 9,
				unit: i + 9,
				focus: 'Side Wash',
				hangingPositionId: 'elec-sl',
				positionOnBar: (i + 1) / 9
			})),
			// Center Electric (6 instruments)
			...Array.from({ length: 6 }, (_, i) => ({
				id: `inst-center-${i + 1}`,
				type: 'instrument' as const,
				channel: i + 17,
				unit: i + 17,
				focus: 'Center Wash',
				hangingPositionId: 'elec-center',
				positionOnBar: (i + 1) / 7
			})),
			// Back Electric (12 instruments)
			...Array.from({ length: 12 }, (_, i) => ({
				id: `inst-back-${i + 1}`,
				type: 'instrument' as const,
				channel: i + 23,
				unit: i + 23,
				focus: 'Back Wash',
				hangingPositionId: 'elec-back',
				positionOnBar: (i + 1) / 13
			}))
		],
		setPieces: [],
		annotations: [
			{
				id: 'ann-sr',
				type: 'annotation',
				text: 'SR Electric',
				x: 400,
				y: -30,
				rotation: 0
			},
			{
				id: 'ann-sl',
				type: 'annotation',
				text: 'SL Electric',
				x: -400,
				y: -30,
				rotation: 0
			},
			{
				id: 'ann-center',
				type: 'annotation',
				text: 'Center Electric',
				x: 0,
				y: -80,
				rotation: 0
			},
			{
				id: 'ann-back',
				type: 'annotation',
				text: 'Back Electric',
				x: 0,
				y: 270,
				rotation: 0
			}
		]
	};
}

/**
 * Template type definitions
 */
export type LayoutTemplateType = 'generic' | 'theater-boom' | 'concert';

export interface LayoutTemplate {
	id: LayoutTemplateType;
	name: string;
	description: string;
	fn: (scale: { unit: string; pixelsPerUnit: number }) => Record<string, unknown[]>;
}

/**
 * Available layout templates
 */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
	{
		id: 'generic',
		name: 'Basic Stage',
		description: 'Simple stage layout with reference lines',
		fn: createGenericStageLayout
	},
	{
		id: 'theater-boom',
		name: 'Theater Box Booms',
		description: 'Box boom layout for theater productions',
		fn: createTheaterBoomLayout
	},
	{
		id: 'concert',
		name: 'Concert Rig',
		description: 'Concert-style electrics layout',
		fn: createConcertLayout
	}
];

/**
 * Get a layout template by ID
 */
export function getLayoutTemplate(type: LayoutTemplateType): LayoutTemplate | undefined {
	return LAYOUT_TEMPLATES.find((t) => t.id === type);
}

/**
 * Create layers for a new project using a template
 */
export function createLayoutFromTemplate(
	type: LayoutTemplateType,
	scale: { unit: string; pixelsPerUnit: number }
): Record<string, unknown[]> {
	const template = getLayoutTemplate(type);
	if (!template) {
		return createGenericStageLayout(scale);
	}
	return template.fn(scale);
}
