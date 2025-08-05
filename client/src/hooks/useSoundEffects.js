"use client"

import { useCallback, useRef } from "react"

export const useSoundEffects = () => {
  const audioContextRef = useRef(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency, duration, type = "sine") => {
      try {
        const audioContext = initAudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.warn("Audio playback failed:", error)
      }
    },
    [initAudioContext],
  )

  const playSuccess = useCallback(() => {
    playTone(523.25, 0.2) // C5
    setTimeout(() => playTone(659.25, 0.2), 100) // E5
    setTimeout(() => playTone(783.99, 0.3), 200) // G5
  }, [playTone])

  const playError = useCallback(() => {
    playTone(220, 0.5, "sawtooth") // A3
  }, [playTone])

  const playClick = useCallback(() => {
    playTone(800, 0.1, "square")
  }, [playTone])

  const playWarning = useCallback(() => {
    playTone(440, 0.2) // A4
    setTimeout(() => playTone(440, 0.2), 300)
  }, [playTone])

  const playComplete = useCallback(() => {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99] // C-D-E-F-G
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.2), index * 100)
    })
  }, [playTone])

  const playTick = useCallback(() => {
    playTone(1000, 0.05, "square")
  }, [playTone])

  return {
    playSuccess,
    playError,
    playClick,
    playWarning,
    playComplete,
    playTick,
    playTone,
  }
}
