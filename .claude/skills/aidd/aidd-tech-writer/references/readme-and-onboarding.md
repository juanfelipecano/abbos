# README and Onboarding

The most-read and most-neglected file in any repository.

Optimize ruthlessly for the first ninety seconds. Most readers arrive with one of two questions —
*what is this?* and *how do I run it?* — and they will decide whether the project is worth their
attention before scrolling.

---

## The structure

In this order. The order is the design.

**1. What this is** — one sentence. What it does and for whom. No marketing.

> A CLI that converts Postgres schemas into TypeScript types.

**2. Why it exists** — one or two sentences. What problem, and why not an existing tool. This is
what a reader uses to decide whether to keep reading.

**3. Quickstart** — copy-pasteable, from clone to running. **This is the point of the file.**

**4. Configuration** — a table: variable, required, default, purpose.

**5. Common tasks** — run tests, run one test, build, lint, migrate.

**6. Architecture** — one paragraph and a link. Not the details.

**7. Where to go next** — the map to deeper documentation.

Everything else belongs elsewhere. A README that scrolls for five screens has no quickstart, because
nobody found it.

---

## The quickstart is the whole file

Every command tested, in order, on a clean checkout. Not from memory — actually run them.

```bash
git clone https://github.com/org/project
cd project
npm install
cp .env.example .env
npm run dev
# → http://localhost:3000
```

Properties that matter:

**Copy-pasteable as a block.** No `$` prompts, no interleaved output, no "now edit the file to add
your key" without saying which key and where.

**Ends with a verification.** The reader should know whether it worked. `# → http://localhost:3000`
or `# → "Server listening on 3000"`. Without it, silence is ambiguous.

**Prerequisites stated first**, with versions. "Requires Node 20+ and Postgres 15+." Discovering a
version requirement from a cryptic error four commands in is where people give up.

**No manual steps hidden in prose.** If the reader must create a database or request an API key, it
is a numbered step, not a sentence they might skim past.

### The ninety-second test

Hand the README to someone who has never seen the project. Watch where they stop.

That is your only real finding, and it beats every style guideline. The place they stop is almost
never where you expected — it is usually a missing prerequisite, an undocumented environment
variable, or a command that assumes a global install.

---

## Wrong is worse than missing

Missing documentation costs a reader ten minutes of reading code. Wrong documentation costs an hour
of debugging against a false model — and worse, it teaches the team that the docs cannot be trusted,
after which nobody reads any of them.

So: **run every command you document.** If you cannot, mark it and say so:

```markdown
<!-- unverified: requires production credentials -->
```

**Never document from the spec.** A spec describes intent; the system describes reality. Documenting
a flag from a PRD is how a README ends up describing something that was renamed before merge.

---

## Configuration

A table, always. Prose about configuration is unusable for lookup.

```markdown
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Postgres connection string |
| `PORT` | no | `3000` | HTTP listen port |
| `LOG_LEVEL` | no | `info` | `debug` \| `info` \| `warn` \| `error` |
| `SESSION_SECRET` | yes | — | 32+ random bytes. Rotating invalidates all sessions |
```

The **Required** column is the one readers scan. Everything required and undefaulted must be in the
quickstart, or the quickstart does not work.

Note the last row: consequences belong here. "Rotating invalidates all sessions" is the kind of fact
that is expensive to learn empirically.

---

## Onboarding beyond the README

The README gets someone running. Onboarding gets them productive, and it is a different document
with a different reader — someone who has already run the project and now needs the map.

Worth writing, in `docs/` rather than the README:

- **How the code is organized**, with the reasoning. Not a directory listing — the *why* of the
  boundaries
- **The one workflow they will do most.** Add an endpoint, add a component, add a migration
- **What to read before their first change**, in order
- **The conventions that are not obvious from reading**, and where they are enforced
- **Who to ask about what**

**The highest-value onboarding document is a walkthrough of one complete change** — a small real
feature, traced from request to database to test. It teaches the layering, the conventions, and the
test structure at once, in the form someone will actually use.

---

## Keeping it current

The README rots faster than anything else because it describes setup, and setup changes without
anyone noticing.

- **Re-run the quickstart on a clean checkout when dependencies change.** Not read it — run it.
- **Ask what a release just made wrong.** A renamed flag invalidates every example using it.
- **Prefer generated content where possible** — CLI help, config schemas, API references. Generated
  content cannot drift.
- **Date anything time-sensitive.** "Requires Node 20+ `<!-- verified 2026-07 -->`" ages honestly.

`maintenance.md` covers the systematic version of this.

---

## Anti-patterns

- **No quickstart in the first screen.** The main reason people came, and they did not find it.
- **Architecture before the quickstart.** Pushes the essential below the fold.
- **Untested commands.** The first failure is where a reader gives up on the project entirely.
- **A quickstart with no verification step.** Silence is ambiguous.
- **Prerequisites discovered from a cryptic error.** State them first, with versions.
- **Manual steps buried in prose.** They get skimmed past, then the next command fails.
- **`$` prompts in copy-paste blocks.** Breaks paste.
- **Configuration as prose.** Unusable for lookup.
- **Documenting from the spec.** Describes intent, not the system.
- **A five-screen README.** It has no quickstart; nobody found it.
