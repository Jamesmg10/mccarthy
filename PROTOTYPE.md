# Part 4a — Four-screen prototype (Engineering draft)

Status: **Implemented as untested browser-local prototype**, not a validated AI product or approved BR-002 scope.

## Running locally

Serve this directory with any static local HTTP server, for example:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. No dependencies or credentials are needed. Do not deploy or treat this as production-ready without separate approval and testing.

## Implemented UI

- My Library: list locally saved sources, start a save or search.
- Save Source: HTTP(S) URL, unchanged why-saved note, project; validates URL and stores in this browser's localStorage.
- Source Details: original URL, original user note, project, and explicit AI-unavailable state.
- Search Results: **lexical word-overlap only** on saved notes, project and URL; shows exact matched fields and opens original URL.

The external source opens in a new tab, not an in-app fifth screen. The app does not fetch source pages or summarize their contents.

## Explicit limitations / not implemented

- No authenticated user identity, database, server-side storage, source parsing, embeddings, semantic retrieval, AI summaries, chatbot, API cost metering, deployed live URL, or independent test evidence.
- Browser-local storage is not private account isolation and does not persist across devices. Avoid sensitive data.
- Query paraphrases may fail lexical matching. The reviewer task involving “compares ways to code interviews” versus “interview coding approaches” **is not guaranteed to pass** without semantic retrieval or approved synonym handling.
- A website cannot infer an article's claims from its link alone. The interface correctly reports AI understanding unavailable.
- Browser storage may be unavailable/full, which displays an error.

## Suggested acceptance tests (not yet executed)

1. Open My Library in a clean browser profile: empty state.
2. Save a valid HTTPS source, exact note and project: Source Details preserves note verbatim and shows original URL.
3. Close and reopen in same browser: item appears in My Library.
4. Search an exact phrase from the note: result and grounded field-overlap explanation appear.
5. Search a paraphrase using different words: document whether it fails (expected possible failure).
6. Search unrelated terms: no-match state.
7. Enter malformed/unsupported URL: validation prevents save.
8. Open Original: correct URL opens in separate tab.
9. Disable localStorage or force storage error: verify error behavior.
10. Run keyboard navigation and mobile viewport checks.

## Proposed next integrations — require human scope/stack authorization

1. Confirm Part 4a scope (BR-002) and human implementation/deployment owner.
2. Add backend and a database with user-level access controls.
3. Add source ingestion with permission-aware, reliable provenance and explicit unsupported states.
4. Add swappable embedding/model services, semantic retrieval, grounded why-match explanations, logging and cost controls.
5. Conduct the Nov 22 independent reviewer test and record objective evidence.

Source: Product Design & Research Task 1 dated Nov 17, 2026. Design handoff was ready for Engineering review, not already implemented.
