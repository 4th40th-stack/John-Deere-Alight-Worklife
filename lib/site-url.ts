import { PROJECT_DISPLAY_NAME } from "./project-config"

/** Display name for notifications and metadata. */
export const SITE_DISPLAY_NAME = PROJECT_DISPLAY_NAME

/** Canonical origin (no trailing slash) — production hostname, exactly as pasted by the operator. */
export const SITE_ORIGIN = "https://www.johndeerebenefit.com" as const

export const SITE_URL = SITE_ORIGIN

export const SITE_HOMEPAGE_CANONICAL = `${SITE_ORIGIN}/` as const

/** Bump when homepage SEO copy changes materially (used for sitemap lastmod). */
export const SITE_CONTENT_UPDATED_AT = "2026-08-10T09:00:00.000Z" as const

export const SITE_SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml` as const

export const CANONICAL_HOST = new URL(SITE_ORIGIN).hostname

/** Apex host (www-stripped) — for keyword binding. */
export const CANONICAL_APEX = CANONICAL_HOST.replace(/^www\./, "")

/** www-variant host — covers the www primary-host case without hardcoding a domain. */
export const CANONICAL_WWW_HOST = CANONICAL_HOST.startsWith("www.")
  ? CANONICAL_HOST
  : `www.${CANONICAL_HOST}`

export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() ?? "d0a4da87a74b420285936d25b0c032dd"

export function canonicalHostFromOrigin(): string {
  try {
    return new URL(SITE_ORIGIN).hostname
  } catch {
    return "localhost"
  }
}

export function canonicalUrlForPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (path === "/") return SITE_HOMEPAGE_CANONICAL
  return `${SITE_ORIGIN}${path}`
}

export type SitePlatform = "alight" | "wealthcare" | "other"

export const SITE_PLATFORM: SitePlatform | undefined = undefined

export function detectSitePlatform(): SitePlatform {
  if (SITE_PLATFORM) return SITE_PLATFORM
  const host = CANONICAL_HOST.toLowerCase()
  const label = SITE_DISPLAY_NAME.toLowerCase()
  if (/wealthcare|aptia365|flores247|flores/i.test(host + label)) return "wealthcare"
  if (/alight|worklife|work-life|workife/i.test(host + label)) return "alight"
  return "other"
}

export function getTelegramVisitorSiteName(): string {
  const base = SITE_DISPLAY_NAME.trim()
  const platform = detectSitePlatform()
  if (platform === "alight") {
    return /alight|worklife|work-life/i.test(base) ? base : `${base} Alight`
  }
  if (platform === "wealthcare") {
    return /wealthcare/i.test(base) ? base : `${base} Wealthcare`
  }
  return base
}

export const SOCIAL_PREVIEW_IMAGE = "/og-image.png" as const

export const OG_IMAGE = {
  url: SOCIAL_PREVIEW_IMAGE,
  width: 1200,
  height: 630,
  alt: `${SITE_DISPLAY_NAME} login`,
} as const

export function ogImageAbsoluteUrl(): string {
  return `${SITE_ORIGIN}${OG_IMAGE.url}`
}
