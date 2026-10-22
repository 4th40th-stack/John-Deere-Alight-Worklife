"use client"

import { AuthShellHeader } from "@/components/auth/auth-shell-header"

/**
 * Global branded header for the Next.js auth-flow pages (verify / OTP /
 * identity / forgot-password / new-user). Previously a no-op stub (returned
 * null), which left these pages with no header bar while the Astro landing
 * rendered the full `AuthShellHeader`. Delegates to `AuthShellHeader` so every
 * page shares one consistent header (logo + menu + language + VA).
 */
export function SiteHeader() {
  return <AuthShellHeader />
}
