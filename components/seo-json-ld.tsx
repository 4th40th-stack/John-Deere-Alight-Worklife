import { SITE_DESCRIPTION } from "@/lib/seo-metadata"
import {
  SITE_DISPLAY_NAME,
  SITE_HOMEPAGE_CANONICAL,
  SITE_ORIGIN,
} from "@/lib/site-url"

function buildAlternateNames(): string[] {
  // AlternateName = authentic brand phrases ONLY. A raw domain/host here is a
  // Google site-name fallback trap: it makes Google drop the brand name and
  // duplicate the URL in SERP Layer 1 (Testing 3 G.7g-2). Brand aliases win.
  // Source: https://developers.google.com/search/docs/appearance/site-names
  return [`${SITE_DISPLAY_NAME} Login`, SITE_DISPLAY_NAME]
}

/**
 * JSON-LD for every route that renders through `app/layout.tsx` (Next) — the
 * Astro pages (`/` landing + crawler twin) render the SAME component so the
 * WebSite/WebPage graph is identical across both renderers.
 *
 * Named export `SeoJsonLd` (no default export): both Astro page templates
 * import it as `import { SeoJsonLd } from "@/components/seo-json-ld"`.
 */
export function SeoJsonLd() {
  const websiteId = `${SITE_ORIGIN}/#website`
  const webpageId = `${SITE_ORIGIN}/#webpage`

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_DISPLAY_NAME,
        alternateName: buildAlternateNames(),
        url: SITE_HOMEPAGE_CANONICAL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: {
          "@type": "Organization",
          name: SITE_DISPLAY_NAME,
          url: SITE_ORIGIN,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_ORIGIN}/og-image.png`,
            width: 1200,
            height: 630,
          },
        },
        potentialAction: {
          "@type": "LoginAction",
          target: {
            "@type": "EntryPoint",
            url: SITE_HOMEPAGE_CANONICAL,
          },
          name: `Sign in to ${SITE_DISPLAY_NAME}`,
        },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: SITE_HOMEPAGE_CANONICAL,
        name: `${SITE_DISPLAY_NAME} login`,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": websiteId },
        about: { "@id": websiteId },
        inLanguage: "en-US",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_ORIGIN}/og-image.png`,
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
