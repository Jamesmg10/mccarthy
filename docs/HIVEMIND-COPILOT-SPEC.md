# HiveMind rebrand — GitHub Copilot implementation specification

**Version:** 1.0  
**Prepared:** November 19, 2026, America/New_York  
**From:** McCarthy | Engineering & Technology  
**Repository:** `Jamesmg10/mccarthy`  
**Work branch:** `branding/hivemind-preview`  
**Existing pull request:** #3  
**Delivery state sought:** Branding candidate ready for human review, not an automatic merge or launch.

## 1. Mission and authorization

Finish the HiveMind branding-only update on the existing, user-verified four-screen prototype. Apply the selected minimal, scholarly visual direction without changing how saving, retrieval, AI consent, explanations or source reopening work.

The product promise remains **remembering research by context rather than exact titles**. Use **HiveMind** as the candidate user-facing product name and retain **McCarthy** as the team/project identity. This is an incremental presentation change, not a rebuild.

**Approval boundary:** The proposal and BR-004 permit limited naming/design/engineering assessment. The user subsequently requested starting the rebrand and now requests this implementation handoff. Execute the branding candidate; do not infer official public-name adoption, permission to merge/deploy, a domain purchase, or authorization to implement the Knowledge Graph. ENG-005 keeps the November 23 prototype ahead of graph work. Obtain explicit release approval before promotion.

This document translates the existing direction into engineering requirements. Additional viewport, accessibility and test details below are implementation acceptance targets, not claims that the board already approved them or that tests already passed.

## 2. Verified starting point — inspect before editing

At preparation, `main` points to `c251f2a764ec75c5109f431003d4d8cd8462631f`. The branding candidate before this specification is `d9b65e2fe46953d11f483cff8796bab20bb68285`. PR #3 is open, draft and unmerged. These are inspection snapshots; verify current refs rather than assuming they remain unchanged.

PR #3 already changes `index.html`, `styles.css` and `docs/HIVEMIND-REBRAND.md`. **Review and complete that draft; do not recreate completed work.** This specification adds a documentation file to that branch.

The user confirmed on November 19 at 18:56:10 EST: “I have verified the 4 screen prototype works with AI integration using my OpenAI API. Functionality is confirmed.” Treat the pre-rebrand prototype as **user-verified with real OpenAI integration**. Do not describe it as merely a nonworking mockup. The exact tested local/deployed revision and URL were not supplied, and the confirmation is not proof of cloud persistence, article summaries, graph functionality or acceptance of the new branding candidate.

Read the existing files before making changes:

- `docs/HIVEMIND-REBRAND.md`, `README.md`, `PROTOTYPE.md` and PR #3.
- `index.html`, `styles.css`, `app.js`, `ai-search.js`.
- `package.json`, `scripts/build.mjs`, `netlify.toml`.
- `netlify/functions/semantic-search.mjs`, `tests/semantic-search.test.mjs`, `tests/client_dom_check.py`.

Use `git status --short`, `git branch --show-current`, `git log -1 --oneline`, and a non-destructive fetch/diff to reconcile the workspace with the remote branches. Preserve uncommitted and unpushed human work. Do not reset, clean, force-push, overwrite a dirty file or automatically stash changes. If the working prototype differs from the remote baseline, identify the differences and preserve its behavior; report conflicts rather than reverting it to an older version.

## 3. Scope and file-level change contract

| File/area | Allowed work |
|---|---|
| `index.html` | Complete the candidate wordmark, title, metadata, supporting line, preview label and team attribution. Preserve script loading and the application mount. |
| `styles.css` | Complete the design tokens, typography, spacing, controls, responsive layout and state styling below. |
| `docs/HIVEMIND-REBRAND.md` | Record final scope, actual checks, limitations, release gate and rollback guidance. Preserve the human verification update. |
| `docs/HIVEMIND-COPILOT-SPEC.md` | Reference this task contract; do not broaden it silently. |
| Tests/evidence | Add a small branding-specific test or evidence file only where necessary. Do not add runtime dependencies or change the build pipeline to do so. |
| Functional code/configuration | Read and test, but do not change as part of this branding task. Escalate a separately identified defect. |

No global search-and-replace of “McCarthy.” The old name legitimately remains in team attribution, repository/package identifiers, storage keys and historical records.

**Out of scope:** Knowledge Graph UI or algorithms; PARA navigation/classification; proactive connection suggestions; browser-history/traffic tracking; new screens; article/PDF ingestion; summary generation; chatbot or account features; Supabase migration; model/endpoint changes; framework migration; repository/domain/origin renames; public campaign; merge or deployment. Do not show disabled or “coming soon” graph/Projects/Areas/Resources/Archives navigation as a substitute for implemented features.

## 4. Required identity and wording

Use the existing preview wording:

