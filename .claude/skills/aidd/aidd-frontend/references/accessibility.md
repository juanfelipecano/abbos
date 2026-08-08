# Accessibility — WCAG 2.2 AA

Practical guide to the criteria that actually get failed, plus the nine criteria WCAG 2.2 added.
Written to be turned into acceptance criteria before implementation, because keyboard support and
semantics are structural — found late, they require a rebuild.

**Version note.** WCAG 2.2 (October 2023) is current. It added nine success criteria and
**removed 4.1.1 Parsing**, which is now obsolete — do not write criteria against it. Everything in
2.1 AA remains in 2.2 AA.

Automated tooling catches roughly a third of real issues. Never claim compliance from a green axe
run; the criteria below marked **manual** are the ones tooling cannot see.

---

## POUR, and what each actually means

| Principle | Question | Most common failure |
|---|---|---|
| **Perceivable** | Can they perceive the content? | Contrast, missing text alternatives |
| **Operable** | Can they use it? | Keyboard traps, unreachable controls, tiny targets |
| **Understandable** | Can they understand it? | Unlabeled inputs, unexplained errors |
| **Robust** | Does it work with their tools? | Custom widgets with no semantics |

---

## The nine WCAG 2.2 additions

Newest, therefore least implemented, therefore where findings are.

### 2.4.11 Focus Not Obscured (Minimum) — AA · manual
When an element receives keyboard focus, it must not be **entirely** hidden by other content.

The classic failure: a sticky header or cookie banner covering the element the user just tabbed
to. They are focused on something invisible. Tab through the whole page with a sticky header
present and watch for focus disappearing.

Fix with `scroll-margin-top` on focusable elements equal to the sticky header height, so scrolling
into view accounts for the overlay.

### 2.5.7 Dragging Movements — AA
Any drag-and-drop must have a single-pointer alternative that does not require dragging.

A kanban board needs a "move to column" menu. A reorderable list needs up/down buttons or a
position input. A slider needs clickable increments or a text field.

This one is routinely missed because drag interactions feel complete once they work with a mouse.

### 2.5.8 Target Size (Minimum) — AA
Interactive targets at least **24×24 CSS pixels**, with exceptions for inline links in text and
targets with sufficient spacing.

Note this is smaller than the 44×44 often cited — that is 2.5.5 Target Size (Enhanced), at AAA.
For AA, 24×24 is the bar. Icon buttons and close buttons are the usual failures; padding counts
toward the target, so you can meet it without changing the visual size.

### 3.2.6 Consistent Help — A
If a help mechanism exists (contact link, chat, FAQ), it must appear in the **same relative
order** on every page that has it.

Cheap to satisfy by putting it in a shared layout. Easy to fail by moving it on one page.

### 3.3.7 Redundant Entry — A
Do not ask for the same information twice in one process. Auto-populate it, or let the user
select the earlier value.

Multi-step checkouts asking for an address again at the shipping step fail this.

### 3.3.8 Accessible Authentication (Minimum) — AA
No **cognitive function test** in authentication unless an alternative exists.

Concretely: do not block paste in password fields — that breaks password managers, which are the
alternative mechanism this criterion protects. Do not require solving a puzzle, remembering a
sequence, or transcribing characters, unless another route exists.

Blocking paste on a password field is the single most common failure of this criterion, and it is
usually added deliberately as a "security measure" that reduces security.

### 2.4.12 / 2.4.13 / 3.3.9 — AAA
Focus Not Obscured (Enhanced), Focus Appearance, Accessible Authentication (Enhanced). Out of scope
for AA; worth knowing exist if the project targets AAA.

---

## Keyboard and focus

The area with the most findings, and the one automated tools see least.

**Test method:** unplug the mouse. Complete the primary flow. Note every place you get stuck.

- [ ] Every interactive element reachable by Tab, in an order matching visual order
- [ ] Visible focus indicator, contrast ≥ 3:1 against adjacent colors (**1.4.11**)
- [ ] No keyboard trap — you can always Tab out (**2.1.2**)
- [ ] Escape closes overlays and **returns focus to the trigger**
- [ ] Modal: focus moves in on open, is trapped while open, restored on close
- [ ] Skip link to main content as the first focusable element (**2.4.1**)
- [ ] Custom widgets follow the expected key pattern for their role
- [ ] Nothing focusable is hidden — `tabindex="0"` on a `display:none` element still receives focus
      in some browsers via programmatic focus

