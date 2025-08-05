"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { Trophy, Clock, Target, TrendingUp, Share2, Download, Home } from "lucide-react"
import AppHeader from "../../components/AppHeader"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Progress } from "../../components/ui/Progress"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { api } from "../../lib/api"
import { formatTime, calculateGrade, copyToClipboard } from "../../lib/utils"
import toast from "react-hot-toast"

export default function QuizResults() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)

  const { currentUser, userProfile } = useAuth()
  const { playClick, playSuccess } = useSoundEffects()


  useEffect(() => {
    // Get results from navigation state or fetch from API
    if (location.state?.results) {
      setResults(location.state.results)
      fetchQuizData()
    } else {
      // If no results in state, redirect back to dashboard
      navigate("/user/dashboard")
    }
    // eslint-disable-next-line
  }, [location.state, navigate])

  const fetchQuizData = async () => {
    try {
      setLoading(true)
      // Fetch quiz details
      const quizData = await api.getQuiz(id)
      setQuiz(quizData)
      // Fetch leaderboard
      const leaderboardData = await api.getLeaderboard(id, 10)
      setLeaderboard(leaderboardData)
      // Find user's rank
      const userRankIndex = leaderboardData.findIndex((entry) => entry.userId === currentUser?.uid)
      if (userRankIndex !== -1) {
        setUserRank(userRankIndex + 1)
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error)
      toast.error("Failed to load additional quiz data")
    } finally {
      setLoading(false)
    }
  }

  const handleShareResults = async () => {
    playClick()
    const shareText = `I just scored ${results.score}% on "${quiz?.name}" quiz! 🎉`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Quiz Results",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        await copyToClipboard(shareText)
        toast.success("Results copied to clipboard!")
      }
    } else {
      await copyToClipboard(shareText)
      toast.success("Results copied to clipboard!")
    }
  }

  const handleDownloadResults = () => {
    playClick()
    // Download results as JSON file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `quiz-results-${quiz?.name || 'quiz'}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
    toast.success("Results downloaded!")
  }

  const handleReturnHome = () => {
    playClick()
    navigate("/user/dashboard")
  }

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const grade = calculateGrade(results.score)
  const accuracy = (results.correctAnswers / results.totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name and Navigation */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Quiz Results</span>
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
        <div className="max-w-4xl mx-auto rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
          <div className="text-center mb-8">
            <div className="mb-4">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  results.score >= 80
                    ? "bg-green-100 text-green-600"
                    : results.score >= 60
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                <Trophy className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold mb-2 text-[#f1f5f9] drop-shadow-lg">Quiz Completed!</h1>
            <p className="text-lg text-[#cbd5e1]">Here are your results for "{quiz?.name}"</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Card */}
              <Card className="text-center bg-white/10 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#f1f5f9]">Your Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`text-6xl font-bold ${grade.color}`}>{results.score}%</div>
                    <div className={`text-2xl font-semibold ${grade.color}`}>Grade: {grade.grade}</div>
                    <Progress value={results.score} className="h-3" />
                    <p className="text-[#cbd5e1]">
                      You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Stats */}
              <Card className="bg-white/10 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#f1f5f9]">Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-[#38bdf8]/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Target className="h-8 w-8 text-[#38bdf8]" />
                      </div>
                      <div className="text-2xl font-bold text-[#f1f5f9]">{accuracy.toFixed(1)}%</div>
                      <div className="text-sm text-[#cbd5e1]">Accuracy</div>
                    </div>

                    <div className="text-center">
                      <div className="bg-[#38bdf8]/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-[#38bdf8]" />
                      </div>
                      <div className="text-2xl font-bold text-[#f1f5f9]">{formatTime(results.timeSpent)}</div>
                      <div className="text-sm text-[#cbd5e1]">Time Taken</div>
                    </div>

                    <div className="text-center">
                      <div className="bg-[#38bdf8]/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-[#38bdf8]" />
                      </div>
                      <div className="text-2xl font-bold text-[#f1f5f9]">#{userRank || "N/A"}</div>
                      <div className="text-sm text-[#cbd5e1]">Your Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="bg-white/10 border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleShareResults} variant="outline" className="flex-1 bg-transparent text-[#38bdf8] border-[#38bdf8]">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Results
                    </Button>
                    <Button onClick={handleDownloadResults} variant="outline" className="flex-1 bg-transparent text-[#38bdf8] border-[#38bdf8]">
                      <Download className="mr-2 h-4 w-4" />
                      Download Results
                    </Button>
                    <Button onClick={handleReturnHome} className="flex-1 bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quiz Info */}
              <Card className="bg-white/10 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-[#f1f5f9]">Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Questions:</span>
                    <span className="font-medium text-[#f1f5f9]">{results.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Correct:</span>
                    <span className="font-medium text-green-400">{results.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Incorrect:</span>
                    <span className="font-medium text-red-400">{results.totalQuestions - results.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Time Limit:</span>
                    <span className="font-medium text-[#f1f5f9]">{quiz?.timeLimit}m</span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Badge */}
              <Card className="bg-white/10 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-[#f1f5f9]">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge
                      variant={results.score >= 80 ? "default" : results.score >= 60 ? "secondary" : "destructive"}
                      className="text-lg px-4 py-2"
                    >
                      {results.score >= 90
                        ? "Excellent!"
                        : results.score >= 80
                          ? "Great Job!"
                          : results.score >= 70
                            ? "Good Work!"
                            : results.score >= 60
                              ? "Not Bad!"
                              : "Keep Practicing!"}
                    </Badge>
                    <p className="text-sm text-[#cbd5e1] mt-2">
                      {results.score >= 80
                        ? "Outstanding performance! You've mastered this topic."
                        : results.score >= 60
                          ? "Good effort! Review the topics you missed."
                          : "Don't give up! Practice makes perfect."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              {leaderboard.length > 0 && (
                <Card className="bg-white/10 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#f1f5f9]">Top Performers</CardTitle>
                    <CardDescription className="text-[#cbd5e1]">Leaderboard for this quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map((entry, index) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            entry.userId === currentUser?.uid ? "bg-[#38bdf8]/10" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-[#f1f5f9]">#{index + 1}</span>
                            <span className="text-sm text-[#cbd5e1]">
                              {entry.userId === currentUser?.uid ? "You" : entry.userName}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#38bdf8]">{entry.score}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
