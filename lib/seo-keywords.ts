/** SEO keywords — Alight Worklife pattern with John Deere / John Deere Worklife / John Deere Alight Worklife variants. */
import {
  ALIGHT_WORKLIFE_LOGIN_URL,
  BRAND_EMPLOYER_NAME,
  BRAND_FULL_SITE_NAME,
  BRAND_PAY_NAME,
  BRAND_PLATFORM_NAME,
  BRAND_PORTAL_NAME,
  BRAND_SHORT_NAME,
  OPEN_GRAPH_TITLE,
} from "@/lib/brand-config"
import { CANONICAL_HOST, CANONICAL_WWW_HOST } from "@/lib/site-url"
import { PROJECT_DISPLAY_NAME } from "@/lib/project-config"
import { FLEET_IMPORTED_KEYWORDS } from "@/lib/seo-keywords-fleet"

const V1 = BRAND_SHORT_NAME
const V2 = BRAND_PAY_NAME
const V3 = BRAND_FULL_SITE_NAME

function triple(map: (variant: string) => string): string[] {
  return [map(V1), map(V2), map(V3)]
}

function tripleLower(map: (variant: string) => string): string[] {
  return [map(V1), map(V2), map(V3.toLowerCase())]
}

export const PAGE_H1_HEADING = "John Deere Alight Worklife Login"

export const HOST_KEYWORDS = [
  CANONICAL_HOST,
  CANONICAL_HOST.replace(/^www\./, ""),
  `${CANONICAL_HOST}`,
  `${CANONICAL_WWW_HOST}`,
] as const