**`tabindex` rules:** `0` puts an element in natural order. `-1` makes it programmatically
focusable but not tabbable — correct for a modal container you focus on open. **Never use a
positive value**; it jumps ahead of everything and breaks order globally.

**Expected keys for custom widgets** — if you build one, all of these are required:

| Widget | Keys |
|---|---|
| Button | Enter, Space |
| Link | Enter |
| Checkbox / Switch | Space |
| Radio group | Arrows move and select; Tab enters/leaves the group as one stop |
| Select / Combobox | Arrows, Enter, Escape, type-ahead |
| Tabs | Arrows switch, Home/End jump, Tab moves to panel |
| Menu | Arrows, Enter, Escape, Home/End |
| Dialog | Escape closes, focus trapped |
| Tree | Arrows navigate, Right/Left expand/collapse |
| Slider | Arrows, Home/End, PageUp/PageDown |

This table is the argument for using a native element or a vetted library. Reimplementing a
combobox correctly is a week of work that a `<select>` gives you free.

---

## Semantics

**Native elements before ARIA.** A `<button>` gives you keyboard activation, focus, a role, and
form participation. A `<div role="button">` gives you the role and nothing else — you now owe
`tabindex`, Enter and Space handlers, and disabled-state semantics, and you will miss one.

The first rule of ARIA is not to use ARIA. Bad ARIA is worse than none, because it overrides
correct native semantics with an incorrect claim.

**Where ARIA is genuinely needed:** custom widgets with no native equivalent (`role="tablist"`,
`role="combobox"`), live regions, relationships (`aria-describedby`), and states native HTML
cannot express (`aria-expanded`, `aria-current`, `aria-invalid`).

**Landmarks and headings** (**1.3.1**, **2.4.6**):
- One `<main>`, plus `<nav>`, `<header>`, `<footer>`, `<aside>` as appropriate
- One `<h1>` per page. Levels sequential — never skip from `h2` to `h4`
- Headings describe structure, not styling. Do not pick a level for its font size

**Forms** (**1.3.1**, **3.3.2**):
- Every input has a programmatically associated `<label>` — `for`/`id`, or wrapping
- **A placeholder is not a label.** It disappears on input, fails contrast, and is not announced
  reliably
- Group related controls in `<fieldset>` with a `<legend>` (radio groups, address blocks)
- Mark required fields in text, not with a red asterisk alone (**1.4.1**)
- `autocomplete` attributes on personal-data fields (**1.3.5**)

---

## Errors and dynamic content

**Error identification** (**3.3.1**, **3.3.3**):
- Identify **which** field and **what** is wrong, in text
- Associate the message with the input via `aria-describedby`, and set `aria-invalid="true"`
- Announce it — a message rendered silently is invisible to a screen reader user
- Do not rely on color or a border alone
- On submit failure, move focus to the first error or to a summary

```html
<label for="email">Email</label>
<input id="email" type="email" aria-invalid="true" aria-describedby="email-err">
<p id="email-err" role="alert">Enter an email address, like name@example.com</p>
```

**Live regions.** Content that changes without a page load must be announced:

| Attribute | Behavior | Use for |
|---|---|---|
| `aria-live="polite"` | Announced when idle | Search results count, save confirmation, filter updates |
| `aria-live="assertive"` / `role="alert"` | Interrupts immediately | Errors, session expiry warnings |
| `aria-busy="true"` | Suppresses announcement while updating | Wrapping a region during a batch update |

Two implementation details that break live regions: the container must exist in the DOM **before**
the content changes (injecting the whole region announces nothing), and rapid updates should be
debounced or the user hears a stream of interruptions.

**Loading states must be perceivable non-visually.** A spinner is invisible to a screen reader.
Announce "Loading results" and then the outcome.

---

## Visual

- [ ] Text contrast ≥ **4.5:1**; large text (18.66px bold or 24px) ≥ **3:1** (**1.4.3**)
- [ ] UI component and graphic contrast ≥ **3:1** (**1.4.11**) — borders, icons, focus rings,
      chart series
- [ ] Meaning never carried by color alone (**1.4.1**) — add an icon, a label, or a pattern
- [ ] Usable at **200% zoom** (**1.4.4**) and at **320 CSS px** width with no horizontal scroll
      (**1.4.10**)
