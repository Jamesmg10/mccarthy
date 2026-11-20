# HiveMind workspace and graph foundation

Status: implementation candidate for review, not merged/deployed or live-API certified.
Prepared: November 20, 2026. Base: main `5706e5594ed0c14c3f9ee9e39641f3ab3d2b2572`.

## Authority and scope

The user explicitly requested proceeding with the validation recommendations and beginning the proposed UI with a Knowledge Graph on November 20. This task expands the prior branding-only scope to a bounded workspace and graph foundation. It does not rewrite BR-004 or claim blanket board approval, authorize browsing surveillance, rename the repository/domain, or authorize public launch. Protect November 23 prototype delivery; keep this on a separate review branch.

The existing four-screen prototype is user-verified with a real OpenAI API. The new candidate still needs a real browser-to-host-to-provider regression in that authorized environment. Earlier evidence and approvals are not overwritten.

## Implemented increment

- Minimal scholarly application shell: local wordmark, persistent navigation, global search, responsive Library and source details. Existing palette retained; no purple, gradients, external fonts or graph dependencies.
- Original four core routes retained. Adds optional `#graph`; `#edit/<id>` reuses the capture form for explicit repairs, not an automatic migration.
- Fixes stale-query submission and ignored late-response races. Header/results query fields stay synchronized. Exactly one primary results region; explicit Word match versus By meaning modes.
- Capture validation aligns with existing API caps. User-entered display titles use the existing `title` field. Notes remain byte-preserved. Explicit source selection handles the API's 20-record/context limit without silently omitting records. Legacy incompatible records can be edited or explicitly deselected.
- Saved-source/project graph using real stored project labels, filtered/paginated nodes, keyboard selection, an evidence inspector, original-source links, zoom/reset and an equivalent Connections list. Mobile initially uses the list; Graph View remains selectable.
- Browser storage errors/corruption and concurrent-tab changes fail without replacing/clearing stored data. Edit operations preserve IDs, timestamps and unknown existing fields.

## Graph truth contract

A source is a source node. Each exact nonempty saved project label is a project node. An edge exists only when that source's stored `project` field equals the project label. Its evidence is `{recordId, field:'project', value:<actual saved value>}`.

There are no invented topic nodes, inferred support/contradiction edges, generated insight counts, cross-user relations, background scraping or new AI calls. Case-different project labels remain distinct. Unassigned sources stay unconnected. This is a project-membership graph, not the finished semantic knowledge network.

The view uses at most 24 sources per page and explicitly reports page/source counts. Pagination and filters expose the remaining records; records are never truncated in storage. Full source names are available in the Connections list and inspector. This initial SVG layout offers zoom/reset, not a fully featured pan/drag graph editor.

## Protected behavior and intentional changes

Unchanged: server OpenAI function, request/response contract, model, threshold, consent requirement, reviewer authorization, Netlify config, environment names, historical records and storage key `mccarthy-prototype-sources-v1`. No automatic provider call is made by opening the graph or typing a query.

Changed intentionally: frontend HTML/CSS/JavaScript and tests. Adds `core.js` and `knowledge-graph.js` to the static build allowlist (six public assets total), and expands syntax checks. No npm dependencies added. The existing Python component-test entry point delegates to the expanded workspace harness.

The server still supports 1–20 sources per request, 2,000 characters per note, 200 per project, 500 per query, 16,000 combined context characters, and its existing 64 KiB HTTP-body guard. Source picker selection is explicit. Libraries remain browser-local. Summaries remain unavailable until real permitted source content is supplied and supported by a separate implementation.

## Verification

Run existing commands:

```sh
npm run check
npm test
npm run build
python tests/client_dom_check.py
```

The Python harness requires already installed Playwright and Chromium (or CHROMIUM_PATH). It uses synthetic fixtures, mocked storage and mocked provider transport; it never reads a real library or uses an API key. See `HIVEMIND-WORKSPACE-RESULTS.md` for observations and boundaries.

## Release and remaining proposal work

Before merge/release, compare against unpushed local changes; run real same-origin persistence, edit/cancel, both search modes, consent/reviewer gates, graph/filter/list navigation, new-tab opening, mobile/keyboard checks and a real browser-to-Netlify-to-OpenAI request under existing authorization. Use a permitted source genuinely matching the qualitative-research scenario, not a programming interview page with a synthetic qualitative note. Record URL, candidate commit and actual results. Do not expose keys in screenshots/logs.

Source-grounded understanding, Supabase/user-isolated cloud storage, structured PARA containers, accepted/dismissed semantic relationships, and proactive suggestions remain separate work. Recommended next sequence: release-safe search regression and hosted reviewer evidence; permitted-excerpt understanding; structured organization and persisted source embeddings; related-source suggestions with evidence and human controls; expand graph relation types only after those data contracts work. Browsing-history capture requires separate explicit opt-in design.

Do not merge, deploy, change paid limits or publish an official rebrand from this handoff. Revert only this candidate's changes if necessary; never reset a human working tree or clear a library.

Design reference: user-selected minimalist HiveMind mockup in the Engineering conversation. Its full PARA menu and topic clusters remain concept scope, not evidence of implemented capabilities. Accessibility targets follow W3C reflow and keyboard guidance; no comprehensive conformance claim is made.
