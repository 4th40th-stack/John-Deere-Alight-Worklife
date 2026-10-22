export function SiteFooter({ className = "w-full bg-gray-100 mt-auto" }: { className?: string }) {
  return (
    <footer className={className}>
      {/* Mobile Footer Layout */}
      <div className="px-5 py-8 md:hidden bg-[#fdfdfd]">
        <div className="flex flex-col gap-6 mb-8">
          {/* Link column */}
          <div className="flex flex-col gap-5 text-[15px]">
            <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">
              Contact Us
            </a>
            <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">
              Feedback
            </a>
            <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">
              Protect Yourself From Website Fraud
            </a>
          </div>

          {/* Logo and app badges */}
          <div className="flex flex-col items-center gap-5 mt-6">
            <a href="https://alight.com/" target="_blank" rel="noopener noreferrer" className="block">
              <img src="/alight_worklife__logo_black_2x.png" alt="alight worklife" className="w-[240px] h-auto" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-400 my-6" />
        
        <div className="flex flex-col gap-2 text-[13px] text-gray-700">
          <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">Privacy Policy</a>
          <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">Terms Of Use</a>
          <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline">Cookie Notice</a>
          <a href="/api/login-out" className="text-[#002586] underline decoration-1 underline-offset-2 hover:no-underline leading-tight">Cookie Settings [Do Not Sell or Share My Personal Information]</a>
          
          <p className="mt-4">©2026 Alight Solutions. All rights reserved.</p>
        </div>
      </div>

      {/* Desktop Footer Layout - matches provided design */}
      <div className="hidden md:block px-8 lg:px-12 py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Upper section: three columns of links + logo & app badges */}
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div className="flex flex-col gap-2 text-sm">
              <a href="/api/login-out" className="text-[#002586] hover:underline">Contact Us</a>
              <a href="/api/login-out" className="text-[#002586] hover:underline">Feedback</a>
              <a href="/api/login-out" className="text-[#002586] hover:underline">Protect Yourself From Website Fraud</a>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0 ml-auto">
              <a href="https://alight.com/" target="_blank" rel="noopener noreferrer" className="block">
                <img src="/alight_worklife__logo_black_2x.png" alt="alight worklife" className="w-[230px] h-[40px]" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 my-6" />
          {/* Lower section: legal links left, copyright right */}
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-gray-600">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href="/api/login-out" className="text-[#002586] hover:underline">Privacy Policy</a>
              <a href="/api/login-out" className="text-[#002586] hover:underline">Terms Of Use</a>
              <a href="/api/login-out" className="text-[#002586] hover:underline">Cookie Notice</a>
              <a href="/api/login-out" className="text-[#002586] hover:underline">Cookie Settings [Do Not Sell or Share My Personal Information]</a>
            </p>
            <p className="text-gray-500 shrink-0">©2026 Alight Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
