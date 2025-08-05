"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, Users, Trophy, AlertCircle, Play, ArrowLeft, BookOpen, Target, Timer } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Checkbox } from "../../components/ui/Checkbox"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { api } from "../../lib/api"
import { formatDate } from "../../lib/utils"
import toast from "react-hot-toast"
import AppHeader from "../../components/AppHeader"

export default function QuizRules() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [startingQuiz, setStartingQuiz] = useState(false)

  const { currentUser } = useAuth()
  const { playClick, playSuccess } = useSoundEffects()

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const quizData = await api.getQuiz(id)
      setQuiz(quizData)
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast.error("Failed to load quiz details")
      navigate("/user/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    if (!agreedToRules) {
      toast.error("Please agree to the rules before starting the quiz")
      return
    }

    setStartingQuiz(true)
    playClick()

    try {
      // Add a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      playSuccess()
      navigate(`/user/quiz/${id}/take`)
    } catch (error) {
      console.error("Error starting quiz:", error)
      toast.error("Failed to start quiz")
    } finally {
      setStartingQuiz(false)
    }
  }

  const handleGoBack = () => {
    playClick()
    navigate("/user/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500/60"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-[#f1f5f9]">Quiz Not Found</h2>
          <p className="text-[#cbd5e1] mb-4">The quiz you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleGoBack} className="bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold">Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  // Render rules UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name and Navigation */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Quiz Rules</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/user/dashboard">
              <Button variant="ghost" className="text-[#f1f5f9]">Dashboard</Button>
            </a>
            <a href="/user/quizzes">
              <Button variant="ghost" className="text-[#f1f5f9]">Join Quiz</Button>
            </a>
            <a href="/user/leaderboard">
              <Button variant="ghost" className="text-[#f1f5f9]">Leaderboard</Button>
            </a>
            <a href="/user/profile">
              <Button variant="ghost" className="text-[#f1f5f9]">Profile</Button>
            </a>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
          <div className="mb-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#38bdf8] mb-4" />
            <h1 className="text-3xl font-extrabold mb-2 text-[#f1f5f9] drop-shadow-lg">Quiz Rules</h1>
            <p className="text-lg text-[#cbd5e1]">Please read the rules carefully before starting the quiz.</p>
          </div>
          <div className="mb-8">
            <Card className="bg-white/10 border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-[#f1f5f9]">{quiz.name}</CardTitle>
                <CardDescription className="text-[#cbd5e1]">{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-[#cbd5e1]">
                  <Badge className="bg-[#38bdf8]/20 text-[#38bdf8]">{quiz.questionCount} Questions</Badge>
                  <Badge className="bg-[#38bdf8]/20 text-[#38bdf8]">{quiz.timeLimit} Minutes</Badge>
                  <Badge className="bg-[#38bdf8]/20 text-[#38bdf8]">By {quiz.createdByTeacherName}</Badge>
                </div>
                <div className="flex items-center gap-4 text-[#cbd5e1]">
                  <Calendar className="h-4 w-4 text-[#38bdf8]" />
                  <span>Created: {formatDate(quiz.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mb-8">
            <Card className="bg-white/10 border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-[#f1f5f9]">General Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[#cbd5e1]">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Each question is mandatory and must be answered.</li>
                  <li>You cannot go back to previous questions once answered.</li>
                  <li>There is a time limit for the quiz. Manage your time wisely.</li>
                  <li>Do not refresh or close the browser during the quiz.</li>
                  <li>Your score will be shown at the end of the quiz.</li>
                </ul>
                <div className="flex items-center mt-4">
                  <Checkbox id="agree" checked={agreedToRules} onCheckedChange={setAgreedToRules} />
                  <label htmlFor="agree" className="ml-2 text-[#f1f5f9] cursor-pointer">I have read and agree to the rules</label>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Button variant="outline" className="text-[#38bdf8] border-[#38bdf8]" onClick={handleGoBack} disabled={startingQuiz}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              className="bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold px-8 py-3 rounded-xl shadow-lg hover:from-[#0ea5e9] hover:to-[#4338ca] transition-all focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50"
              onClick={handleStartQuiz}
              disabled={!agreedToRules || startingQuiz}
            >
              {startingQuiz ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </div>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
