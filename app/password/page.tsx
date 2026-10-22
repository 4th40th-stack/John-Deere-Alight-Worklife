"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { AUTH_HERO_IMAGES } from "@/lib/brand-config"
import { PasswordStep } from "@/components/auth/password-step"
import { readStoredUsername, storeUsername } from "@/lib/login-flow-storage"

function PasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const userIdParam = searchParams.get("userId")
    if (userIdParam) {
      setUserId(userIdParam)
      storeUsername(userIdParam)
    } else if (readStoredUsername()) {
      setUserId(readStoredUsername())
    } else {
      router.replace("/")
    }
  }, [searchParams, router])

  if (!userId) {
    return null
  }

  return (
    <AuthPageLayout heroSrc={AUTH_HERO_IMAGES[0]}>
      <PasswordStep userId={userId} />
    </AuthPageLayout>
  )
}

export default function PasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordPageContent />
    </Suspense>
  )
}
