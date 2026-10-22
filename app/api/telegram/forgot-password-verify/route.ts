import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendForgotPasswordVerifyNotification(data.verificationType)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending forgot password verify notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

