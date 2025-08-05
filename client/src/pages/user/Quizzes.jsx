import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { BookOpen, Clock, User, Star, Calendar } from "lucide-react"
import { api } from "../../lib/api"
import { formatDate } from "../../lib/utils"


export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      try {
        const data = await api.getQuizzes()
        setQuizzes(data)
      } catch (e) {
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500/60"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b] flex flex-col items-center justify-center">
      {/* QuickTestly Logo/Name */}
      <div className="w-full flex justify-center items-center py-8">
        <div className="flex items-center gap-3">
          <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
          <span className="text-3xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-extrabold mb-10 flex items-center gap-3 text-[#f1f5f9] drop-shadow-lg">
          <BookOpen className="h-8 w-8 text-[#38bdf8] drop-shadow" /> Available Quizzes
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {quizzes.length > 0 ? quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-2xl font-bold mb-1 text-[#f1f5f9]">{quiz.name}</div>
                  <div className="text-base text-[#cbd5e1] mb-2">{quiz.description}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] font-semibold text-sm shadow-sm">{quiz.questionCount} questions</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-[#cbd5e1]">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-[#38bdf8]" />
                    {quiz.timeLimit} minutes
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4 text-[#38bdf8]" />
                    {quiz.createdByTeacherName}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-[#cbd5e1]">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-[#38bdf8]" />
                    {formatDate(quiz.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    4.5
                  </div>
                </div>
                <Button
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold text-lg shadow-lg hover:from-[#0ea5e9] hover:to-[#4338ca] transition-all focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50"
                  onClick={() => navigate(`/quiz/${quiz.id}/rules`)}
                >
                  Join Quiz
                </Button>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-12 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <BookOpen className="mx-auto h-14 w-14 text-[#38bdf8] mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-[#f1f5f9]">No quizzes found</h3>
              <p className="text-lg text-[#cbd5e1]">No quiz created yet. Coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
