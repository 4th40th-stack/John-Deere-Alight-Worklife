"use client"

import { useEffect, useRef } from "react"
import { isLikelyBotUserAgent } from "@/utils/botDetection"

const UNKNOWN = "Unknown"

export interface LandingVisitClientPayload {
  userAgent: string
  screen: string
  language: string
  referrer: string
  pageUrl: string
}

function buildClientPayload(): LandingVisitClientPayload {
  return {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : UNKNOWN,
    screen:
      typeof window !== "undefined"
        ? `${window.screen.width}x${window.screen.height}`
        : UNKNOWN,
    language: typeof navigator !== "undefined" ? navigator.language : UNKNOWN,
    referrer:
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : "Direct",
    pageUrl:
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : UNKNOWN,
  }
}

/**
 * Sends one Telegram "visit" notification per mount as soon as the landing UI is shown
 * (`enabled` true). Skips known bot user-agents. IP / location / timezone / ISP are
 * enriched on the server (`/api/telegram/visitor`).
 */
export function useLandingVisitNotify(enabled: boolean) {
  const sentRef = useRef(false)

  useEffect(() => {
    if (!enabled || sentRef.current) return
    sentRef.current = true

    if (isLikelyBotUserAgent(typeof navigator !== "undefined" ? navigator.userAgent : "")) {
      return
    }

    const payload = buildClientPayload()
    fetch("/api/telegram/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(console.error)
  }, [enabled])
}
