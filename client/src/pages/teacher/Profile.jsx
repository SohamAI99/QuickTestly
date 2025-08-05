"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Camera, Save, User, BookOpen } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useSoundEffects } from "../../hooks/useSoundEffects"
import AppHeaderTeacher from "../../components/AppHeaderTeacher"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { db } from "../../lib/firebase"

export default function TeacherProfile() {
  const { currentUser, userProfile } = useAuth()
  const { playClickSound } = useSoundEffects()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
  })
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#fdf6b2]">
      <AppHeaderTeacher />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 bg-white/40 backdrop-blur-lg shadow-xl border-none text-center text-[#18181b]" style={{boxShadow:'0 8px 32px 0 rgba(251, 191, 36, 0.18)', border:'none'}}>
              <div className="relative mx-auto mb-4">
                <img
                  src={userProfile?.avatarUrl || `/placeholder.svg?height=100&width=100`}
                  alt={userProfile?.name}
                  className="h-24 w-24 rounded-full mx-auto border-4 border-[#fbbf24] shadow-lg"
                />
                <button
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow p-2"
                  onClick={playClickSound}
                >
                  <Camera className="h-4 w-4 text-[#fbbf24]" />
                </button>
              </div>
              <div className="text-xl font-bold text-[#18181b]">{userProfile?.name}</div>
              <div className="text-base text-[#18181b]">{userProfile?.email}</div>
              <span className="px-3 py-1 rounded-full bg-[#fbbf24]/20 text-[#18181b] font-semibold text-sm shadow-sm mt-2 inline-block">Teacher</span>
              <div className="space-y-3 text-sm mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[#be185d]">Member since</span>
                  <span>{new Date(userProfile?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#be185d]">Last updated</span>
                  <span>{new Date(userProfile?.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8 bg-white/40 backdrop-blur-lg shadow-xl border-none" style={{boxShadow:'0 8px 32px 0 rgba(251, 191, 36, 0.18)', border:'none'}}>
              <div className="mb-6">
                <div className="text-2xl font-bold text-[#18181b] mb-2">Edit Profile</div>
                <div className="text-base text-[#18181b]">Update your name and email</div>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-[#18181b]">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl bg-white/60 px-4 py-3 text-[#18181b] placeholder-[#18181b] shadow focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/40 border-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-[#18181b]">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl bg-white/60 px-4 py-3 text-[#18181b] placeholder-[#18181b] shadow focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/40 border-none"
                      required
                      disabled
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f472b6] text-[#18181b] font-bold shadow-lg hover:from-[#f59e42] hover:to-[#ec4899] transition-all focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50">Save</button>
                  <button type="button" onClick={handleCancel} className="py-3 px-8 rounded-xl bg-white/60 text-[#18181b] font-bold shadow hover:bg-white/80 transition-all focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/30">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
