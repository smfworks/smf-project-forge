# SMF Project Forge

> **"The AI Manuscript Orchestrator"**
> A calm, beautiful web application for orchestrating the SMF 28-agent ecosystem through a six-phase creative production pipeline.

**Live:** https://forge.smfworks.com
**Dashboard Embed:** https://smf-dashboard.vercel.app/forge
**GitHub:** https://github.com/smfworks/smf-project-forge

---

## What is Forge?

SMF Project Forge is a visual command center for Michael's three-agent creative production system. The core metaphor: a **manuscript being written by 28 specialized agents under one conductor's direction**.

The six-phase pipeline:

```
Brainstorm → Organize → Order & Map Out → Rough Drafts → Edit → Final Draft
```

Each phase is an explicit gate. The human conductor advances each gate with a single click, answering one focused question at each stage.

---

## Architecture

```
┌─────────────────────────────────────────┐
│           BROWSER (React UI)            │
│  React Flow Canvas · Phase Gates · Roster│
└──────────────────┬──────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────┐
│    VERCEL (Next.js 15 App Router)       │
│  Server Actions · API Routes · SSE       │
│  ┌──────────────────────────────────┐  │
│  │     TURSO (libSQL — Persistent)  │  │
│  │  Projects · Nodes · Artifacts     │  │
│  └──────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │ Sync Daemon (inotify)
┌──────────────────▼──────────────────────┐
│      AGENT MACHINES (Local Queues)     │
│  mikesai1 · mikesai2 · mikesai3        │
│  forge-sync-agent.py watches local JSON │
│  files and pushes deltas to Vercel API  │
└─────────────────────────────────────────┘
```

**Key design decisions:**
- Agents write to local JSON files (zero code changes)
- Sync daemon pushes changes to Vercel (invisible to agents)
- State lives permanently in Turso
- Machines can be replaced freely — new machine gets the same daemon

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Canvas | React Flow (@xyflow/react) |
| Database | Turso (libSQL) via Drizzle ORM |
| Animations | Framer Motion |
| Icons | Lucide React |
| Sync | Python 3 + watchdog (per machine) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Turso credentials and API keys
```

**Required environment variables:**
```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-token
FORGE_API_KEY=your-secret-api-key
NEXT_PUBLIC_FORGE_URL=https://forge.smfworks.com
```

### 3. Set up database

```bash
# Push schema to Turso
npm run db:push

# Or with drizzle-kit (for migrations)
npm run db:generate
npm run db:migrate
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
# Connect to GitHub and push — Vercel auto-deploys
git init
git add .
git commit -m "Initial commit"
gh repo create smf-project-forge --public --push
# Connect repo in Vercel dashboard
# Add env vars in Vercel project settings
```

---

## Install Sync Daemon (per agent machine)

The sync daemon runs on mikesai1, mikesai2, and mikesai3 to watch local queue files and push changes to Forge.

```bash
# On each agent machine:
cd forge-sync-agent
chmod +x install.sh
sudo ./install.sh
```

Edit `/etc/forge/queues.conf` with the machine's API key and queue paths.

**Systemd service** (recommended):
```bash
sudo systemctl status forge-sync-agent
```

**Or start manually:**
```bash
python3 /opt/forge/forge-sync-agent.py
```

---

## Project Structure

```
smf-project-forge/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Phase gate dashboard (home)
│   ├── canvas/page.tsx             # Mind-map canvas
│   ├── roster/page.tsx             # 28-agent team roster
│   ├── artifacts/page.tsx          # Artifact vault
│   ├── forge-settings/page.tsx      # Settings + config
│   └── api/                        # API routes
│       ├── projects/               # CRUD for projects
│       ├── artifacts/              # CRUD for artifacts
│       ├── queues/                 # Sync daemon endpoints
│       └── agents/                 # Agent status
├── components/
│   ├── canvas/forge-canvas.tsx     # React Flow wrapper
│   ├── phases/phase-gate-dashboard.tsx
│   ├── agents/agent-roster.tsx
│   └── layout/top-nav.tsx
├── lib/
│   ├── db.ts                      # Turso client
│   └── schema.ts                  # Drizzle schema
├── forge-sync-agent/
│   ├── forge-sync-agent.py         # The sync daemon
│   ├── install.sh                  # Per-machine install
│   ├── forge-sync-agent.service    # Systemd unit
│   └── queues.conf.example         # Config template
└── SPEC.md                        # Full specification
```

---

## Design System

| Element | Value |
|---------|-------|
| Background | `#0A0F1E` |
| Surface | `#111827` |
| Border | `#1E293B` |
| Text | `#E2E8F0` |
| Accent | `#3B82F6` |
| Team Rafael | `#F59E0B` (amber) |
| Team Aiona | `#F97316` (orange) |
| Team Gabriel | `#14B8A6` (teal) |
| Font | Inter + JetBrains Mono |

---

## License

Proprietary — SMF Works. All rights reserved.
