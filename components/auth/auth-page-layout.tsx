import Image from "next/image"
import type { CSSProperties } from "react"
import { AuthShellFooter } from "@/components/auth/auth-shell-footer"
import { BRAND_BAR_COLOR, BRAND_LOGO_ALT, BRAND_PORTAL_NAME } from "@/lib/brand-config"
import { AuthShellHeader } from "@/components/auth/auth-shell-header"
import { VirtualAssistantButton } from "@/components/auth/virtual-assistant-button"

/**
 * John Deere landing shell.
 *
 * Target structure (measured at 1440 / 1024 / 1023 / 768 / 375):
 *   hr.brand-bar                       8px, John Deere green, full bleed
 *   header.global-header               89px (88px content + 1px rule)
 *   div.virtual-assistant-row          56px, one full-bleed green pill
 *                                      (below 1024px only — above it the
 *                                       control lives in the header)
 *   main.main-wrapper                  two-column grid, max-width 1440, gap 0
 *     section.login-section            LEFT cell: 50% -> 33.3333% (>=1024)
 *     section.hero-container           RIGHT cell: 50% -> 66.6667%, stacked
 *                                      below 768px
 *   footer.f-global-footer             #f9f9f9, 1200px centred content
 *
 * The hero is present on THIS tenant (unlike AutoZone, whose target has no
 * promo image at all): a 1455x801 farm-sunrise photograph that always fills
 * its column — 960x528 at 1440, 683x376 at 1024, 512x282 at 1023, 384x211 at
 * 768 and stacked full-width below 768.
 */
export function AuthPageLayout({
  children,
  heroSrc,
  heroAlt,
}: {
  children: React.ReactNode
  heroSrc: string
  heroAlt?: string
}) {
  const effectiveHeroAlt = heroAlt || `${BRAND_LOGO_ALT} benefits`

  return (
    <div
      className="auth-shell-page"
      style={{ display: "block", minHeight: "100vh", position: "relative" }}
    >
      <hr
        className="brand-bar"
        style={{ "--f-default-color": BRAND_BAR_COLOR } as CSSProperties}
      />
      <AuthShellHeader />
      <div className="virtual-assistant-row">
        <VirtualAssistantButton />
      </div>
      <main className="main-wrapper">
        <section className="login-section">{children}</section>
        <section className="hero-container" aria-label={`${BRAND_PORTAL_NAME} ${BRAND_LOGO_ALT} promotion`}>
          <Image
            src={heroSrc}
            alt={effectiveHeroAlt}
            className="hero-image"
            width={1455}
            height={801}
            priority
          />
        </section>
      </main>
      <AuthShellFooter />
    </div>
  )
}
