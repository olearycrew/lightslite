# LightsLite Architecture Documentation

## Overview

LightsLite is a browser-based 2D CAD application for theatrical lighting designers. This documentation is split into focused sections for easier consumption.

## Quick Reference

| Decision       | Choice               | Rationale                                        |
| -------------- | -------------------- | ------------------------------------------------ |
| Cloud Sync     | Required for v1      | Multi-device access needed                       |
| Sync Strategy  | Server-authoritative | Simpler implementation, users mostly online      |
| Rendering      | SVG                  | Development simplicity, optimize later if needed |
| Authentication | Neon Auth            | Integrated with database, simpler stack          |
| Deployment     | Vercel               | Excellent SvelteKit support                      |
| Data Model     | Hybrid               | Normalized entities + JSON for complex data      |

## System Architecture Overview

### Architecture Diagram

```mermaid
flowchart TB
    subgraph Client [Browser Client]
        UI[SvelteKit UI]
        SVG[SVG Renderer]
        Store[Svelte Stores]
        IDB[(IndexedDB Cache)]
    end

    subgraph Vercel [Vercel Edge]
        SK[SvelteKit Server]
        API[API Routes]
    end

    subgraph Neon [Neon Cloud]
        Auth[Neon Auth]
        DB[(Postgres DB)]
    end

    UI --> Store
    Store --> SVG
    Store <--> IDB
    Store <--> API
    API <--> Auth
    API <--> DB
```

### Data Flow

1. **User Action** → Svelte Store updated → SVG re-renders
2. **Store Change** → Debounced save to IndexedDB (immediate) + API (500ms)
3. **API Response** → Store updated → IndexedDB synced
4. **Page Load** → Check IndexedDB for cached data → Fetch from API → Merge

## Technology Stack

### Frontend

| Technology   | Purpose           | Version |
| ------------ | ----------------- | ------- |
| SvelteKit    | Framework         | 2.x     |
| Svelte 5     | UI Components     | 5.x     |
| TypeScript   | Type Safety       | 5.x     |
| SVG          | Rendering         | Native  |
| Tailwind CSS | Styling           | 4.x     |
| idb          | IndexedDB wrapper | 8.x     |

### Backend

| Technology               | Purpose          | Version |
| ------------------------ | ---------------- | ------- |
| SvelteKit API Routes     | REST API         | -       |
| Drizzle ORM              | Database queries | Latest  |
| @neondatabase/serverless | DB connection    | Latest  |
| @neondatabase/auth       | Authentication   | Latest  |
| Zod                      | Validation       | 4.x     |

### Infrastructure

| Service   | Purpose                  |
| --------- | ------------------------ |
| Vercel    | Hosting & Edge Functions |
| Neon      | Postgres Database        |
| Neon Auth | User Authentication      |

