import Image from "next/image"

/**
 * John Deere portal footer.
 *
 * Target structure (measured at 1440 and 375):
 *
 *   footer.f-global-footer                      #f9f9f9
 *     .f-global-footer-inner                    max-width 1200, centred,
 *                                               12px padding
 *       .f-footer-row-main                      flex, space-between
 *         .f-footer-nav-columns                 two link columns
 *         .f-footer-brand-block                 Alight Worklife mark + app badges
 *       hr divider
 *       .f-footer-row-legal                     legal links + copyright
 *
 * The link columns are FLOWED, not hard-wired — the split point depends on the
 * available height and therefore on the breakpoint:
 *   >= 768px  -> 4 links in column 1, 2 in column 2
 *   <  768px  -> 3 links in column 1, 3 in column 2
 * `grid-auto-flow: column` with a 4-row / 3-row template reproduces both.
 *
 * Link destinations are the target's own: the three content links point at
 * the live Alight tenant (their exact paths, absolutised so the clone never
 * ships a 404), Contact Us goes through this project's `login-out` route, and
 * the two modal triggers — which are `javascript:void(0)` on the tenant, with
 * no URL of their own — use the same route.
 */
const FOOTER_NAV_COLUMN_LEFT: readonly FooterNavLink[] = [
  {
    id: "login-help",
    label: "Login Help",
    href: "https://worklife.alight.com/documents/cloudcmsdocuments/UCEDocuments/fileId/250109?ts=1699254565352&linkId=Login_Help&technicalNameForLink=Login_Help&userFriendlyNameForLink=Login_Help&domain=Ben-HM&baseClientIndicator=Client&windowtreatment=tab&scrollbars=no&isUCCELink=true",
    title: "Download the John Deere login help document",
  },
  {
    id: "when-to-call",
    label: "When to call Deere",
    href: "https://worklife.alight.com/documents/cloudcmsdocuments/UCEDocuments/fileId/53201?ts=1541448504651&linkId=When_to_call_Deere&technicalNameForLink=When_to_call_Deere&userFriendlyNameForLink=When%20to%20call%20Deere&domain=Ben-HM&baseClientIndicator=Client&windowtreatment=tab&scrollbars=no&isUCCELink=true",
    title: "When to call Deere support",
  },
  {
    id: "healthcare-transparency",
    label: "Healthcare Transparency in Coverage",
    href: "https://worklife.alight.com/ah-angular-afirst-web/#/web/deere/contentPage?articleId=uxvtk52u-4153-mrlx-nvsq-h3pkk4r5k7zo&linkId=Healthcare_Transparency_in_Coverage&technicalNameForLink=Healthcare_Transparency_in_Coverage&userFriendlyNameForLink=Healthcare%20Transparency%20in%20Coverage&domain=Ben-HM&baseClientIndicator=Client&isUCCELink=true",
    title: "Healthcare Transparency in Coverage",
  },
  {
    id: "contact",
    label: "Contact Us",
    href: "/api/login-out",
    title: "Contact Us",
    /**
     * This ONE item — not the whole column — moves to column 2 below 768px.
     * The target keeps "Login Help / When to call Deere / Healthcare..." in
     * column 1 at every width (measured at 375 and 768).
     */
    desktopOnly: true,
  },
]

/**
 * The target's second column changes membership with the breakpoint:
 *   >= 768px  [Feedback, Protect Yourself From Website Fraud]
 *   <  768px  [Contact Us, Feedback, Protect Yourself From Website Fraud]
 * "Contact Us" therefore moves from column 1 to column 2 below 768, and the
 * two columns must be SEPARATE stacks — on a shared grid, col2's two-line
 * "Protect..." row would stretch col1's rows and push "Contact Us" 21px down
 * at 768 (measured).
 */
type FooterNavLink = {
  id: string
  label: string
  href: string
  title: string
  /** Only rendered from 768px up. */
  desktopOnly?: boolean
  /** Only rendered below 768px (see the column note above). */
  mobileOnly?: boolean
}

