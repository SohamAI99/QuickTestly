"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Award, Crown, TrendingUp, Clock, Target } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../lib/api"
import { formatDate } from "../../lib/utils"
import toast from "react-hot-toast"

export default function UserLeaderboard() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [quizLeaderboards, setQuizLeaderboards] = useState({})
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState("")
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)

  const { currentUser } = useAuth()

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)

      // Fetch global leaderboard
      const globalData = await api.getGlobalLeaderboard(50)
      setGlobalLeaderboard(globalData)

      // Find user's rank in global leaderboard
      const userRankIndex = globalData.findIndex((entry) => entry.userId === currentUser?.uid)
      if (userRankIndex !== -1) {
        setUserRank(userRankIndex + 1)
      }

      // Fetch available quizzes
      const quizzesData = await api.getQuizzes()
      setQuizzes(quizzesData)

      // Fetch leaderboard for each quiz
      const quizLeaderboardPromises = quizzesData.map(async (quiz) => {
        const leaderboard = await api.getLeaderboard(quiz.id, 20)
        return { quizId: quiz.id, leaderboard }
      })

      const quizLeaderboardResults = await Promise.all(quizLeaderboardPromises)
      const quizLeaderboardsMap = {}
      quizLeaderboardResults.forEach(({ quizId, leaderboard }) => {
        quizLeaderboardsMap[quizId] = leaderboard
      })
      setQuizLeaderboards(quizLeaderboardsMap)

      if (quizzesData.length > 0) {
        setSelectedQuiz(quizzesData[0].id)
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      toast.error("Failed to load leaderboard data")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st Place</Badge>
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">2nd Place</Badge>
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">3rd Place</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  const LeaderboardTable = ({ data, showQuizName = false }) => (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const rank = index + 1
        const isCurrentUser = entry.userId === currentUser?.uid

        return (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              isCurrentUser ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10">{getRankIcon(rank)}</div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{entry.userName}</h3>
                  {isCurrentUser && <Badge variant="outline">You</Badge>}
                </div>
                {showQuizName && <p className="text-sm text-muted-foreground">{entry.quizName}</p>}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center">
                    <Target className="mr-1 h-3 w-3" />
                    {entry.correctAnswers}/{entry.totalQuestions}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.round((entry.timeSpent || 0) / 60)}m
                  </div>
                  <span>{formatDate(entry.completedAt)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{entry.score}%</div>
              {getRankBadge(rank)}
            </div>
          </div>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500/60"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name and Navigation */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Leaderboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/user/dashboard">
              <Button variant="ghost" className="text-[#f1f5f9]">Dashboard</Button>
            </Link>
            <Link to="/user/quizzes">
              <Button variant="ghost" className="text-[#f1f5f9]">Join Quiz</Button>
            </Link>
            <Link to="/user/profile">
              <Button variant="ghost" className="text-[#f1f5f9]">Profile</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
          <h2 className="text-4xl font-extrabold mb-8 text-center text-[#f1f5f9] drop-shadow-lg">Leaderboard</h2>
          <LeaderboardTable data={globalLeaderboard} showQuizName={false} />
        </div>
      </div>
    </div>
  )
}
