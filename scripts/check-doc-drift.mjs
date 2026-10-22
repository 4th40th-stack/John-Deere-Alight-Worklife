#!/usr/bin/env node
/**
 * Pack doc-drift guard — Sleipnir prompt pack.
 * Usage: node Steins Gate/scripts/check-doc-drift.mjs [pack-root]
 * Exit 1 if any check fails.
 *
 * WHY THIS EXISTS
 *   This pack states the same rule in several places on purpose: a Step prompt
 *   an agent actually reads, and the kit file it must match. Those copies drift.
 *   Three failures have already been found and fixed by hand (a dead
 *   `<link rel="manifest">`, a "keep the icons block because the audit greps the
 *   layout" rationale that stopped being true after the Astro conversion, and
 *   links pointing out of the pack at sibling projects). This script makes all
 *   three impossible to reintroduce silently.
 *
 * THREE RULE SETS
 *   1. DRIFT            — every copy of a duplicated claim still carries the
 *                         owner's tokens, and none carries a retired rationale.
 *   2. SELF-CONTAINMENT — no link or path in the pack resolves outside the pack
 *                         root. This pack must never point at a sibling project.
 *   3. BRAND HYGIENE    — no tenant/client brand appears in pack documentation.
 *
 * HONEST LIMIT
 *   Rule 1 proves a copy is PRESENT AND CURRENT. It cannot prove that redundant
 *   prose was fully removed from a document, and it cannot prove a rewritten
 *   sentence still reads well. Removing leftover duplication stays a review task.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PACK_ROOT = path.resolve(process.argv[2] ?? path.join(SCRIPT_DIR, "..", ".."))

const failures = []
const notes = []

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function abs(rel) {
  return path.join(PACK_ROOT, rel)
}

function read(rel) {
  try {
    return fs.readFileSync(abs(rel), "utf8")
  } catch {
    return null
  }
}

function exists(rel) {
  return fs.existsSync(abs(rel))
}

function mdFiles(dir = PACK_ROOT, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".git")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) mdFiles(full, out)
    else if (entry.name.endsWith(".md")) out.push(full)
  }
  return out
}

/** Single-line token test: markdown hard-wraps prose, so a multi-word phrase
 *  spanning a line break would never match. Callers must pick safe tokens. */
function hasToken(text, token) {
  return text.split("\n").some((line) => line.includes(token))
}

