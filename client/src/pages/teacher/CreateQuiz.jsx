"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Switch } from "../../components/ui/Switch"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import AppHeaderTeacher from "../../components/AppHeaderTeacher"

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { playClickSound } = useSoundEffects()

  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [quizData, setQuizData] = useState({
    name: "",
    description: "",
    timeLimit: 30,
    isPublic: true,
    questions: [
      {
        questionText: "",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctAnswerIndex: 0,
      },
    ],
  })

  const handleQuizDataChange = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question,
      ),
    }))
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, oIndex) =>
                oIndex === optionIndex ? { ...option, text: value } : option,
              ),
            }
          : question,
      ),
    }))
  }

  const addQuestion = () => {
    playClickSound()
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
          correctAnswerIndex: 0,
        },
      ],
    }))
  }

  const removeQuestion = (questionIndex) => {
    playClickSound()
    if (quizData.questions.length > 1) {
      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex),
      }))
    }
  }

  const addOption = (questionIndex) => {
    playClickSound()
    if (quizData.questions[questionIndex].options.length < 6) {
      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.map((question, index) =>
          index === questionIndex
            ? {
                ...question,
                options: [...question.options, { text: "" }],
              }
            : question,
        ),
      }))
    }
  }

  const removeOption = (questionIndex, optionIndex) => {
    playClickSound()
    if (quizData.questions[questionIndex].options.length > 2) {
      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.map((question, index) =>
          index === questionIndex
            ? {
                ...question,
                options: question.options.filter((_, oIndex) => oIndex !== optionIndex),
                correctAnswerIndex:
                  question.correctAnswerIndex >= optionIndex && question.correctAnswerIndex > 0
                    ? question.correctAnswerIndex - 1
                    : question.correctAnswerIndex,
              }
            : question,
        ),
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate quiz data
      if (!quizData.name.trim() || !quizData.description.trim()) {
        alert("Please fill in quiz name and description")
        return
      }

      if (quizData.questions.some((q) => !q.questionText.trim())) {
        alert("Please fill in all question texts")
        return
      }

      if (quizData.questions.some((q) => q.options.some((o) => !o.text.trim()))) {
        alert("Please fill in all answer options")
        return
      }

      // Prepare quiz data for submission
      const submitData = {
        ...quizData,
        questions: quizData.questions.map((question, index) => ({
          ...question,
          id: `q${index + 1}`,
        })),
        createdByTeacherId: userProfile.uid,
        createdByTeacherName: userProfile.name,
        createdByTeacherEmail: userProfile.email,
        questionCount: quizData.questions.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to Firestore
      await addDoc(collection(db, "quizzes"), submitData)

      playClickSound()
      navigate("/teacher/dashboard")
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("Error creating quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#fdf6b2]">
      <AppHeaderTeacher />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>Basic details about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-name">Quiz Name *</Label>
                  <Input
                    id="quiz-name"
                    placeholder="Enter quiz name"
                    value={quizData.name}
                    onChange={(e) => handleQuizDataChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-limit">Time Limit (minutes) *</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="1"
                    max="180"
                    value={quizData.timeLimit}
                    onChange={(e) => handleQuizDataChange("timeLimit", Number.parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-description">Description *</Label>
                <Textarea
                  id="quiz-description"
                  placeholder="Describe what this quiz covers"
                  value={quizData.description}
                  onChange={(e) => handleQuizDataChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={quizData.isPublic}
                  onCheckedChange={(checked) => handleQuizDataChange("isPublic", checked)}
                />
                <Label>Make quiz public (visible to all students)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions ({quizData.questions.length})</CardTitle>
                  <CardDescription>Add questions and answer options</CardDescription>
                </div>
                <Button type="button" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Question {questionIndex + 1}</h4>
                    {quizData.questions.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(questionIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text *</Label>
                    <Textarea
                      placeholder="Enter your question"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(questionIndex, "questionText", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options *</Label>
                      {question.options.length < 6 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => addOption(questionIndex)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswerIndex === optionIndex}
                          onChange={() => handleQuestionChange(questionIndex, "correctAnswerIndex", optionIndex)}
                          className="w-4 h-4 text-[#18181b]"
                        />
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            required
                          />
                        </div>
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <p className="text-xs text-[#18181b]">Select the radio button next to the correct answer</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link to="/teacher/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#18181b]">Quiz Preview</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-xl">{quizData.name || "Untitled Quiz"}</h4>
                    <p className="text-[#18181b]">{quizData.description || "No description"}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-[#18181b]">
                      <span>{quizData.questions.length} questions</span>
                      <span>{quizData.timeLimit} minutes</span>
                      <span>{quizData.isPublic ? "Public" : "Private"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">
                          {index + 1}. {question.questionText || "Question text not set"}
                        </h5>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded text-sm ${
                                question.correctAnswerIndex === optionIndex
                                  ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                  : "bg-muted/30"
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option.text || "Option not set"}
                              {question.correctAnswerIndex === optionIndex && (
                                <span className="ml-2 text-[#18181b] text-xs">
                                  (Correct Answer)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
