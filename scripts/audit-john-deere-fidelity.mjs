#!/usr/bin/env node
/**
 * John Deere landing-UI fidelity audit.
 *
 * Asserts that styles/dell-auth-shell.css and the header/footer/layout
 * components still carry the decisions reverse-engineered from the live
 * target:
 *
 *   https://worklife.alight.com/ah-angular-afirst-web/#/web/deere/login?forkPage=false
 *
 * Every expectation below is a measured value (getBoundingClientRect +
 * getComputedStyle under headless Chrome at an exact viewport) — see
 * docs/target-evidence/geometry-report.json for the delta table.
 *
 * Run:  node scripts/audit-john-deere-fidelity.mjs .
 * Exit: 0 = every expectation holds, 1 = at least one drifted.
 *
 * WHY A SCRIPT AND NOT A COMMENT: the fidelity work is easy to regress from
 * an unrelated edit, and several John Deere decisions are the INVERSE of the
 * AutoZone sibling's (this tenant HAS a hero and app badges; AutoZone has
 * neither). A drift here means the clone has silently stopped matching the
 * tenant it exists to reproduce, so it fails the build.
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(process.argv[2] ?? ".")
const cssPath = path.join(root, "styles", "dell-auth-shell.css")

const failures = []

function css() {
  if (!fs.existsSync(cssPath)) {
    console.error(`FAIL john-deere fidelity: ${cssPath} not found`)
    process.exit(1)
  }
  return fs.readFileSync(cssPath, "utf8")
}

function source(rel) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) {
    failures.push(`missing file: ${rel}`)
    return ""
  }
  return fs.readFileSync(p, "utf8")
}

/** Every entry must appear verbatim in the stylesheet. */
function expectCss(label, needle) {
  if (!css().includes(needle)) {
    failures.push(`CSS  ${label}: expected to find ${JSON.stringify(needle)}`)
  }
}

/** Every entry must be present (or absent, when `present` is false). */
function expectIn(label, rel, needle, present = true) {
  const found = source(rel).includes(needle)
  if (present && !found) failures.push(`FILE ${label}: ${rel} must contain ${JSON.stringify(needle)}`)
  if (!present && found) failures.push(`FILE ${label}: ${rel} must NOT contain ${JSON.stringify(needle)}`)
}

// ---------------------------------------------------------------------------
// 1. Brand colour — measured rgb(54, 124, 43) on the target's brand bar and
//    Virtual Assistant pill. John Deere green, not AutoZone orange.
// ---------------------------------------------------------------------------
expectCss("brand colour token", "--brand-color: #367c2b")
expectCss("brand hover token", "--brand-color-hover: #2c6322")
expectCss("button primary token", "--button-primary: #1c68bf")
expectCss("button primary hover token", "--button-primary-hover: #001f6b")

// ---------------------------------------------------------------------------
// 2. Authentic typography — the target loads FS Thrive Elliot Web
// ---------------------------------------------------------------------------
for (const weight of ["Regular", "Bold", "Heavy", "Light", "Italic"]) {
  expectCss(
    `font face ${weight}`,
    `url("/fonts/FSThriveElliotWeb-${weight}.woff") format("woff")`,
  )
}
expectCss("body font stack", '"FS Thrive Elliot Web", "Outfit"')

// ---------------------------------------------------------------------------
// 3. Brand bar — 8px, full bleed, brand colour
// ---------------------------------------------------------------------------
expectCss("brand bar height", "height: 8px")
expectCss("brand bar fill", "background-color: var(--f-default-color, var(--brand-color))")

// ---------------------------------------------------------------------------
// 4. Virtual Assistant — one control, two placements
//      < 1024px  a full-bleed pill in its own row under the header
//      >= 1024px a content-sized 178x40 pill inside the header's right cluster
// ---------------------------------------------------------------------------
expectCss("VA row padding", "padding: 16px 16px 0")
expectCss("VA glow", "box-shadow: 0 0 8px 0 var(--brand-color)")
expectCss("VA glyph box", "width: 24px")
expectCss("VA button padding", "padding: 0 16px")
expectIn("VA in layout", "components/auth/auth-page-layout.tsx", "VirtualAssistantButton")
expectIn("VA component", "components/auth/virtual-assistant-button.tsx", "Virtual Assistant")
expectIn("VA in header", "components/auth/auth-shell-header.tsx", "VirtualAssistantButton")