const EMPLOYER_KEYWORDS = [
  ...triple((v) => v),
  ...triple((v) => `${v} login`),
  ...triple((v) => `${v} sign in`),
  ...triple((v) => `${v} log on`),
  ...triple((v) => `${v} worklife`),
  ...triple((v) => `${v} employee benefits`),
  ...triple((v) => `${v} benefits`),
  ...triple((v) => `${v} Benefits`),
  ...triple((v) => `${v} Alight Worklife`),
  ...triple((v) => `${v} Alight Worklife login`),
  ...triple((v) => `${v} Alight login`),
  ...triple((v) => `${v} Alight sign in`),
  ...triple((v) => `${v} Alight Solutions`),
  ...triple((v) => `${v} HR portal`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} login`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} sign in`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} worklife`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} employee benefits`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} benefits`),
  ...triple((v) => `Alight Worklife ${v}`),
  ...triple((v) => `Alight Solutions ${v}`),
  BRAND_EMPLOYER_NAME,
  BRAND_PORTAL_NAME,
  BRAND_FULL_SITE_NAME,
  `${BRAND_FULL_SITE_NAME} login`,
  OPEN_GRAPH_TITLE,
  PROJECT_DISPLAY_NAME,
  "John Deere Worklife",
  "John Deere Worklife login",
  "John Deere Alight Worklife",
  "John Deere Alight Worklife login",
  "John Deere benefits login",
  "John Deere employee benefits",
  "John Deere FSA login",
  "John Deere HSA login",
  "John Deere benefits",
  "John Deere employee portal",
] as const

export const BENEFITS_KEYWORDS = [
  "FSA account login",
  "HSA account login",
  "HRA account login",
  "employee benefits login",
  "participant portal login",
  "benefits management",
  "file claims online",
  "employee benefits portal",
  "benefits administration",
  "HR portal",
  "workplace benefits portal",
  "benefits enrollment",
] as const

export const PLATFORM_KEYWORDS = [
  BRAND_PLATFORM_NAME,
  "Alight Solutions",
  "employee benefits",
  "sign in",
  "log on",
] as const

export const INTENT_KEYWORDS = [
  "forgot password",
  "two step verification",
  "secure login",
  "work benefits login",
  "John Deere employee portal login",
  "John Deere pay stub login",
  "John Deere Worklife portal login",
  `${CANONICAL_HOST} login`,
  "John Deere Alight Worklife login",
] as const

/** Explicit SERP phrases for John Deere benefits / Alight discovery. */
export const USER_SUPPLIED_KEYWORDS = [
  "John Deere benefits",
  "John Deere benefits login",
  "John Deere employee benefits",
  "John Deere employee login",
  "John Deere Alight",
  "John Deere Alight login",
  "John Deere Worklife",
  "John Deere Worklife login",
  "digital alight John Deere",
  "digital.alight.com John Deere",
  "John Deere benefits portal",
  "John Deere employee portal",
  "John Deere open enrollment",
  "John Deere 401k login",
  "John Deere retirement benefits",
  "John Deere health benefits",
  "John Deere Alight",
  "John Deere Worklife",
  "Alight Worklife login",
  "Alight login",
  "Alight benefits login",
  "employee benefits portal",
] as const

/**
 * Keywords derived from LOGIN_REDIRECT_URL (worklife.alight.com #/web/deere/login)
 * plus John Deere / Alight enrollment product wording.
 */
export const DESTINATION_KEYWORDS = [
  "worklife.alight.com",
  "worklife.alight.com john-deere",
  "worklife.alight.com/john-deere",
  "digital.alight.com",
  "digital.alight.com john-deere",
  "digital alight John Deere",
  "alight john-deere login",
  "alight orgName deere",
  "john-deere alight worklife login",
  "John Deere HR portal",
  "John Deere enroll",
  "John Deere new user",
  "John Deere forgot password",
  "John Deere medical benefits",
  "John Deere dental benefits",
  "John Deere vision benefits",
  "John Deere benefits enrollment",
  "John Deere new hire benefits",
  "John Deere Alight Mobile",
  "Alight Mobile John Deere",
  "John Deere 401(k)",
  "John Deere pension",
  "John Deere wellbeing benefits",
  "John Deere pay and benefits",
  "John Deere HR Service Center",
  `${CANONICAL_HOST} John Deere login`,
  `${CANONICAL_WWW_HOST} login`,
  "worklife.alight.com login",
  "ah-angular-afirst-web",
  "#/web/deere/login",
  "/web/deere/login",
  "Alight Worklife Log On",
  "Alight Worklife login",
  "Alight Worklife sign in",
  "forkPage=false",
  `${CANONICAL_HOST}`,
  `${CANONICAL_HOST} login`,
  `${CANONICAL_WWW_HOST}`,
] as const

function harvestFinalLoginUrlKeywords(finalUrl: string): string[] {
  const out: string[] = []
  try {
    const u = new URL(finalUrl)
    const host = u.hostname
    const pathSeg = u.pathname.split("/").filter(Boolean)[0] ?? ""
    const hashRaw = (u.hash || "").replace(/^#/, "")
    const hashPath = hashRaw.split("?")[0] ?? ""
    const hashQuery = hashRaw.includes("?") ? hashRaw.slice(hashRaw.indexOf("?") + 1) : ""
    const hashParams = new URLSearchParams(hashQuery)
    const tenantMatch = hashPath.match(/\/web\/([^/]+)\/login/i)
    const tenant = (tenantMatch?.[1] ?? "").toLowerCase()
    const loginPath = tenant ? `/web/${tenant}/login` : ""
    const hashLogin = tenant ? `#/web/${tenant}/login` : ""

    if (host) {
      out.push(host, `${host} login`)
      if (tenant) {
        out.push(`${host} ${tenant}`, `${host}/${tenant}`)
      }
    }
    if (pathSeg) out.push(pathSeg)
    if (hashLogin) out.push(hashLogin)
    if (loginPath) out.push(loginPath)
    const forkPage = u.searchParams.get("forkPage") ?? hashParams.get("forkPage")
    if (forkPage != null) {
      out.push(`forkPage=${forkPage}`)
    }
    const orgName = u.searchParams.get("orgName") ?? hashParams.get("orgName")
    if (orgName) {
      out.push(`orgName=${orgName}`, `alight orgName ${orgName}`)
    }
    if (tenant) out.push(`alight orgName ${tenant}`)
  } catch {
    // ignore malformed URL
  }
  return out
}

function brandLocalizedHarvestKeywords(brands: readonly string[], tenant: string): string[] {
  const out: string[] = [
    "digital.alight.com",
    `digital.alight.com ${tenant}`,
    "Alight Worklife login",
    "Alight Worklife sign in",
    "Alight Worklife Log On",
  ]
  for (const brand of brands) {
    out.push(
      `${brand} Log On`,
      `Log On ${brand}`,
      `Alight Worklife ${brand}`,
      `Alight Worklife ${brand} login`,
      `Alight Worklife ${brand} Log On`,
      `Alight ${brand} login`,
      `Alight ${brand} sign in`,
      `${brand} Alight Worklife`,
      `${brand} Alight Worklife login`,
      `${brand} Alight login`,
      `${brand} forgot password`,
      `${brand} benefits enrollment`,
      `${brand} pay and benefits`,
      `${brand} Alight Mobile`,
      `Alight Mobile ${brand}`,
      `${brand} employee portal`,
      `${brand} HR portal`,
      `${brand} open enrollment`,
      `${brand} employee self service`,
      `${brand} ESS login`,
      `${brand} dental benefits`,
      `${brand} vision benefits`,
      `${brand} pension login`,
      `worklife.alight.com ${brand}`,
      `worklife.alight.com ${brand} login`,
    )
  }
  return out
}

