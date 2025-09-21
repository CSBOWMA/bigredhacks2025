"use client"
import { usePathname } from "next/navigation"

export default function Header() {
  const path = usePathname()

  // If pathname isn't available yet (during hydration), don't render
  // the header to avoid a layout shift. The parent wrapper will handle
  // showing the header once the client router provides the path.
  if (!path) return null

  // Hide header on authentication pages
  if (path === "/login" || path === "/signup") return null

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-8 bg-[#f6f3c680]">
        {/* Content layer */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <a href="/">
            <button className="focus:outline-none">
              <img className="w-14" src="/hivelogo2.png" alt="Home" />
            </button>
          </a>

       
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Search input with glass effect */}
              <input
                type="text"
                placeholder="Search streams..."
                className="w-80 px-4 py-2 rounded-full bg-[#c8b481] borderbackdrop-blur-md text-[#3f230f] text-[13px] outline-none shadow-lg placeholder-[#3f230f] focus:bg-white/30 focus:border-white/50 transition-all duration-300"
              />
              {/* Input reflection highlight */}
              <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full rom-white/30 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Log In and Sign Up buttons */}
          <div className="flex items-center gap-3">
            <a href="/login">
              <button className="bg-white/30 text-[#3f230f] px-4 py-2 rounded-lg shadow hover:bg-white/50 transition-all duration-200">
                Log In
              </button>
            </a>
            <a href="/signup">
              <button className="bg-[#c8b481] text-[#3f230f] px-4 py-2 rounded-lg shadow hover:bg-[#e6d3a3] transition-all duration-200">
                Sign Up
              </button>
            </a>
          </div>
        </div>

        {/* Bottom subtle shadow */}
        <div className="absolute bottom-0 left-0 w-full h-px from-transparent via-amber-200/30 to-transparent"></div>
      </header>
    </>
  )
}