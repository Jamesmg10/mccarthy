# McCarthy

**A proposed research-library assistant for PhD thesis researchers and other higher-education students.**

McCarthy aims to help researchers save sources, organize them around research projects, and later retrieve and use them without remembering an exact title. The proposed primary AI capability is meaning-based, context-aware retrieval, supported by structured summaries and source-grounded Q&A.

## Project status

| Item | Status |
| --- | --- |
| Proposal date | October 24, 2026 |
| Proposal attribution | UX-CHATGPT for Brandon |
| Review audience | James (DATA), Fangqi/Han (PM), and the team |
| This package | Documentation-only starter; no application code |
| MVP/context additions and PM criteria | Proposed; pending human approval |
| Existing data model | Reported `mccarthy-data-sheet` v0.1: 14 tables, CSV templates, and three unresolved questions; original contents unavailable here |
| Deployment platform and implementation ownership | Open / unassigned |
| Shared Google Drive files and data sheet | Not modified by this starter |

This README is based on the supplied October 24 proposal text. It does not establish that any backend, authentication, retrieval, chatbot, or deployment feature has been implemented. The accompanying PDF has not been independently reviewed for this starter.

## Start here

There are no dependencies to install or build commands to run. This package contains only this README.

Before implementation:

1. Have PM and the team review the proposed MVP, priorities, and acceptance criteria below.
2. Follow the shared-file session controls before accessing or updating the team's Agent Home.
3. Have DATA inspect the actual v0.1 sheet and schema README, then report verified coverage, gaps, dependencies, and its three actual open questions.
4. Select a deployment platform and assign implementation ownership.
5. Produce the required technical System Architecture Diagram.
6. Obtain human approval before applying context additions, schema edits, or additional build scope.

Do not treat this standalone starter as a replacement for the team's shared context, approvals, or session records.

## Product direction

### Established decisions reported in the proposal

- **D1 - Core workflow:** save a link/PDF -> organize by research project and suggest tags -> create an in-depth, source-linked summary -> later retrieve by remembered context without the exact title -> use the source in a thesis.
- **D2 - Users:** PhD thesis researchers and other higher-education students.
- **D3 - Deployment:** platform remains open; implementation ownership is unassigned.
- **D4 - Builder agents:** PM-CHATGPT, UX-CHATGPT, and DATA-CHATGPT operate in manual mode with human handoffs. The persistent **McCarthy Agent Home is the shared Google Drive folder**, not ChatGPT itself. Leads of shared PM/UX agents remain TBD.

### Proposed primary AI capability

Meaning-based, context-aware retrieval should use saved source content or permissible excerpts, research-project context, why-saved notes, and user highlights where available.

Results should:

- Be restricted to the requesting user's authorized library/project.
- Explain why the source matched the remembered context.
- Link to the original source and preserve supporting provenance.

Tagging and summaries alone do not meet the proposal's substantive AI requirement.

### Proposed live chatbot: Ask Your Library

Ask Your Library should answer from retrieved saved material, with verifiable citations back to real source records and excerpts. It must explicitly state when available evidence is insufficient.

Retrieval passages need to remain bound to source records and citation anchors. Unsupported claims and fabricated citations are not acceptable.

## Proposed MVP scope

Prioritize high-frequency, low-complexity, high-value interactions:

- Save a link or PDF reference, subject to the team's approved capture implementation.
- Organize sources by research project/collection and suggest tags.
- Preserve user corrections to AI suggestions.
- Produce structured, source-linked summaries for individual papers.
- Retrieve sources using remembered context rather than exact titles.
- Answer questions from saved material with verifiable citations.

The broader live MVP must also satisfy the stated requirements for:

- A public URL.
- Registration with email verification and a confirmation email.
- A live chatbot.
- Help documentation.

### Candidate deferrals requiring PM agreement

- Advanced filters.
- Full PDF drag-and-drop if implementation proves complex.
- External source discovery.
- Production-grade Thesis Check and evidence mapping.

