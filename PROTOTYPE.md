# Part 4a prototype — OpenAI retrieval groundwork

## Implemented code versus verification

The four screens still use browser-local storage. The optional Search Results panel
calls a server-side OpenAI embeddings endpoint only after explicit consent and a
reviewer access code. The code defaults to `text-embedding-3-small` and ranks up to
20 saved records by cosine similarity. Evidence quotes the user's saved note and
project; no source page is fetched and no article summary is generated.

This branch is NOT deployed. Live API credentials, real model quality, host routing,
rate-limit enforcement and an independent reviewer flow are unverified.

## Important limits

- Saves persist only in the same browser/origin; a preview URL and production URL
  have different local libraries. No cross-device sync or durable server database.
- The reviewer code is a temporary paid-endpoint gate, NOT per-user authentication.
- Search sends the query, saved notes and project labels to OpenAI. Original URLs,
  IDs and full article content are not sent to the embedding provider.
- Up to 20 records; 2,000 characters per note; 200 per project; 500 per query;
  16,000 characters total; 64 KiB HTTP body. Larger libraries are rejected, not silently truncated.
- Results are candidate matches, not proof. The default 0.35 cutoff is uncalibrated.
- One batch per search, no embedding cache. Repeated searches re-embed the saved
  context; durable per-user storage and a versioned embedding index are later work.
- AI summaries, source ingestion, cited chatbot answers, registration and verified
  emails remain unimplemented. Do not mark the entire SAVE → UNDERSTAND → RETRIEVE
  journey complete based on this branch.

## Hosted acceptance tests — NOT EXECUTED

1. Open the actual deployment in a fresh browser without a developer account.
2. Save a permitted real research URL, exact why-saved note and project.
3. Verify unchanged note, correct link, successful reload and new-tab link behavior.
4. Try malformed URLs, storage errors and no-match searches; confirm honest messages.
5. With AI disabled or wrong reviewer code, verify no paid provider request occurs.
6. Enable AI after spending approval. Use the UX interview-coding query and at least
   two further paraphrases against a multi-item library; record ranks and relevance judgments.
7. Include unrelated queries; calibrate the cutoff using both relevant and irrelevant pairs.
8. Verify explanations cite real notes, not inferred article claims. No source text means no article summary.
9. Test 401, 403, 429, timeout and unavailable-provider paths; local search remains explicitly lexical.
10. Inspect network traffic/build output: no OpenAI secret in browser files, DOM or requests.
11. Verify Netlify's host-side rate limit, exact-origin policy, request sizes and token usage.
12. Run keyboard, mobile and independent human reviewer tests. Record URL, commit,
    timestamp, pass/fail evidence and costs. No assistance during the independent test.
