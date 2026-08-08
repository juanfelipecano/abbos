# Project Context

Copy this file to the root of a project as `PROJECT-CONTEXT.md` and fill it in. Every
AIDD role reads it before acting. It is the single place where stack-specific facts live,
which is what keeps the role skills reusable across projects.

Delete the instructional comments as you fill it in. Keep it under two pages — this file
is read on every iteration, so every line costs tokens forever.

---

## Identity

- **Project**: <name>
- **What it does**: <one sentence a new engineer would understand>
- **Stage**: prototype | MVP | production | legacy maintenance
- **Users**: <who, and roughly how many>

## Stack

| Layer | Technology | Version |
|---|---|---|
| Language | | |
| Framework | | |
| Data store | | |
| Frontend | | |
| Auth | | |
| Infrastructure | | |

## Commands

These are the literal commands roles will run. Wrong commands here mean every verify step
fails for the wrong reason, so test each one before committing this file.

```bash
# Install dependencies
<command>

# Run the full test suite
<command>

# Run a single test / a subset
<command>

# Lint and format check
<command>

# Type check (or: N/A)
<command>

# Build for production
<command>

# Run locally
<command>
```

**Verify command** — the one command that gates a commit. Roles treat a non-zero exit as
a hard stop.

```bash
<command>
```

## Layout

```
<annotated tree of the directories that matter — where code, tests, config, and docs live>
```

## Conventions

Only list what is not obvious from reading the code. Things a reviewer has actually asked
for twice.

- **Naming**:
- **Error handling**:
- **Logging**:
- **Test structure**:
- **Commit format**:
- **Branch strategy**:

## Quality bars

Numbers, not adjectives. These become acceptance criteria verbatim.

| Dimension | Bar |
|---|---|
| Test coverage | <e.g. 80% on new code; no reduction in overall> |
| Accessibility | <e.g. WCAG 2.2 AA> |
| Performance | <e.g. p95 API < 300ms; LCP < 2.5s> |
| Security | <e.g. OWASP ASVS L2; no High/Critical in dependency scan> |
| Browser/runtime support | |

## Boundaries

Things that must not change without human approval. Roles treat these as read-only.

- <e.g. the public API contract in api/v1/>
- <e.g. database migrations already applied to production>
- <e.g. the billing calculation module>

## Domain glossary

Terms that mean something specific here and would be misread otherwise.

| Term | Meaning |
|---|---|
| | |

## Known debt

Where the shortcuts are, so roles do not mistake them for patterns to copy.

| Area | Issue | Do instead |
|---|---|---|
| | | |

## Documentation map

| Artifact | Location |
|---|---|
| Product brief | `docs/product/brief.md` |
| PRD | `docs/product/prd.md` |
| Architecture | `docs/architecture/architecture.md` |
| ADRs | `docs/architecture/adr/` |
| UX spec | `docs/design/ux-spec.md` |
| Threat model | `docs/security/threat-model.md` |
| Specs | `specs/<feature>/spec.md` |
| Active feature pointer | `.aidd-active` |
| Plans | `specs/<feature>/plan.md` |
| Backlog | `BACKLOG.md` |
