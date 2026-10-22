import { NextResponse } from "next/server"

const COOKIE = "deny_recovery"
const MAX_AGE = 60 * 60

/** User entered admin-deny → identity funnel (before OTP). */
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, "identity", {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  })
  return res
}
