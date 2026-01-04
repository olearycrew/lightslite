# User Acceptance Test Script: Phase 2 - Core Editor

**Epic:** lxl-192  
**Version:** 1.0  
**Date:** 2026-01-03  
**Tester:** **********\_\_**********

---

## Prerequisites

### Environment Setup

1. **Start the application:**

   ```bash
   pnpm dev
   ```

2. **Open browser:** Navigate to `http://localhost:5173`

3. **Login credentials:**
   - **Email:** `demo@olearycrew.com`
   - **Password:** `demodemo`

4. **Navigate to editor:** After login, create a new project or open an existing one to access the canvas editor.

### Test Environment Notes

- **Browser:** **********\_\_********** (Chrome, Firefox, Safari, Edge)
- **OS:** **********\_\_********** (macOS, Windows, Linux)
- **Screen Resolution:** **********\_\_**********
- **Touch Device:** Yes / No

---

## Test Sections

### 1. Viewport Tests

#### VP-01: Pan with middle-mouse drag

- [ ] Pass [ ] Fail
- **Steps:**
  1. Position cursor on canvas
  2. Press and hold middle mouse button
  3. Drag in any direction
- **Expected:** Canvas pans smoothly following cursor movement
- **Notes:**

#### VP-02: Pan with spacebar + left-drag

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press and hold spacebar
  2. Cursor should change to grab/hand icon
  3. Click and drag with left mouse button
- **Expected:** Canvas pans while spacebar is held; reverts to previous tool when released
- **Notes:**

#### VP-03: Zoom with scroll wheel (zoom to cursor)

- [ ] Pass [ ] Fail
- **Steps:**
  1. Position cursor at a specific point on canvas
  2. Scroll up to zoom in
  3. Scroll down to zoom out
- **Expected:** Zoom centers on cursor position; the point under cursor stays stationary
- **Notes:**

#### VP-04: Zoom in button (+)

- [ ] Pass [ ] Fail
- **Steps:**
  1. Locate zoom controls
  2. Click the "+" button multiple times
- **Expected:** Canvas zooms in incrementally with each click
- **Notes:**

#### VP-05: Zoom out button (-)

- [ ] Pass [ ] Fail
- **Steps:**
  1. Locate zoom controls
  2. Click the "-" button multiple times
- **Expected:** Canvas zooms out incrementally with each click
- **Notes:**

#### VP-06: Reset zoom

- [ ] Pass [ ] Fail
- **Steps:**
  1. Zoom to a non-default level
  2. Click reset/100% button
- **Expected:** Canvas returns to 100% zoom level
- **Notes:**

#### VP-07: Fit to view

- [ ] Pass [ ] Fail
- **Steps:**
  1. Draw several objects on canvas
  2. Pan away from objects
  3. Click "Fit" button
- **Expected:** All objects become visible and centered in viewport
- **Notes:**

#### VP-08: Touch: Pinch to zoom

- [ ] Pass [ ] Fail [ ] N/A (Touch only)
- **Steps:**
  1. Using touch device
  2. Place two fingers on canvas
  3. Pinch in/out
- **Expected:** Canvas zooms smoothly following pinch gesture
- **Notes:**

#### VP-09: Touch: Two-finger pan

- [ ] Pass [ ] Fail [ ] N/A (Touch only)
- **Steps:**
  1. Using touch device
  2. Place two fingers on canvas
  3. Drag both fingers together
- **Expected:** Canvas pans following finger movement
- **Notes:**

---

### 2. Grid Tests

#### GR-01: Grid visibility

- [ ] Pass [ ] Fail
- **Steps:**
  1. Open canvas editor
  2. Observe grid lines
- **Expected:** Grid lines are visible on canvas background
- **Notes:**

#### GR-02: Green center line

- [ ] Pass [ ] Fail
- **Steps:**
  1. Pan to center of canvas (0,0)
  2. Observe horizontal axis
- **Expected:** Green line visible at Y=0 (center line)
- **Notes:**

#### GR-03: Magenta plaster line

- [ ] Pass [ ] Fail
- **Steps:**
  1. Pan to locate plaster line
  2. Observe distinguishing line
