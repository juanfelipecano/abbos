# Frontend Performance

Budgets, diagnostics, and fixes. The discipline is short: **measure, find the actual bottleneck,
fix that one thing, measure again.** Everything below serves that loop.

The bottleneck is almost never where it feels like it is, and an optimization applied to the wrong
layer adds permanent complexity for no gain.

---

## Core Web Vitals

Three metrics, all measured at the **75th percentile of real users** — not on your laptop.

| Metric | Good | Needs work | Poor | Measures |
|---|---|---|---|---|
| **LCP** Largest Contentful Paint | ≤ 2.5s | 2.5–4.0s | > 4.0s | When the main content appeared |
| **INP** Interaction to Next Paint | ≤ 200ms | 200–500ms | > 500ms | Responsiveness across all interactions |
| **CLS** Cumulative Layout Shift | ≤ 0.1 | 0.1–0.25 | > 0.25 | Unexpected layout movement |

**INP replaced FID in March 2024.** If a document, ticket, or older reference mentions First Input
Delay, it is out of date. The difference matters: FID measured only the delay before the *first*
interaction was processed, which was easy to pass while the app felt slow. INP measures the full
latency — input delay, processing, and presentation — across essentially all interactions, and
reports near the worst one. Applications that passed FID comfortably routinely fail INP.

Supporting diagnostics, not targets themselves: TTFB (server + network), FCP (first paint), TBT
(main-thread blocking, the lab proxy for INP).

**Lab versus field.** Lighthouse is a lab tool on a synthetic profile: good for finding causes,
useless as ground truth. Field data (RUM, CrUX) is what users experience. Optimize using lab,
validate using field.

---

## Budgets

Set them in the spec before implementation, or performance becomes a cleanup project that never
gets scheduled.

| Budget | Typical | Why this one |
|---|---|---|
| LCP | < 2.5s on 4G, mid-tier mobile | The headline metric |
| INP | < 200ms | Where SPAs actually fail |
| CLS | < 0.1 | Cheap to hold, annoying to lose |
| JS added by this feature | e.g. < 30 KB gzipped | The only budget that prevents slow accretion |
| Total route JS | e.g. < 200 KB gzipped | Cumulative ceiling |
| Requests before first paint | e.g. ≤ 5 | Catches waterfalls |

The per-feature JS budget is the one that changes behavior. Nobody ships a 400 KB regression at
once; twenty features each adding 20 KB do it invisibly, and no single change is ever the one to
reject.

Enforce in CI. A budget nobody checks is a comment.

---

## Diagnosing LCP

Break it into four parts and find which dominates. Do this before changing anything.

```
TTFB  →  Resource load delay  →  Resource load time  →  Render delay
```

| Dominant part | Cause | Fix |
|---|---|---|
| **TTFB** | Slow server, no CDN, redirect chain | Cache at the edge; remove redirects; fix the slow query |
| **Load delay** | LCP resource discovered late — in CSS, injected by JS, or lazy-loaded | `<link rel="preload">`; put the hero in HTML; **never lazy-load the LCP image** |
| **Load time** | Image too large or wrong format | Resize, use AVIF/WebP, `srcset` for density and viewport |
| **Render delay** | Render-blocking CSS/JS, font swap, hydration | Inline critical CSS, defer the rest, `font-display: swap`, stream/partial hydrate |

**The most common LCP mistake is lazy-loading the hero image.** `loading="lazy"` applied
globally guarantees the LCP element is discovered late. Mark it `loading="eager"` and
`fetchpriority="high"`.

Second most common: the LCP image referenced only from a CSS background, so the browser cannot
find it until CSS is parsed and matched.

---

## Diagnosing INP

INP is a main-thread problem. Something is blocking, and the fix is almost always to break work
into smaller pieces rather than to make it faster.

Its three parts:

```
Input delay  →  Processing time  →  Presentation delay
```

**Input delay** — the main thread was busy when the user acted. Usually a long task: hydration,
a big JSON parse, an expensive effect, third-party script execution. Fix by breaking long tasks
up (`scheduler.yield()`, or `await new Promise(r => setTimeout(r, 0))` at natural boundaries) and
by deferring non-critical work.

**Processing time** — your handler is slow, or it triggers a large synchronous re-render. Fix by
doing the minimum needed to show feedback, then scheduling the rest.

**Presentation delay** — layout and paint after the handler. Usually too much DOM, or a
layout-thrashing read/write interleave.

The pattern that fixes most INP problems:

```js
// Before — the whole update blocks the response to the click
onClick() { const result = expensiveWork(); setState(result); }

// After — visible feedback immediately, heavy work after the next paint
onClick() {
  setState({ pending: true });                 // paints now
  requestIdleCallback(() => {                  // or scheduler.postTask
    const result = expensiveWork();
    setState({ pending: false, result });
  });
}
```

Users perceive responsiveness, not throughput. Acknowledging the input in 50ms and finishing in
500ms feels fast; doing it all in 300ms feels slow.

**Long task rule of thumb:** anything over 50ms blocks. Anything over 200ms is felt.

---

## Diagnosing CLS

Almost always one of five causes, all cheap to fix:

1. **Images without dimensions.** Set `width` and `height` attributes (or `aspect-ratio`) so the
   box is reserved before the image loads. This is the single most common cause.
2. **Ads, embeds, iframes** with no reserved space. Reserve a min-height.
3. **Injected content** — banners, cookie notices, promo bars pushing content down. Overlay
   instead of inserting, or reserve the space.
4. **Web fonts** causing reflow. `font-display: swap` plus `size-adjust` on the fallback to match
   metrics, or preload the font.
5. **Late-arriving data** changing layout. Skeletons with the same dimensions as the real content.

