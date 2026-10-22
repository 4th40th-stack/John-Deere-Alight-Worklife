#!/usr/bin/env node
/**
 * `npm run astro:watch` — rebuilds the static pages on every change and mirrors
 * dist-astro/* into public/, so `next dev` (another terminal) serves current output.
 *
 * EXACTLY ONE watcher. Do not also run `astro watch` in parallel — two
 * processes racing on dist-astro/ produce partially-written public/ files.
 *
 * Usage: node scripts/astro-watch.mjs
 */
import { spawn } from "node:child_process"

const npx = process.platform === "win32" ? "npx.cmd" : "npx"
const shell = process.platform === "win32"

const watcher = spawn(npx, ["astro", "build", "--watch"], {
  stdio: ["ignore", "pipe", "inherit"],
  shell,
})

// Astro prints a summary line per completed build; debounce and re-sync.
let pending = null
const sync = () => {
  if (pending) clearTimeout(pending)
  pending = setTimeout(() => {
    spawn(process.execPath, ["scripts/sync-astro-pages.mjs"], { stdio: "inherit" })
  }, 150)
}

watcher.stdout.on("data", (chunk) => {
  const text = String(chunk)
  process.stdout.write(text)
  if (text.includes("page(s) built")) sync()
})

watcher.on("exit", (code) => process.exit(code ?? 0))

const shutdown = () => { watcher.kill(); process.exit(0) }
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
