# AGATA MVP Tasks

Project: AGATA — Agentic GeoAI for Ambulance and Triage Assistance

This file defines the implementation checklist for the MVP showcase.
The goal is not a production-ready system.
The goal is a visually convincing WebGIS + chatbot prototype aligned with the research proposal.

## Core Principle

Build only what is needed for a proposal-stage showcase:
- no real backend
- no real hospital integration
- no real ambulance routing
- no real AI orchestration
- no authentication
- no database required for MVP

Everything may use mock data and scripted flows, as long as the final result looks coherent and demonstrable.

---

## Phase 1 — Project Setup Review

- [ ] Read `AGATA_AGENT_BRIEF.md` fully before making changes.
- [ ] Review the existing SIGAPP repo structure before adding new files.
- [ ] Reuse existing UI patterns where possible.
- [ ] Do not refactor unrelated existing modules.
- [ ] Keep all MVP-specific files isolated and clearly named.

### Output
A clear understanding of where AGATA MVP should live in the current repo.

---

## Phase 2 — Dashboard Route Skeleton

Create the main showcase route:

- [ ] Add `/dashboard` page.
- [ ] Build a 3-part layout:
  - left sidebar = chatbot panel
  - main center = WebGIS map area
  - right panel or floating panel = recommendation details
- [ ] Add a top stats section or compact KPI strip.
- [ ] Ensure the layout already looks good even before full functionality is added.

### Notes
The page must feel like a smart emergency decision-support system, not a generic admin panel.

### Output
A static but polished dashboard skeleton for AGATA.

---

## Phase 3 — Mock Data Layer

Create all mock data locally in the codebase.

- [ ] Create mock hospital dataset.
- [ ] Create 10–15 Jakarta hospital entries.
- [ ] Each hospital should include:
  - `id`
  - `name`
  - `lat`
  - `lng`
  - `distanceKm`
  - `bedsAvailable`
  - `totalBeds`
  - `availabilityStatus`
  - `specialization`
  - `estimatedTravelMinutes`
- [ ] Create 3 demo patient scenarios:
  - Central Jakarta
  - South Jakarta
  - East Jakarta
- [ ] Create scripted recommendation outputs for each scenario.
- [ ] Create mock agent workflow steps for UI animation.

### Output
A self-contained mock data layer with no API calls.

---

## Phase 4 — WebGIS Map View

Implement the main map showcase.

- [ ] Add Mapbox-based map component.
- [ ] Center map on Jakarta by default.
- [ ] Show hospital markers from mock data.
- [ ] Add marker styling by availability status:
  - green = available
  - yellow = limited
  - red = full
- [ ] Support selecting a hospital from a marker.
- [ ] Optional: show a highlighted patient location marker for active scenario.

### Notes
No real routing is required.
If needed, use a simple visual line or highlight instead of actual route computation.

### Output
A visually convincing Jakarta hospital recommendation map.

---

## Phase 5 — Chatbot Panel

Implement the conversational panel.

- [ ] Add chat input UI.
- [ ] Add initial system greeting.
- [ ] Support 3 predefined scenario prompts.
- [ ] When user submits a supported scenario:
  - show loading state
  - trigger mock agent pipeline
  - display scripted response
- [ ] Show recommendation summary in natural language.
- [ ] Keep interaction deterministic and mock-driven.

### Example prompts
- "Pasien di Cempaka Putih"
- "Pasien di Tebet"
- "Pasien di Matraman"

### Output
A chatbot panel that demonstrates the AGATA interaction concept.

---

## Phase 6 — Agent Pipeline Visualization

Represent the multi-agent concept visually.

- [ ] Build a compact AGATA pipeline status component.
- [ ] Show these stages:
  - Query Parser / Intake
  - Data Retrieval
  - Spatial Analysis
  - Recommendation Generator
- [ ] Animate the stages during query processing.
- [ ] Mark stages as completed after response is generated.

### Notes
This is a UI storytelling component.
It does not need real agent execution behind it.

### Output
A convincing visual explanation of the agentic workflow.

---

## Phase 7 — Recommendation Detail Panel

Show structured recommendation results.

- [ ] Build recommendation cards for top hospitals.
- [ ] Show top 3 hospital recommendations.
- [ ] Each recommendation should display:
  - hospital name
  - distance
  - estimated travel time
  - bed availability
  - specialty
  - recommendation rank
- [ ] Highlight the best recommendation.
- [ ] Add concise explanation text:
  - closest
  - highest capacity
  - balanced option

### Output
A recommendation panel that looks decision-ready.

---

## Phase 8 — KPI / Summary Cards

Add compact summary metrics.

- [ ] Add 3–4 KPI cards above or near the map.
- [ ] Suggested metrics:
  - total hospitals in current view
  - average travel time
  - beds currently available
  - top recommendation confidence
- [ ] Use mock-calculated values from local data.

### Output
A small analytics layer that strengthens the showcase.

---

## Phase 9 — Landing / Entry Page

Optional but recommended.

- [ ] Update `/` landing page or create a minimal AGATA entry section.
- [ ] Include:
  - AGATA title
  - short subtitle
  - one paragraph explaining the concept
  - button to open dashboard
- [ ] Position AGATA as a proposal-stage Agentic GeoAI prototype.

### Output
A coherent front door into the dashboard experience.

---

## Phase 10 — Styling and Showcase Polish

- [ ] Use a clean health-tech / smart-city visual style.
- [ ] Keep interface professional and not overly playful.
- [ ] Use consistent status colors.
- [ ] Ensure spacing, cards, and typography feel polished.
- [ ] Make sure the system looks presentable in screenshots.

### Output
A demo-ready prototype suitable for proposal presentation.

---

## Non-Goals

Do not implement:
- real LLM integration
- OpenRouter integration
- Pinecone integration
- PostgreSQL / PostGIS integration
- authentication
- real geocoding pipeline
- real ambulance dispatch logic
- real hospital bed API
- production-grade backend

---

## Definition of Success

This task is successful when:
- the dashboard runs locally without requiring a backend
- the user can trigger at least 3 scenario-based chatbot demos
- the map displays Jakarta hospitals clearly
- recommendation cards appear coherently
- the agent pipeline animation helps explain the concept
- the whole product feels like a research prototype ready for showcase
