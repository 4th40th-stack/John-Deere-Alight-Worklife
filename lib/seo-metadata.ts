import { LAYOUT_DESCRIPTION } from "@/lib/meta-description"
import { buildSiteKeywords, buildVisibleKeywords } from "@/lib/seo-keywords"
import { SITE_DISPLAY_NAME } from "@/lib/site-url"

export const SITE_TITLE = `Member login | ${SITE_DISPLAY_NAME}`

export const SITE_DESCRIPTION = LAYOUT_DESCRIPTION

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

export const SITE_VISIBLE_KEYWORDS: string[] = buildVisibleKeywords()
