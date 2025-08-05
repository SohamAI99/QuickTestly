import { Link, useLocation } from "react-router-dom"
import { BookOpen } from "lucide-react"

export default function AppHeader({ role }) {
  const location = useLocation()
  // Determine dashboard path based on role or current path
  let dashboardPath = "/user/dashboard"
  if (role === "teacher" || location.pathname.startsWith("/teacher")) {
    dashboardPath = "/teacher/dashboard"
  }
  return (
    <header className="w-full z-30 sticky top-0 bg-white/30 backdrop-blur-lg shadow-lg border-none">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <Link to={dashboardPath} className="flex items-center gap-2 group">
          <span className="rounded-xl bg-gradient-to-tr from-[#6366f1]/80 to-[#38bdf8]/80 p-2 shadow-lg">
            <BookOpen className="h-7 w-7 text-white drop-shadow" />
          </span>
          <span className="text-2xl font-extrabold text-[#1e293b] tracking-tight group-hover:text-[#6366f1] transition-colors">QuickTestly</span>
        </Link>
      </div>
    </header>
  )
}
