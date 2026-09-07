---
version: 1
name: SurgeLab marketing site
description: Light, colourful and alive. A warm off-white canvas with drifting gradient blobs, white cards that lift and shine, near-black text, one signal-orange voltage on every primary action, and five gate colours that each mean something and pass colour-vision checks. Bebas Neue display set huge and tight, DM Sans body at 17px, Space Mono for labels and numbers. Cards lift and shine on hover, numbers count up, sections reveal on scroll, and every one of those effects switches off under prefers-reduced-motion. The feel is a modern product company, not a brochure.
---

# SurgeLab DESIGN.md

Read this before changing any page in this repository. It is the same design language as the SurgeLab tool at socialtool.surgelab.co, so a customer who moves from the site to the tool should not notice a seam.

## Colours

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fbf9f4` | Page background. Warm off-white, never pure white, never grey. |
| `--bg-2` | `#f5edd6` | Cream tint for alternate sections. |
| `--bg-3` / `--card` | `#ffffff` | White sections and every card. |
| `--ink` | `#0b0a09` | Headings and body text. Near black, warm. |
| `--muted` | `#5c5651` | Secondary text. Passes AA on every surface here. |
| `--line` / `--line-2` | `#e8e1d2` / `#d9d2c2` | Card borders and dividers. |
| `--orange` | `#ff3c00` | Fills only: primary buttons (black text on it), rings, bars, glows. |
| `--orange-ink` | `#c12a00` | Orange as text. `#ff3c00` on white fails contrast for small text, so text always uses this. |

Every accent comes as a pair: a vivid fill (`--cyan`, `--blue`, `--amber`, `--green`, `--pink`, `--violet`) and a darker ink (`--cyan-ink` and so on) for text. Cards take `--accent` and `--accent-ink` together.

The five gates always use the same colour, in this order, validated for colour-vision safety on white: Found `#0891b2`, Right `#2563eb`, Clear `#ca8a04`, Bookable `#c12a00`, Proven `#0f7833`. Do not reassign them. Charts use the same inks and never more than four series.

The hero and section glows are drifting gradient blobs (orange, amber, pink, sky) blurred 70px at 35 to 55% opacity, over a faint 56px grid and a light grain.

## Typography

- Display: Bebas Neue, uppercase, line-height 0.92, letter-spacing 0.01em, `text-wrap: balance`. Hero `clamp(60px, 13.5vw, 148px)`, section titles `clamp(42px, 7.5vw, 84px)`, card titles 28 to 42px.
- Body: DM Sans 400/500/700 at 17px, line-height 1.6. Nothing user-facing below 16px on phones except source lines and chips, which are labels not reading text.
- Labels and numbers: Space Mono 400/700, 12 to 14px, letter-spacing 0.12 to 0.18em, uppercase.
- Fonts are self-hosted woff2 files in `assets/fonts` with `font-display: swap` and real fallbacks: Arial Narrow or Impact for display, system sans for body, Menlo for mono.

## Spacing and layout

- Container `min(100% - 2 * gutter, 1200px)`, gutter `clamp(18px, 4vw, 40px)`.
- Section padding `clamp(64px, 10vw, 136px)`. Section heads max 780px wide. Sections alternate off-white, cream tint and white.
- Grid gap 16px. Five gate cards go 5 across at 980px, 2 across on tablets, 1 on phones.
- Radius 18px for cards, 26px for the score card, tool window, CTA and consultancy bands, pill (999px) for buttons and chips.

## Components

- Primary button: orange fill, black text, pill, 52px min height (60px for `.btn-lg`), full width under 560px. Magnetic: it drifts a few pixels towards the pointer on desktop, lifts 2px, gains an orange shadow, and a light sweep crosses it once. Arrow nudges right. `.btn-dark` (black) is for "Book a call".
- Ghost button: white, warm grey border, black text.
- Card: white, 1px warm border, soft shadow. On hover it lifts 5px, its border and shadow take the card's accent, a mouse-following spotlight appears, and a diagonal light sweep runs once. `.card-accent` with `--accent` and `--accent-ink` picks the colour.
- Chip: mono label with a glowing dot in the accent colour.
- Eyebrow: mono, muted, preceded by a 22px orange dash.
- HUD (hero score card): the product's own score screen, with a stroke-dashoffset ring that fills to the score, a count-up number, and five gate rows that slide in one after another.
- XP bar: 8px track at 7% black, fill in the accent ink, width set by `data-fill`.
- Form field: white fill, warm grey border, 52px min height, 17px text, orange ring on focus.
- FAQ: native `details`, plus icon rotates to a cross and fills orange when open.

## Sections that exist

Hero with score card, ticker, five gates, how it works (pinned horizontal on desktop), the tool (a browser window of the dashboard on demo data), everything behind the door (bento), agents (three "so what" cards plus a swipeable roster of 27), video add-on (asset lock), proof stats, customers marquee and testimonials (sample, marked), pricing with a businesses/agencies switch, AI consultancy band (black), FAQ, CTA band (animated orange gradient), the logo video band, footer.

## Motion

- anime.js (self-hosted, deferred) drives the showy parts; the CSS reveals take over if it is missing.
- Hero: the headline flies in letter by letter, then the eyebrow, lede, buttons and chips follow; the score card springs in and its ring, number and gate rows play.
- Reveal on scroll: 36px rise plus fade, 1.1s, ease-out expo. Grids marked `data-stagger` reveal their children one after another, from the first or from the centre.
- The line chart in the tool window draws itself; bars fill; the donut sweeps; the agent feed rows drop in.
- Numbers count up over 1.4s with cubic ease-out when they enter the viewport.
- Hero: three parallax layers move at 0.16, 0.08 and 0.04 of scroll. The score card tilts up to 7 degrees towards the pointer on desktop only.
- How it works: on screens 1024px and wider, the section is 260vh tall and the three step cards slide horizontally while the section is pinned. On smaller screens they stack.
- Ticker and customer marquee: 44s and 60s linear loops, duplicated content so they never gap, paused on hover.
- Under `prefers-reduced-motion: reduce`, every animation and transition is removed, reveals are visible immediately, parallax and tilt are off, the ticker becomes a wrapped static row, and the how-it-works section stacks.

## Voice

British English. No em dashes. No AI buzzwords. Short sentences, plain words, numbers with their denominator. Say what a thing does for the reader before what it is. Never publish a rate without saying what it is out of.

## Never

- No dark mode on this site. No purple-to-blue gradients. Orange `#ff3c00` never as small text.
- No prices for agencies, no white-label fee, no per-agent prices, no clips-per-month headline.
- No client names without written permission.
- No animation that cannot be switched off.
