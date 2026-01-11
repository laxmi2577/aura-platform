"use client"

import { useEffect, useRef } from "react"

interface SineWaveProps {
  isPlaying: boolean
  baseFreq: number
  beatFreq: number
}

/**
 * Canvas-based Oscilloscope.
 * Renders a simulated sine wave simulation to provide visual feedback for the binaural beat generator.
 * Maps frequency parameters to visual amplitude and phase velocity.
 */
export default function SineWaveVisualizer({ isPlaying, baseFreq, beatFreq }: SineWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const phaseRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      ctx.lineWidth = 2
      ctx.strokeStyle = isPlaying ? "#4ade80" : "#525252"
      ctx.beginPath()

      // Scale frequency visually for aesthetic rendering (non-literal representation)
      const visualFrequency = baseFreq * 0.05 + beatFreq * 0.2
      const amplitude = isPlaying ? height * 0.3 : height * 0.1

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin((x * 0.02 * visualFrequency) + phaseRef.current) * amplitude

        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      ctx.stroke()

      if (isPlaying) {
        phaseRef.current += beatFreq * 0.05
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, baseFreq, beatFreq])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className="w-full h-20 rounded-md border bg-background/50"
    />
  )
}