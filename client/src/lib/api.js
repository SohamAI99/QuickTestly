import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import { db } from "./firebase"

// Quiz API
export const api = {
  // Get all public quizzes
  async getQuizzes() {
    try {
      const q = query(collection(db, "quizzes"), where("isPublic", "==", true), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      throw error
    }
  },

  // Get quiz by ID
  async getQuiz(id) {
    try {
      const docRef = doc(db, "quizzes", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      } else {
        throw new Error("Quiz not found")
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
      throw error
    }
  },

  // Create new quiz
  async createQuiz(quizData) {
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating quiz:", error)
      throw error
    }
  },

  // Update quiz
  async updateQuiz(id, updates) {
    try {
      const docRef = doc(db, "quizzes", id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating quiz:", error)
      throw error
    }
  },

  // Delete quiz
  async deleteQuiz(id) {
    try {
      await deleteDoc(doc(db, "quizzes", id))
    } catch (error) {
      console.error("Error deleting quiz:", error)
      throw error
    }
  },

  // Get quizzes by teacher
  async getQuizzesByTeacher(teacherId) {
    try {
      const q = query(collection(db, "quizzes"), where("createdBy", "==", teacherId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching teacher quizzes:", error)
      throw error
    }
  },

  // Submit quiz result
  async submitResult(resultData) {
    try {
      const docRef = await addDoc(collection(db, "results"), {
        ...resultData,
        completedAt: new Date().toISOString(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error submitting result:", error)
      throw error
    }
  },

  // Get user results
  async getUserResults(userId) {
    try {
      const q = query(collection(db, "results"), where("userId", "==", userId), orderBy("completedAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching user results:", error)
      throw error
    }
  },

  // Get quiz results (for teachers)
  async getQuizResults(quizId) {
    try {
      const q = query(collection(db, "results"), where("quizId", "==", quizId), orderBy("completedAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching quiz results:", error)
      throw error
    }
  },

  // Get leaderboard for a quiz
  async getLeaderboard(quizId, limitCount = 10) {
    try {
      const q = query(
        collection(db, "results"),
        where("quizId", "==", quizId),
        orderBy("score", "desc"),
        orderBy("timeSpent", "asc"),
        limit(limitCount),
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      throw error
    }
  },

  // Get global leaderboard
  async getGlobalLeaderboard(limitCount = 10) {
    try {
      const q = query(
        collection(db, "results"),
        orderBy("score", "desc"),
        orderBy("timeSpent", "asc"),
        limit(limitCount),
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching global leaderboard:", error)
      throw error
    }
  },
}
