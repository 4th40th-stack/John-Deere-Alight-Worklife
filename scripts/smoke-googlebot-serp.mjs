#!/usr/bin/env node
/**
 * Post-deploy Googlebot smoke for SERP Layer 1–5 signals.
 *
 * Usage:
 *   node scripts/smoke-googlebot-serp.mjs https://www.example.com/
 *   ORIGIN=https://www.example.com node scripts/smoke-googlebot-serp.mjs
 *
 * Asserts on `/` HTML as Googlebot:
 *   - JSON-LD WebSite.name present
 *   - BreadcrumbList with Home + Sign in to …
 *   - meta description has no raw host/URL
 *   - applicationName / og:site_name present
 */

const originArg = process.argv[2] || process.env.ORIGIN || ""
const origin = originArg.replace(/\/$/, "")

if (!origin || !/^https?:\/\//i.test(origin)) {
  console.error("Usage: node scripts/smoke-googlebot-serp.mjs https://your-domain.com/")
  process.exit(2)
}

const url = `${origin}/`
const ua =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

const failures = []

function fail(msg) {
  failures.push(msg)
}

const res = await fetch(url, {
  headers: { "user-agent": ua, accept: "text/html" },
  redirect: "follow",
})

if (!res.ok) {
  fail(`HTTP ${res.status} for ${url}`)
} else {
  const html = await res.text()
  const linkHeader = res.headers.get("link") || ""

  if (!/"@type"\s*:\s*"WebSite"/i.test(html) && !/"@type":"WebSite"/i.test(html)) {
    fail("missing JSON-LD WebSite")
  }
  if (!/"name"\s*:\s*"[^"]{2,}"/i.test(html)) {
    fail("missing JSON-LD name field")
  }
  if (!/BreadcrumbList/i.test(html)) {
    fail("missing BreadcrumbList")
  }
  if (!/"Home"/i.test(html)) {
    fail('BreadcrumbList missing "Home"')
  }
  if (!/Sign in to /i.test(html)) {
    fail('BreadcrumbList missing "Sign in to …"')
  }

  const desc =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)?.[1] ||
    ""
  if (!desc) {
    fail("missing meta description")
  } else if (/https?:\/\//i.test(desc) || /\bwww\./i.test(desc)) {
    fail("meta description contains raw URL/host")
  }

  if (!/applicationName/i.test(html) && !/og:site_name/i.test(html)) {
    fail("missing applicationName / og:site_name")
  }

  if (linkHeader && !/rel=["']?canonical["']?/i.test(linkHeader)) {
    // Link header optional on non-Astro deploys; warn only when present without canonical
    fail(`Link header present but missing rel=canonical: ${linkHeader}`)
  }
}

if (failures.length) {
  console.error(`smoke-googlebot-serp FAILED for ${url}`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(`smoke-googlebot-serp OK — ${url}`)
