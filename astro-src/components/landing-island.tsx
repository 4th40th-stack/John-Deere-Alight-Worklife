/**
 * The project-owned landing island wrapper.
 *
 * `astro-src/pages/index.astro` mounts THIS component with
 * `client:only="react"`. It exists so the entire interactive login tree
 * (LandingShell gates + the real LoginPageClient) hydrates inside ONE island —
 * children of a `client:only` island are not server-rendered, so the real
 * login components must be part of the island's own React tree rather than
 * passed through an Astro slot.
 *
 * The login flow itself is NOT re-implemented: LoginPageClient,
 * AuthPageLayout, UserIdStep and the preloader are the exact components the
 * Next `/` route used before the Astro conversion.
 */
"use client"

import LandingShell from "./landing-shell"
import { LoginPageClient } from "../../app/login-page-client"

export default function LandingIsland({
  allowLocalTestingEnv = false,
}: {
  /** Injected at build time from ALLOW_LOCAL_TESTING so the island matches the server. */
  allowLocalTestingEnv?: boolean
}) {
  return (
    <LandingShell allowLocalTestingEnv={allowLocalTestingEnv}>
      <LoginPageClient />
    </LandingShell>
  )
}