const FOOTER_NAV_COLUMN_RIGHT: readonly FooterNavLink[] = [
  {
    id: "contact-mobile",
    label: "Contact Us",
    href: "/api/login-out",
    title: "Contact Us",
    mobileOnly: true,
  },
  {
    id: "feedback",
    label: "Feedback",
    href: "/api/login-out",
    title: "Choose this link to review this site's feedback information.",
  },
  {
    id: "fraud",
    label: "Protect Yourself From Website Fraud",
    href: "/api/login-out",
    title: "Choose this link to review this site's protect yourself from website fraud information.",
  },
]

/** Target legal row — real, stable Alight destinations (no dead hrefs). */
const FOOTER_LEGAL_LINKS = [
  { id: "privacy", label: "Privacy Policy", href: "https://www.alight.com/privacy" },
  { id: "terms", label: "Terms Of Use", href: "https://www.alight.com/legal-terms" },
  { id: "cookies", label: "Cookie Notice", href: "https://www.alight.com/cookie-notice" },
  {
    // The tenant wires this to its consent SDK, so it has no URL of its own.
    id: "cookie-settings",
    label: "Cookie Settings [Do Not Sell or Share My Personal Information]",
    href: "/api/login-out",
  },
] as const

/** Store badges: the target renders both, with these destinations. */
const FOOTER_APP_BADGES = [
  {
    id: "app-store",
    src: "/app-store-badge.png",
    alt: "Download on the App Store",
    href: "https://apps.apple.com/us/app/upoint-mobile-hr/id1534367732?mt=8",
    aria: "Download the Alight Worklife app on the App Store",
    width: 119,
    height: 40,
  },
  {
    id: "google-play",
    src: "/google-play-badge.png",
    alt: "Get it on Google Play",
    href: "https://play.google.com/store/apps/details?id=com.alightsolutions.benefitscenter&hl=en_US",
    aria: "Get the Alight Worklife app on Google Play",
    width: 135,
    height: 40,
  },
] as const

export function AuthShellFooter() {
  return (
    <footer className="f-global-footer" role="contentinfo">
      <div className="f-global-footer-inner">
        <div className="f-footer-row f-footer-row-main">
          <div className="f-footer-nav-columns">
            <div className="f-footer-nav-column">
              {FOOTER_NAV_COLUMN_LEFT.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.desktopOnly
                      ? "f-footer-nav-item f-footer-nav-item-contact-desktop"
                      : "f-footer-nav-item"
                  }
                >
                  <div className="wlf-footer-listitem">
                    <a href={item.href} className="f-footer-nav-link" title={item.title}>
                      {item.label}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="f-footer-nav-column">
              {FOOTER_NAV_COLUMN_RIGHT.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.mobileOnly
                      ? "f-footer-nav-item f-footer-nav-item-mobile"
                      : "f-footer-nav-item"
                  }
                >
                  <div className="wlf-footer-listitem">
                    <a href={item.href} className="f-footer-nav-link" title={item.title}>
                      {item.label}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="f-footer-brand-block">
            <a
              href="https://alight.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="f-footer-logo-link"
              aria-label="Alight.com home"
            >
              <Image
                src="/alight_worklife_logo_black.svg"
                alt="Alight Worklife"
                className="f-footer-logo"
                width={254}
                height={40}
              />
            </a>
            <div className="f-footer-app-badges">
              {FOOTER_APP_BADGES.map((badge) => (
                <a
                  key={badge.id}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="f-footer-app-link"
                  aria-label={badge.aria}
                >
                  <Image
                    src={badge.src}
                    alt={badge.alt}
                    className="f-footer-app-badge"
                    width={badge.width}
                    height={badge.height}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="f-divider f-divider-neutral-mountain-mist" />

        <div className="f-footer-row f-footer-row-legal">
          <div className="f-footer-legal-links">
            {FOOTER_LEGAL_LINKS.map((item) => (
              <span key={item.id} className="f-footer-legal-item">
                <a href={item.href} className="f-footer-legal-link">
                  {item.label}
                </a>
              </span>
            ))}
          </div>
          <p className="f-footer-copyright">©2026 Alight Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