Thesis Check appears in the illustrative prototype; this is not evidence of a validated working backend.

## Milestones and acceptance proposals

All dates below are in **2026**. These are review targets, not claims of completed work or approved new scope.

| Target | Proposed outcome | Qualification |
| --- | --- | --- |
| November 23 | Recruit and test with 3-5 PhD student users; collect actionable prototype feedback | Han proposal; the prior guide listed 4-5 users. PM must resolve/approve the criterion. |
| December 7 | Deliver structured summaries for individual papers and source-grounded Q&A | Contextual retrieval is proposed as the main AI differentiator. Broader live-MVP requirements also apply. |
| December 14 | Demonstrate the project and reflect on outcomes | Review actual outcomes against the approved scope and criteria. |

## Prototype and diagram references

The following are referenced materials, **not files included in this starter**:

| Reference | What it describes | What it does not prove |
| --- | --- | --- |
| `Team McCarthy Agent Architecture.png` | Builder-agent roles, manual human handoffs, ChatGPT runtime, shared Google Drive Agent Home, and external individual tools | A deployed application architecture or working backend |
| `mccarthy_information_architecture_sitemap.png` | User-facing hierarchy: Landing/Onboarding; signed-in Home, Save Source, Library, Thesis Check, and Ask; Collection, AI Organizing, and shared In-depth Summary | Implementation of those pages or backend capabilities |

**Information Architecture is not the technical System Architecture Diagram required by Part 3.**

The technical diagram must describe deployment, authentication, the app/frontend, backend, storage, search/AI, and grounded chatbot connections. Platform details remain open; this README deliberately does not select or invent a stack.

## DATA work order

**Reviewer:** James / DATA-CHATGPT  
**Target:** the existing `mccarthy-data-sheet` v0.1 and relevant schema README  
**Mode:** review first; do not auto-apply changes

The original sheet and schema text are unavailable in this starter. Do not invent existing table names, fields, relationships, or the contents of unresolved questions.

### Coverage to verify against the actual sheet

These are capability requirements to investigate, **not asserted existing column names or confirmed gaps**.

| Capability | Verify storage and relationships |
| --- | --- |
| Capture / retrieval | Source identity, type, original URL/file reference, user ownership, date saved, project/collection, why-saved note, user highlights/notes, and permissible extracted excerpts |
| Organization | AI-suggested tags and project/collection, human-accepted corrections, and source-linked structured summaries |
| Meaning-based search | Searchable content/excerpts, context, user notes/highlights, semantic retrieval index or equivalent, authorized library/project filtering, and "why this matched" provenance |
| Ask Your Library | Retrieval passages bound to sources and citation anchors; answers reference verifiable real source material without fabricated citations |
| Privacy / operations | User-library protection, copyright compliance, model switching, and AI usage/spend tracking |

**One specifically documented field:** the October 24 Setup Guide explicitly states that `why_saved` already exists in the data sheet. This is a reported fact from that guide, not an independent inspection of the sheet, and establishes no other exact column name.

### Required DATA report

1. Confirm what already exists in the reported 14-table v0.1.
2. Distinguish verified gaps from proposed gaps and items still unverified.
3. Identify dependencies blocking save -> contextual retrieval -> cited chatbot.
4. Report the sheet's **three actual open questions**, quoting or faithfully referencing their real text rather than guessing.
5. Propose minimally invasive schema/index/citation changes using the format below, only after inspecting existing content.
6. Ask PM to approve additional build scope or new priorities.
7. Ask UX to validate page labels, result explanations, and citation presentation.

### Change proposal format

For each proposed change, record:

| Required entry | Instructions |
| --- | --- |
| Target file | Actual shared target and relevant section/table |
| Original text | Exact verified current text; if proposing an insertion, identify the verified insertion point |
| New text | Exact proposed replacement or addition |
| Reason | Capability/dependency addressed and why the change is minimally invasive |

