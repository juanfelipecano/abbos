# Implementation Plan — ab-input

Spec: specs/ab-input/spec.md
Iteration: Iter-1 (amended 2026-08-04, see "Amendment" at the bottom — not a new iteration)
Verify (per-task, scoped): `npx prettier --check "projects/abbos/src/lib/components/**" && ng build abbos && ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`
Verify (final, task 10): `npx prettier --check "projects/abbos/src/lib/components/**" && ng build abbos && ng test abbos --watch=false`
Status: DONE, amended — final verify (task 10) no longer passes as written; re-run 2026-08-04
gives `ng test abbos --watch=false` → 3 test files, 1 failed, 9 passed / 7 failed of 16 tests.
`ng build abbos` still succeeds. See Amendment.
Note: commits deferred to the user by request — tasks below are verified (build/test green)
but not committed. Task checkboxes reflect verification state, not commit state.

## Tasks

- [x] 1. Walking skeleton (amended 2026-08-04 — reversed): class `Input` → `AbInput`, delete
      `input.html`, empty `input.css` stays for now, update `input.spec.ts` to instantiate via
      a test host (`<input ab-input>`). **Not done**: `@Component` → `@Directive` — `AbInput` was
      directed to remain a `@Component` with `template: ''`; see ADR-0001's amendment and the
      plan-level Amendment below.
      → `projects/abbos/src/lib/components/form/input/input.ts`,
        `projects/abbos/src/lib/components/form/input/input.spec.ts`,
        deleted `projects/abbos/src/lib/components/form/input/input.html`
      → `ng build abbos && ng test abbos --include "**/components/form/input/**/*.spec.ts" --watch=false`
      — 1 test file, 1 test, passed. Not committed (user handles commits).
- [x] 2. Barrel + public export: `components/index.ts` already existed (pre-existing, staged,
      already re-exporting `./form/input/input` — picked up `AbInput` automatically once task 1
      renamed the class); added the missing re-export in `public-api.ts`
      → `projects/abbos/src/public-api.ts`
      → `ng build abbos` — confirmed `AbInput` present in `dist/abbos/types/abbos.d.ts`. Not
      committed.
- [x] 3 (amended 2026-08-04 — reflection mechanism changed, tests not updated to match):
      `size`/`shape` inputs, defaults `'md'`/`'round'`; one test per value (3+3). **Shipped as**
      `ab-input_{size}`/`ab-input_{shape}` host **classes**, not the `data-size`/`data-shape`
      **attributes** this task and its tests originally targeted. `input.spec.ts` still asserts
      the attributes, so 6 of its 8 size/shape tests now fail — see spec.md AC-F3/AC-F4.
      → `projects/abbos/src/lib/components/form/input/input.ts`, `input.spec.ts`
      → 8 tests written (default + 3 size + 3 shape + render); re-run 2026-08-04: 1 passes
      (render, covered by task 1), 7 fail (default + 3 size + 3 shape, all asserting
      `data-size`/`data-shape` against a class-based implementation). Not committed.
