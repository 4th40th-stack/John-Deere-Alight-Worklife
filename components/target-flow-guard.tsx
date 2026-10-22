"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  hasTargetFlowDetailsOk,
  hasTargetFlowLogin,
} from "@/lib/flores-flow"
import { useTargetFlowGate } from "@/components/target-flow-gate-provider"

export type TargetFlowPhase = "details" | "code" | "verify-choice"

/**
 * Redirects to `/` if session flow flags / loginUserId are missing (direct URL or wrong order).
 */
export function TargetFlowGuard({
  phase,
  children,
}: {
  phase: TargetFlowPhase
  children: ReactNode
}) {
  const router = useRouter()
  const { allowLocalTesting } = useTargetFlowGate()
  const [allowed, setAllowed] = useState(allowLocalTesting)

  useEffect(() => {
    if (allowLocalTesting) {
      setAllowed(true)
      return
    }
    if (typeof window === "undefined") return

    const uid = sessionStorage.getItem("loginUserId")
    if (!uid) {
      router.replace("/")
      return
    }

    if (phase === "details") {
      if (!hasTargetFlowLogin()) {
        router.replace("/")
        return
      }
      setAllowed(true)
      return
    }

    if (phase === "code" || phase === "verify-choice") {
      if (!hasTargetFlowDetailsOk()) {
        router.replace("/")
        return
      }
      setAllowed(true)
    }
  }, [phase, router, allowLocalTesting])

  if (!allowed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-500 text-sm">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
