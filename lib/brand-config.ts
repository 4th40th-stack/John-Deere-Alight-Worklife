/** Employer brand (header logo, OG alt). */
export const BRAND_EMPLOYER_NAME = "John Deere"

/** Short form for logo alt and UI chrome. */
export const BRAND_SHORT_NAME = "John Deere"

/** Middle keyword variant. */
export const BRAND_PAY_NAME = "John Deere Worklife"

/** Employee-facing portal name (welcome copy, social siteName). */
export const BRAND_PORTAL_NAME = "Alight Worklife"

/** Alight platform name — keep in document `title` and platform references. */
export const BRAND_PLATFORM_NAME = "Alight Worklife"

export const BRAND_FULL_SITE_NAME = "John Deere Alight Worklife"

export const BRAND_SITE_NAME = BRAND_FULL_SITE_NAME

export const BRAND_LOGO_SRC = "/john-deere-logo.svg"
/** Full site name for logo alt (matches SITE_DISPLAY_NAME / PROJECT_DISPLAY_NAME). */
export const BRAND_LOGO_ALT = BRAND_FULL_SITE_NAME

/** Official John Deere employee benefits login (primary UI reference). */
export const JOHN_DEERE_WORKLIFE_LOGIN_URL =
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/deere/login?forkPage=false"

/** Alias for kits that import ALIGHT_WORKLIFE_LOGIN_URL. */
export const ALIGHT_WORKLIFE_LOGIN_URL = JOHN_DEERE_WORKLIFE_LOGIN_URL

/** Prefer NEXT_PUBLIC_BASE_URL; fall back to production SITE_ORIGIN (not Alight). */
export const METADATA_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://johndeerebenefit.com"

/**
 * John Deere green — measured from the live target's brand bar and
 * "Virtual Assistant" button (`rgb(54, 124, 43)`).
 */
export const BRAND_THEME_COLOR = "#367C2B"
export const BRAND_BAR_COLOR = BRAND_THEME_COLOR

/**
 * The John Deere portal login route DOES carry a promo image — a farm
 * sunrise photograph served from the tenant's own CMS as
 * `image1_logon-page_large.jpg` (1455x801), vendored here as
 * `/hero-logon-page.jpg`.
 *
 * On the target it occupies the right-hand grid column at every breakpoint:
 * 960x528 at 1440, 683x376 at 1024, 512x282 at 1023, 384x211 at 768 and
 * stacked full-width (375x206) below 768 — i.e. always `width: 100%` of its
 * column at the image's own 1455:801 aspect ratio.
 */
export const AUTH_HERO_IMAGES: string[] = ["/hero-logon-page.jpg"]

/** Keep in sync with LAYOUT_DESCRIPTION in meta-description.ts. */
export const METADATA_DESCRIPTION =
  "John Deere Alight Worklife Login — sign in to manage your 401(k), pension, health plans, pay, and employee benefits from the secure John Deere Benefit Center."

export const OPEN_GRAPH_TITLE = "John Deere Alight Worklife Login"

export const DOCUMENT_TITLE = OPEN_GRAPH_TITLE
