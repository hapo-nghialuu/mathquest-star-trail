# Research & Design Decisions

---

**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:
- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.

---

## Summary

- **Feature**: `vertical-mvp-001` (MathQuest: Star Trail — first vertical MVP slice)
- **Discovery Scope**: New Feature (greenfield web app)
- **Key Findings**:
  - The project ships only the polished art package, JSON guidance, and source-of-truth docs. There is no existing code, no `package.json`, no `src/`. Every file in the app must be created from scratch.
  - The approved art package is complete and self-sufficient: 5 full-screen and concept PNGs, 4 reference sheets, 6 reusable UI crops. No new image generation is required for the MVP slice.
  - The `mathquest_mvp_implementation_config.json` JSON is the single source of truth for the 3 screens, 9-state machine, scoring tiers, animation direction, and acceptance criteria.
  - A vanilla HTML + ES modules + GSAP-via-CDN approach delivers the playable loop with zero build step, matching the YAGNI/KISS guidance in `CLAUDE.md`.
  - The state machine and scoring are pure functions, testable in isolation. The screens are render/unmount functions. The localStorage layer is the only side effect outside the DOM.

## Evidence Summary

This section is mandatory for non-trivial specs. It is written before finalizing requirements, design, or tasks.

- **Codebase Scout**: Required
  - Result or skip rationale: Greenfield. `find` of the project root returns no `.ts`/`.tsx`/`.js`/`.json` outside the spec/, json/, archive/, mathquest_source_of_truth_package/ directories, plus `.claude/`. No `package.json`, no `src/`, no `index.html`. Every file in the runtime must be created.
  - Relevant files/modules: None. New project.
  - Existing patterns/contracts: Only contracts are the JSON guidance and source-of-truth markdown at the repo root. These are the binding specification; the implementation must consume them verbatim.
  - Tests or checks affected: None (no tests exist). Manual walkthrough is the verification surface per slice scope.

- **External / Current Research**: Required
  - Result or skip rationale: Three external topics must be validated: GSAP ESM import map for browsers, `prefers-reduced-motion` MediaQuery behaviour, and localStorage schema-versioning conventions.
  - Primary sources:
    - GSAP 3.12 ESM via import map (https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm) — works in any evergreen browser without a bundler.
    - MDN: `window.matchMedia('(prefers-reduced-motion: reduce)')` — returns a `MediaQueryList`; can be queried synchronously and re-evaluated on `change` event.
    - MDN: `Web Storage API` — `localStorage.getItem` / `setItem` are synchronous, scoped to origin, with a typical quota of 5–10 MB.
  - Current constraints or best practices:
    - Use `import` map + ES modules to keep zero build step.
    - Re-check `matchMedia` on every screen mount, not cached at module load, to avoid stale values if the user toggles their OS setting.
    - Wrap `localStorage` access in try/catch — Safari private mode and quota errors can throw.
    - Versioned storage key (`mathquest:v1:state`) so future schema migrations can be safely additive.

- **Selected Decision**:
  - Decision: Vanilla HTML + ES Modules + GSAP via CDN import map. No build step. State machine, scoring, and storage in plain ES module files. Screen rendering is a function that returns a DOM tree and an `unmount()` cleanup.
  - Why it fits the current codebase: There is no existing build system, framework, or pattern. Adding React/Vite/TS/Tailwind would introduce a bundler, install time, and a build artifact to verify, none of which produce a playable loop. The slice is small (~600 LOC) and a single page.
  - Why it fits current external constraints: GSAP is the animation library locked by `skills-lock.json`. Loading it via import map keeps the developer workflow "open file, run, test" without toolchain friction. The `prefers-reduced-motion` media query and `localStorage` are standard browser APIs.

