"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, Save, Trophy, Clock, Target, Calendar, Mail, UserIcon } from "lucide-react"
import AppHeader from "../../components/AppHeader"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import { api } from "../../lib/api"
import { formatDate, calculateGrade } from "../../lib/utils"
import toast from "react-hot-toast"

export default function UserProfile() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
    dob: "",
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef()
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { currentUser, userProfile, updateProfile } = useAuth()
  const { playClick, playSuccess } = useSoundEffects()

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        avatarUrl: userProfile.avatarUrl || "",
        dob: userProfile.dob || "",
      })
    }
    fetchUserData()
  }, [userProfile])



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b]">
      {/* QuickTestly Logo/Name and Navigation */}
      <header className="border-b bg-white/10 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/vite.svg" alt="QuickTestly Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-[#f1f5f9] tracking-tight drop-shadow-lg">QuickTestly</span>
            <span className="ml-4 text-base text-[#38bdf8] font-semibold">Profile</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/user/dashboard">
              <Button variant="ghost" className="text-[#f1f5f9]">Dashboard</Button>
            </a>
            <a href="/user/quizzes">
              <Button variant="ghost" className="text-[#f1f5f9]">Join Quiz</Button>
            </a>
            <a href="/user/leaderboard">
              <Button variant="ghost" className="text-[#f1f5f9]">Leaderboard</Button>
            </a>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <div className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#6366f1]/80 to-[#38bdf8]/80 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-lg">
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl || "/placeholder.svg"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      profileData.name?.charAt(0) || "U"
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    className="absolute -bottom-2 -right-2 rounded-full bg-white shadow p-2"
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <Camera className="h-4 w-4 text-[#6366f1]" />
                  </button>
                </div>
                <div className="text-xl font-bold text-[#f1f5f9]">{profileData.name}</div>
                <div className="text-base text-[#cbd5e1]">{profileData.email}</div>
              </div>
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#38bdf8]">{stats.totalQuizzes}</div>
                    <div className="text-sm text-[#cbd5e1]">Quizzes Taken</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#38bdf8]">{stats.averageScore}%</div>
                    <div className="text-sm text-[#cbd5e1]">Average Score</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#38bdf8]">{stats.bestScore}%</div>
                    <div className="text-sm text-[#cbd5e1]">Best Score</div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#38bdf8]">{stats.totalTimeSpent}m</div>
                    <div className="text-sm text-[#cbd5e1]">Time Spent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <div className="mb-6">
                <div className="text-2xl font-bold text-[#f1f5f9] mb-2">Edit Profile</div>
                <div className="text-base text-[#cbd5e1]">Update your personal information</div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-[#6366f1]" />
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl bg-white/20 text-[#f1f5f9] placeholder-[#94a3b8] shadow focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 border-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#6366f1]" />
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={profileData.dob}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl bg-white/20 text-[#f1f5f9] placeholder-[#94a3b8] shadow focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 border-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6366f1]" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl bg-white/20 text-[#f1f5f9] placeholder-[#94a3b8] shadow focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 border-none"
                        placeholder="Enter your email"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="rounded-xl bg-white/20 text-[#f1f5f9] placeholder-[#94a3b8] shadow focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 border-none"
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#18181b] font-bold text-lg shadow-lg hover:from-[#0ea5e9] hover:to-[#4338ca] transition-all focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50">
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-lg shadow-xl border border-white/10 mt-8" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
              <div className="mb-6">
                <div className="text-2xl font-bold text-[#f1f5f9] mb-2">Quiz History</div>
                <div className="text-base text-[#cbd5e1]">Your complete quiz performance history</div>
              </div>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => {
                    const grade = calculateGrade(result.score)
                    return (
                      <div key={result.id} className="rounded-xl p-4 bg-white/20 shadow border-none">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[#f1f5f9]">{result.quizName}</h3>
                          <span className={`px-3 py-1 rounded-full font-semibold text-sm ${result.score >= 80 ? 'bg-green-200 text-green-800' : result.score >= 60 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{result.score}%</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#cbd5e1]">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-[#38bdf8]" />
                            {formatDate(result.completedAt)}
                          </div>
                          <div className="flex items-center">
                            <Target className="mr-1 h-4 w-4 text-[#38bdf8]" />
                            {result.correctAnswers}/{result.totalQuestions}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-[#38bdf8]" />
                            {Math.round((result.timeSpent || 0) / 60)}m
                          </div>
                          <div className="flex items-center">
                            <Trophy className="mr-1 h-4 w-4 text-[#38bdf8]" />
                            Grade {grade.grade}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-[#38bdf8] mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-[#f1f5f9]">No quiz history yet</h3>
                  <p className="text-[#cbd5e1]">Take your first quiz to see your results here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
