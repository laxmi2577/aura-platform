"use client"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { audioAnalyzer } from "@/lib/audio/audioAnalyzer"

function hexToRgba(hex: string, alpha: number) {
  hex = hex.replace("#", "")

  if (hex.length === 3) {
    hex = hex.split("").map(char => char + char).join("")
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(251, 191, 36, ${alpha})`
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Real-time Audio Spectrum Visualization.
 * Renders a dynamic frequency bar chart synchronized with the audio playback.
 * Adapts visual theming based on the active track's primary color.
 */
export default function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isPlaying, currentTrack } = usePlayerStore()
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      const data = audioAnalyzer.getFrequencyData()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bars = 20
      const gap = 2
      const barWidth = canvas.width / bars - gap

      const themeColor = currentTrack?.color || "#fbbf24"

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
      gradient.addColorStop(0, themeColor)
      gradient.addColorStop(1, hexToRgba(themeColor, 0))

      ctx.fillStyle = gradient

      const step = Math.floor(data.length / bars) || 1

      for (let i = 0; i < bars; i++) {
        const value = data[i * step] || 0
        const percent = value / 255
        const height = Math.max(4, percent * canvas.height)

        const x = i * (barWidth + gap)
        const y = canvas.height - height

        ctx.beginPath()

        const anyCtx = ctx as CanvasRenderingContext2D & {
          roundRect?: (x: number, y: number, w: number, h: number, r: number | number[]) => void
        }

        if (typeof anyCtx.roundRect === "function") {
          anyCtx.roundRect(x, y, barWidth, height, 4)
        } else {
          ctx.rect(x, y, barWidth, height)
        }

        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTrack])

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={40}
      className="mr-4"
    />
  )
}
