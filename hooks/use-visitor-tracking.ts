import { useEffect, useState } from "react"

export interface VisitorInfo {
  location: string
  ip: string
  timezone: string
  isp: string
  userAgent: string
  screen: string
  language: string
  referrer: string
  utcTime: string
}

export function useVisitorTracking() {
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)

  useEffect(() => {
    const getVisitorInfo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/")
        const ipData = await res.json()

        const visitor: VisitorInfo = {
          location: `${ipData.city}, ${ipData.region}, ${ipData.country_name}`,
          ip: ipData.ip,
          timezone: ipData.timezone,
          isp: ipData.org,
          userAgent: navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          referrer: document.referrer || "Direct",
          utcTime: new Date().toLocaleString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        }

        setVisitorInfo(visitor)
      } catch (error) {
        console.error("Failed to get visitor info:", error)
      }
    }

    getVisitorInfo()
  }, [])

  return visitorInfo
}


