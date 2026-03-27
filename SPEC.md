# SMF Project Forge — Specification

> **"The AI Manuscript Orchestrator"**
> A calm, writer-focused web application that transforms the SMF agent ecosystem into a living creative production pipeline, guided by the human conductor at every gate.

**GitHub:** https://github.com/smfworks/smf-project-forge
**Live:** https://forge.smfworks.com
**Dashboard Embed:** https://smf-dashboard.vercel.app/forge

---

## 1. Concept & Vision

SMF Project Forge is a visual command center for Michael's three-agent creative production system. The core metaphor is a **manuscript being written by 28 specialized agents under one conductor's direction** — each project a book, each phase a chapter, each agent a specialized writer in a writing room.

The app is calm, beautiful, and deeply functional. It feels like Obsidian meets Linear meets a well-designed writing app — dark, focused, with purposeful color. It doesn't shout. It shows you exactly where you are, who's doing what, and what needs your attention next.

The six-phase pipeline (Brainstorm → Organize → Order & Map Out → Rough Drafts → Edit → Final Draft) is enforced as explicit gates. The human conductor advances each gate with a single click, answering one focused question at each stage. Everything else happens automatically.

---

## 2. Design Language

### Aesthetic
Obsidian-meets-Linear. Dark, focused, writer-friendly. Calm without being sterile. The interface should feel like a premium creative tool, not a project management dashboard.

### Color Palette
```
Background:       #0A0F1E (deep navy-black)
Surface:          #111827 (card backgrounds)
Border:           #1E293B (subtle separators)
Text Primary:     #E2E8F0 (near-white)
Text Secondary:   #94A3B8 (muted)

Accent Blue:      #3B82F6 (interactive elements, links)
Accent Cyan:      #06B6D4 (highlights, active states)

Team Rafael:      #F59E0B (amber) — ops, coordination
Team Aiona:       #F97316 (warm orange) — content, writing
Team Gabriel:     #14B8A6 (teal) — research, production

Success:          #22C55E
Warning:          #EAB308
Error:            #EF4444
```

### Typography
- **Primary:** Inter (Google Fonts) — clean, readable, modern sans-serif
- **Monospace:** JetBrains Mono — for code snippets, JSON previews, technical artifacts
- **Fallback:** system-ui, -apple-system

### Spatial System
- Base unit: 4px
- Content max-width: 1280px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)

### Motion
- Framer Motion for all transitions
- Phase gate transitions: 400ms ease-out slide
- Card hover: 150ms subtle lift (translateY -2px + shadow)
- Canvas node interactions: React Flow native physics
- No gratuitous animation — every motion has purpose

### Visual Assets
- **Icons:** Lucide React (consistent, clean)
- **Agent avatars:** Emoji-based (🎯 Aiona, 🔥 Rafael, 🧪 Gabriel)
- **Team color badges:** Solid colored pills with team name
- **Progress visualization:** Ink-filling-a-page metaphor for phase advancement

---

## 3. System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (React UI)                   │
│  React Flow Canvas · Phase Gates · Agent Roster        │
│  Artifact Vault · Analytics Dashboard                   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL (Next.js 15 App Router)            │
│  Server Actions · API Routes · SSE · Auth              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │           TURSO (SQLite — Persistent)           │  │
│  │  Projects · Queues · Nodes · Artifacts · Agents  │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │ Sync Daemon (inotify)
                          ▼