| Placement | Required text |
|---|---|
| Wordmark | `HiveMind` |
| Browser title | `HiveMind — Research Library` |
| Supporting line | `Research, kept in context.` |
| Header status | `Research library · Brand preview` |
| Meta description | `Save research with context. Find it again by meaning. A McCarthy project.` |
| Team attribution | `A McCarthy project.` |

Keep the wordmark linked to `#library`. Keep the visible preview label until official adoption/release is approved; do not substitute “production,” “launched,” or “verified” labels.

Preserve the current disclosure, with the attribution prepended:

> A McCarthy project. Prototype only. Records are saved in this browser. Optional AI search sends your notes, project labels and query to OpenAI with consent. Do not use sensitive data.

Keep existing consent and limitation messages visible and readable. Do not imply full-article reading, automatic knowledge connections, browsing surveillance, account privacy or cross-device synchronization. Do not change the brand name inside user-authored notes, source titles or URLs. Do not seed production with illustrative records, results or counts.

## 5. Visual implementation contract

Use the last user-selected minimalist mockup as **style inspiration only**. Its graph, side navigation and illustrative counts are not a feature specification. The existing PR #3 Library rendering is the closer implementation reference. The requirements below are sufficient without access to chat image attachments.

### Palette — existing draft tokens

```css
--paper: #f6f5f0;
--surface: #ffffff;
--ink: #202b26;
--muted: #59645d;
--forest: #174b3d;
--forest-hover: #10382d;
--sage: #e8eee9;
--line: #d6dcd7;
--field-line: #7b877e;
--focus: #80602e;
--error: #943a32;
```

Use paper for the page, white for panels/header, charcoal for primary text, forest for primary actions/links and sage for notices. Keep amber restricted to focus or small functional accents. Error surfaces may use the existing `#fbefec`.

**Prohibited:** purple/lavender/violet, gradients, glows, glass effects, decorative AI sparkles/brains, oversized rounded cards, animated backgrounds, unnecessary shadows, stock dashboard illustrations and invented activity metrics.

### Typography and layout

- Wordmark/headings: `Georgia, "Times New Roman", serif`; controls/body: the current system sans-serif stack. No downloaded fonts, icon packages or external asset requests.
- Retain the approximately 940px centered content column and 20px side gutters. Use the existing 600px responsive breakpoint unless a measured layout issue requires a CSS-only adjustment.
- Wordmark around 1.9rem; main heading around 2.15rem desktop and 1.8rem mobile; secondary heading around 1.25rem. Body at the system default, with comfortable line height.
- Use 1px borders and 4px corners. Primary buttons are forest/white; secondary buttons are white/forest with visible outlines. Avoid decoration that competes with source text.
- Keep the simple header, main content and footer. Do not rebuild the interface around the graph concept’s sidebar.
- Let the header, toolbar, search controls and action rows wrap naturally. Long URLs, notes, labels and error messages must not escape their containers.

### Accessibility acceptance targets

These are test targets, not a certification claim: ordinary text contrast at least 4.5:1; large text and meaningful control/focus boundaries at least 3:1 where applicable. Check actual color combinations, including hover, error and keyboard focus.

Preserve semantic labels, heading order, `aria-live` regions and keyboard operation. Keep a conspicuous focus outline; do not hide warnings through CSS. Primary input/button targets should be at least 44px high. The consent checkbox must remain visibly labeled and usable. Verify no horizontal overflow at 320, 390, 768, 1280 and 1440px and usability at 200% zoom. Record limitations rather than asserting blanket accessibility compliance.

## 6. Four-screen requirements

Apply one visual system to the existing screens and their states. Do not change routing or introduce a fifth in-app source viewer.

| Screen | Existing route | Required presentation and preserved behavior |
|---|---|---|
| **My Library** | `#library` | Clear heading, prominent Save Source action, labeled Search My Library control, actual saved-source cards and existing empty state. Keep View details and Open Original actions. No seeded counts or sample sources in the live library. |
| **Save Source** | `#save` | URL, original why-saved note, project/topic, Save and Cancel. Labels must remain visible; input, focus, validation and storage-error states use the same design system. Preserve entered note text and existing save/cancel behavior. |
| **Source Details** | `#details/<encoded-id>` | Actual stored title/hostname fallback, original URL, project, unchanged note, original-source action and existing unavailable-summary disclosure. Do not invent article metadata or remove the unavailable notice to make the screen appear complete. |
| **Search Results** | `#search/<encoded-query>` | Preserve query input, optional meaning-based panel, consent/reviewer-code controls, status/results and explicitly lexical fallback. Keep real saved-context explanations and external Open Original links. Make loading, disabled, success, no-match and failure messages readable. |

The current hostname-as-title fallback and missing article summaries are existing product limitations, not problems for this presentation PR to solve. Log them separately if encountered. A truthful unavailable state is required but must not be reported as an implemented summary feature.

