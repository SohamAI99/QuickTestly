"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Users, Clock, MoreHorizontal } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import AppHeaderTeacher from "../../components/AppHeaderTeacher"

export default function ManageQuizzes() {
  const { userProfile } = useAuth()
  const { playClickSound } = useSoundEffects()
  const [quizzes, setQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [userProfile])

  useEffect(() => {
    // Filter quizzes based on search term
    const filtered = quizzes.filter(
      (quiz) =>
        quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredQuizzes(filtered)
  }, [quizzes, searchTerm])

  const fetchQuizzes = async () => {
    try {
      const quizzesQuery = query(
        collection(db, "quizzes"),
        where("createdByTeacherId", "==", userProfile.uid),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(quizzesQuery)
      const quizzesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setQuizzes(quizzesData)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId, quizName) => {
    if (window.confirm(`Are you sure you want to delete "${quizName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "quizzes", quizId))
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId))
        playClickSound()
      } catch (error) {
        console.error("Error deleting quiz:", error)
        alert("Error deleting quiz. Please try again.")
      }
    }
  }

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
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#18181b]" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Total Quizzes</p>
                  <p className="text-2xl font-bold text-[#18181b]">{quizzes.length}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-[#18181b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Public Quizzes</p>
                  <p className="text-2xl font-bold text-[#18181b]">{quizzes.filter((quiz) => quiz.isPublic).length}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#18181b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#18181b]">Private Quizzes</p>
                  <p className="text-2xl font-bold text-[#18181b]">{quizzes.filter((quiz) => !quiz.isPublic).length}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-[#18181b]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quizzes List */}
        <div className="space-y-4">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{quiz.name}</CardTitle>
                        <Badge variant={quiz.isPublic ? "success" : "secondary"}>
                          {quiz.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={playClickSound}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={playClickSound}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteQuiz(quiz.id, quiz.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={playClickSound}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#18181b]">Questions</p>
                      <p className="font-semibold">{quiz.questionCount || quiz.questions?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-[#18181b]">Time Limit</p>
                      <p className="font-semibold">{quiz.timeLimit} min</p>
                    </div>
                    <div>
                      <p className="text-[#18181b]">Created</p>
                      <p className="font-semibold">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#18181b]">Last Updated</p>
                      <p className="font-semibold">{new Date(quiz.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-[#18181b]">
                      <span>ID: {quiz.id.slice(0, 8)}...</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={playClickSound}>
                        View Results
                      </Button>
                      <Button variant="outline" size="sm" onClick={playClickSound}>
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 text-[#18181b] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-[#18181b]">No quizzes found</h3>
                    <p className="text-[#18181b] mb-4">No quizzes match your search term "{searchTerm}".</p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any quizzes yet. Create your first quiz to get started.
                    </p>
                    <Link to="/teacher/create-quiz">
                      <Button onClick={playClickSound}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Quiz
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