## Database Schema Design

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ projects : owns
    projects ||--o{ hanging_positions : contains
    projects ||--o{ instruments : contains
    projects ||--o{ set_pieces : contains
    projects ||--o{ annotations : contains
    projects ||--o{ project_history : has
    hanging_positions ||--o{ instruments : holds

    users {
        uuid id PK
        string email
        string name
        timestamp created_at
        timestamp updated_at
    }

    projects {
        uuid id PK
        uuid user_id FK
        string name
        jsonb venue
        jsonb scale
        jsonb layers
        jsonb metadata
        int version
        timestamp created_at
        timestamp updated_at
    }

    hanging_positions {
        uuid id PK
        uuid project_id FK
        string type
        string name
        jsonb geometry
        float trim_height
        float load_capacity
        int circuit_count
        text notes
        int sort_order
    }

    instruments {
        uuid id PK
        uuid project_id FK
        uuid hanging_position_id FK
        string type
        float position_x
        float position_y
        float rotation
        int channel
        string dimmer
        string circuit
        int universe
        int address
        string color
        string gobo
        string template
        string accessory
        int unit_number
        string purpose
        text notes
        jsonb label_display
    }

    set_pieces {
        uuid id PK
        uuid project_id FK
        string name
        string type
        jsonb geometry
        string fill
        string stroke
        string layer
        text notes
    }

    annotations {
        uuid id PK
        uuid project_id FK
        string type
        jsonb geometry
        string text
        jsonb style
        string layer
    }

    project_history {
        uuid id PK
        uuid project_id FK
        jsonb state_snapshot
        timestamp created_at
    }
```

## State Management Architecture

### Store Structure

```mermaid
flowchart LR
    subgraph Global Stores
        Auth[authStore]
        App[appStore]
    end

    subgraph Project Stores
        Proj[projectStore]
        Sel[selectionStore]
        View[viewportStore]
        Tool[toolStore]
        Hist[historyStore]
    end

    subgraph Derived Stores
        Inst[instrumentsStore]
        Pos[positionsStore]
        Layers[layersStore]
    end

    Auth --> App
    App --> Proj
    Proj --> Inst
    Proj --> Pos
    Proj --> Layers
    Sel --> View
    Tool --> View
```

## Data Synchronization Layer

### Sync Architecture

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Store as Svelte Store
    participant Sync as SyncManager
    participant IDB as IndexedDB
    participant API as API Routes
    participant DB as Neon DB

    UI->>Store: User makes change
    Store->>Sync: Store updated
    Sync->>IDB: Save immediately
    Sync->>Sync: Debounce 500ms
    Sync->>API: POST /api/projects/[id]
    API->>DB: Update database
    DB-->>API: Success + version
    API-->>Sync: Response
    Sync->>Store: Update version
    Sync->>IDB: Update cache
```

## SVG Rendering Architecture

### Component Hierarchy

```mermaid
flowchart TB
    Canvas[CanvasContainer.svelte]
    Canvas --> VP[Viewport.svelte]
    VP --> Grid[Grid.svelte]
    VP --> Stage[StageLayer.svelte]
    VP --> Positions[PositionsLayer.svelte]
    VP --> Instruments[InstrumentsLayer.svelte]
    VP --> SetPieces[SetPiecesLayer.svelte]
    VP --> Annotations[AnnotationsLayer.svelte]
    VP --> Selection[SelectionOverlay.svelte]
    VP --> Tools[ToolOverlay.svelte]

    Instruments --> Symbol[InstrumentSymbol.svelte]
    Positions --> PosLine[PositionLine.svelte]
```

## API Routes Structure

### Route Map

| Method | Route                               | Description               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/projects`                     | List user's projects      |
| POST   | `/api/projects`                     | Create new project        |
| GET    | `/api/projects/[id]`                | Get project with all data |
| PUT    | `/api/projects/[id]`                | Update project            |
| DELETE | `/api/projects/[id]`                | Delete project            |
| POST   | `/api/projects/[id]/duplicate`      | Duplicate project         |
| GET    | `/api/projects/[id]/export`         | Export as JSON            |
| GET    | `/api/projects/[id]/reports/[type]` | Generate report           |

## File Structure

```
lightslite/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── Viewport.svelte
│   │   │   │   ├── Grid.svelte
│   │   │   │   ├── layers/
│   │   │   │   │   ├── StageLayer.svelte
│   │   │   │   │   ├── PositionsLayer.svelte
│   │   │   │   │   ├── InstrumentsLayer.svelte
│   │   │   │   │   ├── SetPiecesLayer.svelte
│   │   │   │   │   └── AnnotationsLayer.svelte
│   │   │   │   ├── overlays/
│   │   │   │   │   ├── SelectionOverlay.svelte
│   │   │   │   │   └── ToolOverlay.svelte
│   │   │   │   └── symbols/
│   │   │   │       ├── InstrumentSymbol.svelte
│   │   │   │       ├── PositionLine.svelte
│   │   │   │       └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── MenuBar.svelte
│   │   │   │   ├── ToolPalette.svelte
│   │   │   │   ├── PropertiesPanel.svelte
│   │   │   │   ├── StatusBar.svelte
│   │   │   │   └── dialogs/
│   │   │   │       ├── NewProjectDialog.svelte
│   │   │   │       ├── ExportDialog.svelte
│   │   │   │       └── SettingsDialog.svelte
│   │   │   └── reports/
│   │   │       ├── ChannelHookup.svelte
│   │   │       ├── InstrumentSchedule.svelte
│   │   │       └── DimmerSchedule.svelte
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client
│   │   │   ├── schema.ts         # Database schema
│   │   │   └── migrations/       # Drizzle migrations
│   │   ├── stores/
│   │   │   ├── project.ts        # Project state
│   │   │   ├── selection.ts      # Selection state
│   │   │   ├── viewport.ts       # Pan/zoom state
│   │   │   ├── tool.ts           # Active tool
│   │   │   ├── history.ts        # Undo/redo
│   │   │   └── index.ts          # Re-exports
│   │   ├── sync/
│   │   │   ├── manager.ts        # Sync orchestration
│   │   │   ├── indexeddb.ts      # Local storage
│   │   │   └── conflict.ts       # Conflict resolution
│   │   ├── symbols/
│   │   │   ├── paths.ts          # SVG path definitions
│   │   │   ├── types.ts          # Symbol type mappings
│   │   │   └── index.ts
│   │   ├── reports/
│   │   │   ├── generators/
│   │   │   │   ├── channel-hookup.ts
│   │   │   │   ├── instrument-schedule.ts
│   │   │   │   └── dimmer-schedule.ts
│   │   │   ├── pdf.ts            # PDF generation
│   │   │   └── csv.ts            # CSV export
│   │   ├── types/
│   │   │   ├── project.ts
│   │   │   ├── instrument.ts
│   │   │   ├── geometry.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── geometry.ts       # Geometry calculations
│   │   │   ├── snap.ts           # Snapping logic
│   │   │   ├── keyboard.ts       # Keyboard shortcuts
│   │   │   └── debounce.ts
│   │   └── auth/
│   │       └── client.ts         # Neon Auth client
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.server.ts     # Auth check
│   │   ├── +page.svelte          # Landing/dashboard
│   │   ├── auth/
│   │   │   └── [...path]/
│   │   │       └── +page.svelte  # Auth pages
│   │   ├── app/
│   │   │   ├── +layout.svelte    # App shell
│   │   │   ├── +page.svelte      # Project list
│   │   │   └── [projectId]/
│   │   │       ├── +page.svelte  # Editor
│   │   │       └── +page.ts      # Load project
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...path]/
│   │       │       └── +server.ts
│   │       └── projects/
│   │           ├── +server.ts
│   │           └── [id]/
│   │               ├── +server.ts
│   │               ├── duplicate/
│   │               │   └── +server.ts
│   │               ├── export/
│   │               │   └── +server.ts
│   │               └── reports/
│   │                   └── [type]/
│   │                       └── +server.ts
│   └── app.html
├── static/
│   └── symbols/                  # SVG symbol files
├── drizzle/
│   └── migrations/               # SQL migrations
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── .env.example
```

## Authentication Flow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant App as SvelteKit App
    participant Auth as Neon Auth
    participant DB as Neon DB

    User->>App: Visit /app
    App->>Auth: Check session
    Auth-->>App: No session
    App->>User: Redirect to /auth/sign-in

    User->>App: Submit credentials
    App->>Auth: POST /api/auth/sign-in
    Auth->>DB: Validate user
    DB-->>Auth: User data
    Auth-->>App: Session token
    App->>User: Redirect to /app

    User->>App: Access /app/[projectId]
    App->>Auth: Validate session
    Auth-->>App: Valid session
    App->>DB: Fetch project
    DB-->>App: Project data
    App->>User: Render editor
```

## Keyboard Shortcuts System

### Shortcut Reference

| Category | Shortcut           | Action         |
| -------- | ------------------ | -------------- |
| Tools    | `V`                | Select tool    |
| Tools    | `H`                | Pan tool       |
| Tools    | `I`                | Add instrument |
| Tools    | `E`                | Add electric   |
| Edit     | `Ctrl+Z`           | Undo           |
| Edit     | `Ctrl+Shift+Z`     | Redo           |
| Edit     | `Ctrl+D`           | Duplicate      |
| Edit     | `Ctrl+A`           | Select all     |
| Edit     | `Delete/Backspace` | Delete         |
| View     | `Ctrl+0`           | Fit all        |
| View     | `Ctrl+=`           | Zoom in        |
| View     | `Ctrl+-`           | Zoom out       |
| File     | `Ctrl+S`           | Save           |
| File     | `Ctrl+Shift+E`     | Export         |

## Report Generation

### Report Generation System

- Generate reports from the current project
- Export to PDF or CSV
- Reports are generated on the server

### Available Reports

| Report Type         | Description                       | Export Formats |
| ------------------- | --------------------------------- | -------------- |
| Channel Hookup      | Channels with instrument details  | PDF, CSV       |
| Instrument Schedule | All instruments by position       | PDF, CSV       |
| Dimmer Schedule     | Dimmer assignments with load info | PDF, CSV       |

## Environment & Configuration

### Environment Variables

```bash
# .env.example

# Neon Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"

# Neon Auth
NEON_AUTH_BASE_URL="https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth"
PUBLIC_NEON_AUTH_URL="https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth"

# App
PUBLIC_APP_URL="http://localhost:5173"
```

### Key Technical Decisions Summary

| Area          | Decision                | Rationale                          |
| ------------- | ----------------------- | ---------------------------------- |
| Framework     | SvelteKit 2 + Svelte 5  | Modern, performant, great DX       |
| Rendering     | SVG                     | Simpler development, native events |
| State         | Svelte stores           | Built-in reactivity, simple API    |
| Local Storage | IndexedDB via idb       | Structured data, good capacity     |
| Database      | Neon Postgres + Drizzle | Serverless, type-safe ORM          |
| Auth          | Neon Auth               | Integrated, simpler stack          |
| Sync          | Server-authoritative    | Simpler conflict resolution        |
| Deployment    | Vercel                  | Excellent SvelteKit support        |
| Styling       | Tailwind CSS            | Rapid development, consistent      |

## Implementation Phases

### Phase 1: Foundation

- [ ] Initialize SvelteKit project with TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure Vercel adapter
- [ ] Set up Neon database and Drizzle ORM
- [ ] Create database schema and run migrations
- [ ] Implement Neon Auth integration
- [ ] Create basic route structure

### Phase 2: Core Editor

- [ ] Implement SVG viewport with pan/zoom
- [ ] Create grid rendering
- [ ] Build selection system
- [ ] Implement basic shape drawing
- [ ] Create instrument symbol library
- [ ] Build properties panel

### Phase 3: Data Layer

- [ ] Implement Svelte stores for project state
- [ ] Build IndexedDB persistence layer
- [ ] Create SyncManager for server sync
- [ ] Implement undo/redo system
- [ ] Add version conflict handling

### Phase 4: Domain Features

- [ ] Implement hanging position tools
- [ ] Build instrument placement with snapping
- [ ] Create venue/stage configuration
- [ ] Add layer system
- [ ] Implement keyboard shortcuts

### Phase 5: Paperwork

- [ ] Build channel hookup report
- [ ] Create instrument schedule
- [ ] Implement dimmer schedule
- [ ] Add PDF export
- [ ] Add CSV export

### Phase 6: Polish

- [ ] Add project management (list, create, delete)
- [ ] Implement crash recovery
- [ ] Add offline indicator
- [ ] Performance optimization
- [ ] Testing and bug fixes

## Next Steps

1. Review this architecture plan
2. Approve or request changes
3. Switch to Code mode to begin implementation
4. Start with Phase 1: Foundation
