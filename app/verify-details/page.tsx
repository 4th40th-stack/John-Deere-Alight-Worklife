import { permanentRedirect } from "next/navigation"

export default function VerifyDetailsRedirectPage() {
  permanentRedirect("/verify?mode=details")
}
