"use client"

function safeString(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

export async function notifyInput(inputs: Record<string, string>): Promise<boolean> {
  try {
    const sanitized: Record<string, string> = {}
    for (const [label, value] of Object.entries(inputs)) {
      const trimmed = safeString(value)
      if (trimmed) sanitized[label] = trimmed
    }

    if (Object.keys(sanitized).length === 0) return false

    await fetch("/api/telegram/input", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: sanitized }),
    }).catch(() => null)

    return true
  } catch {
    return false
  }
}
