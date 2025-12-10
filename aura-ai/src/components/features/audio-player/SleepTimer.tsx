"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, X } from "lucide-react"
import { usePlayerStore } from "@/store/playerStore"
import { cn } from "@/lib/utils"

const TIMERS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
]

/**
 * Playback cessation timer.
 * Provides a popover interface for scheduling automatic audio pause.
 * Handles background interval management and countdown visualization.
 */
export default function SleepTimer() {
  const [isOpen, setIsOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const { setIsPlaying } = usePlayerStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current)

    setTimeLeft(minutes * 60)
    setIsOpen(false)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          setIsPlaying(false)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const cancelTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(null)
    setIsOpen(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
          timeLeft
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        )}
        title="Sleep Timer"
      >
        <Timer className="w-8 h-8" />
        {timeLeft && (
          <span className="text-xs font-mono font-medium w-9 text-center">
            {formatTime(timeLeft)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 mb-2 w-48 bg-popover border rounded-xl shadow-xl p-2 z-50 animate-in slide-in-from-bottom-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
              Stop audio in...
            </div>

            <div className="grid grid-cols-2 gap-1">
              {TIMERS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => startTimer(t.minutes)}
                  className="px-2 py-1.5 text-sm rounded-md hover:bg-accent text-left transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {timeLeft && (
              <button
                onClick={cancelTimer}
                className="w-full mt-2 flex items-center justify-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              >
                <X className="w-6 h-6" /> Cancel Timer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}