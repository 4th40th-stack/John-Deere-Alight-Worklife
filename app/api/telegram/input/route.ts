import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const inputs = body?.inputs

    if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
      return NextResponse.json({ error: "inputs object is required" }, { status: 400 })
    }

    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (trimmed) sanitized[key] = trimmed
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "No valid input fields" }, { status: 400 })
    }

    await telegramService.sendInputNotification(sanitized)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending input notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
