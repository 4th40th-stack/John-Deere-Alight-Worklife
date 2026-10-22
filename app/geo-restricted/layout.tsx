import type React from "react"
import type { Metadata } from "next"
import { canonicalUrlForPath } from "@/lib/site-url"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: canonicalUrlForPath("/geo-restricted"),
  },
}

export default function GeoRestrictedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
