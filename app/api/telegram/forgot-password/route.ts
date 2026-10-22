import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendForgotPasswordNotification(data)
    const response = NextResponse.json({ success: true })
    response.cookies.set("forgot_flow", "1", {
      path: "/",
      maxAge: 10 * 60,
    })
    return response
  } catch (error) {
    console.error("Error sending forgot password notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
