# Prompt for Building a Browser-Based 2D Lighting Plot CAD Application

---

## Project Overview

Build a simple, browser-based 2D CAD application for theatrical lighting designers to create lighting plots. The application should be intuitive, focused on the specific needs of lighting design, and prioritize data integrity above all else. Think of it as a purpose-built tool that sits between a basic drawing app and professional software like Vectorworks—powerful enough to be useful, simple enough to learn in minutes.

**Tech Stack Recommendation:** Sveltekit, HTML5 Canvas or SVG for rendering, IndexedDB for local persistence, and optionally a simple backend with Neon Postgres and Auth for cloud sync.

---

## Core Architecture Principles

### 1. State Persistence (CRITICAL)

This is the **highest priority feature**. Users must never lose work.

- **Auto-save:** Save the entire document state to IndexedDB on every meaningful change (debounced to ~500ms)
- **Version history:** Maintain the last 50 states for undo/redo and crash recovery
- **Recovery mode:** On app load, detect if a previous session crashed and offer to restore
- **Export backup:** Allow manual export of the full project as a JSON file at any time
- **Cloud sync (optional):** If implementing accounts, sync to a backend with conflict resolution
- **Dirty state indicator:** Always show users when there are unsaved changes (even if auto-save is active)

```
State Structure (conceptual):
{
  id: uuid,
  name: string,
  created: timestamp,
  modified: timestamp,
  scale: { unit: "feet" | "meters", pixelsPerUnit: number },
  venue: VenueObject,
  hangingPositions: HangingPosition[],
  instruments: Instrument[],
  setPieces: SetPiece[],
  annotations: Annotation[],
  layers: Layer[],
  metadata: ProjectMetadata
}
```

---

## Data Models

### Instrument (Lighting Fixture)

```typescript
interface Instrument {
	id: string;
	type: InstrumentType; // Determines the drawn symbol
	position: { x: number; y: number };
	rotation: number; // 0-360 degrees
	hangingPositionId: string | null; // Reference to parent hanging position

	// Electrical/Control Data
	channel: number | null;
	dimmer: number | string | null; // Can be "1-4" for a range
	circuit: string | null;
	universe: number | null; // For DMX
	address: number | null; // DMX address

	// Physical Properties
	color: string | null; // Gel color, e.g., "R02" or "L201"
	gobo: string | null;
	template: string | null;
	accessory: string | null; // Barn doors, top hats, etc.

	// Identification
	unitNumber: number | null; // Position on the hanging position
	purpose: string | null; // "Front wash", "Backlight", etc.
	notes: string | null;

	// Visual
	labelDisplay: LabelConfig; // What labels to show on plot
}

type InstrumentType =
	| 'ers-19'
	| 'ers-26'
	| 'ers-36'
	| 'ers-50' // Ellipsoidal (Source 4, etc.)
	| 'par-64'
	| 'par-56'
	| 'par-38'
	| 'fresnel-6'
	| 'fresnel-8'
	| 'cyc-light'
	| 'moving-spot'
	| 'moving-wash'
	| 'moving-beam'
	| 'led-par'
	| 'led-wash'
	| 'led-strip'
	| 'followspot'
	| 'practical'
	| 'custom';
```

### Hanging Position

```typescript
interface HangingPosition {
	id: string;
	type: 'electric' | 'truss' | 'ladder' | 'boom' | 'box-boom' | 'ground-row' | 'custom';
	name: string; // "1st Electric", "FOH Truss", "SL Ladder"

	// Geometry
	geometry: LineGeometry | RectGeometry; // Electrics are lines, trusses might be rects

	// Properties
	trimHeight: number | null; // Height from stage floor
	loadCapacity: number | null; // Optional for planning
	circuitCount: number | null;

	notes: string | null;
}
```

### Set Piece / Scenic Element

```typescript
interface SetPiece {
	id: string;
	name: string;
	type: 'wall' | 'platform' | 'stair' | 'furniture' | 'prop' | 'custom';
	geometry: Shape; // Rectangle, circle, polygon, line
	fill: string; // Color or pattern
	stroke: string;
	layer: string;
	notes: string | null;
}
```

