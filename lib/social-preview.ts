import type { Metadata } from "next"
import ogImageMeta from "../public/og-image.meta.json"

/** Generated social preview — from header logo via scripts/generate-og-image.py */
export const SOCIAL_PREVIEW_IMAGE = "/og-image.png" as const

export const SOCIAL_PREVIEW_WIDTH = ogImageMeta.width
export const SOCIAL_PREVIEW_HEIGHT = ogImageMeta.height

/** Import SITE_ORIGIN from lib/site-url.ts in each project. */
export function createSocialPreviewMetadata(
  siteOrigin: string,
  alt: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = `${siteOrigin}${SOCIAL_PREVIEW_IMAGE}`
  return {
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: SOCIAL_PREVIEW_WIDTH,
          height: SOCIAL_PREVIEW_HEIGHT,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
  }
}
