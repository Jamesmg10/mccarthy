# HiveMind candidate validation

## Revisions and environment

- Functional baseline / unchanged `origin/main`: `c251f2a764ec75c5109f431003d4d8cd8462631f`.
- Reconciled local and remote draft: `427e31b7e47079363c502d80e19de70d392b3978`.
- Tested presentation candidate: `219cb34356cc314ea22327f0bf50807731553658`.
  The subsequent evidence commit changes documentation/screenshots only.
- Branch: `branding/hivemind-preview`; existing draft [PR #3](https://github.com/Jamesmg10/mccarthy/pull/3).
- Local origin: `http://localhost:8888`, existing Netlify development backend;
  no hosted deployment tested or changed.
- macOS; Node `v22.20.0`; Python `3.9.6`; integrated browser reports `1.147.0`.
  No new test/runtime packages were installed.
- Test run: November 19, 2026 EST, from the 19:40 request through 20:03:36
  (`2026-11-20T01:03:36.677Z`) for the browser checks. Each matrix row below
  records observations within this run, on the candidate and origin above unless
  explicitly labeled as the draft/baseline. Final command/screenshot-metadata
  validation continued November 20, 2026 EST; its exact capture time is in
  `checks.txt`. No additional paid request was made.

The worktree initially had no tracked changes and one untracked `package-lock.json`.
No local commits were ahead of the fetched remote. The lockfile was not staged or
modified; its Git blob hash remained `28677ad511920ae2330f5bde5d927ec546ed4b00`.
No reset, stash, clean, credential change or force-push was used.

## Test data and privacy

The automation-owned browser began with an empty library. A reviewer fixture was
saved through the real form **before** the wrapping correction, then compared
byte-for-byte in the same origin after the correction and reloads. This checks
existing-record persistence across the candidate, not access to the human's
separate browser library or cloud persistence.

- Human-selected permitted URL:
  <https://www.techinterviewhandbook.org/coding-interview-prep/>.
- Exact scenario note: "I saved this because it compares ways to code interviews".
- Project: "Research Methods".
- Two unrelated, explicitly synthetic notes: growing tomatoes/composting and
  booking holiday train tickets, with Garden and Travel labels.
- Additional temporary long-content and pointer-test fixtures exercised layout
  and ordinary pointer saving. No fixture was added to application source or the build.

The scenario note is test input, not a verified description of the linked page.
The selected page concerns coding-interview preparation; no article was fetched or
read by semantic search. Retrieval here establishes similarity to saved context,
not qualitative-methods relevance of the page or summary correctness.

Only test fixtures were removed afterward, with ID/note guards; the automation
library's original absent storage value was restored exactly. Four remaining test
records were removed at `2026-11-20T01:03:36.677Z`; the long fixture had already been
removed after stress testing. No user-authored record was read, migrated or cleared.
No key, code, authorization header, private environment file or private research
is included in this evidence. Reviewer-code fields were emptied before captures.

## Acceptance matrix

Expected outcomes are those in the implementation specification. Times/revision/
origin use the shared run metadata above; the real call has exact timestamps in
[`live-api.json`](live-api.json). "Real storage" means browser-local, not cloud.

| ID | Expected | Actual result | Status / transport | Evidence |
|---|---|---|---|---|
| B01 | Exact identity/copy, McCarthy attribution, preview status; only existing screens | Existing HTML already satisfies the contract, including metadata, linked wordmark and unchanged disclosure. No graph/PARA/new navigation. | PASS; static inspection and actual browser | Four-screen screenshots below |
| B02 | Scholarly palette, typography and flat consistent layout | Existing colors, serif headings, system controls, 4px corners and 940px column retained. No added assets, external fonts, purple, gradients, glow or decoration. Normal four-route browser sweep made no external asset requests. | PASS; real rendering | Four-screen screenshots |
| B03 | Required viewport reflow, labels, focus, targets, contrast and 200% zoom | Corrected all 20 screen/width combinations and three 320px long-content routes; no horizontal overflow. Keyboard navigation/submission, 3px focus and control sizes passed. Measured contrast and 200% CSS layout zoom passed; native browser UI zoom not controllable here. | PARTIAL; actual rendering, native zoom BLOCKED | Viewport/contrast tables; focus/zoom images |
| F01 | A record existing before the update is unchanged afterward | Fixture saved on draft `427e31b` retained the same serialized record on candidate `219cb34` and same origin. Human's separate pre-existing library not inspected. | PASS for pre-correction fixture; real storage | Details images; persistence comparison |
| F02 | Save opens correct Details; Cancel adds nothing; visible validation/storage errors | Valid saves opened generated IDs; both ordinary pointer and keyboard Save/Cancel passed. Required URL validation and rejected `ftp:` URL observed. Simulated quota failure displayed the existing error without a record. | PASS; real UI/storage except explicitly mocked quota failure | Save/validation/storage-error images |
| F03 | Same-origin reload persistence | Three saved fixtures survived reload; original note, URL and project stayed byte-for-byte unchanged. No cloud claim. | PASS; real storage | Details screenshots and repeated record comparison |
| F04 | Accurate lexical matches/explanation and honest no-match state | Keyboard library search reached encoded search route and returned only the relevant fixture; explanation cited note `interview` and URL `interview, coding`. `zzqvnonmatchingword` returned "No matches found" and "This is not semantic search." | PASS; actual lexical search, no provider | Search and no-match images |
| F05 | Consented, gated real paraphrase search preserves saved-context evidence | Authorized backend call returned HTTP 200, relevant note first/only at 0.6552; two unrelated notes excluded. 57 input tokens, existing `text-embedding-3-small`, threshold 0.35 unchanged. Live browser submission stopped before sending: supplied code/consent were not in the automation session; user approved backend-only alternative. Actual response then replayed for UI evidence. | PASS backend; live browser-to-provider submission BLOCKED; replay explicitly mocked | `live-api.json`; `search-live-response-replay-*.png` |
| F06 | Safeguards and failures are honest and preserve records | Actual local endpoint rejected missing code (401) and missing consent (400) before provider use. Browser no-consent and `sk-` guards sent zero requests. Mocked 401/503/429/502 messages remained visible, enabled retry and preserved storage. Mock fetch honored the real 20s client abort timer; observed completion about 21.1s including capture, with records unchanged. Existing unit tests cover disabled/missing config and provider timeout/failure without paid traffic. | PASS for observed gates; provider failures deliberately MOCKED | `checks.txt`; denied/loading/provider-error/timeout images |
| F07 | Correct external URL opens separately from Details and Results | Both links have the exact selected URL, `target="_blank"`, `rel="noopener noreferrer"`; app route stayed unchanged. Destination returned HTTP 200 via curl. Keyboard activation timed out waiting for an observable popup; built-in click also exposed no new target. Actual external-tab opening cannot be confirmed in this browser host. | Link correctness/reachability PASS; new-tab observation BLOCKED | Link values recorded below; Details/Results screenshots |
| F08 | Notes preserved, grounded explanation, truthful unavailable summary | Exact original note/project retained. Replayed real result renders actual note/project and "No article text was read." Details retains "AI summary unavailable" and unavailable article-text disclosure. | PASS; real storage + explicitly replayed response rendering | Details and response-replay images |
| T01 | Protected files unchanged; checks/build pass; static output excludes secrets/server | All protected tracked functional/config/test/environment-example files match functional baseline byte-for-byte. Syntax, 23 tests and build pass. Four static allowlisted files only; served files match build. No known local credential in build/evidence files. Existing Python component check fails to import missing Playwright. | PASS preservation/Node checks; Python component check BLOCKED | `checks.txt`; final preservation/privacy assertions |

### Draft defect and narrow correction

Before correction, the selected hostname in Details produced a scroll width of
383px at a 320px viewport. Long unbroken project labels also overflowed cards.
The only new runtime declaration is `overflow-wrap: anywhere` on `.card`, inherited
by its headings and saved project labels. No functional JavaScript was changed.

Final overflow matrix (`documentElement.scrollWidth <= clientWidth`):

| Screen | 320px | 390px | 768px | 1280px | 1440px |
|---|---|---|---|---|---|
| My Library | PASS | PASS | PASS | PASS | PASS |
| Save Source | PASS | PASS | PASS | PASS | PASS |
| Source Details | PASS | PASS | PASS | PASS | PASS |
| Search Results | PASS | PASS | PASS | PASS | PASS |

Long-content stress at 320px also passed Library, Details and Search Results:
63-character hostname label, long URL path, 187-character unbroken project label,
and an unbroken note segment. Save controls retained their labels and constraints.
All four screens passed no-overflow checks at 200% **CSS layout zoom** at 1280px;
keyboard tabbing and note entry also worked at that scale. This is not a native
browser zoom or assistive-technology certification.

Measured contrast ratios (sRGB relative luminance):

| Pair | Ratio | Required |
|---|---:|---:|
| Charcoal / paper, white, sage | 13.41, 14.63, 12.43 | 4.5 |
| Muted / paper, white, sage | 5.65, 6.17, 5.24 | 4.5 |
| Forest / paper, white, sage | 9.12, 9.95, 8.45 | 4.5 |
| White / hover forest | 12.92 | 4.5 |
| Field boundary / white, paper | 3.74, 3.43 | 3 |
| Amber focus / white, paper, sage | 5.78, 5.30, 4.91 | 3 |
| Error border / white | 7.22 | 3 |

Save inputs measured 52.39px high; textarea 120px; Save/Cancel 47.58px, all above
44px. Keyboard Tab moved from URL to note; the note had a 3px amber outline with
3px offset. Consent remained an 18px native checkbox within its full visible
label, not misreported as a 44px checkbox. Disabled-button contrast is exempt;
disabled state was explicitly observed during mocked loading.

Original-link attributes in both Details and Results:
`https://www.techinterviewhandbook.org/coding-interview-prep/`,
`target="_blank"`, `rel="noopener noreferrer"`.
Destination reachability (curl HTTP 200) is separate from the blocked popup check.

## Screenshots

These are full-page captures of test fixtures, not a populated production library.
Requested desktop/mobile viewports were 1280x1000 and 390x1000, but the browser host
sometimes resets the viewport during capture and omits scrollbar pixels. Normal
desktop captures are actually 1044px wide; mobile captures are 375px or 390px wide.
The 320px Details capture is 305px wide. Other desktop/state captures range from
1044px to 1280px. Exact persisted PNG dimensions are recorded in
[`image-dimensions.txt`](image-dimensions.txt), not inferred from requested sizes.
These images show desktop/mobile presentation; they are not claimed to be exact
1280px screenshots. The five-width overflow matrix was measured separately before
capture and records actual DOM viewport widths.

| Screen | Desktop | Mobile |
|---|---|---|
| My Library | [Desktop](library-desktop.png) | [Mobile](library-mobile.png) |
| Save Source | [Desktop](save-desktop.png) | [Mobile](save-mobile.png) |
| Source Details | [Desktop](details-desktop.png) | [Mobile](details-mobile.png) |
| Search Results, lexical | [Desktop](search-desktop.png) | [Mobile](search-mobile.png) |
| Semantic success: captured real response, **browser replay** | [Desktop replay](search-live-response-replay-desktop.png) | [Mobile replay](search-live-response-replay-mobile.png) |

Representative states:
[real empty library after cleanup](library-empty-mobile.png),
[320px Details with unavailable summary](details-320.png),
[missing record](details-missing-mobile.png),
[URL validation](save-validation-desktop.png),
[mock storage failure](save-storage-error-desktop.png),
[lexical no match](search-no-match-mobile.png),
[mock denied code](search-denied-mock-desktop.png),
[mock loading](search-loading-mock-mobile.png),
[mock provider error](search-provider-error-mock-mobile.png),
[mock client timeout](search-timeout-mock-desktop.png),
[keyboard focus](save-keyboard-focus-mobile.png),
[200% CSS layout zoom](save-200-percent-layout-zoom.png).

## Failures, limitations and release gate

1. `python3 tests/client_dom_check.py`: `ModuleNotFoundError: No module named
   'playwright'`. Not a pass; no dependencies installed. Existing 23 Node tests
   use injected fake provider responses, not live API traffic.
2. Creating a second browser context was rejected by the browser host's storage
   affinity rule. Tests used the owning automation browser, which was empty;
   the original storage state was restored afterward.
3. One pointer click after a full-page screenshot timed out with intercepted
   pointer events. Keyboard completed the scenario. A fresh-page ordinary-pointer
   Save and Cancel rerun subsequently passed; no product-code workaround was added.
4. Browser real-submission check stopped at the unchecked-consent/empty-code guard,
   with zero calls. The user authorized one backend-only real request instead.
   The success screenshots replay its exact JSON; they do not prove an uninterrupted
   browser-to-provider flow.
5. Native browser zoom and actual new-tab observation remain manual checks.
   Link correctness, destination HTTP reachability and 200% CSS reflow are narrower
   observed passes, not substitutes for those outstanding checks.
6. No hosted rate-limit enforcement, billing-dollar verification, comprehensive
   accessibility certification, cross-device persistence, article ingestion or
   summary capability was claimed or tested.
7. Baseline functionality is user-confirmed; independent human candidate acceptance,
   naming/public-adoption review and explicit release approval remain outstanding.
   No separate paid baseline replay was attempted.
8. The first final evidence audit incorrectly required PNG widths to equal requested
   viewports and failed (`305 !== 320`). Its actual output is preserved in
   [`checks-initial-failure.txt`](checks-initial-failure.txt). Inspecting PNG headers
   confirmed the scrollbar/capture-size discrepancy and host resets described above.
   The final audit validates PNG format, desktop/mobile classification and records
   exact dimensions; it does not substitute those images for measured viewport tests.

Implementation: complete, one CSS correction. Regression: observed passes and
limits above. Live integration: backend confirmed once, browser live flow blocked.
Release: **not approved**. No merge/deploy/domain or repository rename/public launch.
No Google Drive/Agent Home write; relay this review/evidence link to its human owner.
The known working deployment identifier was not supplied and was not changed.
Rollback guidance is in [the rebrand notes](../HIVEMIND-REBRAND.md).
