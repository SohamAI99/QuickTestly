"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  Target,
  Menu,
  Plus,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { api } from "../../lib/api"
import { formatDate } from "../../lib/utils"
import AppHeaderTeacher from "../../components/AppHeaderTeacher"
import toast from "react-hot-toast"

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const { currentUser, userProfile, logout } = useAuth()
  const { playClick } = useSoundEffects()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch teacher's quizzes
      const teacherQuizzes = await api.getQuizzesByTeacher(currentUser.uid)
      setQuizzes(teacherQuizzes)

      // Calculate stats
      let totalAttempts = 0
      let totalScore = 0
      const uniqueStudents = new Set()

      for (const quiz of teacherQuizzes) {
        const results = await api.getQuizResults(quiz.id)
        totalAttempts += results.length

        results.forEach((result) => {
          totalScore += result.score
          uniqueStudents.add(result.userId)
        })
      }

      setStats({
        totalQuizzes: teacherQuizzes.length,
        totalStudents: uniqueStudents.size,
        totalAttempts,
        averageScore: totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0,
      })

      // Get recent activity (latest quiz attempts)
      const allResults = []
      for (const quiz of teacherQuizzes.slice(0, 5)) {
        // Limit to recent quizzes
        const results = await api.getQuizResults(quiz.id)
        allResults.push(...results.slice(0, 3)) // Get latest 3 attempts per quiz
      }

      // Sort by completion date and take the most recent
      const sortedActivity = allResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 10)

      setRecentActivity(sortedActivity)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return
    }

    try {
      await api.deleteQuiz(quizId)
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId))
      toast.success("Quiz deleted successfully")
      playClick()
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast.error("Failed to delete quiz")
    }
  }

  const handleLogout = async () => {
    playClick()
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#fdf6b2] text-[#18181b]">
      <AppHeaderTeacher />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#18181b]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/teacher/create-quiz">
                    <Button className="w-full justify-start text-[#18181b] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db]" onClick={playClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Quiz
                    </Button>
                  </Link>
                  <Link to="/teacher/manage-quizzes">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-[#18181b] border-[#d1d5db] hover:bg-[#f3f4f6]" onClick={playClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Quizzes
                    </Button>
                  </Link>
                  <Link to="/teacher/results">
                    <Button variant="outline" className="w-full justify-start bg-transparent text-[#18181b] border-[#d1d5db] hover:bg-[#f3f4f6]" onClick={playClick}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#18181b]">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#18181b]">Total Quizzes</span>
                    <span className="font-medium text-[#18181b]">{stats.totalQuizzes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#18181b]">Students Reached</span>
                    <span className="font-medium text-[#18181b]">{stats.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#18181b]">Total Attempts</span>
                    <span className="font-medium text-[#18181b]">{stats.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#18181b]">Avg. Score</span>
                    <span className="font-medium text-[#18181b]">{stats.averageScore}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Welcome Section */}
              <div>
                <h2 className="text-3xl font-bold mb-2 text-[#18181b]">Welcome back, Professor {userProfile?.name?.split(" ")[0]}! 👋</h2>
                <p className="text-[#18181b]">
                  Manage your quizzes and track student performance from your dashboard.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-[#18181b]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#18181b]">Total Quizzes</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#18181b]">{stats.totalQuizzes}</div>
                    <p className="text-xs text-[#18181b]">Active quizzes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#18181b]">Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#18181b]">{stats.totalStudents}</div>
                    <p className="text-xs text-[#18181b]">Unique participants</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#18181b]">Quiz Attempts</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#18181b]">{stats.totalAttempts}</div>
                    <p className="text-xs text-[#18181b]">Total submissions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#18181b]">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#18181b]">{stats.averageScore}%</div>
                    <p className="text-xs text-[#18181b]">Across all quizzes</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Quizzes */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#18181b]">Your Quizzes</h3>
                  <Link to="/teacher/create-quiz">
                    <Button onClick={playClick} className="text-[#18181b] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db]">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Quiz
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzes.slice(0, 6).map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                    <CardTitle className="text-lg mb-2 text-[#18181b]">{quiz.name}</CardTitle>
                    <CardDescription className="text-sm text-[#18181b]">{quiz.description}</CardDescription>
                          </div>
                          <Badge variant={quiz.isPublic ? "default" : "secondary"} className="text-[#18181b]">
                            {quiz.isPublic ? "Public" : "Draft"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-[#18181b]">
                            <div className="flex items-center">
                              <BookOpen className="mr-1 h-4 w-4 text-[#18181b]" />
                              {quiz.questionCount} questions
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4 text-[#18181b]" />
                              {quiz.timeLimit} min
                            </div>
                          </div>

                          <div className="text-sm text-[#18181b]">Created {formatDate(quiz.createdAt)}</div>

                          <div className="flex items-center justify-between">
              <button
                className="md:hidden p-2 rounded hover:bg-blue-100"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                <Menu className="h-6 w-6 text-blue-900" />
              </button>
              {menuOpen && (
                <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border w-48 z-50 flex flex-col">
                  <button
                    className="px-4 py-3 text-left hover:bg-[#f3f4f6] border-b text-[#18181b]"
                    onClick={() => { window.location.href = '/teacher/profile'; setMenuOpen(false) }}
                  >Profile</button>
                  <button
                    className="px-4 py-3 text-left hover:bg-[#f3f4f6] border-b text-[#18181b]"
                    onClick={async () => {
                      // Switch role logic
                      if (userProfile?.role === 'teacher') {
                        await updateProfile({ role: 'user' });
                        window.location.href = '/user/dashboard';
                      } else {
                        await updateProfile({ role: 'teacher' });
                        window.location.href = '/teacher/dashboard';
                      }
                      setMenuOpen(false)
                    }}
                  >Switch to {userProfile?.role === 'teacher' ? 'User' : 'Teacher'}</button>
                  <button
                    className="px-4 py-3 text-left hover:bg-[#f3f4f6] text-[#18181b]"
                    onClick={handleLogout}
                  >Logout</button>
                </div>
              )}
                            <div className="flex space-x-2">
                              <Link to={`/teacher/quiz/${quiz.id}/results`}>
                                <Button size="sm" variant="outline" onClick={playClick} className="text-[#18181b] border-[#d1d5db] hover:bg-[#f3f4f6]">
                                  <Eye className="mr-1 h-3 w-3 text-[#18181b]" />
                                  View
                                </Button>
                              </Link>
                              <Link to={`/teacher/quiz/${quiz.id}/edit`}>
                                <Button size="sm" variant="outline" onClick={playClick} className="text-[#18181b] border-[#d1d5db] hover:bg-[#f3f4f6]">
                                  <Edit className="mr-1 h-3 w-3 text-[#18181b]" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="text-red-600 hover:text-red-700 border-[#d1d5db] hover:bg-[#f3f4f6]"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {quizzes.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-[#18181b] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-[#18181b]">No quizzes yet</h3>
                      <p className="mb-4 text-[#18181b]">
                        Create your first quiz to get started with QuickTestly.
                      </p>
                      <Link to="/teacher/create-quiz">
                        <Button onClick={playClick} className="text-[#18181b] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db]">
                          <Plus className="mr-2 h-4 w-4 text-[#18181b]" />
                          Create Your First Quiz
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <div>
              <h3 className="text-2xl font-bold mb-6 text-[#18181b]">Recent Activity</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-[#18181b]">{activity.userName}</h4>
                              <p className="text-sm text-[#18181b]">
                                Completed "{activity.quizName}" • {formatDate(activity.completedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                            <div className="font-medium text-[#18181b]">{activity.score}%</div>
                            <div className="text-sm text-[#18181b]">
                              {activity.correctAnswers}/{activity.totalQuestions}
                            </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
