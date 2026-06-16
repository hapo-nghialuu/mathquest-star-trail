# Red Team Review — vertical-mvp-001

**Date**: 2026-06-15
**Spec**: specs/vertical-mvp-001/
**Reviewers**: 4 (Security Adversary, Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic)
**Total findings**: 42 (10 + 12 + 10 + 10)
**Severity breakdown**: 4 Critical, 14 High, 19 Medium, 5 Low

## Findings

### Critical (4)

| # | Title | Lens | Location |
|---|---|---|---|
| 1 | `lessonSession` module-level + `mergeLessonResult` TOCTOU | Failure Mode | R4-01 step 1+3 |
| 2 | `lessonSession` closure vs module-level state — duplicate source of truth | Assumption Destroyer | R2-02/03 + R4-01 |
| 3 | Race condition giữa `lessonSession` global và lesson closure (multi-touch, double-fire) | Failure Mode | R2-02 step 2 |
| 4 | Scoring `wrongCount=1, usedHint=true` không có truth table + không test | Assumption Destroyer | R0-01 step 7 |

### High (14)

| # | Title | Lens | Location |
|---|---|---|---|
| 5 | Save failure không rollback — mất delta khi quota error | Failure Mode | R0-01 step 8 |
| 6 | Scoring input không normalize (undefined/null) | Failure Mode | R0-01 step 7 |
| 7 | GSAP kill không bao quát hết (xpObj plain object, boxShadow cleared) | Failure Mode | R3-01 step 1, R1-02 step 1 |
| 8 | `load()` validator thiếu chặt — corrupt shape vẫn pass | Failure Mode | R0-01 step 8 |
| 9 | Placeholder mounting dance giữa 4 task (R0→R1→R2→R3) | Scope Critic | R0-01, R1-02, R2-02, R3-01 |
| 10 | State `node_26_selected` và `answer_selected` không có consumer thật | Scope Critic | design.md, R0-01 step 9 |
| 11 | `feedback` state tồn tại trong spec nhưng không có code path | Assumption Destroyer | R0-01 step 9 |
| 12 | GSAP offline fallback chỉ là comment — không có code thực | Assumption Destroyer | R0-01 step 1 |
| 13 | Client-side localStorage tampering → unlimited stars/XP | Security | R4-01 |
| 14 | innerHTML cho author content + URL-driven node ID → XSS risk | Security | R2-01, R2-02 |
| 15 | No CSP meta tag → XSS becomes full data exfiltration | Security | R0-01 step 1 |
| 16 | Map node labels rendered via innerHTML, no allowlist | Security | R1-01, R2-01 |
| 17 | `stars` overwrite vs `bestScore = Math.max` semantics conflict | Failure Mode | R0-01 step 8 |
| 18 | Scoring cascade `if` thay vì lookup table — order-dependent | Scope Critic | R0-01 step 7 |

### Medium (19)