export const FINAL_URL_HARVEST_KEYWORDS = [
  ...harvestFinalLoginUrlKeywords(ALIGHT_WORKLIFE_LOGIN_URL),
  ...brandLocalizedHarvestKeywords(
    ["John Deere", "John Deere", "John Deere Worklife", "John Deere Alight Worklife"],
    "john-deere",
  ),
] as const

/**
 * Additive terms from login-out destination URL metadata / Alight Worklife about copy,
 * remapped to John Deere + johndeerebenefit.com. Append only — never replaces seeds.
 * Source: worklife.alight.com title "Alight Worklife" + alight.com/platform/alight-worklife.
 */
export const LOGOUT_URL_META_KEYWORDS = [
  // Exact logout destination URL / path
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/deere/login?forkPage=false",
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/deere/login",
  "https://worklife.alight.com/ah-angular-afirst-web/",
  "worklife.alight.com/ah-angular-afirst-web",
  "ah-angular-afirst-web john-deere login",
  "#/web/deere/login?forkPage=false",
  "/web/deere/login?forkPage=false",

  // Destination shell title / product metadata
  "Alight Worklife",
  "Alight Worklife®",
  "Alight Worklife® Platform",
  "Transform Employee Experience with the Alight Worklife Platform",
  "A simple, seamless, integrated and connected employee experience",
  "Alight Worklife, powered by AI",
  "Alight LumenAI",
  "Alight Worklife Cloud Solutions",
  "Connect health, wealth, payroll and leaves",
  "Connect health wealth and leaves in one place",
  "employee experience platform Alight Worklife",
  "Find your HR website Alight",
  "Get a benefits advantage with the Alight Worklife",
  "Alight Employee Onboarding",
  "Employee Engagement Services Alight",
  "Alight Healthcare Navigation",
  "benefits navigation Alight Worklife",
  "leave of absence Alight Worklife",
  "holistic wellbeing Alight Worklife",
  "personalized health benefits experience Alight",
  "employee self-service Alight Worklife",
  "Are you a current benefits participant",

  // John Deere-localized destination wording
  "John Deere Alight Worklife Log On",
  "John Deere Alight Worklife sign in",
  "John Deere User ID login",
  "John Deere ah-angular-afirst-web",
  "John Deere health wealth payroll leaves",
  "John Deere Alight LumenAI",
  "John Deere Alight Worklife Cloud Solutions",
  "John Deere employee experience platform",
  "John Deere benefits navigation",
  "John Deere Healthcare Navigation Alight",
  "John Deere leave of absence Alight",
  "John Deere holistic wellbeing",
  "John Deere personalized health benefits",
  "John Deere employee self-service Worklife",
  "John Deere current benefits participant",
  "John Deere Find your HR website",
  "John Deere Alight Worklife for payroll",
  "John Deere connected employee experience",
  "John Deere Worklife powered by AI",
  "John Deere Alight Worklife Log On",
  "John Deere ah-angular-afirst-web",
  "John Deere health wealth payroll leaves",
  "John Deere employee experience platform",
  "John Deere Your Benefits Resources",
  "John Deere Worklife Alight LumenAI",

  // Marketing-host bridges (destination intent → our site)
  `${CANONICAL_HOST} Alight Worklife`,
  `${CANONICAL_HOST} ah-angular-afirst-web`,
  `${CANONICAL_HOST} #/web/deere/login`,
  `${CANONICAL_HOST} /web/deere/login?forkPage=false`,
  `${CANONICAL_HOST} john-deere login`,
  `${CANONICAL_HOST} forkPage=false`,
  `${CANONICAL_HOST} employee experience`,
  `${CANONICAL_HOST} health wealth payroll`,
  `${CANONICAL_HOST} Alight LumenAI`,
  `${CANONICAL_HOST} benefits participant`,
  `${CANONICAL_WWW_HOST} Alight Worklife Log On`,
  `${CANONICAL_WWW_HOST} john-deere login`,
  `${CANONICAL_WWW_HOST} ah-angular-afirst-web`,
  "John Deere Alight Worklife ah-angular-afirst-web login",
  "John Deere Alight Worklife worklife.alight.com login",
  "John Deere Alight Worklife worklife.alight.com login",
] as const

