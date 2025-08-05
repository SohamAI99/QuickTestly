
import { Routes, Route, Navigate } from "react-router-dom"
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
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute requiredRole="user">
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/leaderboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/quiz-rules/:quizId"
        element={
          <ProtectedRoute requiredRole="user">
            <QuizRules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/take-quiz/:quizId"
        element={
          <ProtectedRoute requiredRole="user">
            <TakeQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/quiz-results/:quizId"
        element={
          <ProtectedRoute requiredRole="user">
            <QuizResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/create-quiz"
        element={
          <ProtectedRoute requiredRole="teacher">
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/manage-quizzes"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ManageQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/results"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherResults />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
