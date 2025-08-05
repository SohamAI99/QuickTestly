"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Select } from "../components/ui/Select"

import { useAuth } from "../contexts/AuthContext"
import { useSoundEffects } from "../hooks/useSoundEffects"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const { playClick, playSuccess, playError } = useSoundEffects()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    playClick()

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          playSuccess()
          // Redirect based on role if available, else default to /dashboard
          if (result.user && result.user.role === "teacher") {
            navigate("/teacher/dashboard")
          } else {
            navigate("/user/dashboard")
          }
        } else {
          playError()
        }
      } else {
        const result = await register(formData)
        if (result.success) {
          playSuccess()
          if (formData.role === "teacher") {
            navigate("/teacher/dashboard")
          } else {
            navigate("/user/dashboard")
          }
        } else {
          playError()
        }
      }
    } catch (error) {
      playError()
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    playClick()
    setIsLogin(!isLogin)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#a1c4fd] via-[#fbc2eb] to-[#fcb69f] dark:from-[#232526] dark:via-[#414345] dark:to-[#232526]">
      <div className="absolute top-6 right-6 z-20">

      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#fcb69f] to-[#a1c4fd] rounded-full p-3 shadow-lg">
              <BookOpen className="h-8 w-8 text-white drop-shadow" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#fcb69f] via-[#a1c4fd] to-[#fbc2eb] drop-shadow">QuickTestly</h1>
          <p className="text-slate-700 dark:text-white mt-2 font-medium">Interactive Aptitude Quiz Platform</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl border border-white/40 dark:border-gray-700/40 p-8 transition-all">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-slate-800 dark:text-white font-bold">{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription className="text-center text-slate-500 dark:text-white">
              {isLogin ? "Enter your credentials to access your account" : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 z-10" />
                    <Select name="role" value={formData.role} onChange={handleInputChange} className="pl-10" required>
                      <option value="user">Student</option>
                      <option value="teacher">Teacher</option>
                    </Select>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full flex items-center justify-center gap-2 font-semibold text-base" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <span className="inline-block px-4 py-2 rounded bg-blue-600 dark:bg-blue-700 text-white font-semibold">Sign In</span>
                    ) : (
                      <span className="inline-block px-4 py-2 rounded bg-green-600 dark:bg-green-700 text-white font-semibold">Create Account</span>
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-white">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleMode} className="ml-1 text-primary hover:underline font-medium">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

          </CardContent>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-white">
          <p>© 2024 QuickTestly. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