// ---------------------------------------------------------------------------
// RULE SET 1 — DRIFT
// Each claim names its OWNER (where the rule lives) and every COPY that must
// agree with it.
// ---------------------------------------------------------------------------
const CLAIMS = [
  {
    id: "renderer-ownership",
    owner: "Steins Gate/instruction.md",
    note: "Astro owns / + the twin; Next owns everything else",
    required: ["RENDERER OWNERSHIP"],
    copies: [
      "Steins Gate/instruction.md",
      "Steins Gate/NEW_PROJECT_CHECKLIST.md",
      "Steins Gate/SEO_CRAWLER_RULES.md",
      "Astro Hybrid/instruction.md",
      "Astro Hybrid/README.md",
      "Astro Hybrid/NEW_PROJECT_CHECKLIST.md",
    ],
  },
  {
    id: "astro-head-is-the-served-head",
    owner: "Astro Hybrid/astro-src/components/seo-head.astro",
    note: "brand assets + head parity are checked against the Astro head, not app/layout.tsx",
    required: ["seo-head.astro"],
    forbidden: ["audit-brand-assets.mjs` greps", "greps the layout"],
    copies: [
      "Steins Gate/NEW_PROJECT_CHECKLIST.md",
      "Steins Gate/scripts/audit-brand-assets.mjs",
      "Astro Hybrid/snippets/layout-astro-strip.md",
      "Astro Hybrid/NEW_PROJECT_CHECKLIST.md",
      "Step 1 — Build Landing UI — Multi-Viewport Clone Prompt.md",
      "Step 3 — Telegram and Database Integration Prompt.md",
    ],
  },
  {
    id: "manifest-removed",
    owner: "Astro Hybrid/astro-src/components/seo-head.astro",
    note: "no PWA manifest on login clones; layout metadata must drop the key",
    required: ["manifest"],
    copies: [
      "Steins Gate/NEW_PROJECT_CHECKLIST.md",
      "Astro Hybrid/snippets/layout-astro-strip.md",
      "Astro Hybrid/NEW_PROJECT_CHECKLIST.md",
      "Step 1 — Build Landing UI — Multi-Viewport Clone Prompt.md",
      "Step 3 — Telegram and Database Integration Prompt.md",
    ],
  },
  {
    id: "error-icon-provenance",
    owner: "Steins Gate/instruction.md",
    note: "error-icon.png is COPIED from the kit, never generated",
    required: ["error-icon.png"],
    copies: [
      "Steins Gate/instruction.md",
      "Steins Gate/NEW_PROJECT_CHECKLIST.md",
      "Step 4 — Steins Gate Prompt.md",
    ],
  },
  {
    id: "seo-json-ld-module",
    owner: "Step 1 — Build Landing UI — Multi-Viewport Clone Prompt.md",
    note: "the Astro templates need a project-owned SeoJsonLd module",
    required: ["seo-json-ld"],
    copies: [
      "Step 1 — Build Landing UI — Multi-Viewport Clone Prompt.md",
      "Astro Hybrid/instruction.md",
      "Astro Hybrid/NEW_PROJECT_CHECKLIST.md",
    ],
  },
  {
    id: "authority-model",
    owner: "Steins Gate/instruction.md",
    note: "two-axis authority: prompts own sequence, kit owns its own files",
    required: ["AUTHORITY MODEL"],
    copies: [
      "Steins Gate/instruction.md",
      "Step 3 — Telegram and Database Integration Prompt.md",
      "Step 4 — Steins Gate Prompt.md",
    ],
  },
  {
    id: "crawler-ua-single-owner",
    owner: "Step 4 — Steins Gate Prompt.md",
    note: "Step 4 owns lib/crawler-ua.ts; earlier steps may copy it as a prerequisite",
    required: ["crawler-ua"],
    copies: [
      "Step 1 — Build Landing UI — Multi-Viewport Clone Prompt.md",
      "Step 4 — Steins Gate Prompt.md",
      "Astro Hybrid/instruction.md",
      "Astro Hybrid/NEW_PROJECT_CHECKLIST.md",
    ],
  },
  {
    id: "error-screen-canonical-geometry",
    owner: "Steins Gate/instruction.md",
    note: "canonical ErrorScreen geometry (42rem/72px) + its audit must stay in every copy; the zoom counter rule is retired",
    required: ["42rem", "72px", "audit-error-screen.mjs"],
    forbidden: ["zoom: 1 / <factor>"],
    copies: [
      "Steins Gate/instruction.md",
      "Steins Gate/NEW_PROJECT_CHECKLIST.md",
      "Step 4 — Steins Gate Prompt.md",
      "Testing 3 — Steins Gate, CrawlerSeoPage & Audits Prompt.md",
      "Steins Gate/README.md",
      "Master — Full Project Pipeline Prompt.md",
    ],
  },
]

for (const claim of CLAIMS) {
  for (const copy of claim.copies) {
    const text = read(copy)
    if (text === null) {
      failures.push(`${claim.id}: copy missing — ${copy}`)
      continue
    }
    for (const token of claim.required ?? []) {
      if (!hasToken(text, token)) {
        failures.push(`${claim.id}: ${copy} no longer mentions "${token}" (owner: ${claim.owner})`)
      }
    }
    for (const token of claim.forbidden ?? []) {
      if (hasToken(text, token)) {
        failures.push(
          `${claim.id}: ${copy} still carries the RETIRED rationale "${token}" (owner: ${claim.owner})`,
        )
      }
    }
  }
}

