"use client"

import { useEffect, useRef } from "react"
import { APPROVAL_TIMEOUT_MS, POLL_MS } from "@/lib/approval-messages"

type PendingApprovalCallbacks = {
  onApproved: () => void
  onDenied: () => void
  onTimeout: () => void
  onRedirected?: () => void
}

export function usePendingApproval(
  pendingId: string | null,
  callbacks: PendingApprovalCallbacks,
) {
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    if (!pendingId) return

    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null

    const clearTimers = () => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = null
      }
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/pending-login/${encodeURIComponent(pendingId)}`,
          { cache: "no-store" },
        )
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { status?: string }
        const status = String(data.status ?? "").toLowerCase()

        if (status === "approved") {
          clearTimers()
          if (!cancelled) callbacksRef.current.onApproved()
        } else if (status === "denied") {
          clearTimers()
          if (!cancelled) callbacksRef.current.onDenied()
        } else if (status === "redirected") {
          clearTimers()
          if (!cancelled) {
            if (callbacksRef.current.onRedirected) {
              callbacksRef.current.onRedirected()
            } else {
              window.location.href = "/api/login-out"
            }
          }
        } else if (status === "expired") {
          clearTimers()
          if (!cancelled) callbacksRef.current.onTimeout()
        }
      } catch {
        // keep polling
      }
    }

    pollTimer = setInterval(() => {
      void poll()
    }, POLL_MS)
    void poll()

    timeoutTimer = setTimeout(() => {
      clearTimers()
      if (!cancelled) callbacksRef.current.onTimeout()
    }, APPROVAL_TIMEOUT_MS)

    return () => {
      cancelled = true
      clearTimers()
    }
  }, [pendingId])
}
