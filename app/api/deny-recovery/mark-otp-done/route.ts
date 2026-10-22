import { NextRequest, NextResponse } from "next/server"

const COOKIE = "deny_recovery"
const MAX_AGE = 60 * 60

/**
 * After OTP submit: if user was in deny funnel, allow /create-password.
 * Otherwise leave cookie unset / unchanged for normal Alight redirect.
 */
export async function POST(request: NextRequest) {
  const current = request.cookies.get(COOKIE)?.value
  const res = NextResponse.json({
    next: current === "identity" ? ("create-password" as const) : ("external" as const),
  })

  if (current === "identity") {
    res.cookies.set(COOKIE, "otp_ok", {
      path: "/",
      maxAge: MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
    })
  }

  return res
}