- **Expected:** Magenta line visible indicating plaster line position
- **Notes:**

#### GR-04: Grid adapts to zoom - zoomed out

- [ ] Pass [ ] Fail
- **Steps:**
  1. Zoom out significantly
  2. Observe grid spacing
- **Expected:** Grid shows coarser intervals to avoid clutter
- **Notes:**

#### GR-05: Grid adapts to zoom - zoomed in

- [ ] Pass [ ] Fail
- **Steps:**
  1. Zoom in significantly
  2. Observe grid spacing
- **Expected:** Grid shows finer intervals for precision
- **Notes:**

#### GR-06: Origin marker

- [ ] Pass [ ] Fail
- **Steps:**
  1. Pan to (0,0) position
  2. Observe intersection point
- **Expected:** Clear origin marker visible at (0,0) coordinate
- **Notes:**

---

### 3. Tool Palette Tests

#### TP-01: Tool palette visibility

- [ ] Pass [ ] Fail
- **Steps:**
  1. Open canvas editor
- **Expected:** Tool palette is visible on screen
- **Notes:**

#### TP-02: Select tool via click

- [ ] Pass [ ] Fail
- **Steps:**
  1. Click on Line tool in palette
- **Expected:** Line tool becomes active; visual indicator shows selection
- **Notes:**

#### TP-03: Shortcut: V for Select

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "V" key
- **Expected:** Select tool becomes active
- **Notes:**

#### TP-04: Shortcut: H for Pan

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "H" key
- **Expected:** Pan/Hand tool becomes active
- **Notes:**

#### TP-05: Shortcut: L for Line

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "L" key
- **Expected:** Line tool becomes active
- **Notes:**

#### TP-06: Shortcut: R for Rectangle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "R" key
- **Expected:** Rectangle tool becomes active
- **Notes:**

#### TP-07: Shortcut: C for Circle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "C" key
- **Expected:** Circle tool becomes active
- **Notes:**

#### TP-08: Shortcut: E for Electric

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "E" key
- **Expected:** Electric (hanging position) tool becomes active
- **Notes:**

#### TP-09: Shortcut: I for Instrument

- [ ] Pass [ ] Fail
- **Steps:**
  1. Press "I" key
- **Expected:** Instrument tool becomes active
- **Notes:**

#### TP-10: Active tool indicator

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select different tools
  2. Observe palette
- **Expected:** Currently active tool is clearly highlighted/indicated
- **Notes:**

---

### 4. Drawing Tests

#### DR-01: Draw a line

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Line tool (L)
  2. Click first point on canvas
  3. Click second point
- **Expected:** Line appears connecting the two points
- **Notes:**

#### DR-02: Draw a rectangle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Rectangle tool (R)
  2. Click and drag on canvas
  3. Release mouse
- **Expected:** Rectangle appears with corners at drag start/end
- **Notes:**

#### DR-03: Draw a circle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Circle tool (C)
  2. Click and drag on canvas
  3. Release mouse
- **Expected:** Circle appears; center at click point, radius to release
- **Notes:**

#### DR-04: Line snaps to grid

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Line tool
  2. Click near grid intersection
  3. Complete line near another intersection
- **Expected:** Line endpoints snap to nearest grid points
- **Notes:**

#### DR-05: Rectangle snaps to grid

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Rectangle tool
  2. Draw rectangle near grid lines
- **Expected:** Rectangle corners snap to grid
- **Notes:**

#### DR-06: Circle snaps to grid

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Circle tool
  2. Draw circle starting near grid point
- **Expected:** Circle center snaps to grid
- **Notes:**

#### DR-07: Shift constrains line horizontal

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Line tool
  2. Click first point
  3. Hold Shift and move cursor
  4. Click to complete
- **Expected:** Line is constrained to horizontal or vertical
- **Notes:**

#### DR-08: Shift constrains rectangle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Rectangle tool
  2. Hold Shift while dragging
- **Expected:** Rectangle becomes a square
- **Notes:**

#### DR-09: Shift constrains circle

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Circle tool
  2. Hold Shift while dragging
