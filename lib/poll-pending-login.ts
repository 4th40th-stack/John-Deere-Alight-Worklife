import {
  APPROVAL_TIMEOUT_MS,
  approvalPollDelayMs,
} from "./approval-messages"

export type PollOutcome = "approved" | "denied" | "redirected" | "timeout"

export async function pollPendingLogin(
  id: string,
  timeoutMs: number = APPROVAL_TIMEOUT_MS
): Promise<PollOutcome> {
  const deadline = Date.now() + timeoutMs
  const waitStartedAt = Date.now()

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`/api/pending-login/${encodeURIComponent(id)}`, {
        cache: "no-store",
      })

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          status?: string
        }

        if (data.status === "approved") {
          return "approved"
        }
        if (data.status === "denied") {
          return "denied"
        }
        if (data.status === "redirected") {
          return "redirected"
        }
      }
    } catch {
      // Network hiccup — keep polling
    }

    await new Promise((r) => setTimeout(r, approvalPollDelayMs(waitStartedAt)))
  }

  return "timeout"
}