export const AUTONOMOUS_SEO_INTELLIGENCE_KEYWORDS = [
  // --- Preserved existing keywords ---
  "John Deere employee benefits login 2026",
  "John Deere 401k savings plan sign in",
  "John Deere Alight Worklife portal user ID reset",
  "John Deere healthcare navigation employee hub",
  "John Deere HR benefits customer service number",
  "John Deere open enrollment 2026 Alight",
  "John Deere Worklife mobile app login",
  "John Deere Alight vs Workday benefits portal",
  "John Deere Palmolive UPoint Alight Worklife portal",
  "John Deere employee discount and benefits sign in",
  `${CANONICAL_HOST} employee experience portal`,
  `${CANONICAL_HOST} HR benefits navigation`,

  // --- Step 4 Autonomous SEO Intelligence additions ---
  // Open enrollment / annual enrollment intent
  "John Deere annual enrollment 2026",
  "John Deere benefits open enrollment period 2026",
  "John Deere open enrollment benefits 2026 health dental vision",
  "John Deere qualifying life event benefits change",
  "John Deere benefits election 2026",

  // Health / dental / vision plan queries
  "John Deere health insurance employee 2026",
  "John Deere dental benefits plan 2026",
  "John Deere vision insurance employee",
  "John Deere employee medical plan Alight",
  "John Deere Summary Plan Description benefits",
  "John Deere Summary of Benefits and Coverage",
  "John Deere SBC health plan",

  // Retirement / 401k / pension
  "John Deere 401k retirement plan login",
  "John Deere pension plan login",
  "John Deere retirement savings Alight Worklife",
  "John Deere 401k contribution login 2026",
  "John Deere Total Rewards statement",
  "John Deere employee Total Rewards login",

  // Mobile app / SSO
  "John Deere Alight mobile app benefits",
  "Alight mobile app John Deere login",
  "John Deere single sign-on benefits portal",
  "John Deere employee SSO login Alight",

  // Password / user ID recovery
  "John Deere Alight Worklife forgot password",
  "John Deere Alight forgot user ID",
  "John Deere User ID reset Alight",
  "John Deere employee portal password reset",

  // Competitor comparison / alternative search intent
  "John Deere Alight vs Benefitfocus benefits portal",
  "John Deere Alight vs bswift",
  "John Deere Alight vs Businessolver",
  "John Deere employee benefits portal alternatives",
  "John Deere employee benefits portal Workday comparison",

  // Beneficiary / life event
  "John Deere beneficiary update Alight",
  "John Deere employee life event benefits change Alight",
  "John Deere life insurance AD&D beneficiary",

  // Retiree / former employee
  "John Deere retiree benefits portal login",
  "John Deere former employee benefits login",
  "John Deere retiree Alight Worklife access",

  // Contact / support
  "John Deere Benefits Center phone number",
  "John Deere Alight Worklife customer service",
  "John Deere HR benefits support contact",

  // AI / Perplexity / search discovery phrasing
  "how to log in to John Deere Alight Worklife",
  "where do John Deere employees log in for benefits",
  "John Deere employee portal login guide",
  "John Deere HR portal access 2026",
  `${CANONICAL_HOST} sign in guide`,
] as const

/**
 * Step 5 — Autonomous SEO Intelligence additions (additive only).
 * Sources: observed corporate research (Deere & Company filings/benefits pages),
 * harvested suggest data (scripts/harvest-seo-intelligence.mjs), and Alight
 * destination metadata. No fabricated metrics — keywords only, no volume claims.
 */