Until the real sheet has been inspected, leave old/new edits unresolved. Do not fabricate a migration or schema to fill the evidence gap.

## Proposed context update

The following block is proposed text for the team's context file. **It is not approved or applied.** Append it only after team approval and the shared-file checks below.

> ### Proposed 2026-10-24 - MVP and prototype alignment (pending approval)
>
> **D1 core workflow remains:** save link/PDF -> organize by research project and suggest tags -> create an in-depth, source-linked summary -> later retrieve by remembered context, without the exact title -> use the source in a thesis.
>
> **Proposed primary AI capability:** meaning-based, context-aware retrieval using saved source content/excerpts, project context, why-saved notes, and highlights where available. Results show why they match and link to the original source.
>
> **Proposed live chatbot:** Ask Your Library answers from retrieved saved material and provides verifiable citations back to source records/excerpts; it must say when it lacks evidence. Tagging and summaries alone are not the substantive AI requirement.
>
> **PM proposals for acceptance criteria:** By **Nov 23**, recruit and test with **3-5 PhD student users** and collect actionable feedback on the prototype (Han proposal; prior guide listed 4-5). By **Dec 7**, deliver **structured summaries for individual papers** plus **source-grounded Q&A**; contextual retrieval is proposed as the main AI differentiator. The broader live MVP must also satisfy public URL, registration with email verification and confirmation email, live chatbot and help docs. By **Dec 14**, demonstrate and reflect on outcomes.
>
> **Scope proposal (Fangqi/Han):** focus short-term work on high-frequency, low-complexity, high-value interactions; defer advanced filters, full PDF drag/drop if implementation proves complex, external source discovery and production-grade Thesis Check/evidence mapping as needed. Thesis Check exists in the *illustrative prototype*, not a validated working backend.
>
> **Unchanged decisions / open questions:** D2 users are PhD thesis researchers and other higher-ed students. D3 deployment platform is OPEN and implementation ownership is unassigned. D4 builder agents are PM-/UX-/DATA-CHATGPT in manual mode; the persistent **McCarthy Agent Home** is the shared **Google Drive folder**, not ChatGPT itself. Leads of shared PM/UX agents remain TBD.
>
> **Diagrams:** Agent Team Architecture is a builder-team coordination figure; Information Architecture is a user-facing sitemap. Neither replaces the technical System Architecture diagram required by Part 3.

## Shared-file session controls

Before applying changes to the real shared Google Drive Agent Home:

1. Read these existing team files in this order:
   1. `FOLDER-ACCESS.md`
   2. `ORIENTATION.md`
   3. `context.md`
   4. `handoff/LOG.md`
   5. `handoff/CARRYOVER.md`
2. Check `handoff/LOG.md` for an open session on the target shared file. **Stop rather than overwrite if locked.**
3. Obtain human approval for the D1 additions / PM criteria and actual schema edits.
4. Save approved updates to the team's real shared Google Drive Agent Home in manual mode.
5. Record changes in `handoff/LOG.md` and carryover items in `handoff/CARRYOVER.md`.
6. Never treat either referenced diagram as evidence of implemented backend functionality.

These are references to existing team-controlled files, not instructions to create substitute control files in this starter.

## Open decisions and next actions

- [ ] PM/team: approve or revise the proposed context additions and milestone criteria.
- [ ] PM: resolve the 3-5 versus 4-5 user-testing target.
- [ ] DATA: inspect the real sheet and schema README; deliver the evidence-based report.
- [ ] DATA: surface the sheet's three actual unresolved questions.
- [ ] Team: select the deployment platform and assign implementation ownership.
- [ ] Team: identify leads for shared PM/UX agents.
- [ ] Team: produce the technical System Architecture Diagram required by Part 3.
- [ ] UX: validate page labels, retrieval explanations, and citation presentation.
- [ ] PM: approve any additional build scope and candidate deferrals.
- [ ] Authorized human: apply only approved changes using the shared-file controls.

No checkbox is marked complete because this documentation starter does not establish completion of those actions.
