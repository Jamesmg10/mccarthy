# McCarthy — lightweight hosting and OpenAI retrieval plan

Date: November 17, 2026 (Eastern Time)
Status: PROPOSED HOSTING PLAN / RETRIEVAL CODE READY FOR REVIEW / NOT DEPLOYED
Scope: user's authorization to merge PR #1 and begin OpenAI retrieval work. This does
not claim blanket board approval, a named deployment owner, or approval to spend.

## Recommendation

Use **one Netlify project for the existing static interface and its server-side
search function**, with OpenAI embeddings called only from that function. Use the
provided `netlify.app` address rather than buying a domain. No frontend framework
migration, always-on server, separate API host or vector database is required for
this bounded first retrieval pilot. Netlify documents Git-based deployments,
functions deployed with the site, and a default public subdomain [1–3].

This is the lowest-change path for the inspected HTML/CSS/JavaScript codebase,
not a claim that Netlify is already connected or universally cheapest.

| Choice | Fit to this codebase | Recommendation |
|---|---|---|
| Netlify + Functions | Same repository for static files and the small server endpoint | First choice; configuration is included in this branch |
| Vercel + Functions | Also supports a frontend and server functions; requires adapting this handler/deployment layout | Backup if the team already has a working Vercel account [4] |
| GitHub Pages alone | Hosts static HTML/CSS/JS, not this server-side credential boundary | Suitable only for the non-AI demo; requires another API service for AI [5] |

## Stage 1 — public interface, AI still disabled

An authorized human should confirm the Netlify account/project owner, applicable
plan and quotas, and approval to publish. Import `Jamesmg10/mccarthy` from GitHub.
For a pilot, select the retrieval branch explicitly; do not assume it has merged to
`main`. Alternatively review and separately approve merging the retrieval PR first.

Configuration included here:

| Setting | Value |
|---|---|
| Runtime/build Node version | 22 |
| Build command | `npm run check && npm test && npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Search endpoint | `POST /api/search` |
| AI switch for first deployment | `AI_ENABLED=false` |

Only four allowlisted browser assets go into `dist`; server code, tests, docs and
`.env` files are excluded. Confirm the generated HTTPS URL loads, saving/reloading
works, and AI search returns a clear unavailable state. Record the actual URL; no
public URL has been created in this work.

**Deployment control:** linking a production branch enables automatic updates on
future pushes. Use a dedicated pilot project/branch, or pause automatic production
publishing when per-release approval is required. Do not give untrusted PR previews
production secrets [1].

## Stage 2 — enable real, reviewer-gated semantic search

The authorized OpenAI account owner creates/selects a project, verifies model access
and billing, and approves a small test budget. A proposed initial ceiling is $5,
not authorization to spend it. Current OpenAI documentation distinguishes spend
alerts from an optional enforced limit; alerts alone do not stop traffic, and even
enforcement can lag slightly [6]. Confirm the actual project settings.

Set these variables through Netlify's server-side environment settings, with
Functions scope where supported. Do not store real values in GitHub, `netlify.toml`,
frontend JavaScript, or ChatGPT. Netlify documents that variables set only in
`netlify.toml` are not available to functions; variable changes require redeployment [7].

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Project-scoped server secret permitted to create embeddings |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` by default |
| `DEMO_ACCESS_TOKEN` | Separate random reviewer code, at least 32 characters; not an API key |
| `ALLOWED_ORIGIN` | Exact chosen HTTPS site origin, no trailing slash |
| `AI_ENABLED` | Set `true` only after configuration, cost and test approval |
| `SEMANTIC_MIN_SCORE` | Starts at `0.35`; must be calibrated using real retrieval judgments |

The OpenAI secret must never be entered in the site's reviewer-code field. The
browser sends the separate demo code to our server; our server sends the API key
to OpenAI. OpenAI explicitly advises keeping API keys out of browsers and source
control [8]. Distribute the reviewer code privately, not in the public README.

Flow: consented query + saved notes/projects → authenticated same-origin server
request → OpenAI embedding batch → cosine ranking → real saved-record IDs and
quoted context → original source opens from the local record. Embeddings measure
text relatedness; this use is semantic retrieval, not keyword matching [9].

The application keeps original notes unchanged. It does not claim to read an article
or produce a source-grounded article summary from a user's note.

## Cost, abuse and privacy controls

The endpoint defaults off, requires a separate reviewer credential and exact Origin,
limits bodies/records/text lengths, makes one batch request without automatic retries,
and times out after 15 seconds. A Netlify domain-wide 10-request/minute rule is
included in function config; verify actual hosting-plan support and enforcement
before exposing paid traffic [10]. Origin checking is not identity authentication.

The code logs model, record count, prompt-token count and elapsed time, not notes,
queries or keys. Provider dashboards remain the billing source of truth. Each search
re-embeds the small library; no cache, database or hard dollar ledger is implemented.
Confirm platform quotas and any auto-recharge/overage settings; do not assume the
hosted service is free. Only non-sensitive, permitted research notes should be used.

## Stage 3 — evidence and remaining engineering work

Run the hosted acceptance tests in `PROTOTYPE.md`. Record the live URL, commit, model,
actual paraphrase retrieval outcomes, false positives, failure behavior, token usage
and observed cost. The local mocked tests do not establish any of those live results.

Before the full MVP, add authenticated user-scoped persistent storage, a versioned
embedding index, deletion behavior and access-control tests. Supabase remains a
previously selected direction in the Part 3 document, but no configured instance
has been verified here. Do not add a second database solely to obtain the first URL.

AI-assisted source understanding remains separate work: approved excerpts/content
must support a labeled summary. Source-grounded Q&A, signup/email flows and help
documentation also remain open. A working retrieval pilot is not the full MVP.

## Proposed checkpoints, not claims of completion

- Nov 18: hosting owner, project settings, reviewer access method, UX Task 2 alignment.
- Nov 19: public pilot URL, disabled-AI browser smoke tests, controlled API enablement.
- Nov 20–21: real-model paraphrase/no-match validation and cost evidence.
- Nov 22: independent reviewer test and fixes; hand evidence to Growth/PM.
- Nov 23, 5:00 PM ET: team submission deadline, including URL, video and note.

## Official references inspected during preparation

[1] https://docs.netlify.com/start/quickstarts/deploy-from-repository/
[2] https://docs.netlify.com/build/functions/overview/
[3] https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/
[4] https://vercel.com/docs/functions
[5] https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
[6] https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform
[7] https://docs.netlify.com/build/functions/environment-variables/
[8] https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
[9] https://developers.openai.com/api/docs/guides/embeddings
[10] https://docs.netlify.com/build/functions/api/
