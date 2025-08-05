"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "../../components/ui/Button"
import AppHeader from "../../components/AppHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Progress } from "../../components/ui/Progress"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { api } from "../../lib/api"
import { formatTime, shuffleArray } from "../../lib/utils"
import toast from "react-hot-toast"

export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const { currentUser, userProfile } = useAuth()
  const { playClick, playTick, playWarning, playComplete } = useSoundEffects()

  useEffect(() => {
    fetchQuiz()
  }, [id])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz(true) // Auto-submit when time runs out
            return 0
          }

          // Play warning sound when 1 minute left
          if (prev === 60) {
            playWarning()
          }

          // Play tick sound every second in last 10 seconds
          if (prev <= 10) {
            playTick()
          }

          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft, playWarning, playTick])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const quizData = await api.getQuiz(id)
      setQuiz(quizData)

      // Shuffle questions and their options for randomization
      const shuffledQuestions = shuffleArray(quizData.questions).map((question) => ({
        ...question,
        options: shuffleArray(question.options),
      }))

      setQuestions(shuffledQuestions)
      setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast.error("Failed to load quiz")
      navigate("/user/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId, selectedOption) => {
    playClick()
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }))
  }

  const handlePreviousQuestion = () => {
    playClick()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    playClick()
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleQuestionJump = (index) => {
    playClick()
    setCurrentQuestionIndex(index)
  }

  const calculateResults = useCallback(() => {
    let correctAnswers = 0
    const totalQuestions = questions.length

    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const timeSpent = Math.round((Date.now() - startTime) / 1000) // in seconds

    return {
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      answers,
    }
  }, [questions, answers, startTime])

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unansweredQuestions = questions.filter((q) => !answers[q.id])
      if (unansweredQuestions.length > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`,
        )
        if (!confirmSubmit) return
      }
    }

    setSubmitting(true)

    try {
      const results = calculateResults()

      // Submit result to database
      const resultData = {
        quizId: id,
        quizName: quiz.name,
        userId: currentUser.uid,
        userName: userProfile.name,
        userEmail: userProfile.email,
        ...results,
      }

      await api.submitResult(resultData)

      playComplete()
      toast.success("Quiz submitted successfully!")

      // Navigate to results page
      navigate(`/user/quiz/${id}/results`, {
        state: { results: resultData },
      })
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500/60 mx-auto mb-4"></div>
          <p className="text-[#cbd5e1]">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-[#f1f5f9]">Quiz Not Available</h2>
          <p className="text-[#cbd5e1] mb-4">Unable to load quiz questions.</p>
          <Button onClick={() => navigate("/user/dashboard")} className="bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold">Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name and Navigation */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Take Quiz</span>
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
      {/* Header */}
      <div className="border-b bg-white/10 backdrop-blur sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-[#f1f5f9]">{quiz.name}</h1>
              <Badge variant="outline" className="text-[#38bdf8] border-[#38bdf8]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  timeLeft <= 60 ? "bg-red-500/10 text-red-400" : "bg-[#27272a] text-[#f1f5f9]"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className={`font-mono font-medium ${timeLeft <= 60 ? "animate-pulse" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#cbd5e1]">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-[#38bdf8]/20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl sticky top-24 border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <CardHeader>
                <CardTitle className="text-lg text-[#f1f5f9]">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      className={`h-10 w-10 p-0 ${
                        answers[questions[index].id]
                          ? currentQuestionIndex === index
                            ? "bg-[#38bdf8] text-[#18181b]"
                            : "bg-green-400/20 text-green-400 border-green-400 hover:bg-green-400/40"
                          : "text-[#f1f5f9] border-white/10"
                      }`}
                      onClick={() => handleQuestionJump(index)}
                    >
                      {answers[questions[index].id] && currentQuestionIndex !== index && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {!answers[questions[index].id] && <span>{index + 1}</span>}
                      {currentQuestionIndex === index && <span>{index + 1}</span>}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#38bdf8] rounded"></div>
                    <span className="text-[#f1f5f9]">Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-400/20 border border-green-400 rounded flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-[#f1f5f9]">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-white/10 rounded"></div>
                    <span className="text-[#f1f5f9]">Not answered</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-[#38bdf8] bg-[#38bdf8]/20">Question {currentQuestionIndex + 1}</Badge>
                      {currentQuestion.difficulty && <Badge variant="outline" className="text-[#f1f5f9] border-white/10">{currentQuestion.difficulty}</Badge>}
                    </div>
                    <CardTitle className="text-xl leading-relaxed text-[#f1f5f9]">{currentQuestion.question}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question Image (if any) */}
                {currentQuestion.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={currentQuestion.imageUrl || "/placeholder.svg"}
                      alt="Question illustration"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionKey = String.fromCharCode(65 + index) // A, B, C, D
                    const isSelected = answers[currentQuestion.id] === option

                    return (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[#38bdf8]/50 ${
                          isSelected ? "border-[#38bdf8] bg-[#38bdf8]/10 shadow-md" : "border-white/10 hover:bg-[#27272a]"
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isSelected
                                ? "border-[#38bdf8] bg-[#38bdf8] text-[#18181b]"
                                : "border-white/10 text-[#f1f5f9]"
                            }`}
                          >
                            {optionKey}
                          </div>
                          <div className="flex-1">
                            <p className={`${isSelected ? "font-medium text-[#38bdf8]" : "text-[#f1f5f9]"}`}>{option}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <Button variant="outline" className="text-[#38bdf8] border-[#38bdf8]" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {!isLastQuestion ? (
                      <Button onClick={handleNextQuestion} className="bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold">
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubmitQuiz(false)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-[#f1f5f9] font-bold"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          <>
                            <Flag className="mr-2 h-4 w-4" />
                            Submit Quiz
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            {/* End of sidebar card section */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