### Venue / Stage

```typescript
interface Venue {
	name: string;

	// Stage bounds
	stageBounds: RectGeometry;

	// Architectural elements
	walls: Shape[];
	prosceniumWidth: number | null;
	prosceniumHeight: number | null;
	plasterLine: number; // Y coordinate of plaster line (reference point)
	centerLine: number; // X coordinate of center line

	// Reference lines
	showCenterLine: boolean;
	showPlasterLine: boolean;
	gridSpacing: number | null;
}
```

---

## Instrument Symbol Library

Create a symbol system where each `InstrumentType` maps to a distinct 2D shape:

| Instrument Type   | Symbol Description                                            |
| ----------------- | ------------------------------------------------------------- |
| ERS (Ellipsoidal) | Rounded rectangle with lens indication, body tapers           |
| PAR               | Circle with internal parallel lines indicating lamp direction |
| Fresnel           | Circle with concentric rings                                  |
| Cyc Light         | Elongated rectangle, asymmetric shape                         |
| Moving Light      | Circle with "M" or distinctive yoke indication                |
| LED Par           | Circle with LED dot pattern                                   |
| Followspot        | Large elongated oval with stand indication                    |

Symbols should:

- Be drawn as vector paths (SVG or Canvas paths)
- Scale appropriately with zoom
- Show rotation clearly
- Have a consistent "front" direction
- Support color coding (optional fill based on purpose/system)

---

## Canvas / Drawing Features

### Viewport

- **Pan:** Middle-mouse drag or spacebar + drag
- **Zoom:** Scroll wheel, zoom to cursor position
- **Fit to content:** Button to auto-frame all content
- **Zoom presets:** Fit all, 100%, 50%, 25%

### Grid & Snapping