┌─────────────────────────────────────────────────────────┐
│           AGENT MACHINES (Local Queue Files)            │
│  mikesai1 (Aiona) · mikesai2 (Gabriel) · mikesai3     │
│  /home/mikesaiN/.../smf-agents/shared/data/*.json       │
│                                                         │
│  forge-sync-agent.py  ←  tiny daemon, watches files     │
│  and pushes deltas to Vercel API                        │
└─────────────────────────────────────────────────────────┘
```

### Why This Architecture

- **Agents need zero code changes** — they write to local JSON files as they do today
- **Sync daemon is invisible to agents** — it watches files and pushes to Vercel
- **State lives permanently in Turso** — independent of any VM lifecycle
- **Machines can be replaced freely** — new machine gets the same sync daemon
- **Works fully offline** — if Vercel is down, agents keep working with local files
- **Same codebase** — Vercel for demos/previews, local Next.js for production with full connectivity

---

## 4. The Six-Phase Pipeline

Each project advances through exactly six phases. Only one phase is active at a time. The human conductor approves each gate transition.

### Phase 1: Brainstorm
**Goal:** Surface every possible thought, opportunity, and angle without judgment.

**What triggers:**
- Human clicks "Harvest" button
- Sync daemon pulls signal from: Dwight Radar (Rafael) + Hunter Haley (Aiona) + Harold Historian / Socrates Philosopher (Gabriel)
- All three scouts run in parallel, dumping atomic notes into the idea cloud

**Output:** Raw idea cloud — nodes in the canvas, each tagged by source (Reddit, HN, X, GitHub, news, internal)

**Human gate question:** *"Which three idea clusters feel strongest?"*

**UI:** Infinite canvas showing idea nodes as small colored dots, grouped loosely by apparent theme. Human drags to highlight strongest clusters.

---

### Phase 2: Organize
**Goal:** Collapse chaos into coherent bubbles — central ideas with radiating satellite ideas.

**What triggers:**
- Human clicks "Organize" after selecting clusters in Phase 1
- Allen Architect (Rafael) + Quinn Writer (Aiona) + Chris Curator + Elena Educator (Gabriel) run in parallel
- LLM-assisted grouping collapses idea cloud into 3–7 central bubbles with branching satellites

**Output:** Visual mind-map (React Flow canvas), exported as JSON + PNG. Tagged clusters stored in Turso.

**Human gate question:** *"Do these bubbles accurately represent your project scope?"*

**UI:** Canvas now shows organized bubbles. Each bubble is a draggable group. Color-coded by team (amber/orange/teal).

---

### Phase 3: Order & Map Out
**Goal:** Turn the map into actionable artifacts.

**What triggers:**
- Human clicks "Map Out" after approving bubbles
- Allen Architect drafts requirements skeleton → Chad Approver gates it → Samantha ScriptWriter + Ned Narrator (Gabriel) add narrative flow → Paige Analyst (Aiona) adds SEO/metadata layers

**Output (auto-generated):**
- Requirements Document (Markdown → Google Doc via gog CLI)
- Architectural Decision Record (ADR)
- Task breakdown JSON → mission queue for Rafael's Fred Forge

**Human gate question:** *"Approve requirements and task breakdown, or request changes?"*

**UI:** Split view — requirements document on left, task list on right. Editable inline. Approve/Request Changes buttons.

---

### Phase 4: Rough Drafts
**Goal:** Create multiple living drafts in parallel.

**What triggers:**
- Human clicks "Execute" after approving Phase 3
- Fred Forge (Rafael) executes mission steps while Quinn Writer (Aiona) produces first drafts
- Gabriel's production sub-agents (Veronica Voice, Mary Formatter) generate audio/multi-format prototypes
- Multiple drafts can exist simultaneously (e.g., v0.1 blog post + v0.1 code module + v0.1 video script)

**Output:** Artifacts in mission queue marked "Draft" — linked in Artifact Vault

**Human gate question:** *"Ready for review?"*

**UI:** Artifact cards appear as drafts complete. Cards show: artifact type, version, which agent produced it, link to preview.

---

### Phase 5: Edit
**Goal:** Ruthless refinement.

**What triggers:**
- Human clicks "Edit" to begin review phase
- Vera Editor + Edith Editor (Gabriel) run quality passes
- Filo FactChecker + Patricia QALead + Justin EdgeCase stress-test
- Sam Sage (Rafael) extracts lessons and patterns
- Cross-team reviews: Aiona reviews Gabriel's technical accuracy; Gabriel reviews Aiona's pedagogical clarity

**Output:** Versioned "Edited" artifacts with diff highlights and change logs

**Human gate question:** *"Approve edited artifacts?"*

**UI:** Diff view for each artifact. Change log sidebar. Approve/Request Revisions buttons per artifact.

---

### Phase 6: Final Draft
**Goal:** Lock and launch.

**What triggers:**
- Human clicks "Ship" after approving all edits
- Dex Publisher pushes to CMS/social
- Tracy TestAudience + Gabriel's final QA sign-off
- Sam Sage closes the loop with post-mortem metrics

**Output:** Published content, deployed code, shipped series episode. Post-mortem insight card generated.

**Human gate:** Final "Ship" confirmation

**UI:** Success state — published artifacts with links. Sam Sage insight card shows what was learned.

---

## 5. Core UI Components

### 5.1 Phase Gate Dashboard (Home View)
Six horizontal lanes, each representing one phase. Active phase is expanded; completed phases show ink-fill progress bar.

```
[ Brainstorm ●●●●●○○○ 5/8 ] → [ Organize ○○○○○○○○ 0/8 ] → ...
```

Each lane shows:
- Phase name + icon
- Active agents (colored pills)
- One-line status summary
- "Advance" button (active phase only)

### 5.2 Visual Canvas (Mind-Map)
React Flow-based infinite canvas.

**Nodes:**
- `idea-node` — small circle, source-colored, shows first 30 chars of note
- `bubble-node` — large rounded rect, team-colored border, contains satellite idea nodes
- `artifact-node` — rect with artifact icon, links to preview

**Edges:** Bezier curves, subtle color matching source node

**Controls:** Zoom, pan, fit-to-view, auto-layout button, export PNG/JSON

### 5.3 Agent Team Roster
Live grid of all 28 agents.

Each agent card shows:
- Emoji avatar + agent name
- Team color badge
- Current task (one line)
- Model in use
- Status indicator (active/idle/blocked)

Color bands at top of card: Rafael agents = amber, Aiona = orange, Gabriel = teal.

### 5.4 Artifact Vault
Auto-generated, versioned list of all project artifacts.

Columns: Name · Type · Version · Created · Agent · Status · Actions

Types: Requirements Doc, ADR, Blog Draft, Code Module, Audio, Video, Series Episode

Each row links to the artifact (Google Doc, local file, or Vercel preview).

### 5.5 Project Selector
Dropdown in top nav to switch between active projects.

Each project card shows: name, current phase, last activity, active agents count.

"New Project" opens a modal with project name + type (Blog Series / Ops Mission / Great Thinkers Episode / Other).

---

## 6. Data Model (Turso / SQLite)

### Projects Table
```sql
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,          -- UUID
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,              -- 'blog' | 'ops' | 'series' | 'other'
  phase       INTEGER NOT NULL DEFAULT 0, -- 0=Brainstorm ... 5=Final
  status      TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'archived'
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

### Nodes Table (Canvas)
```sql
CREATE TABLE nodes (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id),
  phase       INTEGER NOT NULL,           -- 0-5
  type        TEXT NOT NULL,              -- 'idea' | 'bubble' | 'artifact'
  title       TEXT,
  content     TEXT,
  team        TEXT,                       -- 'rafael' | 'aiona' | 'gabriel'
  source      TEXT,                       -- 'radar' | 'hunter' | 'historian' | etc.
  parent_id   TEXT,                       -- for bubble grouping
  position_x  REAL,
  position_y  REAL,
  created_at  INTEGER NOT NULL
);
```

### Artifacts Table
```sql
CREATE TABLE artifacts (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id),
  phase       INTEGER NOT NULL,
  type        TEXT NOT NULL,              -- 'requirements' | 'adr' | 'blog_draft' | etc.
  version     INTEGER NOT NULL DEFAULT 1,
  content     TEXT,                       -- Markdown or JSON
  gdoc_url    TEXT,                        -- Google Doc link (via gog CLI)
  local_path  TEXT,                       -- local file path
  agent_id    TEXT,
  status      TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'edited' | 'published'
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

### Agent Status Table (Polled Snapshot)
```sql
CREATE TABLE agent_status (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  team        TEXT NOT NULL,
  model       TEXT,
  current_task TEXT,
  status      TEXT NOT NULL,              -- 'active' | 'idle' | 'blocked'
  updated_at  INTEGER NOT NULL
);
```

---

## 7. API Design

### Queue Sync (Forge Sync Daemon → Forge API)

**POST /api/queues/heartbeat**
Called by sync daemon on machine boot.
```json
{ "machine": "mikesai3", "queues": ["opportunities", "proposals", "missions", "completed"] }
```

**POST /api/queues/ping**
Called when a local queue file changes.
```json
{ "machine": "mikesai3", "queue": "proposals", "action": "add", "entry": {...} }
```

**GET /api/queues/:queue**
Returns current state of a queue (for initial sync on daemon start).

### Project & Artifact (Forge UI → Forge API)

**GET /api/projects** — List all projects
**POST /api/projects** — Create project
**GET /api/projects/:id** — Get project detail
**PATCH /api/projects/:id** — Update project (phase advance, status change)

**GET /api/projects/:id/nodes** — Get canvas nodes
**POST /api/projects/:id/nodes** — Create node
**PATCH /api/projects/:id/nodes/:nodeId** — Update node position/content

**POST /api/projects/:id/advance** — Advance to next phase (Server Action)

**GET /api/artifacts?projectId=xxx** — List artifacts for project
**POST /api/artifacts** — Create artifact
**PATCH /api/artifacts/:id** — Update artifact (version bump, status change)

### Real-Time Updates (SSE)

**GET /api/projects/:id/stream**
Server-Sent Events stream for live project updates.
Events: `phase-advance`, `node-created`, `artifact-updated`, `agent-status-change`

### Agent Status

**GET /api/agents/status**
Returns cached snapshot of all 28 agent statuses (refreshed every 15s).

**POST /api/agents/trigger**
Trigger a specific agent/sub-agent to act on a project.
```json
{ "agent": "dwight-radar", "projectId": "xxx", "action": "scan" }
```

---

## 8. SMF Forge Sync Daemon

**File:** `forge-sync-agent.py` (one file, < 200 lines)

**Install per machine:**
```bash
pip install watchdog requests
# Add to systemd service or @reboot cron
python3 /opt/forge/forge-sync-agent.py &
```

**What it does:**
1. Reads queue paths from `/etc/forge/queues.conf` (machine-specific)
2. Uses `inotify` (Linux) or `FSEvents` (macOS) to watch JSON queue files
3. On any file change: reads diff, POSTs delta to `https://forge.smfworks.com/api/queues/ping`
4. On daemon start: does a full sync (GET all queues, compares, pushes missing entries)
5. On Vercel unreachable: queues changes locally, retries with exponential backoff

**Queue config on each machine (`/etc/forge/queues.conf`):**
```json
{
  "machine": "mikesai3",
  "api_url": "https://forge.smfworks.com",
  "api_key": "forge-agent-token-xxx",
  "queues": [
    { "name": "opportunities", "path": "/home/mikesai3/.../smf-agents/shared/data/opportunities.json" },
    { "name": "proposals", "path": "/home/mikesai3/.../smf-agents/shared/data/proposals.json" },
    { "name": "missions", "path": "/home/mikesai3/.../smf-agents/shared/data/missions.json" },
    { "name": "completed", "path": "/home/mikesai3/.../smf-agents/shared/data/completed.json" }
  ]
}
```

**Security:** Each machine has its own scoped API token with write access only to queue endpoints.

---

## 9. Dashboard Integration

### As Standalone App
`https://forge.smfworks.com` — full Forge experience

### As Dashboard Widget
`https://smf-dashboard.vercel.app/forge` — renders Forge as an embedded page

**Implementation:** The Next.js app at `/forge` is a self-contained page that uses the same layout shell as the standalone app. The sidebar nav is hidden in embed mode (`?embed=true` query param).

**Dashboard sidebar link:**
```
Chat → smf-chat.vercel.app (external)
Forge → forge.smfworks.com (external, new tab)
```

---

## 10. Google Drive & Workspace Integration

### Requirements Document → Google Doc
- Phase 3 auto-generates requirements as Markdown
- Server Action calls `gog doc create --title "Requirements: [Project Name]" --content [markdown]`
- Returns Google Doc URL, stored in artifact record
- Document link shown in Artifact Vault

### Obsidian Vault (Reference)
- Canvas can link to existing Obsidian notes as reference nodes
- Not a write integration — Forge reads notes to populate idea cloud context
- Obsidian path configurable via `NEXT_PUBLIC_OBSIDIAN_VAULT_PATH` env var

---

## 11. Authentication & Security

### Single-User (Phase 1 MVP)
- Simple bearer token in `X-Forge-Key` header
- Token stored in Vercel env vars and in sync daemon config
- No user accounts, no login flow
- Michael is the only user

### Future Multi-User (Phase 2)
- Add NextAuth.js with Michael's Google account
- Agent tokens remain bearer-key based
- Per-user project ownership

### API Security
- All endpoints require `X-Forge-Key` or valid session cookie
- Rate limiting: 100 req/min per token
- Sync daemon tokens: scoped to queue write only, no project data access

---

## 12. Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui components |
| Canvas | React Flow (@xyflow/react) |
| Database | Turso (libSQL / SQLite) |
| ORM | Drizzle ORM |
| Auth | Simple bearer token (MVP) / NextAuth.js (Phase 2) |
| Real-time | Server-Sent Events (SSE) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| Deployment | Vercel (preview + production) |
| Sync Daemon | Python 3 + watchdog + requests |
| Google Workspace | gog CLI (existing) |

---

## 13. Project Structure

```
smf-project-forge/
├── app/
│   ├── layout.tsx                    # Root layout, font, dark shell
│   ├── page.tsx                     # Phase gate dashboard (home)
│   ├── globals.css                  # Tailwind + custom properties
│   ├── canvas/
│   │   └── page.tsx                # React Flow mind-map canvas
│   ├── project/
│   │   └── [id]/
│   │       ├── page.tsx             # Project detail view
│   │       ├── phases/
│   │       │   └── [phase]/page.tsx # Phase-specific UI
│   │       ├── artifacts/
│   │       │   └── page.tsx         # Artifact vault
│   │       └── settings/
│   │           └── page.tsx         # Project settings
│   ├── roster/
│   │   └── page.tsx                 # 28-agent team roster
│   ├── forge.config.ts               # Forge settings page
│   ├── api/
│   │   ├── projects/
│   │   │   ├── route.ts             # GET/POST projects
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET/PATCH/DELETE project
│   │   │       ├── nodes/route.ts   # GET/POST nodes
│   │   │       ├── advance/route.ts # POST phase advance
│   │   │       └── stream/route.ts  # SSE stream
│   │   ├── artifacts/
│   │   │   └── route.ts             # GET/POST artifacts
│   │   ├── queues/
│   │   │   ├── ping/route.ts        # POST queue delta (sync daemon)
│   │   │   └── [queue]/route.ts     # GET queue state
│   │   └── agents/
│   │       ├── status/route.ts       # GET agent statuses
│   │       └── trigger/route.ts     # POST trigger agent
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   ├── canvas/
│   │   ├── forge-canvas.tsx         # React Flow wrapper
│   │   ├── idea-node.tsx
│   │   ├── bubble-node.tsx
│   │   ├── artifact-node.tsx
│   │   └── canvas-controls.tsx
│   ├── phases/
│   │   ├── phase-gate.tsx           # Individual phase lane
│   │   ├── phase-advance-button.tsx
│   │   └── gate-question.tsx         # Human prompt at each gate
│   ├── agents/
│   │   ├── agent-card.tsx
│   │   └── agent-roster.tsx
│   ├── artifacts/
│   │   ├── artifact-card.tsx
│   │   └── artifact-vault.tsx
│   └── layout/
│       ├── top-nav.tsx
│       └── project-switcher.tsx
├── lib/
│   ├── db.ts                        # Turso client + init
│   ├── schema.ts                    # Drizzle schema
│   ├── queues.ts                    # Queue read/write helpers
│   ├── smf-chat.ts                 # smf-chat polling/writing
│   ├── gog.ts                      # Google Drive/gog CLI wrappers
│   └── agents.ts                    # Agent status helpers
├── drizzle/
│   └── migrations/
├── public/
│   └── favicon.svg
├── forge-sync-agent/
│   ├── forge-sync-agent.py          # The sync daemon (standalone)
│   ├── install.sh                   # Per-machine install script
│   └── queues.conf.example          # Config template
├── .env.local.example
├── package.json
├── README.md
└── SPEC.md                          # This document
```

---

## 14. Build Phases

### Phase 1 (MVP — 1 Week)
- [ ] Next.js 15 project scaffold with Tailwind + shadcn/ui + dark theme
- [ ] Phase gate dashboard (6 lanes, advance button, active phase highlight)
- [ ] Project CRUD (create project, switch between projects)
- [ ] Phase 1 + Phase 2 canvas (React Flow, idea nodes, bubble grouping)
- [ ] Phase 3 requirements document generation (Markdown output)
- [ ] Sync daemon (`forge-sync-agent.py`) + install script
- [ ] Turso schema + all API routes
- [ ] Deploy to Vercel (preview link + production)
- [ ] Run a test project through all 6 phases end-to-end

### Phase 2 (Polish — 1 Week)
- [ ] Phase 3 artifact generation (ADR + task JSON)
- [ ] Phase 4 rough draft tracking (artifact cards)
- [ ] Phase 5 diff view + edit tracking
- [ ] Phase 6 publish + Sam Sage post-mortem card
- [ ] Agent roster with live status (polling every 15s)
- [ ] Artifact vault with Google Doc links (via gog CLI)
- [ ] Real-time SSE updates (phase advance, new artifacts)
- [ ] Full dashboard embed mode

### Phase 3 (Ecosystem — 1 Week)
- [ ] Agent trigger integration (write to queues → agent acts → response flows back)
- [ ] Multi-project support (queue per project)
- [ ] Analytics dashboard (Sam Sage insights)
- [ ] Excalidraw-style canvas enhancement (future-proof)
- [ ] Publish to Vercel as public demo

---

## 15. Success Criteria

1. Michael can create a new project → run it through all 6 phases → ship an artifact
2. All queue changes from agent machines appear in Forge UI within 5 seconds
3. All 28 agents are visible with current status in the roster
4. Phase advancement requires explicit human approval (no accidental advancement)
5. Forge is usable as a standalone app AND embedded in smf-dashboard
6. Sync daemon runs reliably on all three agent machines without maintenance
7. When any agent machine is replaced, the new machine picks up seamlessly with no data loss

---

## 16. Dependencies & Credits

**Built for:** Michael Gannotti / SMF Works
**Framework:** Next.js 15, React 19, TypeScript
**Canvas:** React Flow (@xyflow/react)
**Icons:** Lucide
**Database:** Turso (libSQL)
**AI Integration:** OpenClaw agent ecosystem (Rafael, Aiona, Gabriel + 25 sub-agents)
**Workspace:** Google Workspace via gog CLI
**Chat:** smf-chat (existing internal tool)
**Design inspiration:** Obsidian, Linear, Notion

---
