"use client"

import { usePlayerStore } from "@/store/playerStore"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

/**
 * Dynamic Ambient Background.
 * Renders a slow-moving, organic color field that adapts to the dominant color of the currently playing track.
 * Adjusts opacity and blending modes based on the user's active theme (light/dark) for optimal contrast.
 */
export default function MoodBackground() {
  const { currentTrack, isPlaying } = usePlayerStore()
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#3b82f6")

  useEffect(() => {
    if (currentTrack?.color) {
      setColor(currentTrack.color)
    }
  }, [currentTrack])

  if (!currentTrack) return null

  // Theme-aware opacity adjustment for visual consistency
  const isLight = resolvedTheme === "light"
  const mainOpacity = isLight ? 0.6 : 0.3
  const pulseOpacity = isLight ? 0.4 : 0.2

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
      {/* Primary Atmospheric Layer */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl transition-colors duration-[2000ms] ease-in-out"
        style={{
          backgroundColor: color,
          opacity: mainOpacity
        }}
      />

      {/* Reactive Pulse Layer */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-[3000ms] ease-in-out ${isPlaying ? "scale-125" : "scale-100"}`}
        style={{
          backgroundColor: color,
          opacity: pulseOpacity
        }}
      />

      {/* Film Grain Texture for Analog Feel */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}