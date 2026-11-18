# McCarthy — research recall prototype

**Current feature branch: OpenAI retrieval groundwork, not a verified live AI service.**

PR #1 merged the four-screen browser-local starter into `main` at
`1d8798ce61b3066105d832ba59a4963e263a9108`. This branch adds an optional server-side
OpenAI embedding search and a proposed Netlify deployment configuration. No hosting
account, API key, paid call, database, or deployment was configured during this work.

## Run checks

Use Node.js 22 or newer. There are no npm dependencies to install.

```sh
npm run check
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

The static server only demonstrates the local library. It does NOT run `/api/search`.
The AI panel will report that the endpoint is unavailable. Host the function on
Netlify after completing the setup and approval gates in [the hosting plan](docs/OPENAI-HOSTING-PLAN.md).

## What is in this branch

- Four screens: My Library, Save Source, Source Details and Search Results.
- Local saved records, original notes and original-source links.
- An opt-in AI panel that sends only a query, notes and project labels to a server.
- `POST /api/search`: OpenAI embeddings and cosine-similarity ranking; no invented article summaries.
- A separate reviewer access code; the OpenAI key stays server-side.
- Offline tests, request limits, timeout handling, a disabled-by-default AI switch,
  provider usage counts, and a Netlify rate-limit declaration requiring hosted verification.

The similarity cutoff is provisional. Offline fixtures do not prove live retrieval quality.
Saved records remain browser-local; the reviewer code is not account authentication.
This is not the complete Part 4a submission or Part 4b MVP.

## Documentation

- [Prototype behavior and remaining tests](PROTOTYPE.md)
- [Hosting and OpenAI setup plan](docs/OPENAI-HOSTING-PLAN.md)
- [Observed test evidence and limitations](docs/TEST-EVIDENCE.md)
- [Original October 24 proposal, preserved unchanged](docs/README-2026-10-24.md)

Google Drive remains the authoritative Agent Home. Repository work does not silently
update its LOG, shared decision statuses, or department records. Human deployment
ownership and wider scope decisions remain separate from this authorized code work.