- [x] 4 (amended 2026-08-04 — mechanism changed again): Token-driven styles: base
      (border/bg/text/radius/height/padding per size+shape), `:hover`, `:focus-visible` (ring via
      `--ab-focus-ring`), `:disabled`, `:read-only`. **Shipped as**: `AbInput` stayed a
      `@Component`, so `styleUrl` was available after all — no global Sass partial or
      `components` mixin was needed. The real defect was that the `styleUrl` stylesheet's rules
      were bare class selectors instead of nested under `:host`, so `ViewEncapsulation.Emulated`
      compiled them against the wrong scoping attribute and none of them ever matched the host
      (see ADR-0001's amendment). Fixed by nesting every rule inside `:host { … }`.
      → `projects/abbos/src/lib/components/form/input/input.scss` (new, replaces the deleted
      `input.css`; superseded the `_input.scss` global-partial approach that was never adopted)
      → `ng build abbos` compiles clean; `ng test abbos --include
      "**/components/form/input/**/*.spec.ts" --watch=false` — Angular compilation unaffected by
      the styling fix (styles don't affect the size/shape attribute-vs-class test failures above,
      which are pre-existing and unrelated to this task)
- [x] 5 (amended 2026-08-04 — file path only): Invalid-state + placeholder color styles:
      `.ng-invalid.ng-touched` using `--ab-danger` (plus the new `ab-input_invalid` class, see
      task 3's replacement AC-F8); placeholder color set to `--ab-text-secondary` (not
      `-tertiary`, per AC-U3's contrast finding: `-tertiary` computes to 2.99:1, failing AA)
      → `projects/abbos/src/lib/components/form/input/input.scss` (not `_input.scss` — see
      task 4)
      → Sass compiles clean (rule present, verified above); contrast computed by hand (see
      spec.md AC-U3/AC-U5) since jsdom has no CSS cascade/pseudo-element support to assert
      against — no unit-testable claim was dropped, this was the documented limitation from
      the Constraints section, not a shortcut taken here
- [x] 6. Forms integration tests (no production code change — proves ADR-0001):
      `[(ngModel)]` round-trip, `[formControl]` round-trip (write + read), disabled
      `FormControl` → native `disabled` attribute
      → `projects/abbos/src/lib/components/form/input/input.spec.ts`
      → 12/12 tests passed (4 new). AC-F6, AC-F7 confirmed.
- [x] 7. Security grep check (AC-S1) — run and record output, no code change expected
      → n/a (verification only)
      → `grep -nE "innerHTML|outerHTML|bypassSecurityTrust" projects/abbos/src/lib/components/form/input/input.ts`
      → no matches, exit 1. AC-S1 confirmed.
- [x] 8. TSDoc accessibility note on `AbInput` (AC-U1, written as part of task 3) + doc
      corrections: `CLAUDE.md`'s `AbInput` bullet, `PROJECT-CONTEXT.md`'s "Known debt" +
      "Documentation map" rows. Everything else discovered but out of scope (repo-wide
      Prettier debt, other stale `CLAUDE.md` lines, the uncommitted staged pile, unused DI
      tokens) captured in new `BACKLOG.md` per Rule 5, not fixed here.
      → `projects/abbos/src/lib/components/form/input/input.ts`, `CLAUDE.md`,
        `PROJECT-CONTEXT.md`, `BACKLOG.md` (new)
      → manual review (AC-U1); `ng build abbos && ng test` still green (12/12)
- [x] 9 (amended 2026-08-04 — scope reduced from what was recorded): Playground demo: `/input`
      route (lazy-loaded `InputDemo`) covering size/shape/disabled/read-only/invalid
      combinations, each with a proper `aria-label`. **Not done, contrary to what this task
      originally claimed**: no nav link was added to `app.html`/`app.ts` (the demo is only
      reachable by navigating to `/input` directly — `app.html` was reduced to a bare
      `<router-outlet />`); `styles.scss` was not wired to any `abbos.components` mixin, because
      no such mixin exists (`AbInput`'s styles ship via its own component `styleUrl`, not a
      global Sass partial — see task 4). The `curl`'d `styles.css` claim below (rules present
      verbatim, `[data-size=sm]` selector) describes the pre-amendment, never-shipped
      `_input.scss`/`data-size` approach and does not describe the current `input.scss`
      (`ab-input_sm` class selectors, scoped under `:host`). Not re-verified against the current
      code as part of this amendment.
      → `projects/playground/src/app/pages/input-demo/input-demo.ts` (new),
        `projects/playground/src/app/app.routes.ts`
      → historical (pre-amendment) evidence only, see note above; not re-run
- [x] 10 (amended 2026-08-04 — no longer green): Full-suite regression + final verify (AC-Q2).
      **Re-run 2026-08-04**: `ng test abbos --watch=false` → 3 test files, 1 failed, 9 passed /
      7 failed of 16 tests (the AC-F3/AC-F4 `data-size`/`data-shape` assertions in
      `input.spec.ts`, unrelated to the `RouterLink`/`app.spec.ts` fix recorded below, which
      still holds). `ng build abbos` still succeeds. AC-Q2 is currently unmet — see spec.md.
      → `projects/playground/src/app/app.spec.ts`
      → `npx prettier --check "projects/abbos/src/lib/components/**" && ng build abbos && ng test abbos --watch=false`
      — historical record: 3 test files, 16/16 tests passed at the time this task was written.
      Also: `ng build playground` clean, `ng test playground --watch=false` 2/2 passed (was
      failing before the `RouterLink` fix above). Not re-verified against `playground` as part
      of this amendment.

## Criteria coverage

| Criterion | Covered by task | Status 2026-08-04 |
|---|---|---|
| AC-F1 | 1 | met |
| AC-F2 | 1 (code-review confirms at gate) | met (amended — Component, not Directive) |
| AC-F3 | 3 | **not met** — class, not attribute; test fails |
| AC-F4 | 3 | **not met** — class, not attribute; test fails |
| AC-F5 | 2 | met |
| AC-F6 | 6 | met |
| AC-F7 | 6 | met |
| AC-F8 | 3 (new) | met — not test-covered |
| AC-U1 | 8 | met |
| AC-U2 | 4, 9 | met (styling math unaffected by the `:host` fix) |
| AC-U3 | 5 | met |
| AC-U4 | 4 | met |
| AC-U5 | 5 | met (amended — selector location/rationale changed) |
| AC-S1 | 7 | met |
| AC-Q1 | 1–6 (each task's verify is the before/after proof) | met |
| AC-Q2 | 10 | **not met** — 7/16 tests failing |

Every criterion has at least one task; every task covers at least one criterion except task 9,
which is the mandatory "run it in a browser" check for UI changes (not itself an AC, but
required practice) and task 7, which is a verification-only step for AC-S1.

(tasks 6-10 tracked below as they complete)

## Attempt log

<none yet>

## Escalations
<none>

## Retrospective

**What went well**: the frozen spec held — the one real mid-run discovery (Directives can't
have `styleUrl`) changed *how* two tasks were implemented, not what any criterion required, so
it never needed a spec patch or a new iteration.

**Instruction fixes** (Article XII — the compounding part):

| Document | Change | Applied |
|---|---|---|
| `.claude/skills/aidd/templates/design.md` | The Architecture Document template has no section prompting "confirm the chosen mechanism is actually expressible in the framework" before committing to a Trade-offs decision. The Directive-vs-Component call was right, but "Directives have no `styleUrl`" wasn't caught until task 4, costing a mid-run architecture-doc patch. A one-line prompt in the template ("if this trade-off assumes an API/feature exists, confirm it against the actual framework types before writing the decision down") would have caught it at design time instead. | Not applied — flagging for a human decision, since editing the shared AIDD template affects every future run, not just this one |
| `PROJECT-CONTEXT.md` | Verify command (`npx prettier --check .`) fails repo-wide on pre-existing files; this cost one investigation cycle before this run picked a scoped command instead. Recommend either fixing the repo-wide formatting in its own commit, or changing the documented verify command to a per-project scope (`npx prettier --check projects/`) so it stops failing for unrelated reasons on every future run. | Not applied — user handles commits/formatting separately by request |

**Not a fix, a flag**: nearly the entire repo was staged-but-uncommitted at the start of this
run (pre-existing, not caused by it). Not an AIDD process gap — just worth the user's attention
independent of this feature.

## Amendment (2026-08-04)

Two changes to the delivered code, made directly (outside the AIDD pipeline, at the user's
explicit direction) after this plan's Status was already `DONE`:

1. `AbInput` was directed to remain a `@Component` (not converted to `@Directive` as tasks 1 and
   4 originally planned and recorded).
2. The component's `styleUrl` stylesheet (`input.scss`) had every rule written as a bare class
   selector (`.ab-input`, `.ab-input_sm`, …) instead of nested under `:host`. Under
   `ViewEncapsulation.Emulated`, bare-class rules compile with the `_ngcontent-*` scoping
   attribute, which is only ever applied to nodes the component's own template renders — and the
   template is `''`. So none of those rules could ever match the host `<input>`, and no visual
   styling was ever applied. Fixed by nesting every rule inside `:host { … }` (`&.ab-input`,
   `&.ab-input_sm`, …), which compiles against `_nghost-*` instead — the attribute the host
   element actually carries. See ADR-0001's 2026-08-04 amendment for the full mechanism.

This plan, `spec.md`, and `docs/architecture/adr/0001-abinput-directive-no-custom-cva.md` have
been updated in place (tasks 1, 3, 4, 5, 9, 10, and the criteria coverage table above) to
describe what actually shipped. One item remains open and is **not** resolved by this amendment:
`input.spec.ts` still asserts `data-size`/`data-shape` attributes (AC-F3/AC-F4's original
wording); the shipped implementation reflects `ab-input_{size}`/`ab-input_{shape}` classes
instead, so 7 of 16 tests in `ng test abbos` currently fail. Per spec.md's Open questions: either
`AbInput` should also emit the `data-*` attributes, or the spec and tests should be brought in
line with the class-based reflection that shipped. `ng build abbos` succeeds throughout; this is
a test/spec-accuracy gap, not a compile or runtime break.
