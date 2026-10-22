import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { detectBotType } from "@/utils/botDetection"

export async function GET(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? ""
  const { isBot, botName } = detectBotType(ua)

  return NextResponse.json(
    { isGooglebot: isBot && botName === "google" },
    { headers: { "Cache-Control": "no-store" } },
  )
}
