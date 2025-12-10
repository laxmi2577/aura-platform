"use client"

import { useState, useRef, useEffect } from "react"
import { useMixerStore } from "@/store/mixerStore"
import { cn } from "@/lib/utils"

/**
 * Spatial Audio Mixing Controller.
 * Provides a 2D XY-pad interface for intuitive volume blending of up to four active tracks.
 * Uses bilinear interpolation to map cursor position to individual track volumes.
 */
export default function SmartMixPad() {
  const { activeSounds, updateVolume } = useMixerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const mixableSounds = activeSounds.slice(0, 4)

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

    setPosition({ x, y })

    // Apply bilinear interpolation to distribute volume based on spatial proximity
    if (mixableSounds[0]) updateVolume(mixableSounds[0].id, (1 - x) * (1 - y))
    if (mixableSounds[1]) updateVolume(mixableSounds[1].id, x * (1 - y))
    if (mixableSounds[2]) updateVolume(mixableSounds[2].id, (1 - x) * y)
    if (mixableSounds[3]) updateVolume(mixableSounds[3].id, x * y)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setShowHint(false)
    handleMove(e.clientX, e.clientY)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY)
    }
    const handleGlobalMouseUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove)
      window.addEventListener("mouseup", handleGlobalMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, mixableSounds])

  if (mixableSounds.length < 2) return null

  return (
    <div className="mb-6 p-4 border rounded-xl bg-accent/10">
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
        <span className="truncate max-w-[45%]">{mixableSounds[0]?.title}</span>
        <span className="truncate max-w-[45%] text-right">{mixableSounds[1]?.title}</span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="relative w-full aspect-square bg-card border rounded-xl shadow-inner overflow-hidden cursor-move touch-none group"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
        </div>

        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500",
            showHint ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="bg-black/60 text-white text-[10px] font-medium px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-lg">
            Drag to Blend
          </span>
        </div>

        <div
          className={cn(
            "absolute w-6 h-6 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] transform -translate-x-1/2 -translate-y-1/2 border-2 border-white transition-transform duration-75",
            isDragging ? "scale-125 bg-primary cursor-grabbing" : "scale-100 bg-primary/80 cursor-grab",
            showHint && "animate-pulse"
          )}
          style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
        >
          <div className="absolute inset-0 rounded-full border border-black/10" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">
        <span className="truncate max-w-[45%]">{mixableSounds[2]?.title}</span>
        <span className="truncate max-w-[45%] text-right">{mixableSounds[3]?.title}</span>
      </div>
    </div>
  )
}