// Live-manifest assertion: the production head must not advertise a manifest.
// Comments are stripped first — documenting a removed tag is not shipping it.
{
  const rel = "Astro Hybrid/astro-src/components/seo-head.astro"
  const raw = read(rel)
  if (raw === null) {
    failures.push(`live-manifest: ${rel} missing`)
  } else {
    const code = raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .split("\n")
      .filter((l) => {
        const t = l.trim()
        return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*"))
      })
      .join("\n")
    if (/rel\s*=\s*["']manifest["']/.test(code)) {
      failures.push(`${rel}: emits <link rel="manifest"> — no PWA on login clones`)
    }
    for (const must of ["icon-32x32.png", "apple-touch-icon", "canonical", "og:image"]) {
      if (!code.includes(must)) failures.push(`${rel}: head lost "${must}"`)
    }
  }
}

// audit-brand-assets.mjs must stay comment-aware, or it fails on its own docs.
{
  const rel = "Steins Gate/scripts/audit-brand-assets.mjs"
  const text = read(rel)
  if (text === null) failures.push(`brand-audit: ${rel} missing`)
  else if (!text.includes("stripComments")) {
    failures.push(`${rel}: lost stripComments() — it would flag commented-out markup as live`)
  }
}

// ---------------------------------------------------------------------------
// RULE SET 2 — SELF-CONTAINMENT
// ---------------------------------------------------------------------------
const OUT_OF_PACK_PATTERNS = [
  { re: /\]\(\.\.\/\.\.\//g, what: "markdown link escaping two levels (leaves the pack)" },
  { re: /`\.\.\/\.\.\//g, what: "backticked path escaping two levels (leaves the pack)" },
  { re: /`MGerald\//g, what: "reference to a sibling project under MGerald/" },
  { re: /`Tobi\//g, what: "reference to a sibling project under Tobi/" },
  { re: /`Dada\//g, what: "reference to a sibling project under Dada/" },
  { re: /`Abdullahi\//g, what: "reference to a sibling project under Abdullahi/" },
  { re: /\btarget_benefits_login\b/g, what: "reference to out-of-pack target_benefits_login directory" },
  { re: /\bCloudFaire-Batch-Script\b/g, what: "reference to an out-of-pack sibling tool" },
]

for (const file of mdFiles()) {
  const rel = path.relative(PACK_ROOT, file)
  const text = fs.readFileSync(file, "utf8")
  for (const { re, what } of OUT_OF_PACK_PATTERNS) {
    re.lastIndex = 0
    const m = re.exec(text)
    if (m) {
      const line = text.slice(0, m.index).split("\n").length
      failures.push(`self-containment: ${rel}:${line} — ${what} (${m[0]})`)
    }
  }
}

// ---------------------------------------------------------------------------
// RULE SET 3 — BRAND HYGIENE
//
// PLATFORM names are the products being cloned and stay everywhere:
//   Alight, Worklife, WealthCare, UPoint, WEX, LH1, OnDemand,
//   BenefitExpress, Plansource, Aptia, Alegeus
//
// TENANT/CLIENT names are the strings that must never reach a page, so they do
// not belong in pack documentation either.
//
// Matching is CASE-SENSITIVE and word-bounded.
//
// KNOWN GAP — "Target" is deliberately NOT in this list. This pack uses the word
// "target" constantly as ordinary domain vocabulary ("the target project",
// "Target Analysis", "TARGET URL", "target research"), capitalised or not. A
// denylist entry for it produced ~40 false positives across the Step prompts and
// would train everyone to ignore this check entirely. The retailer name is still
// banned by tenant checks in keyword validation, so the leak this rule exists to
// prevent remains prevented; only the doc-level detection of that one word is given up.
// ---------------------------------------------------------------------------
const TENANT_DENYLIST =
  /\b(Moody|Moodys|Ford|BOA|Bank of America|Home ?Depot|HomeDepot|Caterpillar|Navistar|GaBreeze|Veralto|Wipro|ExxonMobil|Exxon|Schneider|Sentinel|Gusto|Highmark|SiemensEnergy|Siemens|PepsiCo|Pepsi|Kroger)\b/

for (const file of mdFiles()) {
  const rel = path.relative(PACK_ROOT, file)
  const text = fs.readFileSync(file, "utf8")
  const lines = text.split("\n")
  for (let i = 0; i < lines.length; i++) {
    TENANT_DENYLIST.lastIndex = 0
    const m = TENANT_DENYLIST.exec(lines[i])
    if (m) {
      failures.push(`brand-hygiene: ${rel}:${i + 1} — tenant name "${m[1]}" in pack docs`)
    }
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
if (failures.length) {
  console.error(`FAIL doc-drift (pack root: ${PACK_ROOT})`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error(`\n${failures.length} problem(s). Fix the owner first, then re-sync every copy.`)
  process.exit(1)
}

console.log(`OK doc-drift — ${CLAIMS.length} claims × copies, self-containment, brand hygiene`)
for (const n of notes) console.log(`  note: ${n}`)
