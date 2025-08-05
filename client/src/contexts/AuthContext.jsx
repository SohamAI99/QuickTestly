"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data())
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success("Welcome back!")
      return { success: true, user: result.user }
    } catch (error) {
      console.error("Login error:", error)
      let message = "Login failed. Please try again."

      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email."
          break
        case "auth/wrong-password":
          message = "Incorrect password."
          break
        case "auth/invalid-email":
          message = "Invalid email address."
          break
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later."
          break
      }

      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const { email, password, name, role } = userData
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile in Firestore
      const userProfile = {
        uid: result.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        avatarUrl: null,
        bio: "",
        stats: {
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
        },
      }

      await setDoc(doc(db, "users", result.user.uid), userProfile)
      setUserProfile(userProfile)

      toast.success("Account created successfully!")
      return { success: true, user: result.user }
    } catch (error) {
      console.error("Registration error:", error)
      let message = "Registration failed. Please try again."

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "An account with this email already exists."
          break
        case "auth/invalid-email":
          message = "Invalid email address."
          break
        case "auth/weak-password":
          message = "Password should be at least 6 characters."
          break
      }

      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully!")
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed. Please try again.")
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error("No user logged in")

      const userRef = doc(db, "users", currentUser.uid)
      await setDoc(userRef, updates, { merge: true })

      setUserProfile((prev) => ({ ...prev, ...updates }))
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile.")
      return { success: false, error: error.message }
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
