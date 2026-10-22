/**
 * Resolved image URLs for the Astro pages.
 *
 * CRITICAL: Astro image imports return an ImageMetadata OBJECT
 * ({ src, width, height, format }), not a URL string like `next/image` does.
 * Interpolating the object directly renders `src="[object Object]"` in every
 * <img> and <link rel="preload"> on the page.
 *
 * This project's brand/hero/footer assets live in the Next `public/` directory
 * and are referenced by URL string (they are served by the Next host at
 * runtime), so no asset import is needed here — plain strings are already the
 * resolved form and can never degrade to `[object Object]`.
 *
 * All three files were downloaded from the live target's own CMS (org 01576):
 *   john-deere-logo.svg           header mark (963.4x230 viewBox, 201x48 box)
 *   hero-logon-page.jpg           the promo photograph (1455x801)
 *   alight_worklife_logo_black.svg footer partner mark (254x40)
 */

/** John Deere wordmark — header lockup. */
export const BRAND_LOGO_SRC = "/john-deere-logo.svg"

/**
 * Promo photograph shown in the right-hand grid cell. Preloaded by
 * `astro-src/pages/index.astro` so the first paint has it, exactly as the
 * target does with `image1_logon-page_large.jpg`.
 */
export const HERO_IMAGE_SRC = "/hero-logon-page.jpg"

/** Footer partner mark. */
export const PARTNER_LOGO_SRC = "/alight_worklife_logo_black.svg"
