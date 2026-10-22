import { NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST() {
  try {
    await telegramService.sendAccountFoundResetPasswordNotification()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending account found reset password notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

