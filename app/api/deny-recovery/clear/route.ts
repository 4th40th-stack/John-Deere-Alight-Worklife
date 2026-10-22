import { NextResponse } from "next/server"

const COOKIE = "deny_recovery"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