## 7. Protected technical behavior

Unless separate approval explicitly expands the work, preserve these files byte-for-byte relative to the reconciled functional baseline: `app.js`, `ai-search.js`, `netlify/functions/semantic-search.mjs`, `netlify.toml`, `package.json`, `scripts/build.mjs`, existing test files and environment examples.

Required invariants:

1. Keep `<main id="app" tabindex="-1" aria-live="polite"></main>` and the existing deferred script order: `ai-search.js` then `app.js`. No inline event handlers or scripts; keep the current content-security policy intact.
2. Preserve hash routes, event bindings, form identifiers and dynamic DOM selectors. Do not relocate, rename or remove elements required by the JavaScript.
3. Keep `mccarthy-prototype-sources-v1` and the stored record schema (`id`, `url`, `title`, `whySaved`, `project`, `createdAt`). Do not migrate, clear or replace existing records. Keep the deployment origin unchanged; a different origin has a separate browser library.
4. Preserve `POST /api/search`, its request/response contract, configured model, ranking/threshold logic, server-side secret boundary and failure controls. Styling must not add API calls, change costs or alter search inputs.
5. Preserve explicit AI consent and the separate reviewer-code gate. Never ask for, print, commit, screenshot or place an OpenAI key in browser code. Do not copy local `.env` files into artifacts.
6. Keep original URLs and user notes unchanged. Retain HTML escaping and the external-link protections. Do not convert a template explanation into a fabricated model inference.
7. Keep the build allowlist: `index.html`, `styles.css`, `app.js`, `ai-search.js` in `dist`; server code and secrets remain outside the static output. Do not change Node/hosting settings or add packages to accomplish the rebrand.

If a baseline bug prevents a test, record whether it predates the rebrand. Do not silently expand scope, disable a safeguard, or mark a blocked test passed.

## 8. Execution sequence

**A. Establish baseline.** Inspect the working tree, current main, PR #3 and any human local differences. Record the functional baseline commit and environment without secrets. Reuse `branding/hivemind-preview` where safe; do not overwrite local work to switch branches.

**B. Audit the existing draft.** Compare each requirement to the already implemented HTML/CSS. Make only missing or corrective presentation changes. If all requirements are met, spend the remaining work on verification and evidence rather than unnecessary redesign.

**C. Run checks and regressions.** Use existing commands below. Run rendering tests in the local environment and real integration checks only through the user’s already authorized setup. Do not provision services, change credentials, raise spending limits or incur unapproved API usage.

**D. Update the same review.** Commit scoped changes/evidence to the work branch and update PR #3 where permitted. Include baseline/candidate revisions, file list, screenshots, tests and unresolved release items. Do not create duplicate competing branding PRs.

**E. Stop at review.** Leave main and the live deployment unchanged. Ask the human reviewer to approve release once candidate regression, naming review and public adoption decisions are complete.

## 9. Validation and objective evidence

Run from the repository root using the existing Node 22-compatible environment:

```sh
npm run check
npm test
npm run build
```

Run `python tests/client_dom_check.py` when its Playwright/Chromium prerequisites are already available. Otherwise record it as blocked; do not install new dependencies without permission. A plain static server does not execute the Netlify function. Use the existing configured local/hosted function environment for an actual integration check, not a fake successful API response.

Earlier reports recorded 23 mocked server tests and isolated rendering/component checks. Those are historical results, not a pass for changes made by Copilot. Record fresh command outputs and distinguish mock transport from a real OpenAI call.

### Acceptance matrix

| ID | Test | Pass condition |
|---|---|---|
| B01 | Identity and scope | Exact candidate name/copy; McCarthy attribution and Brand preview label; no new screens or graph/PARA controls. |
| B02 | Visual consistency | All four screens use the palette/type/layout contract; no purple, gradients, glow or decorative AI styling. |
| B03 | Mobile and keyboard | No horizontal overflow at required widths; labels/focus/actions usable; zoom and measured contrast results recorded. |
| F01 | Existing data | A pre-existing record remains readable after the update on the same origin; note, URL and project are unchanged. |
| F02 | Save and cancel | Valid save opens the correct record; Cancel returns without adding a record; existing validation/storage errors remain visible. |
| F03 | Reload persistence | A saved record survives reload in the same browser/origin; no false claim of cloud persistence. |
| F04 | Lexical search | Existing word-match results and explanations remain accurate; unrelated search shows the existing honest no-match state. |
| F05 | Meaning-based search | In the authorized real-API environment, paraphrase retrieval still works and preserves consent, access checks and saved-context evidence. |
| F06 | AI failure | Disabled/missing AI setup, denied access, provider failure/rate limit and timeout do not erase records or masquerade as successful AI results. Mocked failure tests are labeled. |
| F07 | Original source | Correct external URL opens separately from Details and Results; no fifth application screen. Report destination reachability separately from link correctness. |
| F08 | Provenance | Original notes remain unchanged; available explanation reflects actual saved context; unavailable article summary remains disclosed. |
| T01 | Technical preservation | Protected functional/config files unchanged against the agreed baseline; existing syntax/tests/build pass; no secrets in static output. |

