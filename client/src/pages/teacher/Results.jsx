"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BarChart3, Users, Download, Filter, Search } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Select } from "../../components/ui/Select"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { formatTime} from "../../lib/utils"
import AppHeaderTeacher from "../../components/AppHeaderTeacher"

export default function TeacherResults() {
  const { userProfile } = useAuth()
  const { playClickSound } = useSoundEffects()
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userProfile])

  useEffect(() => {
    filterResults()
  }, [results, selectedQuiz, searchTerm])

  const fetchData = async () => {
    try {
      // Fetch teacher's quizzes
      const quizzesQuery = query(
        collection(db, "quizzes"),
        where("createdByTeacherId", "==", userProfile.uid),
        orderBy("createdAt", "desc"),
      )

      const quizzesSnapshot = await getDocs(quizzesQuery)
      const quizzesData = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setQuizzes(quizzesData)

      // Fetch results for teacher's quizzes
      const quizIds = quizzesData.map((quiz) => quiz.id)
      if (quizIds.length > 0) {
        const resultsQuery = query(collection(db, "results"), orderBy("completedAt", "desc"))

        const resultsSnapshot = await getDocs(resultsQuery)
        const allResults = resultsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Filter results for teacher's quizzes
        const teacherResults = allResults.filter((result) => quizIds.includes(result.quizId))

        setResults(teacherResults)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterResults = () => {
    let filtered = results

    // Filter by quiz
    if (selectedQuiz !== "all") {
      filtered = filtered.filter((result) => result.quizId === selectedQuiz)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.quizName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredResults(filtered)
  }

  const calculateStats = () => {
    if (filteredResults.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        uniqueStudents: 0,
        passRate: 0,
      }
    }

    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0)
    const averageScore = Math.round(totalScore / filteredResults.length)
    const uniqueStudents = new Set(filteredResults.map((result) => result.userId)).size
    const passRate = Math.round(
      (filteredResults.filter((result) => result.score >= 60).length / filteredResults.length) * 100,
    )

    return {
      totalAttempts: filteredResults.length,
      averageScore,
      uniqueStudents,
      passRate,
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#fdf6b2]">
      <AppHeaderTeacher />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Total Attempts</p>
                  <p className="text-2xl font-bold text-[#18181b]">{stats.totalAttempts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-[#18181b]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Average Score</p>
                  <p className="text-2xl font-bold text-[#18181b]">{stats.averageScore}%</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#18181b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Unique Students</p>
                  <p className="text-2xl font-bold text-[#18181b]">{stats.uniqueStudents}</p>
                </div>
                <Users className="h-8 w-8 text-[#18181b]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Pass Rate</p>
                  <p className="text-2xl font-bold text-[#18181b]">{stats.passRate}%</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#18181b]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#18181b]" />
            <Input
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-[#18181b]" />
            <Select value={selectedQuiz} onChange={(e) => setSelectedQuiz(e.target.value)}>
              <option value="all">All Quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{result.userName}</h4>
                          <Badge
                            variant={result.score >= 80 ? "success" : result.score >= 60 ? "warning" : "destructive"}
                          >
                            {result.score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-[#18181b]">{result.userEmail}</p>
                        <p className="text-sm font-medium text-[#18181b]">{result.quizName}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="text-[#18181b]">Score: </span>
                          <span className={`font-semibold ${getScoreColor(result.score)}`}>
                            {result.correctAnswers}/{result.totalQuestions}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">Time: {formatTime(result.timeSpent)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(result.completedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedQuiz !== "all"
                    ? "No results match your current filters."
                    : "No students have taken your quizzes yet."}
                </p>
                {(searchTerm || selectedQuiz !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedQuiz("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