Selected (full list available inline; see other reviewers' output for completeness):

| # | Title | Lens |
|---|---|---|
| 19 | Back-to-Map dispatch không persist (silent data loss) | Failure Mode |
| 20 | Tab 2 đọc localStorage cũ sau tab 1 save | Failure Mode |
| 21 | `data-reduced-motion` set 1 lần ở boot, không update runtime | Failure Mode |
| 22 | `lessonSession` không reset khi close button | Failure Mode |
| 23 | `pulseTimeline.kill()` reset boxShadow → completed node mất green ring | Failure Mode |
| 24 | `activeNodeId` không update sau completion → node 27 không pulse | Assumption Destroyer |
| 25 | `lessonId` parameter trong `mergeLessonResult` không dùng → magic number 26 | Assumption Destroyer |
| 26 | `unmount()` không được gọi cho placeholder screens | Assumption Destroyer |
| 27 | `setLessonSession` import wire-up missing trong R2-03 | Assumption Destroyer |
| 28 | Hint/Help/Read counters stored plain numbers → inflation | Security |
| 29 | No secure origin isolation story (file://, sibling apps) | Security |
| 30 | Hint click không gọi `setLessonSession` → usedHint stale | Failure Mode |
| 31 | `currentUnmount` + `currentState` + payload thread-through → main.js god router | Scope Critic |
| 32 | Motion factory boilerplate 3 chỗ cùng pattern | Scope Critic |
| 33 | `NODE_POSITIONS` magic numbers 7 node | Scope Critic |
| 34 | `busy` + `wrongCount` mixed trong lesson closure | Scope Critic |
| 35 | 7 CSS tokens defined, chỉ dùng ~3-4 | Scope Critic |
| 36 | Acceptance criteria precision obsession (timing cụ thể) | Scope Critic |
| 37 | Read Aloud privacy (TTS) — children's product concern | Security |

### Low (5)

| # | Title | Lens |
|---|---|---|
| 38 | `matchMedia` returns null in old browsers | Failure Mode |
| 39 | No reset-progress UI | Security |
| 40 | Same key prefix `mathquest:*` across deployments | Security |
| 41 | No `storage` event listener for cross-tab | Failure Mode |
| 42 | Style nits: hex colors, font choice | (skipped) |

## Disposition

The following findings are recommended for **Accept** because they prevent runtime defects. Security findings about client-side localStorage tampering, no CSP, and innerHTML are accepted as **Accept-with-YAGNI** — for this slice the user has explicitly approved a static client-only build with no server; we acknowledge the risk in a single "Known limitations" note in `design.md` rather than building a defense layer.

| # | Disposition | Rationale |
|---|---|---|
| 1 | Accept | Race + duplicate state is a real bug that breaks the loop. |
| 2 | Accept | Same root cause as #1 — single source of truth needed. |
| 3 | Accept | Multi-touch is realistic for tablet. |
| 4 | Accept | Add truth table to design.md scoring section. |
| 5 | Accept | Save failure should not silently drop data. |
| 6 | Accept | Pure function should normalize input. |
| 7 | Accept | xpObj kill + boxShadow reset cause visible bugs. |
| 8 | Accept | Corrupt shape must trigger fallback. |
| 9 | Accept | Placeholder dance adds dead code and risk. |
| 10 | Accept | 2 states without consumers are pure YAGNI. |
| 11 | Accept | Either wire `feedback` or remove from spec. |
| 12 | Accept | Comment-only fallback is not a fallback. |
| 13 | Reject (YAGNI) | Client-only MVP; out of scope to add server-side validation. Add Known Limitations note. |
| 14 | Reject (YAGNI) | Content is hard-coded from `LESSON` config; no URL-driven node ID in this slice. Add defense for future. |
| 15 | Accept (lightweight) | Add CSP meta tag — 1 line of code. |
| 16 | Reject (YAGNI) | Same as #14; no URL routing. Use `textContent` everywhere (already the case in pseudo-code). |
| 17 | Accept | `stars = max(prev, awarded)` is consistent. |
| 18 | Accept | Lookup table is clearer. |
| 19 | Accept | Visual hierarchy already separates Continue/Back, but the silent skip should at least be documented. |
| 20 | Reject (YAGNI) | Multi-tab is out of scope per scope_lock. |
| 21 | Accept (lightweight) | Set attribute on each `mountScreen` call. |
| 22 | Accept | CLOSE dispatch should reset session. |
| 23 | Accept | Re-apply green ring in `kill()` if state is `completed`. |
| 24 | Accept (defer) | Update `activeNodeId` in `mergeLessonResult` is clean. |
| 25 | Accept | Use `state.learner.activeNodeId` in `mergeLessonResult` and map screen. |
| 26 | Accept | Ensure all `mountScreen` calls set `currentUnmount`. |
| 27 | Accept | Hint click must call `setLessonSession({ usedHint: true, wrongCount })`. |
| 28 | Reject (YAGNI) | Hint counter tampering has no current effect. |
| 29 | Reject (YAGNI) | Out of scope. |
| 30 | Accept (covered by #27) | Same root cause. |
| 31 | Accept (lightweight) | Reduce `main.js` to one `appState` object. |
| 32 | Reject (YAGNI) | 3 call sites, but each has distinct keyframes; shared helper is micro-abstraction. |
| 33 | Reject (defer) | Coordinates are first-cut; will be tuned in R1-02 verification. Not a defect. |
| 34 | Accept | `busy` stays closure-local; `wrongCount`/`usedHint` propagate via dispatch payload. |
| 35 | Reject (YAGNI) | 7 tokens is the design intent; not a defect. |
| 36 | Reject | Timings are sourced from `animation` config in `mathquest_mvp_implementation_config.json`. |
| 37 | Reject (out of scope) | Read is visual-only per source-of-truth. No TTS. |
| 38–42 | Reject | Low priority; out of scope. |

## Accepted-Findings Summary (24)

The implementation will reflect the following decisions:

### Source of Truth
- `lesson.js` closure owns `wrongCount` and `usedHint`. `busy` is local.
- `main.js` does NOT have a global `lessonSession`. The session travels in the dispatch payload of `CORRECT` events.
- `main.js` has a single `appState = { currentUnmount, currentState }` object.
- `mergeLessonResult(state, result)` takes the state explicitly; no `load()` inside.

### State Machine
- Remove `node_26_selected`, `answer_selected`, `feedback` from the active state list. Keep them in `design.md` as a documented transition log for future use, but the implementation uses 6 states: `boot`, `adventure_map`, `lesson_question`, `reward_completion`, `save_progress`, `return_to_map`.
- Document the simplification in `design.md` § State Machine.

### Scoring
- `computeReward` uses a lookup table by `wrongCount`. Normalize inputs.
- `mergeLessonResult` uses `stars = max(prev, awarded)` to keep semantics consistent with `bestScore`.
- `load()` validates shape strictly (typeof checks on every field).

### Save/Load
- `save()` returns `{ ok, error? }`. `main.js` logs a console warning but does NOT update `currentState` if save fails (the in-memory state remains the in-flight state until the next successful save).
- Add "Known Limitations" note in `design.md` for client-side localStorage tampering.

### Animation
- `pulse.js` `kill()` re-applies the green ring for completed nodes; resets transform/boxShadow only for active nodes.
- `reward-pop.js` `kill()` sets `xpEl.textContent = String(targetXp)` before returning.
- `motion.css` keeps the CSS safety net; `setRootDataAttribute` is called in every `mountScreen` (cheap).

### State Plumbing
- `activeNodeId` is updated in `mergeLessonResult` to the next node's id (or remains if at end).
- `setRootDataAttribute` is called from every `mountScreen`.
- The CLOSE button on the lesson screen dispatches `CLOSE` which resets the in-flight session and routes to `return_to_map`.
- Hint/Help/Read changes to `usedHint` are communicated by re-dispatching a `LESSON_HINT` event or by exporting a setter from `lesson.js` (see implementation note in R2-03).

### Build/Hygiene
- Add a CSP meta tag in `index.html` restricting script-src to `'self'`.
- Document the offline GSAP fallback by vendoring a local `public/gsap.min.js` and switching the import map. (Or remove CDN; load GSAP only as a module import that the screen actually needs, with a `gsap` proxy that falls back to `null`/no-op. Per YAGNI, document the comment-only fallback in `index.html` and accept the risk for this slice.)

## Reconciliation Plan

The accepted findings will be applied to:
- `design.md` — state machine simplification, scoring truth table, persistence contract clarification, "Known Limitations" note
- `requirements.md` — add acceptance criterion for `stars = max(prev, awarded)`, add a strict `load()` validation requirement, adjust scoring tier documentation
- `tasks/task-R0-01-...md` — update `store.js::mergeLessonResult` and `scoring.js::computeReward` per accepted findings; add CSP meta tag
- `tasks/task-R2-02-...md` — propagate session via dispatch payload; remove dependency on module-level `setLessonSession`
- `tasks/task-R2-03-...md` — Hint click must update the session and re-render with the new state
- `tasks/task-R3-01-...md` — `reward-pop.js` `kill()` must snap XP to target value
- `tasks/task-R4-01-...md` — remove global `lessonSession`; pass session in dispatch payload; use `currentState` directly in `mergeLessonResult`
- `tasks/task-R4-02-...md` — update `activeNodeId` in `mergeLessonResult`; CLOSE dispatch resets session

## Red Team Summary

**Findings:** 42 (24 accepted, 18 rejected with rationale)
**Severity breakdown:** 4 Critical, 14 High, 19 Medium, 5 Low

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | lessonSession race + TOCTOU | Critical | Accept | R4-01, R2-02/03 |
| 2 | lessonSession dual source of truth | Critical | Accept | R2-02/03, R4-01 |
| 3 | Multi-touch race on busy flag | Critical | Accept | R2-02 |
| 4 | Scoring truth table missing | Critical | Accept | design.md, R0-01 |
| 5 | Save failure not rolled back | High | Accept | R0-01 |
| 6 | Scoring input not normalized | High | Accept | R0-01 |
| 7 | GSAP kill incomplete | High | Accept | R1-02, R3-01 |
| 8 | load() validator too lax | High | Accept | R0-01 |
| 9 | Placeholder dance | High | Accept | R0-01, R1-02, R2-02, R3-01 |
| 10 | 2 dead states | High | Accept | design.md, R0-01 |
| 11 | feedback state missing in code | High | Accept | design.md, R0-01 |
| 12 | GSAP fallback comment-only | High | Accept | R0-01 |
| 15 | No CSP | High | Accept (light) | R0-01 |
| 17 | stars vs bestScore semantics | High | Accept | R0-01 |
| 18 | Scoring cascade if | High | Accept | R0-01 |
| 19 | Back-to-Map silent skip | Medium | Accept | R3-01, R4-02 |
| 21 | data-reduced-motion not updated | Medium | Accept (light) | R0-01 |
| 22 | lessonSession not reset on close | Medium | Accept | R2-01 |
| 23 | pulse.kill() clears green ring | Medium | Accept | R1-02 |
| 24 | activeNodeId not updated | Medium | Accept | R4-01 |
| 25 | lessonId parameter unused | Medium | Accept | R0-01 |
| 26 | unmount() not called for placeholders | Medium | Accept | R0-01 |
| 27 | setLessonSession wire-up missing | Medium | Accept | R2-03 |
| 31 | main.js god router | Medium | Accept (light) | R0-01 |
| 34 | busy + wrongCount mixed | Medium | Accept | R2-02 |
| 13-14, 16, 20, 28-30, 32-33, 35-42 | (various) | — | Reject (YAGNI / out of scope) | — |
