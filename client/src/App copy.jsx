"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthPage from "./pages/AuthPage"
import UserDashboard from "./pages/user/Dashboard"
import UserProfile from "./pages/user/Profile"
import UserLeaderboard from "./pages/user/Leaderboard"
import QuizRules from "./pages/user/QuizRules"
import TakeQuiz from "./pages/user/TakeQuiz"
import QuizResults from "./pages/user/QuizResults"
import TeacherDashboard from "./pages/teacher/Dashboard"
import TeacherProfile from "./pages/teacher/Profile"
import CreateQuiz from "./pages/teacher/CreateQuiz"
import ManageQuizzes from "./pages/teacher/ManageQuizzes"
import TeacherResults from "./pages/teacher/Results"

function App() {

  return (
    <>
      helo world
    </>
  )
}

export default App
