
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {

  const { currentUser, userProfile, loading } = useAuth()
  // Debug log to help diagnose routing issues
  console.log("[ProtectedRoute]", { currentUser, userProfile, loading, requiredRole })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userProfile?.role === "teacher" ? "/teacher/dashboard" : "/user/dashboard"
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