### Reviewer scenario

Use a real permitted research source chosen by the human tester, not the illustrative `example.org` link from earlier mockups. Save the note **“I saved this because it compares ways to code interviews”** in **“Research Methods.”** Confirm the exact note in Details and after reload. Include unrelated saved records. Search **“the piece about interview coding approaches,”** use the existing consented semantic search, inspect the actual explanation and reopen the original URL. Repeat after applying branding and compare with the same configured baseline.

Record failures honestly. The earlier user confirmation is sufficient evidence that their baseline worked, but it does not predetermine the candidate’s result. Do not tune models, thresholds or backend behavior as part of a visual update to make this test pass.

For every test record: ID, candidate commit, environment/origin, time, expected result, actual result, pass/fail/blocked, real or mocked transport, and evidence location. Redact secrets and private research. Capture each screen at desktop and mobile sizes, plus representative empty, loading, no-match and unavailable/error states. Test-only fixtures must never be shipped as real user data.

## 10. Deliverables, definition of done and release gate

Deliver a minimal reviewable diff, updated rebrand notes, fresh test output, desktop/mobile screenshots and a short PR summary. Separate **implementation complete**, **regression tested**, **live integration confirmed** and **release approved**; these are different statuses.

The candidate is ready for review when the allowed changes satisfy the identity/design contract, protected functionality/data are preserved, automated checks pass, and any incomplete manual/live tests are explicitly listed. It is ready for release only after the human confirms the candidate flow, naming/public-adoption approval and explicit merge/deploy authorization.

Retain the last known working commit and deployment identifier. If a released branding change needs rollback, use an authorized revert/restoration of the presentation change or prior deployment—not a force-push, storage wipe or credential change.

Final Copilot response must state: branch/commit and PR; changed files and rationale; checks actually run; live versus mocked outcomes; preserved functionality; unresolved items; and whether anything was merged or deployed. Do not claim completion based on generated code or screenshots alone. Do not claim Google Drive/Agent Home was updated by repository commits; return a concise human-relay note when no authorized Drive write occurs.

## 11. Proposal alignment — later assessment, not this build

The original HiveMind proposal joins a searchable Library with an optional Knowledge Graph, using Second Brain-inspired **Projects, Areas, Resources and Archives** organization. Its intent is to help researchers discover connections across saved sources, notes, topics and projects with explanations and accept/edit/dismiss control. It starts with deliberately saved information, not broad internet-traffic surveillance.

For this handoff, that vision informs the restrained identity only. PARA and graph architecture may be documented for later review, but **do not implement, scaffold, expose navigation for, or market them as working**. Any browsing-activity collection requires separate explicit opt-in and approval. Protect November 23 delivery. Naming availability/positioning review and official adoption remain separate from coding the preview.

## 12. Source and decision traceability

- User-provided proposal: **HiveMind — Research Memory & Connected Discovery**, November 18, 2026, reproduced in the Engineering chat; limited exploration and assessment, no implied rename/data-collection/delivery expansion.
- User visual selections: November 18 — minimal scholarly interface, remove purple, remove decorative “AI polish.”
- **ENG-005**, November 19 — prioritize the four-screen prototype; Knowledge Graph assessment allowed but implementation requires additional authorization.
- User confirmation and rebrand request, November 19 at 18:56:10 EST — existing four-screen functionality with the user’s OpenAI API confirmed; begin rebranding.
- [PR #3](https://github.com/Jamesmg10/mccarthy/pull/3), reopened for this specification: draft branding candidate and preservation boundaries.
- [Exact rebrand specification reviewed](https://github.com/Jamesmg10/mccarthy/blob/d9b65e2fe46953d11f483cff8796bab20bb68285/docs/HIVEMIND-REBRAND.md).
- [Exact preview HTML](https://github.com/Jamesmg10/mccarthy/blob/d9b65e2fe46953d11f483cff8796bab20bb68285/index.html) and [CSS](https://github.com/Jamesmg10/mccarthy/blob/d9b65e2fe46953d11f483cff8796bab20bb68285/styles.css), reviewed through the PR patch.
- [Four-screen UX handoff](https://docs.google.com/document/d/1a7AiBmLUcn6pFlgFXGu4BFsimQxOj9Bf6-iCObUIQR8/edit), November 17; screen contract also reproduced in the Engineering chat.

This specification does not silently resolve broader Part 4a scope decisions, certify a public deployment, or replace the authoritative Agent Home’s approval records.
