"use client"

import { useState } from "react"
import { useMixerStore } from "@/store/mixerStore"
import { usePlayerStore } from "@/store/playerStore"
import { Moon, Zap, CloudRain, Coffee, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Context-Aware Mix Generator.
 * Provides one-click generation of audio soundscapes based on predefined scenarios (e.g., Focus, Sleep).
 * Interacts with the backend inference engine to fetch curated track configurations and applies them to the mixer.
 */
export default function MixGenerator() {
  const [loading, setLoading] = useState<string | null>(null)
  const { activeSounds, removeSound, addSound, updateVolume } = useMixerStore()
  const { setIsPlaying } = usePlayerStore()

  const generateMix = async (scenario: string) => {
    setLoading(scenario)

    try {
      // Pause single-track playback to prevent audio bleeding
      setIsPlaying(false)

      // Reset the current mix environment
      activeSounds.forEach(s => removeSound(s.id))

      // Request new mix configuration from the backend
      const res = await fetch("http://127.0.0.1:8000/generate-mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      })

      if (!res.ok) throw new Error("Mix Gen Failed")
      const data = await res.json()

      // Populate mixer with new tracks, staggering volume application for a smooth fade-in
      for (const track of data.mix) {
        addSound({
          id: track.id,
          title: track.title,
          file_url: track.file_url,
          category: "AI Mix"
        })

        setTimeout(() => updateVolume(track.id, track.volume), 100)
      }

    } catch (e) {
      console.error(e)
      alert("Failed to generate mix. Is Python running?")
    } finally {
      setLoading(null)
    }
  }

  const presets = [
    { id: "sleep", label: "Sleep", icon: Moon, color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20" },
    { id: "focus", label: "Focus", icon: Zap, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    { id: "storm", label: "Storm", icon: CloudRain, color: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" },
    { id: "relax", label: "Relax", icon: Coffee, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
  ]

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">
        Instant Mixes
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => generateMix(p.id)}
            disabled={!!loading}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              p.color,
              loading === p.id && "opacity-70 cursor-wait"
            )}
          >
            {loading === p.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p.icon className="w-4 h-4" />
            )}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}