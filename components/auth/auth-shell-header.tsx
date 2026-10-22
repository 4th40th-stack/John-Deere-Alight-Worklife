"use client"

import Image from "next/image"
import Link from "next/link"
import { VirtualAssistantButton } from "@/components/auth/virtual-assistant-button"
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-config"
import { restartFromGate } from "@/lib/restart-gate"

/**
 * John Deere portal header.
 *
 * Target structure (measured at 1440 and at 1023):
 *   nav.f-global-header
 *     hr.brand-bar                     8px, John Deere green
 *     div.header-content (flex, space-between, 88px, 24px padding)
 *       div.header-left
 *         a > img.brand-logo           AutoZone is the one with the hamburger —
 *                                      this tenant renders NO menu button at
 *                                      any width: the logo sits at x=24 even at
 *                                      375px (201x48 at >=1024, 144x48 from
 *                                      768, 144x40 below 768)
 *       nav.header-right               EMPTY below 1024px
 *         .virtual-assistant-btn       178x40 green pill, >=1024px only
 *
 * Unlike the AutoZone tenant, there is no language/overflow menu in this
 * cluster — the target's right-hand group holds the Virtual Assistant alone.
 */
export function AuthShellHeader() {
  return (
    <header className="global-header" role="banner">
      <div className="header-content">
        <div className="header-left">
          <div className="brand-container">
            <Link
              href="/"
              aria-label={`${BRAND_LOGO_ALT} benefits home`}
              onClick={restartFromGate}
            >
              <Image
                src={BRAND_LOGO_SRC}
                alt={BRAND_LOGO_ALT}
                className="brand-logo"
                width={201}
                height={48}
                priority
              />
            </Link>
          </div>
        </div>

        <nav className="header-right" aria-label="Site tools">
          <VirtualAssistantButton className="header-virtual-assistant" />
        </nav>
      </div>
    </header>
  )
}
