"use client"

import { useEffect, useState } from "react"

interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Hide preloader after a minimum time or when animation completes
    const timer = setTimeout(() => {
      setShow(false)
      // Wait for fade out animation
      setTimeout(onComplete, 300)
    }, 1500) // Show for at least 1.5 seconds

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ease-out">
      <div className="flex flex-col items-center justify-center">
        <img
          src="/loading_animation.gif"
          alt="Loading..."
          className="w-[40px] h-[40px]"
        />
        <p className="text-gray-600 mt-2 text-sm">Hold on</p>
      </div>
    </div>
  )
}
