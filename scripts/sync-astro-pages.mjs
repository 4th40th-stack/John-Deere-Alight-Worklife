#!/usr/bin/env node
/**
 * Copy the built Astro pages (dist-astro/*) into public/ so the Next.js
 * middleware rewrite for `/` can serve them:
 *   public/index.html        ← human landing
 *   public/crawler-seo.html  ← crawler SEO twin
 *   public/_astro/           ← hashed CSS/JS/font/image assets
 *
 * Fails the build if either page is missing. Runs FIRST in `prebuild`, before
 * the audit scripts, so the audits always validate a real build.
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const src = path.join(root, "dist-astro")
const dest = path.join(root, "public")

const REQUIRED = ["index.html", "crawler-seo.html"]

if (!fs.existsSync(src)) {
  console.error("FAIL astro sync: dist-astro/ missing — run `astro build` first.")
  process.exit(1)
}

for (const file of REQUIRED) {
  if (!fs.existsSync(path.join(src, file))) {
    console.error(`FAIL astro sync: dist-astro/${file} missing — astro build incomplete.`)
    process.exit(1)
  }
}

// Only build output — never dotfiles (the publicDir .gitkeep placeholder and
// .DS_Store have no business in the Next public/ tree).
let copied = 0
for (const entry of fs.readdirSync(src)) {
  if (entry.startsWith(".")) continue
  fs.cpSync(path.join(src, entry), path.join(dest, entry), { recursive: true })
  copied++
}

/**
 * Prune STALE hashed assets from public/_astro/.
 *
 * Vite emits content-hashed filenames (e.g. brand-images.BlrjVHsx.css). Every
 * rebuild produces a NEW hash, so without pruning the previous build's files
 * accumulate forever. That matters for two reasons:
 *
 *   1. `next start` snapshots the public/ tree at boot. Assets written AFTER
 *      the server boots are invisible to it and 404, so a stale-but-present
 *      file can shadow the live one and silently strip the landing's CSS.
 *   2. A pruned tree makes "is the served CSS the one this build produced?"
 *      answerable by inspection.
 *
 * Only files under public/_astro/ are touched — the Next-owned assets in
 * public/ (favicons, brand logos, og-image, fonts) are never removed.
 */
const ASTRO_ASSET_DIR = "_astro"
const srcAssets = path.join(src, ASTRO_ASSET_DIR)
const destAssets = path.join(dest, ASTRO_ASSET_DIR)

if (fs.existsSync(srcAssets) && fs.existsSync(destAssets)) {
  const keep = new Set(fs.readdirSync(srcAssets))
  let pruned = 0
  for (const entry of fs.readdirSync(destAssets)) {
    if (keep.has(entry)) continue
    fs.rmSync(path.join(destAssets, entry), { recursive: true, force: true })
    pruned++
  }
  if (pruned > 0) {
    console.log(`OK astro sync: pruned ${pruned} stale ${ASTRO_ASSET_DIR}/ asset(s)`)
  }
}

console.log(`OK astro sync: ${REQUIRED.join(", ")} + assets → public/ (${copied} entries)`)