CLS is the easiest of the three to keep green and the easiest to lose in a single careless change.

---

## JavaScript weight

The root cause of most INP problems and much of LCP render delay. Diagnose in this order.

**1. What is actually in the bundle?** Run the analyzer. Look for:
- A date, lodash, or icon library imported whole for one function
- A duplicated dependency at two versions
- A heavy component pulled into the initial chunk by a barrel file (`index.ts` re-exports defeat
  tree-shaking)
- Polyfills for browsers you do not support
- Development-only code not stripped

**2. Is it needed on this route?** Split by route first — the highest-leverage split. Then lazy-load
below-the-fold and interaction-triggered components (modals, editors, charts, date pickers).

**3. Is it needed at all?** The best optimization is deletion. A carousel nobody scrolls, an
animation library used for one fade, a state library wrapping three values.

**Third-party scripts** deserve their own audit. They are frequently the largest single
contributor and the least examined:
- Load with `async` or `defer`, never blocking
- Delay non-essential scripts (analytics, chat, A/B) until after interaction or idle
- Measure each one's cost by removing it and re-measuring
- Set a policy: every new third-party script needs an owner and a measured cost

An A/B testing script that blocks render to prevent flicker is a deliberate LCP regression. Know
that you are making that trade.

---

## Rendering strategy

The choice with the largest performance consequence, and the hardest to change later.

| Strategy | LCP | INP | Best for |
|---|---|---|---|
| SSG | Best | Good | Content that changes less often than deploys |
| SSR + streaming | Good | Depends on hydration | Personalized content needing fast first paint or SEO |
| ISR | Best after warm | Good | Large mostly-static surface with fresh sections |
| CSR | Worst | Good after load | Behind auth, highly interactive, SEO irrelevant |
| Islands | Best | Best | Content-heavy with isolated interactivity |

**Default to the least JavaScript that meets the requirement.** Interactivity is a cost, not a
feature.

**Hydration is the hidden INP cost of SSR.** The page paints fast, then a large hydration task
blocks the main thread — so it looks ready and does not respond. Partial or progressive hydration,
or islands, address this; a faster server does not.

---

## Network and data

- **Compression**: Brotli on text assets. Verify it is actually on in production
- **Caching**: immutable + long max-age on hashed assets; short or revalidated on HTML
- **Preconnect** to critical third-party origins; **preload** the LCP resource and the critical
  font. Preloading everything is the same as preloading nothing
- **HTTP/2 or 3** — but request count still matters for the critical path
- **Waterfalls**: a request that cannot start until another finishes is the most expensive pattern
  in the list. Parallelize, or move the dependency to the server
- **Over-fetching**: an endpoint returning 40 fields for a list showing 3. Fix on the server
  (`aidd-backend`), not by discarding on the client
- **Pagination and virtualization** for long lists. Rendering 5,000 rows is a guaranteed INP
  failure

---

## Images

Usually the largest bytes on the page and the easiest win.

- Modern formats: AVIF, then WebP, with a fallback
- `srcset` + `sizes` so mobile does not download a desktop image
- `width`/`height` always, for CLS
- `loading="lazy"` on below-the-fold images — and **never** on the LCP image
- `fetchpriority="high"` on the LCP image
- Do not ship a 2000px image displayed at 400px
- SVG for icons and line art; strip metadata

---

## Measurement tools

| Tool | Use for | Caveat |
|---|---|---|
| Lighthouse | Finding causes, CI regression gates | Lab data on a synthetic profile |
| DevTools Performance | Long tasks, layout thrash, main-thread flame chart | Your machine is faster than your users' |
| DevTools Network | Waterfalls, blocking, compression, sizes | Throttle to 4G or it lies |
| Bundle analyzer | What is in the bundle and why | Post-build only |
| CrUX / RUM | Ground truth at p75 | Lags changes by weeks |
| `web-vitals` library | Field measurement in your own app | Needs an endpoint to receive it |

**Always throttle.** Untethered on a fast machine, everything looks fine. Mid-tier mobile CPU
throttling (4×–6×) plus 4G is the profile that reflects most users.

---

## Criteria for the spec

```markdown
### UX / performance — appended by aidd-frontend
- [ ] AC-U1: LCP ≤ 2.5s on <route>, 4G + 4× CPU throttle → `npm run lighthouse:ci`
- [ ] AC-U2: INP ≤ 200ms for <primary interaction> → DevTools trace, attached
- [ ] AC-U3: CLS ≤ 0.1 on <route> → `npm run lighthouse:ci`
- [ ] AC-U4: This feature adds ≤ 30 KB gzipped to the route bundle → `npm run size`
- [ ] AC-U5: LCP image is eager, high-priority, and dimensioned → code + trace
- [ ] AC-U6: List view virtualized or paginated above 100 items → `npm test -- list.perf`
```

Note every criterion names a command. "The page should feel fast" is not verifiable and will not
be verified.

---

## Anti-patterns

- **Optimizing before measuring.** Adds complexity, fixes nothing.
- **Lazy-loading the LCP image.** Guarantees a late discovery.
- **Global `loading="lazy"`.** Same problem, applied everywhere.
- **Images without dimensions.** The top cause of CLS.
- **Importing a library whole for one function.**
- **Barrel files.** Defeat tree-shaking and pull the world into the initial chunk.
- **Testing on a fast machine untethered.** Everything passes; users disagree.
- **Treating Lighthouse as ground truth.** It is a lab tool.
- **Optimizing FID.** Replaced by INP in 2024.
- **A blocking A/B script to prevent flicker.** A deliberate LCP regression — know the trade.
- **Caching a slow query on the client.** Hides a server problem and adds a staleness bug.
- **Rendering 5,000 rows.** Virtualize.
