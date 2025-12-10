"use client"

import { usePlayerStore } from "@/store/playerStore"
import { useMixerStore } from "@/store/mixerStore"
import { Play, Pause, Minimize2, Smile } from "lucide-react"
import { useEffect, useState, useRef } from "react"

/**
 * Zen Mode Playback Controls.
 * Floating, auto-hiding control bar designed for minimal visual intrusion during immersive sessions.
 * Provides essential playback toggles and displays the current emotional context without cluttering the viewport.
 */
export default function ZenControls() {
  const { isPlaying, togglePlay, toggleZenMode, currentTrack } = usePlayerStore()
  const { currentMood } = useMixerStore()

  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide heuristic based on mouse inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setVisible(false), 3000)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 z-[100] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] text-white/50 font-medium tracking-[0.2em] uppercase">Now Playing</p>

          {currentMood && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] text-purple-300 font-bold uppercase tracking-wider animate-in fade-in">
              <Smile className="w-2.5 h-2.5" />
              {currentMood}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-end gap-0.5 h-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-1 bg-white/80 rounded-full ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? '100%' : '20%' }} />
            ))}
          </div>
          <p className="text-white font-bold text-sm whitespace-nowrap shadow-black drop-shadow-md">
            {currentTrack?.title || "Silence"}
          </p>
        </div>
      </div>

      <div className="h-8 w-px bg-white/20" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"
      >
        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleZenMode();
        }}
        className="p-2 text-white/50 hover:text-white transition-colors hover:rotate-90 duration-300"
        title="Exit Zen Mode"
      >
        <Minimize2 className="w-5 h-5" />
      </button>
    </div>
  )
}