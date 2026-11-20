# HiveMind branding-only preview

Status: DRAFT FOR REVIEW. Not an official product rename or launch approval.
Prepared November 19, 2026. Baseline: `c251f2a764ec75c5109f431003d4d8cd8462631f`.

## Human verification update

At November 19, 2026, 18:56:10 EST, the project user confirmed that the four-screen
prototype works with their OpenAI API and asked to begin HiveMind rebranding.
Record this as **user-verified four-screen functionality with real OpenAI integration**.
This updates the earlier absence of human functional confirmation. It is not a new
assistant-run live API test. The tested URL and exact local/deployed revision were
not supplied with that confirmation; do not infer a public launch, cloud database,
article summaries, or complete assignment acceptance from it.

## Brand direction

Working product name: **HiveMind**. Team/project identity: **McCarthy**.
Descriptor: **Research library**. Supporting line: **Research, kept in context.**
Voice: clear, restrained and scholarly; describe saving and recall, not fictional features.

Use the user's selected minimal visual direction: warm off-white (#f6f5f0), white
surfaces, forest green (#174b3d), charcoal text (#202b26), muted sage (#e8eee9), and
a restrained amber focus indicator (#80602e). Serif wordmark/headings, system sans-serif
controls, thin borders, 4px corners, and generous spacing. No purple, gradients,
glow, decorative AI icons, animated backgrounds, or fabricated counts.

## This change

Only `index.html`, `styles.css` and this document change. The interface wordmark,
page title and metadata use HiveMind, with a visible Brand preview label and McCarthy
attribution. All existing privacy and AI limitations remain visible.

My Library, Save Source, Source Details and Search Results keep their current routes
and behavior. No JavaScript, API, authentication, model, credentials, Netlify settings,
build configuration, repository name, storage key, or saved record format changes.
Do not rename `mccarthy-prototype-sources-v1`; preserving it avoids orphaning existing
saved browser data on the same origin. Do not change the deployment origin as part
of this branding preview.

## Boundaries and naming risk

BR-004 authorized limited assessment, not Knowledge Graph implementation. This draft
adds no graph, PARA navigation, browsing tracking, proactive recommendations, or
claims that such features work. Public adoption remains subject to the team's
naming/approval process and regression review. No merge, domain purchase or deployment
is included in this change.

A preliminary naming check found that Hive already uses HiveMind for an AI offering:
https://hive.com/blog/hivemind-ai-technology-for-project-management/
Accessed November 19, 2026. This is an existing-use finding, not a trademark clearance
or legal conclusion. Growth should evaluate naming/positioning risk before launch.

## Release checklist

- Compare this draft against any unpushed changes in the user's working local copy.
- Review the name and visual direction; retain McCarthy as the team identity.
- Repeat save, reload, search, why-match and Open Original tests on the candidate.
- Test real OpenAI integration in the user's configured environment without exposing keys.
- Check keyboard focus, mobile layout, empty/error states and unchanged consent text.
- Merge/deploy only after explicit release approval; retain the prior build for rollback.

The existing successful user test applies to the pre-rebrand prototype, not
an automatic sign-off on these new presentation changes.