// ---------------------------------------------------------------------------
// 5. Main region — TWO columns (login + hero). This tenant is the mirror
//    image of AutoZone: it HAS a promo image and renders it at every width.
//    Measured: row capped at 1440px and centred, gap 0.
//      <768px       stacked, each 100%     375:  375 / 375 below
//      768-1023px   50% / 50%              1023: 512 / 512
//      >=1024px     33.3333% / 66.6667%    1440: 480 / 960 (capped there)
//    The 65px offset is the gap from the header block to the H1 and hero top.
// ---------------------------------------------------------------------------
expectCss("main cap", "max-width: 1440px")
expectCss("main offset", "padding: 65px 0 0 0")
expectCss("no column gap", "column-gap: 0")
expectCss("main grid default", "grid-template-columns: 50% 50%")
expectCss("main grid large", "grid-template-columns: 33.3333% 66.6667%")
expectCss(
  "main grid stacked",
  "@media (max-width: 767.98px) {\n  .main-wrapper {\n    grid-template-columns: 1fr;",
)
expectCss("login gutter (small)", "padding: 0 16px 16px")
expectCss("login gutter (large)", "padding: 0 24px 24px")
expectCss("hero fills column", "width: 100%")
expectCss("hero no invented motion", "max-width: none")

// ---------------------------------------------------------------------------
// 6. The H1 spans the whole column content box — it is NOT capped at 432px.
// ---------------------------------------------------------------------------
expectCss("heading fills column", "max-width: 100%")

// ---------------------------------------------------------------------------
// 7. Header — John Deere renders NEITHER a hamburger nor a language selector:
//    the target's left group is the logo lockup alone (the mark sits at x=24
//    even at 375px) and its right cluster holds the Virtual Assistant alone.
// ---------------------------------------------------------------------------
expectIn("no hamburger", "components/auth/auth-shell-header.tsx", "AuthShellHeaderMobileMenu", false)
expectIn("no language control", "components/auth/auth-shell-header.tsx", "AuthShellHeaderLanguage", false)
expectCss("header cluster hidden below 1024", ".header-right {\n  display: none;\n}")
expectCss("header cluster shown from 1024", "gap: 16px;")
expectCss("f-icon box", "width: 16px")
expectCss("logo max width", "max-width: 216px")
expectCss("logo max width (sub-l)", "max-width: 144px")

// ---------------------------------------------------------------------------
// 8. Responsive boundaries — the target's queries are min-width based
//    (320 / 768 / 1024 / 1280 / 1440). A `max-width: 768px` query also fires
//    AT 768px, one pixel too late, so the fractional form is required.
// ---------------------------------------------------------------------------
expectCss("1024 boundary", "@media (max-width: 1023.98px)")
expectCss("768 boundary", "@media (max-width: 767.98px)")
if (css().includes("@media (max-width: 1024px)") || css().includes("@media (max-width: 768px)")) {
  failures.push(
    "CSS  breakpoint boundary: `max-width: 1024px` / `768px` fire one pixel too late; use 1023.98px / 767.98px",
  )
}

// ---------------------------------------------------------------------------
// 9. Card — 2px #dedede border, 10px radius, no shadow; fills the column
// ---------------------------------------------------------------------------
expectCss("card border", "border: 2px solid rgb(222, 222, 222)")
expectCss("card radius", "border-radius: 10px")
expectCss("card shadow", "box-shadow: none")

// ---------------------------------------------------------------------------
// 10. Form — stacked label, required-marker colours
// ---------------------------------------------------------------------------
expectCss("field label stacked", "display: block")
expectCss("required text colour", "color: rgb(102, 102, 102)")
expectCss("required symbol colour", "color: rgb(198, 26, 26)")
expectIn("required marker", "components/auth/user-id-step.tsx", "f-label-text__required-symbol")
expectIn("required label text", "components/auth/user-id-step.tsx", "(Required)")

// ---------------------------------------------------------------------------
// 11. Buttons — 40px tall, 20px radius, brand progressive, #949494 disabled
// ---------------------------------------------------------------------------
expectCss("button height", "height: 40px")
expectCss("button radius", "border-radius: 20px")
expectCss("progressive fill", "background-color: var(--button-primary)")
expectCss("disabled fill", "background-color: rgb(148, 148, 148)")