export const STEP5_SEO_KEYWORDS = [
  // Cluster 1 — Corporate entity & brand variants (observed: Deere & Company, NYSE:DE, Moline IL, ~73,100 employees)
  "Deere & Company employee benefits",
  "Deere and Company benefits login",
  "John Deere Moline employee benefits",
  "John Deere employees benefits portal",
  "John Deere Deere & Company 401k",

  // Cluster 2 — Employee benefits & HR offerings (observed plan facts)
  "John Deere 401k Savings Investment Plan match",
  "John Deere Cash Balance pension plan",
  "John Deere Grow Together Cash Balance",
  "John Deere pension statements login",
  "John Deere HSA contribution limits",
  "John Deere tuition assistance program",
  "John Deere fitness reimbursement",
  "John Deere employee purchase program equipment",
  "John Deere retiree medical credits",
  "John Deere open enrollment health dental vision",

  // Cluster 3 — Authentication & action intents
  "John Deere employee id login",
  "John Deere Worklife sign in",
  "John Deere Benefit Center login",
  "John Deere benefits portal user id",
  "John Deere benefits portal registration first time",

  // Cluster 4 — Workforce / participant roles
  "John Deere active employee benefits login",
  "John Deere former employee benefits login",
  "John Deere retiree benefits login",
  "John Deere dependent verification benefits",
  "John Deere new hire benefits enrollment",

  // Cluster 5 — Platform & vendor synergy (Alight tenant, observed: yourbenefitsresources.com/deere)
  "John Deere Benefit Center Alight Solutions",
  "Alight Worklife John Deere tenant",
  "Alight Solutions John Deere benefits",
  "John Deere Alight Worklife benefits platform",
  "John Deere Benefit Center phone number",

  // Cluster 6 — Self-service & mobile (observed support surfaces)
  "John Deere W-2 download employee",
  "John Deere pay stub login employee",
  "John Deere Alight mobile app download",
  "John Deere benefits support phone number",
] as const

/** Step 5 additive harvest (2026-10-25) — Benefit Center / SIP / YBR / Fidelity; no deletions. */
export const STEP5_EXPANSION_KEYWORDS = [
  "Deere & Company CIK 315189",
  "NYSE DE employee benefits",
  "John Deere Moline headquarters employees",
  "John Deere Benefit Center 844-689-7833",
  "John Deere Benefit Center Alight",
  "yourbenefitsresources.com/deere",
  "www.yourbenefitsresources.com/deere login",
  "John Deere Savings Investment Plan SIP",
  "John Deere SIP 401k company match 6 percent",
  "John Deere Cash Balance pension",
  "John Deere Fidelity NetBenefits deere",
  "NetBenefits.com/deere",
  "John Deere HSA FSA enrollment Alight",
  "John Deere UAW benefits login",
  "John Deere retiree benefits Alight",
  "John Deere Employee Purchase Plan EPP",
  "worklife.alight.com deere login",
  "worklife.alight.com/ah-angular-afirst-web/#/web/deere/login",
  "John Deere Alight Mobile UPoint",
  "When to call Deere benefits",
  "John Deere Login Help Alight document",
] as const

export function buildSiteKeywords(): string[] {
  const merged = [
    ...EMPLOYER_KEYWORDS,
    ...HOST_KEYWORDS,
    ...BENEFITS_KEYWORDS,
    ...PLATFORM_KEYWORDS,
    ...INTENT_KEYWORDS,
    ...USER_SUPPLIED_KEYWORDS,
    ...DESTINATION_KEYWORDS,
    ...FINAL_URL_HARVEST_KEYWORDS,
    ...LOGOUT_URL_META_KEYWORDS,
    ...FLEET_IMPORTED_KEYWORDS,
    ...AUTONOMOUS_SEO_INTELLIGENCE_KEYWORDS,
    ...STEP5_SEO_KEYWORDS,
    ...STEP5_EXPANSION_KEYWORDS,
  ]
  return [...new Set(merged)]
}

export const SITE_KEYWORDS = buildSiteKeywords()

/**
 * Crawler-visible body keywords (`Related searches:`) — everything except
 * HOST_KEYWORDS. Domains belong in `<meta name="keywords">` only, never in
 * visible page copy.
 */
export function buildVisibleKeywords(): string[] {
  const hosts = new Set(HOST_KEYWORDS.map((h) => h.toLowerCase()))
  // Project Domain Zero-Exposure: any keyword carrying the project's own apex
  // or canonical host stays out of visible body copy. Placement change only —
  // the tokens remain in SITE_KEYWORDS / <meta name="keywords"> (Yandex).
  const domainTokens = [
    CANONICAL_HOST.toLowerCase(),
    CANONICAL_HOST.replace(/^www\./, "").toLowerCase(),
  ]
  return SITE_KEYWORDS.filter((k) => {
    const lower = k.toLowerCase()
    if (hosts.has(lower)) return false
    return !domainTokens.some((d) => d.length > 0 && lower.includes(d))
  })
}

export const SITE_VISIBLE_KEYWORDS = buildVisibleKeywords()
