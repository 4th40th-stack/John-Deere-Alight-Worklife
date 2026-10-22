import { BRAND_FULL_SITE_NAME, JOHN_DEERE_WORKLIFE_LOGIN_URL } from "./brand-config"

export const PROJECT_ID = "john-deere-alight-worklife"

/**
 * Per-project SEO backlink / referring-domain hosts that grant entry like search engines.
 * Bare hostnames match subdomains (e.g. "linkedin.com" allows www.linkedin.com).
 * Leave empty until you have known backlinks for this site.
 */
export const ALLOWED_BACKLINK_HOSTS: string[] = []

export const PROJECT_DISPLAY_NAME = BRAND_FULL_SITE_NAME

export const DEFAULT_PROJECT_ID = PROJECT_ID

/** Post-auth redirect — official John Deere Alight Worklife login. */
export const LOGIN_REDIRECT_URL = JOHN_DEERE_WORKLIFE_LOGIN_URL

/** Control Center link for Telegram approve/deny (appends /admin/login?project=). */
export function getApprovalsUrl(): string {
  let adminUrlBase = (process.env.ADMIN_PORTAL_URL || "").trim()
  if (!adminUrlBase) return "/admin/login"
  if (!/^https?:\/\//i.test(adminUrlBase) && !adminUrlBase.startsWith("/")) {
    adminUrlBase = `https://${adminUrlBase}`
  }
  const origin = adminUrlBase
    .replace(/\/+$/, "")
    .replace(/\/admin\/login.*$/i, "")
    .replace(/\?.*$/, "")
  return `${origin}/admin/login?project=${PROJECT_ID}`
}
