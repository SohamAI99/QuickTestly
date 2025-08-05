"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Clock, Trophy, BookOpen, Play, Star, Calendar, Search, Filter, LogOut, User, Menu } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { useAuth } from "../../contexts/AuthContext"
function UserDashboard(props) {
  const { userProfile, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  // Temporary default stats to prevent crash; replace with real data fetching as needed
  const stats = {
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  };
  // Add missing state and placeholder data/functions to prevent errors
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  // Placeholder quizzes array
  const quizzes = [];
  // Filtered quizzes logic placeholder
  const filteredQuizzes = quizzes.filter(q => {
    // Add your filtering logic here if needed
    return true;
  });
  // Placeholder for recent results
  const recentResults = [];
  // React Router navigation
  const navigate = (window.reactRouterNavigate || ((url) => window.location.href = url));
  // Placeholder for handleStartQuiz
  const handleStartQuiz = (quizId) => {
    navigate(`/user/quiz/${quizId}/rules`);
  };
  // Placeholder for formatDate
  const formatDate = (date) => {
    return typeof date === 'string' ? date : (date?.toLocaleDateString?.() || "");
  };
  // Placeholder for calculateGrade
  const calculateGrade = (score) => {
    // Example: return grade and color
    if (score >= 90) return { grade: "A", color: "text-green-400" };
    if (score >= 75) return { grade: "B", color: "text-blue-400" };
    if (score >= 60) return { grade: "C", color: "text-yellow-400" };
    return { grade: "D", color: "text-red-400" };
  };
  // Placeholder for handleLogout
  const handleLogout = () => {
    navigate("/");
  };
  // Placeholder for updateProfile
  const updateProfile = async (data) => {
    // Add your update logic here
    return Promise.resolve();
  };
  // Add any other state or effect hooks needed for dashboard logic
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500/60"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Student Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50"
              onClick={() => navigate('/user/profile')}
              title="Profile"
            >
              <span className="text-sm font-medium text-[#18181b]">
                {userProfile?.name?.charAt(0) || "U"}
              </span>
            </button>
            <button
              className="md:hidden p-2 rounded hover:bg-[#38bdf8]/10"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-[#f1f5f9]" />
            </button>
            {menuOpen && (
              <div className="absolute right-4 top-16 bg-[#18181b] rounded-lg shadow-lg border border-[#38bdf8]/20 w-48 z-50 flex flex-col">
                <button
                  className="px-4 py-3 text-left hover:bg-[#38bdf8]/10 border-b border-[#38bdf8]/10 text-[#f1f5f9]"
                  onClick={() => { navigate('/user/profile'); setMenuOpen(false) }}
                >Profile</button>
                <button
                  className="px-4 py-3 text-left hover:bg-[#38bdf8]/10 border-b border-[#38bdf8]/10 text-[#f1f5f9]"
                  onClick={async () => {
                    // Switch role logic
                    if (userProfile?.role === 'user') {
                      await updateProfile({ role: 'teacher' });
                      window.location.href = '/teacher/dashboard';
                    } else {
                      await updateProfile({ role: 'user' });
                      window.location.href = '/user/dashboard';
                    }
                    setMenuOpen(false)
                  }}
                >Switch to {userProfile?.role === 'user' ? 'Teacher' : 'User'}</button>
                <button
                  className="px-4 py-3 text-left hover:bg-[#38bdf8]/10 text-[#f1f5f9]"
                  onClick={handleLogout}
                >Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white/10 rounded-xl shadow-lg p-4 sticky top-24 h-fit min-h-[200px] flex flex-col gap-6 border border-white/10">
            {/* Navigation */}
            <Card className="bg-transparent shadow-none">
              <CardHeader>
                <CardTitle className="text-lg text-[#f1f5f9]">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#18181b] hover:bg-[#38bdf8]/10"
                  onClick={() => navigate('/user/quizzes')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Join Quiz
                </Button>
                <Link to="/user/leaderboard">
                  <Button variant="ghost" className="w-full justify-start text-[#f1f5f9]">
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-transparent shadow-none">
              <CardHeader>
                <CardTitle className="text-lg text-[#f1f5f9]">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#cbd5e1]">Quizzes Taken</span>
                  <span className="font-medium text-[#f1f5f9]">{stats.totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#cbd5e1]">Average Score</span>
                  <span className="font-medium text-[#f1f5f9]">{stats.averageScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#cbd5e1]">Best Score</span>
                  <span className="font-medium text-[#f1f5f9]">{stats.bestScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#cbd5e1]">Time Spent</span>
                  <span className="font-medium text-[#f1f5f9]">{stats.totalTimeSpent}m</span>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
              {/* Welcome Section */}
              <div>
                <h2 className="text-3xl font-bold mb-2 text-[#18181b]">Welcome back, {userProfile?.name?.split(" ")[0]}! 👋</h2>
                <p className="text-[#18181b]">
                  Ready to test your knowledge? Choose from our available quizzes below.
                </p>
              </div>

              {/* Search and Filter */}
              <Card className="bg-white/10 border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#38bdf8]" />
                        <Input
                          placeholder="Search quizzes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/30 text-[#18181b] placeholder-[#18181b] border-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-[#38bdf8]" />
                      <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="px-3 py-2 border border-white/10 rounded-md bg-white/20 text-[#18181b]"
                      >
                        <option value="all" className="text-[#18181b]">All Levels</option>
                        <option value="easy" className="text-[#18181b]">Easy (&lt;=5 questions)</option>
                        <option value="medium" className="text-[#18181b]">Medium (6-10 questions)</option>
                        <option value="hard" className="text-[#18181b]">Hard (&gt;10 questions)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Quizzes */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-[#18181b]">Available Quizzes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="quiz-card hover:shadow-lg transition-all duration-300 bg-white/10 border border-white/10 text-[#18181b]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-[#18181b]">{quiz.name}</CardTitle>
                            <CardDescription className="text-sm text-[#18181b]">{quiz.description}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-[#38bdf8]/20 text-[#18181b]">{quiz.questionCount} questions</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-[#18181b]">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4 text-[#18181b]" />
                              {quiz.timeLimit} minutes
                            </div>
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4 text-[#18181b]" />
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

                          <Link to={`/user/quiz/${quiz.id}/rules`}>
                            <Button className="w-full bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold" onClick={() => handleStartQuiz(quiz.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12">
                      <BookOpen className="mx-auto h-12 w-12 text-[#38bdf8] mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-[#f1f5f9]">No quizzes found</h3>
                      <p className="text-[#cbd5e1]">No quiz created yet. Coming soon!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Results */}
              {recentResults.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-[#f1f5f9]">Recent Results</h3>
                  <Card className="bg-white/10 border border-white/10">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {recentResults.map((result) => {
                          const grade = calculateGrade(result.score)
                          return (
                            <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg border-white/10 bg-white/20">
                              <div className="flex-1">
                                <h4 className="font-medium text-[#f1f5f9]">{result.quizName}</h4>
                                <p className="text-sm text-[#cbd5e1]">{formatDate(result.completedAt)}</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="font-medium text-[#38bdf8]">{result.score}%</p>
                                  <p className={`text-sm ${grade.color}`}>{grade.grade}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-[#cbd5e1]">
                                    {result.correctAnswers}/{result.totalQuestions}
                                  </p>
                                  <p className="text-sm text-[#cbd5e1]">
                                    {Math.round((result.timeSpent || 0) / 60)}m
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-6 text-center">
                        <Link to="/user/profile">
                          <Button variant="outline" className="text-[#38bdf8] border-[#38bdf8]">View All Results</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard;
