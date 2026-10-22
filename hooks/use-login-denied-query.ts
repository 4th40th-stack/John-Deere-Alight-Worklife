"use client"

import { useEffect } from "react"
import {
  LOGIN_DENIED_ERROR_TEXT,
  MSG_UNABLE_VERIFY_TIME,
} from "@/lib/approval-messages"
import { clearLoginDeniedError, clearLoginFlowStorage, hasLoginDeniedError, SESSION_LOGIN_DENIED_ERROR_KEY } from "@/lib/login-flow-storage"

function clearLoginFlow() {
  if (typeof window === "undefined") return
  clearLoginFlowStorage()
  clearLoginDeniedError()
  sessionStorage.removeItem(SESSION_LOGIN_DENIED_ERROR_KEY)
  sessionStorage.removeItem("pendingLoginId")
}

type Props = {
  onDenied?: (message: string) => void
  onUnavailable?: (message: string) => void
}

export function useLoginDeniedQueryParams({ onDenied, onUnavailable }: Props = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return

    if (
      hasLoginDeniedError() ||
      sessionStorage.getItem(SESSION_LOGIN_DENIED_ERROR_KEY) === "1"
    ) {
      clearLoginDeniedError()
      clearLoginFlow()
      onDenied?.(LOGIN_DENIED_ERROR_TEXT)
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get("loginDenied") === "1") {
      clearLoginFlow()
      onDenied?.(LOGIN_DENIED_ERROR_TEXT)
      params.delete("loginDenied")
      const next = params.toString()
      window.history.replaceState({}, "", next ? `/?${next}` : "/")
    } else if (params.get("verifyUnavailable") === "1") {
      clearLoginFlow()
      onUnavailable?.(MSG_UNABLE_VERIFY_TIME)
      params.delete("verifyUnavailable")
      const next = params.toString()
      window.history.replaceState({}, "", next ? `/?${next}` : "/")
    }
  }, [onDenied, onUnavailable])
}

export { clearLoginFlow }
