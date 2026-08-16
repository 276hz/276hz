# Design system

Reference for the tokens in `assets/css/style.css` and the enhancement layer
in `assets/js/motion.js`. Two themes, switched via `data-theme` on `<html>`
and persisted to `localStorage`.

## Concept

- **Dark = "Neon Circuit"** — magenta + cyan on deep violet-black.
- **Light = "Pop Paper"** — the same ink, on a soft bright page.

Neo-brutalist bones (hard offset shadows, bold 2–3px borders, monospace
type) stayed; the color language got louder and the motion got a second,
richer layer on top.

## Color tokens

| Token | Dark | Light | Contrast vs. `--bg` |
|---|---|---|---|
| `--text` | `#f5f0ff` | `#23113f` | 17.9 : 1 (dark) · 16.3 : 1 (light) |
| `--text-muted` | `#b19fdb` | `#6b5490` | 8.5 : 1 (dark) · 6.1 : 1 (light) |
| `--accent` | `#ff2ec4` | `#c2127f` | 6.2 : 1 (dark) · 5.4 : 1 (light) |
| `--accent-2` | `#00e5ff` | `#067190` | 13.0 : 1 (dark) · 5.3 : 1 (light) |
| `--danger` | `#ff5544` | `#b23417` | 6.3 : 1 (dark) · 5.9 : 1 (light) — reserved, unused |
| `--bg` | `#0d0221` | `#fef7ff` | — |
| `--bg-card` | `#170a35` | `#ffffff` | — |
| `--border` | `#3d2168` | `#ecd3f2` | — |

Every text-bearing pair clears **WCAG AA (4.5:1)** in both themes.

## Typography

Self-hosted **JetBrains Mono** (WOFF2, `assets/fonts/`, SIL OFL license
included). The name/headline now renders as an animated gradient fill
(`accent → accent-glow → accent-2`, cycling via `background-position`) with
a soft neon `drop-shadow`, at a larger, responsive size
(`clamp(2.1rem, 6vw, 3.4rem)`). There's a `@supports not (background-clip:
text)` fallback to a flat accent color for the rare browser without
gradient-text support, so the name is never left actually invisible.

## Motion — two layers

**Layer 1 (`style.css`, always active):** CSS keyframes and transitions —
staggered `--i`-indexed entrances, `--ease-bounce`
(`cubic-bezier(0.34, 1.56, 0.64, 1)`) on small interactive elements, drifting
background blobs, profile-frame glow pulse, status-dot ripple, logo bob,
footer heartbeat, theme-icon pop, copy-button checkmark morph. This layer
is the entire experience on its own and needs nothing else to work.

**Layer 2 (`assets/js/motion.js`, progressive enhancement):** loads
[GSAP](https://gsap.com) core from a CDN and, only if it actually loaded
and the visitor doesn't prefer reduced motion, layers on:

- **Cursor follower** — a tight dot + a trailing ring, fine-pointer
  devices only (`(hover: hover) and (pointer: fine)`); scales up over
  links/buttons/chips.
- **Magnetic pull** on the two header buttons only (menu + theme toggle).
  Applying this everywhere reads as noisy rather than delightful — capped
  at 1–2 focal elements per screen deliberately.
- **Character-split name reveal** — a small hand-rolled stand-in for
  GSAP's paid SplitText plugin (wraps each letter in its own `<span>`,
  animates them with a staggered `expo.out` tween). The full string is
  set as an `aria-label` on the parent and the per-letter spans are
  `aria-hidden`, so screen readers get the real text, not one node per
  letter.
- **Grid-aware stagger** for skill chips (`back.out(1.5)`, wave-from-start
  across the wrapped flex grid), simpler list stagger for projects/contact
  rows. Re-plays every time a panel is (re-)shown, not just on first load.
- **3D tilt** on project cards, following the cursor, clamped to a small
  rotation range and reset on `mouseleave`.
- A choreographed **intro timeline** (logo → header buttons → profile
  frame → name characters → bio → meta chips) replacing the simpler
  single-fade entrance for these specific elements once JS is driving them
  — `style.css` hands off with a `.gsap-ready` class rather than
  double-animating the same properties.

**Why this split:** if the CDN request for GSAP fails — network hiccup,
an ad-blocker, someone running the page offline — `assets/js/motion.js`
checks `typeof window.gsap` first and quietly does nothing. The rest of
the site (Layer 1) doesn't know or care; nothing breaks, nothing looks
half-finished. `prefers-reduced-motion` is checked again independently in
JS (Layer 1's CSS-only reduced-motion rule can't reach into inline styles
that GSAP sets directly, so Layer 2 needs its own guard — it bails out
before doing anything, including adding `.gsap-ready`).

**Deliberately not used:** GSAP's SplitText and Flip plugins. `motion.csv`
(the data this was built from, in `ui-ux-pro-max`) flags SplitText as a
paid/Club plugin needing a license check before shipping — since that
can't be verified here, the character-split reveal above and the
panel-switch animations are hand-rolled with GSAP core instead, which is
and always has been free.

## Navigation

Panels (About/Skills/Projects/Contact) are reflected in `location.hash`,
so they're bookmarkable/shareable and back/forward move through panel
history instead of leaving the page.

## Localization

`<html lang="vi">`, and the split is deliberate rather than all-or-nothing:

- **English** — nav labels, section/group titles, status/role/location
  chips, toasts, `aria-label`s, empty-state and error copy, meta/OG/Twitter
  tags, the 404 page, all proper nouns (GitHub, PayPal, JavaScript,
  Node.js, …). This is the "professional terminology" layer — the
  convention a Vietnamese developer audience aiming at international
  roles would actually expect, not a literal translation of UI chrome.
- **Vietnamese** — only the About paragraphs, the one section that's
  explicitly personal narrative in the visitor's own words.
- **"MENU"** stays as-is either way — a fully-absorbed loanword in
  Vietnamese tech UI.
- `README.md`, this file, and `LICENSE` stay in English — they're for
  other developers/employers reading the repo, not site visitors.

## Icons

[Remix Icon](https://remixicon.com/) throughout (SVG font, loaded via CDN) —
no emoji-as-icon, one consistent icon system across nav, skills, projects,
and contact rows.
