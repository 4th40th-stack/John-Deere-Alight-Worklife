import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    await telegramService.sendForgotPasswordResendNotification()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending forgot password resend notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