- **Grid:** Configurable spacing (1', 6", 1m, etc.)
- **Snap to grid:** Toggle on/off
- **Snap to objects:** Snap to hanging position centers, endpoints
- **Snap to centerline/plasterline:** Magnetic guides

### Selection & Manipulation

- **Click to select:** Single object
- **Shift+click:** Add to selection
- **Marquee select:** Drag to select multiple
- **Move:** Drag selected objects
- **Rotate:** Rotation handle or input field
- **Duplicate:** Ctrl/Cmd+D
- **Delete:** Delete/Backspace key
- **Multi-select property editing:** Edit shared properties of multiple instruments

### Layers

- Background (venue/architecture)
- Set/Scenic
- Hanging Positions
- Instruments
- Annotations
- User-defined layers

Each layer can be locked, hidden, or dimmed.

---

## Paperwork / Reports

This is a key differentiator—the metadata drives real production paperwork.

### Required Reports

1. **Channel Hookup**
   - Sorted by channel number
   - Columns: Channel, Dimmer, Position, Unit #, Instrument Type, Color, Gobo, Purpose, Notes

2. **Dimmer/Circuit Schedule**
   - Sorted by dimmer number
   - Shows what's patched to each dimmer

3. **Instrument Schedule**
   - Sorted by hanging position, then unit number
   - Full details for each instrument

4. **Position Summary**
   - Per-position breakdown of instruments

5. **Color/Gobo Cut List**
   - Aggregated list of all colors and gobos needed

6. **Channel/Dimmer Patch**
   - For loading into lighting consoles (CSV export)

### Export Formats

- **PDF:** Formatted paperwork
- **CSV:** For spreadsheet editing or console import
- **JSON:** Full project backup

---

## User Interface Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Menu Bar: File | Edit | View | Insert | Paperwork | Help           │
├─────────────┬───────────────────────────────────────┬───────────────┤
│             │                                       │               │
│  Tool       │                                       │  Properties   │
│  Palette    │         Canvas / Drawing Area         │  Panel        │
│             │                                       │               │
│  - Select   │      [Grid with stage layout]         │  [Context-    │
│  - Pan      │                                       │   sensitive   │
│  - Line     │                                       │   properties] │
│  - Rect     │                                       │               │
│  - Circle   │                                       │               │
│  - Electric │                                       │               │
│  - Truss    │                                       │               │
│  - Ladder   │                                       │               │
│  - Add Inst.│                                       │               │
│             │                                       │               │
├─────────────┴───────────────────────────────────────┴───────────────┤
│  Status Bar: Scale: 1/4" = 1' | Zoom: 75% | Objects: 47 | Saved ✓   │
└─────────────────────────────────────────────────────────────────────┘
```

### Properties Panel (Context-Sensitive)

When an **instrument** is selected:

- Type dropdown
- Channel, Dimmer, Circuit, Universe, Address fields
- Color, Gobo, Accessory fields
- Purpose and Notes
- Unit number
- Rotation

When a **hanging position** is selected:

- Name
- Type
- Trim height
- Notes
- List of instruments on this position

When **nothing** is selected:

- Project properties
- Venue settings
- Scale configuration

---

## Keyboard Shortcuts

| Action         | Shortcut             |
| -------------- | -------------------- |
| Select tool    | V                    |
| Pan tool       | H or Space (hold)    |
| Add instrument | I                    |
| Add electric   | E                    |
| Undo           | Ctrl/Cmd + Z         |
| Redo           | Ctrl/Cmd + Shift + Z |
| Save (manual)  | Ctrl/Cmd + S         |
| Export         | Ctrl/Cmd + Shift + E |
| Delete         | Delete / Backspace   |
| Duplicate      | Ctrl/Cmd + D         |
| Select All     | Ctrl/Cmd + A         |
| Zoom In        | Ctrl/Cmd + Plus      |
| Zoom Out       | Ctrl/Cmd + Minus     |
| Fit All        | Ctrl/Cmd + 0         |

---

## Implementation Phases

### Phase 1: Core Canvas & Persistence

- [ ] Set up project with chosen framework
- [ ] Implement canvas with pan/zoom
- [ ] Build IndexedDB persistence layer with auto-save
- [ ] Create basic shape drawing (lines, rectangles, circles)
- [ ] Implement selection and manipulation
- [ ] Add undo/redo system

### Phase 2: Domain Objects

- [ ] Implement hanging position types
- [ ] Create instrument symbol library
- [ ] Build instrument placement (snap to positions)
- [ ] Add properties panel
- [ ] Implement all instrument metadata fields

### Phase 3: Stage & Venue

- [ ] Venue boundary tools
- [ ] Centerline/plasterline system
- [ ] Grid configuration
- [ ] Scale settings
- [ ] Set piece drawing

### Phase 4: Paperwork

- [ ] Channel hookup report
- [ ] Instrument schedule
- [ ] Dimmer schedule
- [ ] PDF export
- [ ] CSV export

### Phase 5: Polish

- [ ] Layer system
- [ ] Keyboard shortcuts
- [ ] Project management (new, open, recent)
- [ ] Cloud sync (optional)
- [ ] Print layout

---

## Technical Considerations

### Performance

- Use canvas for rendering, not DOM elements for each object
- Implement spatial indexing (quadtree) for hit testing with many objects
- Throttle auto-save to prevent performance issues
- Use requestAnimationFrame for smooth pan/zoom

### Data Integrity

- Validate all data on load
- Handle corrupted state gracefully
- Implement project versioning for format migrations
- Never delete data without confirmation

### Browser Support

- Target modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Use localStorage as fallback if IndexedDB unavailable
- Handle offline mode gracefully

---

## Out of Scope (Keep It Simple)

- ❌ 3D visualization
- ❌ Complex CAD features (boolean operations, precise dimensioning)
- ❌ Focus/beam angle visualization
- ❌ Photometric calculations
- ❌ Collaboration/multi-user editing (v1)
- ❌ Custom symbol creation (v1)
- ❌ Import from Vectorworks/DWG

---

## Success Criteria

1. A user can create a complete lighting plot in under 30 minutes
2. The app never loses user data, even on crash/refresh
3. Paperwork exports are production-ready
4. The interface is learnable without documentation
5. Performance stays smooth with 200+ instruments
