# Engineering test evidence — November 17, 2026 ET

## PR #1 closeout

Repository: `Jamesmg10/mccarthy`, PR #1.
Reviewed head: `3f4bb0d14efa8126b54d828bb5499ef27e2fa1f9`.
User explicitly authorized merging. GitHub returned `merged: true`; readback showed
`state: closed`, `merged: true`, and merge commit
`1d8798ce61b3066105d832ba59a4963e263a9108`.

The local copies of app.js, index.html and styles.css were checked against their
GitHub blob SHAs and matched exactly. `node --check app.js` passed. GitHub's combined
status response listed no status checks; this is not a CI pass. Browser navigation
to the local HTTP server and local file was blocked by this execution environment.
No end-to-end browser success, independent human test or live deployment is claimed.

## Retrieval branch checks

Runtime: Node.js v22.16.0. No npm dependencies, OpenAI credentials or paid requests.

| Command/check | Observed result | Evidence limit |
|---|---|---|
| `npm run check` | PASS, all three JavaScript syntax checks | Syntax, not runtime acceptance |
| `npm test` | 23 passed; 0 failed; 0 skipped | OpenAI transport is mocked |
| `npm run build` | PASS, dist contains four allowlisted browser assets | Netlify's build/runtime not exercised |
| `python tests/client_dom_check.py` | 3 component scenarios passed | Isolated browser DOM with mocked network; no navigation/storage integration |

Server tests cover cosine ranking, provider index mapping, payload allowlists,
verbatim note preservation, disabled/missing config, reviewer-code and origin checks,
method/type/body limits, consent, malformed input, invalid models/cutoffs, rate-limit
and provider failures, timeout behavior, response integrity, no-match fixtures,
sanitized logs and the existence of the Netlify rate-limit declaration.

Client component checks cover consented payload construction without URLs, grounded
result rendering, API-key-shaped input rejection, failure messaging and retry controls.
They use `page.set_content` and a fake fetch, not a deployed app or real API.

## Explicitly unverified

Real OpenAI credentials/model access; provider billing; actual embedding relevance;
threshold calibration; Netlify account/plan configuration; function route deployment;
host rate-limit enforcement; browser persistence/navigation on the hosted origin;
external URL reachability; independent human usability; server database/auth;
source understanding and chatbot behavior. No $0-running-cost claim is made.

## Governance

Work was performed in this chat under the user's repository authorization. The new
retrieval changes are for a separate review branch/PR, not automatically merged.
No deployment, credential provisioning, spending, human reassignment, Google Drive
file edit or authoritative Agent Home LOG append was performed. This evidence is
for human relay to Executive Office; it is not an independent QA signoff.
