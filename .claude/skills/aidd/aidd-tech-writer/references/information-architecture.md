# Information Architecture

Deciding what documents exist, what goes in each, and where a reader looks first.

Most documentation problems presented as writing problems are structural. The prose is fine; it is
in a document that serves four different readers at once, so it serves none of them.

---

## Diátaxis

The most useful framework for developer documentation, because it explains *why* mixing types feels
wrong even when each sentence is correct.

Four types, organized on two axes: **practical vs. theoretical**, and **specific vs. general**.

| | Practical (doing) | Theoretical (learning) |
|---|---|---|
| **Study / general** | **Tutorial** — learning-oriented | **Explanation** — understanding-oriented |
| **Work / specific** | **How-to guide** — task-oriented | **Reference** — information-oriented |

**Tutorial** — teaches a beginner by having them build something that works. Success is the learner
gaining confidence. It is opinionated, linear, and makes choices for the reader. It does not explain
alternatives.

**How-to** — helps a competent user accomplish one specific goal. Assumes context. "How to configure
SSO with Okta." Not a learning exercise; a recipe.

**Reference** — describes the machinery. Complete, accurate, structured for lookup, dry. API docs,
config options, CLI flags. Nobody reads it start to finish.

**Explanation** — provides understanding and context. Why the system works this way, what the
trade-offs were, how concepts relate. Read away from the keyboard.

### Why mixing them fails

The common failures, each recognizable:

- **Reference with tutorial fragments.** Someone looking up a parameter has to scroll past a
  narrative. Lookup becomes reading.
- **Tutorial with explanation woven in.** The learner loses the thread mid-task, because they are
  being taught two things at once while trying to do one.
- **How-to that teaches concepts.** The user wanted the recipe and got a lesson; they skim, miss a
  step, and it fails.
- **Explanation with commands in it.** Nobody knows whether to run them.

**The diagnostic:** ask what the reader is doing right now. Working or studying? Following a path or
looking something up? The answer names the type, and content that does not fit belongs in a
different document with a link.

---

## Applying it to a codebase

Most projects need less than the full four. A realistic minimum:

```
README.md              → orientation + quickstart (tutorial-shaped)
docs/
  how-to/              → task recipes: deploy, add a migration, configure SSO
  reference/           → API, config, CLI
  explanation/         → architecture, why decisions were made
  runbooks/            → incident response (a how-to under pressure)
  adr/                 → decision records (explanation, immutable)
```

The two that carry the most weight per word are the **README** and the **runbooks**, because both are
read under constraint — one by someone deciding whether to invest attention, the other by someone at
3am.

---

## Audience determines everything

One document, one primary reader. A document serving five serves none.

| Reader | Needs | Failure if you get it wrong |
|---|---|---|
| New contributor | Running locally in 15 minutes | Buried under architecture they cannot use yet |
| API consumer | Request, response, errors, auth, limits | Prose where a table belongs |
| On-call engineer | The fix, in the first three lines | A narrative at 3am |
| Future maintainer | Why, not what | The code already says what |
| Decision maker | Trade-off and consequence | Implementation detail |

**Write for one. Link to the others.** When you catch yourself writing "if you are just getting
started, skip this section" — that is a second document announcing itself.

---

## Where things belong

A recurring source of documentation rot is content in the wrong place, where it will not be
maintained.

| Content | Home | Why |
|---|---|---|
| Why this approach and not the obvious one | Code comment or ADR | Nearest to what it explains |
| Why this architecture | `explanation/` + ADRs | Needs room; changes rarely |
| How to run this locally | README quickstart | First thing anyone needs |
| How to do a specific task | `how-to/` | Discoverable by task name |
| Every config option | `reference/` | Lookup, not narrative |
| What broke and how to fix it | `runbooks/` | Found under pressure |
| What changed in this release | CHANGELOG | Upgrade decisions |
| What we decided and why | ADR | Immutable; the history is the value |

**The most common misplacement is architecture in the README.** It pushes the quickstart below the
fold, and the quickstart is what 90% of README readers came for. One paragraph and a link.

---

## Discoverability

Documentation that exists but is not found has the same value as documentation that does not exist,
and higher maintenance cost.

**Name by task, not by system.** `how-to/add-a-database-migration.md` beats
`how-to/migrations.md` — people search for what they are trying to do.

**Put a map in the README.** A short "where to go next" table beats a nested folder structure nobody
browses.

**Link from where the question arises.** A comment in the config loader pointing at
`reference/configuration.md` is worth more than perfect organization, because it appears at the
moment of need.

**One canonical location per topic.** Two documents about deployment guarantee that one is wrong,
and the reader cannot tell which. When you find a duplicate, delete one and redirect — do not
maintain both.

---

## Sizing

**A document should answer one question completely.** That is the natural boundary.

Split when a document serves two reader states — the person setting up and the person operating.
Merge when two documents are always read together.

Length is a symptom, not a criterion. A 400-line API reference is fine; a 400-line README is not,
because the README's job is orientation and orientation cannot take 400 lines.

---

## Anti-patterns

- **One document for four reader types.** Serves none.
- **Reference with tutorial narrative.** Lookup becomes reading.
- **Tutorial with explanation woven in.** The learner loses the thread.
- **Architecture in the README.** Pushes the quickstart below the fold.
- **Naming documents by system instead of task.** People search for what they are doing.
- **Nested folders with no map.** Nobody browses; they search or give up.
- **Two documents on one topic.** One is wrong and the reader cannot tell which.
- **"If you're just getting started, skip this."** A second document announcing itself.
- **Judging documents by length.** A long reference is fine; a long README is not.
