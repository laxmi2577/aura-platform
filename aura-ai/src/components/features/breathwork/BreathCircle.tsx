"use client"

import { useState, useEffect } from "react"
import { X, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 4-7-8 Breathing Technique Visualizer.
 * Orchestrates a guided anxiety-reduction cycle using CSS animations for expansion (inhale) and contraction (exhale).
 * Implements precise timing logic to ensure adherence to the 19-second cadence.
 */
export default function BreathCircle({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [text, setText] = useState("Inhale")
  const [scale, setScale] = useState(1)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const runCycle = () => {
      // Phase 1: Inhale (4s)
      setPhase("inhale")
      setText("Inhale...")
      setScale(1.5)

      timeout = setTimeout(() => {
        // Phase 2: Hold (7s)
        setPhase("hold")
        setText("Hold")
        setScale(1.5)

        timeout = setTimeout(() => {
          // Phase 3: Exhale (8s)
          setPhase("exhale")
          setText("Exhale...")
          setScale(1)

          timeout = setTimeout(runCycle, 8000)
        }, 7000)
      }, 4000)
    }

    runCycle()

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative flex flex-col items-center justify-center">
        {/* Ambient Ring for Visual Feedback */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-3xl transition-all duration-[4000ms] ease-in-out",
            phase === "inhale" ? "bg-blue-500/30 scale-150" :
              phase === "hold" ? "bg-purple-500/30 scale-150" :
                "bg-cyan-500/10 scale-100"
          )}
        />

        {/* Core Breathing Element */}
        <div
          className={cn(
            "w-64 h-64 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all ease-in-out relative z-10",
            phase === "inhale" ? "border-blue-400 bg-blue-900/20 duration-[4000ms]" :
              phase === "hold" ? "border-purple-400 bg-purple-900/20 duration-0" :
                "border-cyan-400 bg-cyan-900/20 duration-[8000ms]"
          )}
          style={{ transform: `scale(${scale})` }}
        >
          <div className="text-center">
            <p className="text-2xl font-light text-white tracking-widest uppercase animate-pulse">
              {text}
            </p>
            <div className="mt-2 flex justify-center gap-1 opacity-50">
              <div className={`w-1 h-1 rounded-full ${phase === 'inhale' ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`w-1 h-1 rounded-full ${phase === 'hold' ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`w-1 h-1 rounded-full ${phase === 'exhale' ? 'bg-white' : 'bg-white/20'}`} />
            </div>
          </div>
        </div>

        <p className="mt-16 text-white/40 text-sm font-mono">
          4-7-8 Anxiety Reduction Pattern
        </p>
      </div>
    </div>
  )
}