- **Rejected Alternatives**:
  - **React + Vite + TypeScript + Tailwind** — Rejected by YAGNI. The frontend-development skill is available, but the slice has 3 screens, 1 state machine, no router, no API, no auth. The cost of a build setup outweighs the value. Stays as the obvious next step if a second slice needs routing, server data, or component libraries.
  - **Web Audio API for the Read button** — Out of scope per source-of-truth: "Read plays the question aloud and highlights answer choices" is interpreted as a visual sweep (no audio asset is shipped, no TTS contract defined). A future slice can add TTS without changing the visual contract.
  - **Service Worker / PWA install** — Out of scope. The slice targets mobile-portrait web preview, not installable.
  - **Multi-question session** — The config ships 1 question with 4/10 progress as a visual prop. A multi-question session would require sequencing, timer, retry — explicitly excluded.

- **Remaining Gaps / Questions**:
  - **Node 26 exact screen position** — Coordinates must be derived from inspection of `01_adventure_map_screen.png`. R1-02 will hard-code these as percentages. If a future world is added, positions become a data file.
  - **Asset positioning drift across viewports** — Use `%` for all overlay positions to minimize drift across 375×812 / 390×844 / 414×896. Background PNGs use `object-fit: cover`.
  - **GSAP CDN offline failure** — Documented as a high-severity risk. The plan file notes a fallback: download `gsap.min.js` to `public/` and swap the import map.

- **Downstream Task & Test Implications**:
  - Task implication: R0-01 must initialize the localStorage layer, the state machine, scoring, and reduced-motion detector in one foundation task so every UI task is data-shaped on day one.
  - Test/verification implication: R4-03 is the final integration scout that walks the 4 scoring paths, the persistence reload, and the reduced-motion branch. This is the only "test" surface for the slice; future slices can add unit tests for `scoring.js` and `store.js` once a test runner is introduced.

## Codebase Scout

Capture only useful repo evidence, not raw file dumps.

| Area | Finding | Evidence / Path | Implication |
|------|---------|-----------------|-------------|
| Project surface | No source code, no package manifest, no entry HTML. | `ls /Users/luutrungnghia/Desktop/game` returns only `CLAUDE.md`, `README.md`, `MathQuest_Star_Trail_Source_of_Truth.md`, `assets/`, `archive/`, `json/`, `mathquest_source_of_truth_package/`, `skills-lock.json`, `.claude/`, `.git/`. | Greenfield. Every runtime file is new. |
| Relevant files/modules | None. JSON guidance is the binding contract. | `json/mathquest_mvp_implementation_config.json`, `json/mathquest_ai_agent_art_guideline.json`, `json/mathquest_asset_manifest.json` | All app data must derive from these JSONs. `src/state/config.js` inlines them at boot. |
| Existing patterns | None. | n/a | Establish patterns in R0-01: ES module import order, no globals, unmount cleanup. |
| Contracts | localStorage schema (designed here, defined in design.md). | design.md > Canonical Contracts & Invariants | R4-01 implements and persists. |
| Tests and verification | None. | n/a | Manual walkthrough in R4-03. |
| Blast radius | None — greenfield. | n/a | The only blast is the runtime entrypoint. |
| Staleness / conflicts | None. | n/a | No prior code to conflict with. |

## External / Current Research

| Question | Source | Finding | Decision Impact |
|----------|--------|--------|-----------------|
| Can GSAP 3.12 be loaded as an ES module without a bundler? | GSAP forums + cdn.jsdelivr.net `+esm` build | Yes, `https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm` exposes a valid ESM build. Use `<script type="importmap">` with a `gsap` mapping. | Confirms zero-build approach. |
| How do I detect `prefers-reduced-motion` reliably? | MDN | `window.matchMedia('(prefers-reduced-motion: reduce)').matches` returns boolean synchronously. Can subscribe to `change` event to update reactively. | Re-check on each screen mount, not cached. |
| What's the safe pattern for localStorage? | MDN + web storage spec | `getItem` / `setItem` are synchronous. Wrap in try/catch for private mode and quota. Use a versioned key prefix for migrations. | R0-01 wraps all reads/writes; R4-01 uses `mathquest:v1:state` key. |
| What EARS patterns fit animation/state requirements? | `rules/ears-format.md` | "When [event], the [system] shall [response/action]" for transitions, "While [precondition], the [system] shall [response/action]" for ambient behaviour, "If [trigger], the [system] shall [response/action]" for failure modes. | Used in `requirements.md` for all acceptance criteria. |