- **Expected:** Circle maintains perfect circular shape (if applicable)
- **Notes:**

#### DR-10: Cancel drawing with Escape

- [ ] Pass [ ] Fail
- **Steps:**
  1. Start drawing any shape
  2. Press Escape before completing
- **Expected:** Drawing operation is cancelled; no shape created
- **Notes:**

---

### 5. Hanging Position Tests

#### HP-01: Add electric position

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Electric tool (E)
  2. Click on canvas
  3. Drag to define length
  4. Release
- **Expected:** Horizontal hanging position (electric pipe) appears
- **Notes:**

#### HP-02: Position shows name label

- [ ] Pass [ ] Fail
- **Steps:**
  1. Create a hanging position
  2. Observe the position
- **Expected:** Name/label is displayed near the position
- **Notes:**

#### HP-03: Position is selectable

- [ ] Pass [ ] Fail
- **Steps:**
  1. Switch to Select tool (V)
  2. Click on a hanging position
- **Expected:** Position becomes selected; selection handles appear
- **Notes:**

#### HP-04: Position snaps to grid

- [ ] Pass [ ] Fail
- **Steps:**
  1. Create a hanging position near grid
  2. Observe placement
- **Expected:** Position endpoints snap to grid intersections
- **Notes:**

#### HP-05: Multiple positions

- [ ] Pass [ ] Fail
- **Steps:**
  1. Create several hanging positions
  2. Verify they don't interfere
- **Expected:** All positions render correctly and independently
- **Notes:**

---

### 6. Instrument Tests

#### IN-01: Add instrument to canvas

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select Instrument tool (I)
  2. Click on canvas
- **Expected:** Instrument appears at clicked location
- **Notes:**

#### IN-02: Instrument snaps to hanging position

- [ ] Pass [ ] Fail
- **Steps:**
  1. Create a hanging position
  2. Select Instrument tool
  3. Click near the hanging position
- **Expected:** Instrument snaps to and attaches to the position
- **Notes:**

#### IN-03: Different instrument types

- [ ] Pass [ ] Fail
- **Steps:**
  1. Add instruments of different types
  2. Observe their symbols
- **Expected:** Each type shows its distinctive symbol/shape
- **Notes:**

#### IN-04: Instrument shows channel label

- [ ] Pass [ ] Fail
- **Steps:**
  1. Add an instrument
  2. Observe the instrument
- **Expected:** Channel/address label is displayed
- **Notes:**

#### IN-05: Instrument is selectable

- [ ] Pass [ ] Fail
- **Steps:**
  1. Switch to Select tool
  2. Click on an instrument
- **Expected:** Instrument becomes selected
- **Notes:**

#### IN-06: Move instrument along position

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select an instrument on a position
  2. Drag the instrument
- **Expected:** Instrument moves along the hanging position
- **Notes:**

---

### 7. Selection Tests

#### SL-01: Click to select single object

- [ ] Pass [ ] Fail
- **Steps:**
  1. Draw several shapes
  2. Click on one shape
- **Expected:** Only clicked shape is selected
- **Notes:**

#### SL-02: Shift+click adds to selection

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select one shape
  2. Shift+click another shape
- **Expected:** Both shapes are now selected
- **Notes:**

#### SL-03: Shift+click toggles selection

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select two shapes with Shift+click
  2. Shift+click one of them again
- **Expected:** That shape is deselected; other remains selected
- **Notes:**

#### SL-04: Marquee select (click-drag on empty)

- [ ] Pass [ ] Fail
- **Steps:**
  1. Draw several shapes
  2. Click on empty canvas area
  3. Drag to create selection box
- **Expected:** All objects within the box become selected
- **Notes:**

#### SL-05: Escape clears selection

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select one or more objects
  2. Press Escape
- **Expected:** All objects are deselected
- **Notes:**

#### SL-06: Delete removes selected objects

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select one or more objects
  2. Press Delete key
- **Expected:** Selected objects are removed from canvas
- **Notes:**

#### SL-07: Backspace removes selected objects

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select one or more objects
  2. Press Backspace key