// ---------------------------------------------------------------------------
// 12. Footer — 1200px centred content block (its content starts at x=132 on a
//     1440px page), 12px padding, 13px legal links, left-aligned copyright,
//     and two LINK COLUMNS whose split changes with the breakpoint.
// ---------------------------------------------------------------------------
expectCss("footer background", "background-color: rgb(249, 249, 249)")
expectCss("footer cap", "max-width: 1200px")
expectCss("footer padding", "padding: 12px")
expectCss("legal link size", "font-size: 13px")
expectCss("copyright size", "font-size: 14px")
// Two INDEPENDENT stacks (rows must not be shared between columns), and the
// tracks that make the measured 207px / 268px columns with an 80px gap.
expectCss("footer nav two stacks", "grid-template-columns: 207px minmax(0, 1fr)")
expectCss("footer nav Alight gap", "column-gap: 80px")
expectCss("footer nav independent columns", ".f-footer-nav-column {\n  min-width: 0;")
expectIn("footer column split", "components/auth/auth-shell-footer.tsx", "FOOTER_NAV_COLUMN_RIGHT")
expectIn("Contact Us moves below 768", "components/auth/auth-shell-footer.tsx", "f-footer-nav-item-mobile")

// ---------------------------------------------------------------------------
// 13. Content decisions this tenant makes (the inverse of AutoZone's)
// ---------------------------------------------------------------------------
expectIn("welcome title", "lib/auth-copy.ts", '"Welcome to Alight Worklife"')
expectIn("brand name", "lib/brand-config.ts", 'BRAND_FULL_SITE_NAME = "John Deere Alight Worklife"')
expectIn("login url", "lib/brand-config.ts", "#/web/deere/login")
expectIn("project id", "lib/project-config.ts", 'PROJECT_ID = "john-deere-alight-worklife"')
expectIn("canonical origin", "lib/site-url.ts", "https://www.johndeerebenefit.com")
expectIn("hero asset listed", "lib/brand-config.ts", "/hero-logon-page.jpg")

const footer = source("components/auth/auth-shell-footer.tsx")
if (!footer.includes("app-store-badge") || !footer.includes("google-play-badge")) {
  failures.push("FILE footer: the John Deere tenant renders BOTH app-store badges")
}
if (footer.includes("Medical Plans")) {
  failures.push("FILE footer: the John Deere tenant has no plan-year link")
}
const layout = source("components/auth/auth-page-layout.tsx")
if (!layout.includes("hero-container") || !layout.includes("heroSrc")) {
  failures.push("FILE layout: the John Deere tenant renders a hero/promo image")
}
const client = source("app/login-page-client.tsx")
if (!client.includes("AUTH_HERO_IMAGES")) {
  failures.push("FILE landing client: app/login-page-client.tsx must mount a hero image")
}

// ---------------------------------------------------------------------------
// 14. ZERO DEAD LINKS (Phase 3E) — `href="#"` is banned everywhere
// ---------------------------------------------------------------------------
const deadLinkFiles = [
  "components/auth/auth-shell-footer.tsx",
  "components/site-footer.tsx",
  "app/forgot-password/page.tsx",
  "app/new-user/page.tsx",
  "components/auth/auth-page-layout.tsx",
  "components/auth/auth-shell-header.tsx",
  "components/auth/user-id-step.tsx",
]
for (const rel of deadLinkFiles) {
  if (source(rel).includes('href="#"')) {
    failures.push(`FILE dead link: ${rel} still contains href="#"`)
  }
}

// ---------------------------------------------------------------------------
// 15. Brand assets present
// ---------------------------------------------------------------------------
for (const asset of [
  "public/john-deere-logo.svg",
  "public/hero-logon-page.jpg",
  "public/alight_worklife_logo_black.svg",
  "public/app-store-badge.png",
  "public/google-play-badge.png",
  "public/fonts/FSThriveElliotWeb-Regular.woff",
  "public/fonts/FSThriveElliotWeb-Bold.woff",
]) {
  if (!fs.existsSync(path.join(root, asset))) {
    failures.push(`ASSET missing: ${asset}`)
  }
}

// ---------------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`FAIL john-deere fidelity: ${failures.length} expectation(s) drifted`)
  for (const f of failures) console.error("  -", f)
  process.exit(1)
}

console.log("OK John-Deere-Alight-Worklife (landing UI fidelity — target-matched)")
