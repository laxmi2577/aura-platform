"use client"

import { useState } from "react"
import { fetchAI } from "@/lib/api"
import { useMixerStore } from "@/store/mixerStore"
import SmartMixPad from "./SmartMixPad"
import MixGenerator from "./MixGenerator"
import {
  X,
  Volume2,
  Trash2,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  Smile,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Sound Mixer Side Panel.
 * The primary interface for managing active audio layers.
 * Orchestrates volume controls, track removal, automatic mix generation interactions, and mood display.
 * Integrates the SmartMixPad for advanced spatial blending.
 */
export default function SoundMixer() {
  const { activeSounds, isOpen, toggleMixer, removeSound, updateVolume, currentMood } = useMixerStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSurprise = async () => {
    setIsGenerating(true)
    try {
      const scenarios = ["deep sleep", "focus flow", "jungle storm", "meditation", "ocean waves"]
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]

      const data = await fetchAI("/generate-mix", {
        method: "POST",
        body: JSON.stringify({ scenario: randomScenario }),
      })

      if (!data?.mix || !Array.isArray(data.mix)) return

      // Seamlessly inject generated tracks into the active mixer state
      for (const track of data.mix) {
        useMixerStore.getState().addSound({
          id: track.id,
          title: track.title,
          file_url: track.file_url,
          category: "Surprise",
        })

        setTimeout(() => {
          useMixerStore.getState().updateVolume(track.id, track.volume)
        }, 100)
      }
    } catch (e) {
      console.error("Surprise mix generation failed:", e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full md:w-105 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl p-6 flex flex-col z-[60] transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" /> Current Mix
        </h2>

        {/* Dynamic Mood Indicator */}
        {currentMood && (
          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full w-fit animate-in fade-in slide-in-from-left">
            <Smile className="w-3 h-3" />
            AI Detected: <span className="capitalize">{currentMood}</span>
          </div>
        )}
        <button onClick={toggleMixer} className="p-2 hover:bg-accent rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        <MixGenerator />

        {/* Spatial control interface for multi-track environments */}
        {activeSounds.length >= 2 && <SmartMixPad />}

        {activeSounds.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 flex flex-col items-center">
            <p>No sounds in mixer.</p>
            <p className="text-xs mb-6">Layer sounds to create your vibe.</p>

            <button
              onClick={handleSurprise}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground",
                "rounded-full text-sm font-bold hover:bg-primary/90 transition-all",
                "shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Surprise Me
            </button>
          </div>
        ) : (
          activeSounds.map((sound) => (
            <div key={sound.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{sound.title}</span>
                <button
                  onClick={() => removeSound(sound.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sound.volume}
                  onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