- **Expected:** Selected objects are removed from canvas
- **Notes:**

#### SL-08: Selection handles visible

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select an object
  2. Observe the object
- **Expected:** Selection handles/bounding box appear around object
- **Notes:**

#### SL-09: Click empty to deselect

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select objects
  2. Click on empty canvas area
- **Expected:** All objects are deselected
- **Notes:**

---

### 8. Properties Panel Tests

#### PP-01: Panel shows project properties (nothing selected)

- [ ] Pass [ ] Fail
- **Steps:**
  1. Ensure no objects selected (press Escape)
  2. Observe properties panel
- **Expected:** Panel displays project-level properties
- **Notes:**

#### PP-02: Panel shows instrument properties

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select an instrument
  2. Observe properties panel
- **Expected:** Panel shows instrument-specific fields (type, channel, color, etc.)
- **Notes:**

#### PP-03: Panel shows position properties

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select a hanging position
  2. Observe properties panel
- **Expected:** Panel shows position-specific fields (name, length, height, etc.)
- **Notes:**

#### PP-04: Panel shows shape properties

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select a drawn shape (line/rect/circle)
  2. Observe properties panel
- **Expected:** Panel shows shape-specific fields (dimensions, stroke, fill, etc.)
- **Notes:**

#### PP-05: Panel shows multi-select info

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select multiple objects
  2. Observe properties panel
- **Expected:** Panel indicates multiple selection and shows common properties
- **Notes:**

#### PP-06: Change property updates canvas

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select an object
  2. Modify a property in panel
  3. Observe canvas
- **Expected:** Change is immediately reflected on canvas
- **Notes:**

#### PP-07: Change color property

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select an instrument
  2. Change color in properties panel
- **Expected:** Instrument color updates immediately
- **Notes:**

#### PP-08: Change numeric property

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select a shape
  2. Change a dimension value
- **Expected:** Shape resizes accordingly on canvas
- **Notes:**

#### PP-09: Change text property

- [ ] Pass [ ] Fail
- **Steps:**
  1. Select a hanging position
  2. Change the name
- **Expected:** Label updates on canvas
- **Notes:**

---

## Test Results Summary

### Overall Results

**Viewport Tests (9 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Grid Tests (6 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Tool Palette Tests (10 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Drawing Tests (10 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Hanging Position Tests (5 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Instrument Tests (6 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Selection Tests (9 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**Properties Panel Tests (9 total)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

**TOTAL (64 tests)**

- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_
- Not Run: \_\_\_

### Sign-Off

**Tester**

- Name: **********\_\_**********
- Signature: **********\_\_**********
- Date: **********\_\_**********

**Developer**

- Name: **********\_\_**********
- Signature: **********\_\_**********
- Date: **********\_\_**********

**Product Owner**

- Name: **********\_\_**********
- Signature: **********\_\_**********
- Date: **********\_\_**********

---

## Defects Found

### Defect 1

- **Test Case:**
- **Severity:** Critical / High / Medium / Low
- **Description:**
- **Steps to Reproduce:**
- **Status:**

### Defect 2

- **Test Case:**
- **Severity:** Critical / High / Medium / Low
- **Description:**
- **Steps to Reproduce:**
- **Status:**

### Defect 3

- **Test Case:**
- **Severity:** Critical / High / Medium / Low
- **Description:**
- **Steps to Reproduce:**
- **Status:**

_(Add more defects as needed)_

---

## Notes & Observations

_Use this space to record any observations, edge cases, or suggestions discovered during testing:_

---

## Appendix: Keyboard Shortcuts Reference

- **V** — Select tool
- **H** — Pan/Hand tool
- **L** — Line tool
- **R** — Rectangle tool
- **C** — Circle tool
- **E** — Electric (hanging position) tool
- **I** — Instrument tool
- **Space + Drag** — Temporary pan
- **Shift** — Constrain to horizontal/vertical
- **Escape** — Cancel operation / Clear selection
- **Delete / Backspace** — Delete selected objects
- **Scroll** — Zoom in/out
- **Middle Mouse Drag** — Pan viewport
