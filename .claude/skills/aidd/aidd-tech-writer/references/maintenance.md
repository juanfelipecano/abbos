# Documentation Maintenance

Keeping a documentation set honest, which is mostly about deletion and verification rather than
writing.

The central fact: **wrong documentation is worse than none.** Missing docs cost a reader ten minutes
of reading code. Wrong docs cost an hour of debugging against a false model, and they teach the team
that documentation cannot be trusted — after which nobody reads any of it, including the correct
parts.

---

## The question to ask on every change

> **What did this change just make wrong?**

This is most of the role's value in a pipeline, and it takes two minutes. A change rarely announces
what it invalidated:

| Change | Silently invalidates |
|---|---|
| A renamed flag or environment variable | Every example using it, the config table, runbook commands |
| A new required request parameter | Every API example, every client snippet |
| A changed default | The config table, and any prose that assumed the old one |
| A renamed deployment or service | Every runbook command touching it |
| A new error code | The error table — an omission, not a contradiction |
| A dependency upgrade | Prerequisite versions in the README |
| A moved file | Every path reference, including in code comments |
| A changed permission model | The users-and-permissions table, and how-to guides |

Run a search for the old name after any rename. `grep -rn "OLD_NAME" --include='*.md' .` takes
seconds and catches most of it.

---

## Verify, do not trust

**Run every command you document.** Every install step, every curl example, every snippet.

If you cannot run it, mark it explicitly rather than implying verification you did not do:

```markdown
<!-- unverified: requires production credentials. Last checked by @juano, 2026-05. -->
```

**Never document from a spec.** A spec describes intent; the system describes reality. The gap
between them is where every "the docs say X but it does Y" complaint comes from.

**Date anything time-sensitive.** Version requirements, competitor claims, third-party behavior,
runbook verification. `Requires Node 20+ <!-- verified 2026-07 -->` ages honestly; without the date
it stays quietly wrong forever.

---

## A verification pass

Worth running quarterly, and after any large change. Ordered by yield.

1. **The quickstart, on a clean checkout.** Not read — run. This finds the most, because setup
   changes without anyone noticing.
2. **Runbook commands**, against the current infrastructure. Ideally in staging.
3. **API examples**, against the running API.
4. **Config tables** against the actual config loader — names, defaults, required flags.
5. **Links.** Internal and external. Dead links are a trust signal even when the content is fine.
6. **ADRs against reality.** Does the code still reflect the decision?

```bash
# Dead internal links
grep -rhoE '\]\(([^)h][^)]*)\)' --include='*.md' . | sed 's/](\(.*\))/\1/' | \
  while read -r p; do [ -e "${p%%#*}" ] || echo "BROKEN: $p"; done

# References to a renamed thing
grep -rn "OLD_SERVICE_NAME" --include='*.md' .

# Undated version claims
grep -rn "Requires .* [0-9]" --include='*.md' . | grep -v "verified"
```

---

## Deletion

The most underused maintenance action, and usually the correct one.

**Delete documentation for systems that no longer exist.** A stale runbook is worse than a missing
one — someone will follow it during an incident.

**Delete duplicates.** Two documents about deployment guarantee one is wrong and the reader cannot
tell which. Pick the better one, merge anything unique, delete the other, and leave a redirect if the
path was linked.

**Delete aspirational documentation.** Docs describing how the system was supposed to work are
actively harmful. If a section describes a feature that was cut, remove it.

**Delete commented-out examples.** Git remembers.

The instinct against deletion is that information might be lost. It is in version control. The cost
of a wrong document is paid continuously; the cost of retrieving a deleted one is paid once, rarely,
by someone who knows to look.

---

## Changelogs

Written for someone deciding whether to upgrade. That reader determines everything about the format.

Group by **Added / Changed / Fixed / Deprecated / Removed / Security**.

Every entry describes the change **from the user's perspective**, not the implementation:

| Bad | Good |
|---|---|
| `Fixed: timezone bug in TokenService` | `Fixed: password reset links no longer expire early for users in UTC+13 or later` |
| `Changed: refactored the export pipeline` | `Changed: exports over 100k rows now run asynchronously and email a download link` |
| `Added: new endpoint` | `Added: POST /api/exports for programmatic export creation` |

**Breaking changes get their own section with a migration path.** A breaking change noted without one
generates support load proportional to your user count.

**Security fixes get named**, with severity and whether action is required. Users need to know
whether to upgrade urgently. Coordinate the timing with `aidd-security` — but do not omit it.

---

## ADR upkeep

You do not write ADRs; `aidd-architect` does. You keep the set honest, which is real work because a
stale ADR set documents a system that no longer exists.

**A superseded ADR gets a status line, never an edit:**

```markdown
Status: superseded by ADR-0031
```

The original text stays exactly as written. **The reasoning history is the asset** — editing an ADR
to reflect a new decision destroys the record of why the old one made sense at the time, which is the
main thing a future reader needs.

**Flag decisions with no ADR.** A significant choice made in a pull request discussion is a gap. You
do not write it; you raise it, and the architect does.

**Flag ADRs contradicted by the code.** Either the code drifted or the decision changed silently.
Both need someone to know, and neither is your call to resolve.

---

## Ownership

Documentation without an owner rots. Practices that work:

- **The person who changes the behavior updates the docs, in the same change.** Documentation in a
  separate follow-up commit is documentation that does not happen.
- **Generated content wherever possible** — CLI help, config schemas, API references. Generated
  content cannot drift.
- **A verification date on anything not generated.** It makes rot visible rather than invisible.
- **Doc updates as a criterion**, not an afterthought — when a change alters user-facing behavior,
  "the changelog entry exists" is a legitimate acceptance criterion.

---

## Anti-patterns

- **Not asking what a change invalidated.** The most valuable two minutes available.
- **Documenting from the spec.** Describes intent; the system does something else.
- **Untested commands.** The first failure destroys trust in the whole document.
- **Undated version claims.** Quietly wrong forever.
- **Keeping runbooks for deleted systems.** Someone will follow them.
- **Maintaining two documents on one topic.** One is wrong; the reader cannot tell which.
- **Aspirational documentation.** Describes a system that was never built.
- **Changelog entries describing internals.** The reader cannot tell whether to upgrade.
- **A breaking change with no migration path.** Support load proportional to user count.
- **Omitting security fixes from the changelog.** Users cannot judge urgency.
- **Editing a superseded ADR.** Destroys the reasoning history, which was the asset.
- **Deferring doc updates to a follow-up commit.** They do not happen.