- [ ] Text spacing overrides do not break layout (**1.4.12**)
- [ ] `prefers-reduced-motion` respected (**2.3.3**); nothing flashes more than 3×/second
      (**2.3.1**)
- [ ] Content on hover/focus is dismissible, hoverable, and persistent (**1.4.13**)

Disabled controls are commonly exempted from contrast requirements — but a disabled control
nobody can read is a usability failure regardless. Prefer explaining *why* it is disabled in text.

---

## Images and media

| Case | Alt text |
|---|---|
| Informative | Describe the information, not the image. "Sales fell 12% in Q3" not "line chart" |
| Decorative | `alt=""` — empty, not missing. Missing alt makes screen readers read the filename |
| Functional (icon link/button) | Describe the **action**: "Search", not "magnifying glass" |
| Complex (chart, diagram) | Short alt + a longer description nearby or via `aria-describedby` |
| Text in an image | The same text. Better: do not put text in an image |

Video and audio need captions (**1.2.2**), and audio description where visual information is not
in the dialogue (**1.2.5**). Autoplaying audio over three seconds needs a pause control
(**1.4.2**).

---

## Testing

Layered, because each layer catches what the others cannot.

| Layer | Catches | Cost |
|---|---|---|
| Linter (eslint-plugin-jsx-a11y or equivalent) | Missing alt, invalid ARIA, bad roles | Free, at write time |
| axe in component tests | Contrast, ARIA validity, label association | Cheap, per component |
| Keyboard pass | Traps, order, focus visibility, obscured focus | 10 min per flow, **highest yield** |
| Screen reader pass | Announcements, semantics, live regions | 30 min, finds what nothing else does |
| Zoom / 320px | Reflow, overlap, truncation | 5 min |
| User testing with assistive tech users | Everything real | The only ground truth |

**The keyboard pass is the highest-value manual test.** It takes ten minutes and finds the
structural problems that cost the most to fix late.

Screen reader pairs worth using: NVDA + Firefox (Windows), VoiceOver + Safari (macOS/iOS),
TalkBack + Chrome (Android). Test with one properly rather than all three badly.

**Write component tests that use accessible queries.** Querying by role and accessible name means
the test also proves the element *has* an accessible name — the test and the a11y criterion become
one check:

```js
// Also verifies the button is a button and has an accessible name
await user.click(screen.getByRole('button', { name: 'Save changes' }));
```

---

## Criteria for the spec

Copy and tailor. Each names its verification.

```markdown
### UX / accessibility — appended by aidd-frontend
- [ ] AC-U1: Full flow completable by keyboard alone, logical order → manual keyboard pass
- [ ] AC-U2: Focus visible at ≥3:1 on every interactive element → axe + manual
- [ ] AC-U3: Focus never fully obscured by the sticky header (2.4.11) → manual tab-through
- [ ] AC-U4: Every drag interaction has a single-pointer alternative (2.5.7) → manual
- [ ] AC-U5: Interactive targets ≥ 24×24 CSS px (2.5.8) → axe
- [ ] AC-U6: Password fields accept paste (3.3.8) → manual
- [ ] AC-U7: All inputs have associated labels → `npm test -- a11y`
- [ ] AC-U8: Validation errors announced and linked via aria-describedby → screen reader pass
- [ ] AC-U9: Text contrast ≥4.5:1, UI ≥3:1 → axe
- [ ] AC-U10: Usable at 200% zoom and 320px with no horizontal scroll → manual
- [ ] AC-U11: axe reports zero violations on <views> → `npm test -- a11y`
```

AC-U11 is a floor, not a proof. It is there so regressions get caught; the manual criteria are
what establish compliance.

---

## Anti-patterns

- **`<div role="button">`** instead of `<button>`. You now owe four behaviors and will miss one.
- **Placeholder as label.** Vanishes on input, fails contrast.
- **Positive `tabindex`.** Breaks order for the whole page.
- **`outline: none`** with no replacement. Removes the only affordance keyboard users have.
- **Blocking paste in password fields.** Fails 3.3.8 and breaks password managers.
- **Injecting a live region along with its content.** Announces nothing.
- **Missing `alt` on decorative images.** Screen readers read the filename. Use `alt=""`.
- **Color-only state.** Invisible to a large fraction of users.
- **Claiming AA from a green axe run.** It sees about a third.
- **Drag-only interactions.** Fails 2.5.7 outright.
- **Writing a11y criteria after implementation.** Structural issues need rebuilds.