## Research Log

### GSAP ESM Import Map
- **Context**: Avoid bundler/tooling but still use GSAP for timeline animation (per `skills-lock.json`).
- **Sources Consulted**: GSAP official download page (https://gsap.com/docs/v3/Installation/), cdn.jsdelivr.net npm mirror.
- **Findings**: GSAP 3.12 ships a UMD and an ESM build. The `+esm` path on jsDelivr exposes the ESM build. Import maps (`<script type="importmap">`) are supported in all evergreen browsers.
- **Implications**: `index.html` declares an import map mapping `"gsap"` → `https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm`. Any module can `import { gsap } from 'gsap'`. Risk: offline / CDN failure — mitigation is to swap the import map to a local `public/gsap.min.js` copy.

### Reduced Motion Detection
- **Context**: Source-of-truth and animation config both call out a reduced-motion fallback ("replace large movement with opacity and instant state changes").
- **Sources Consulted**: MDN `prefers-reduced-motion`, WCAG 2.1 success criterion 2.3.3 (Animation from Interactions).
- **Findings**: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is a synchronous boolean. The `MediaQueryList` fires a `change` event when the OS setting toggles.
- **Implications**: `src/motion/reduced.js` exposes `isReducedMotion()` that re-queries on every call (no module-level cache) to handle toggles mid-session. Each timeline factory checks the flag and returns either a real GSAP timeline or a no-op `gsap.set` with the end state.

### localStorage Versioning
- **Context**: Persist learner progress; future slices may add new fields.
- **Sources Consulted**: MDN Web Storage, common migration patterns (e.g., Redux Persist).
- **Findings**: Synchronous 5–10 MB quota, scoped to origin. Best practice is to namespace the key (`app:version:state`) and store a `schemaVersion` field for forward-compatible reads.
- **Implications**: Key `mathquest:v1:state`. `store.js::load()` validates `schemaVersion === 1` and falls back to `DEFAULT_STATE` (from config) on mismatch or missing/corrupt data. `save()` stamps `savedAt` and `schemaVersion` on every write.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Vanilla + ESM (selected) | Plain HTML entry, ES module files, GSAP via CDN import map. | Zero build. Open file → run. Tiny mental model. ~600 LOC. | No TS, no router, no test runner. | Fits the slice; future slices can add a bundler if scope grows. |
| React + Vite + TS | Component tree, hooks, JSX, build artifact. | Familiar DX, TS types, easy to grow. | Build step, install time, hydration overhead not needed. | YAGNI for a 3-screen slice. Re-evaluate at slice 2. |
| Vite + vanilla | Vite for dev server + HMR, no framework. | Hot reload, no framework lock-in. | Vite config, node_modules, install time. | Marginal benefit over `python3 -m http.server`. |

## Design Decisions

### Decision: Vanilla + ESM (no build)
- **Context**: Slice scope is small and self-contained. No existing build system. `skills-lock.json` requires GSAP.
- **Alternatives Considered**:
  1. React + Vite + TypeScript + Tailwind — see "Rejected Alternatives".
  2. Vite + vanilla — small benefit over plain static server, big install cost.
- **Selected Approach**: Single `index.html` with import map → ES module files under `src/`. GSAP loaded from CDN.
- **Rationale**: Matches `CLAUDE.md` (YAGNI, KISS, DRY), matches the locked skills (gsap, json-guidance), matches the polished art package (no build pipeline to disturb the asset output).
- **Status**: Accepted (user approved plan).
- **Trade-offs**: Lose TS autocomplete and component libraries. Gain: ship a playable loop in one session, no install, no build artifact.
- **Follow-up**: If slice 2 adds a router or shared component library, re-evaluate stack.

### Decision: 9-state machine as a transition map
- **Context**: `mathquest_mvp_implementation_config.json` enumerates 9 states. Implementation must enforce valid transitions and persist progress on `save_progress`.
- **Alternatives Considered**:
  1. Single `currentState` variable + if/else — works but invites bugs as states multiply.
  2. XState — adds a dependency, not justified at this size.
- **Selected Approach**: `src/state/machine.js` exports `transition(currentState, event) → nextState` with an explicit transition table and an `onTransition` hook for side effects (analytics, persistence, screen render).
- **Rationale**: Deterministic, easy to read, testable as a pure function.
- **Status**: Accepted.
- **Trade-offs**: More boilerplate than a flag variable. Worth it for clarity.
- **Follow-up**: If slice 2 adds async transitions, refactor to a queue with cancellation.

### Decision: localStorage key `mathquest:v1:state`
- **Context**: Persist learner progress across reloads. Future slices will add fields.
- **Alternatives Considered**:
  1. Single key per concern (`learner`, `nodes`, `session`) — harder to evolve atomically.
  2. IndexedDB — overkill for <10 KB of data, async API adds friction.
- **Selected Approach**: Single versioned key with the full snapshot. `schemaVersion` field enables forward-compatible reads.
- **Rationale**: Atomic writes, simple migration path, fast read at boot.
- **Status**: Accepted.
- **Trade-offs**: One big write on every save (rare). Quota risk is low (<1 KB).
- **Follow-up**: Slice 2 may add `mathquest:v1:settings` for non-progress state.

### Decision: GSAP timelines as factory functions returning `{ play, kill, isReduced }`
- **Context**: Each screen needs a timeline that respects reduced-motion. Multiple screens mount/unmount in one session; leaking timelines causes perf issues.
- **Alternatives Considered**:
  1. Global timelines on a single `gsap.timeline()` — leaks on screen change.
  2. Per-call inline animations — verbose, repeats reduced-motion check.
- **Selected Approach**: `src/motion/*.js` exports factories that return an object with `play()` and `kill()`. `kill()` calls `gsap.killTweensOf` to prevent leaks.
- **Rationale**: Predictable lifecycle, easy to mock for tests, single place to implement reduced-motion.
- **Status**: Accepted.
- **Trade-offs**: Slightly more code than inline. Worth it for clarity.
- **Follow-up**: None for slice 1.

## Risks & Mitigations
- **GSAP CDN offline failure** — Mitigation: document fallback (local `public/gsap.min.js`) in `index.html` header comment and R0-01 task. Severity: High.
- **Asset positioning drift across viewports** — Mitigation: use `%` for all overlay positions; verify on 375×812 and 414×896 before claiming done. Severity: Medium.
- **localStorage corruption / quota** — Mitigation: try/catch in `store.js::load()` and `save()`, fall back to `DEFAULT_STATE`, console warn, do not crash. Severity: Medium.
- **Reduced-motion toggle mid-session** — Mitigation: re-query `matchMedia` on every screen mount, no module-level cache. Severity: Low.
- **GSAP timeline memory leak on screen unmount** — Mitigation: every screen exports `unmount()` that calls `timeline.kill()` + `gsap.killTweensOf`. Severity: Low.

## References
- GSAP 3.12 Installation — https://gsap.com/docs/v3/Installation/ — ESM import pattern
- MDN `prefers-reduced-motion` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion — media query behaviour
- MDN `Window.localStorage` — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage — synchronous storage contract
- WCAG 2.1 SC 2.3.3 Animation from Interactions — https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
- `CLAUDE.md` and `MathQuest_Star_Trail_Source_of_Truth.md` at the project root — binding product contract
- `json/mathquest_mvp_implementation_config.json` — 9-state machine, scoring, animation, acceptance criteria
- `json/mathquest_ai_agent_art_guideline.json` — palette, mascot, UI language, screen layout rules
- `json/mathquest_asset_manifest.json` — asset paths and dimensions
