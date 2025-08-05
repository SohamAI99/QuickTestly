import { Link, useLocation } from "react-router-dom"
import { BookOpen } from "lucide-react"

export default function AppHeaderTeacher() {
  const location = useLocation()
  // Always go to teacher dashboard
  return (
    <header className="w-full z-30 sticky top-0 bg-gradient-to-tr from-[#fbbf24]/70 to-[#f472b6]/70 backdrop-blur-lg shadow-lg border-none">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/teacher/dashboard" className="flex items-center gap-2 group">
          <span className="rounded-xl bg-gradient-to-tr from-[#fbbf24] to-[#f472b6] p-2 shadow-lg">
            <BookOpen className="h-7 w-7 text-[#18181b] drop-shadow" />
          </span>
          <span className="text-2xl font-extrabold text-[#18181b] tracking-tight group-hover:text-[#78350f] transition-colors">QuickTestly</span>
        </Link>
      </div>
    </header>
  )
}
