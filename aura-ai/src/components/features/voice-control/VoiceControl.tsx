"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"
import { usePlayerStore } from "@/store/playerStore"
import { useMixerStore } from "@/store/mixerStore"

/**
 * Voice Command Interface.
 * Leverages the Web Speech API to provide hands-free control over playback and mixer state.
 * Maps spoken natural language commands to internal store actions.
 */
export default function VoiceControl() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  const { setIsPlaying, togglePlay } = usePlayerStore()
  const { activeSounds, removeSound } = useMixerStore()

  let recognition: any = null

  if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
    recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.lang = "en-US"
    recognition.interimResults = false
  }

  const handleCommand = (command: string) => {
    const lower = command.toLowerCase()

    // Playback Intent Handling
    if (lower.includes("play") || lower.includes("start")) {
      setIsPlaying(true)
    } else if (lower.includes("stop") || lower.includes("pause")) {
      setIsPlaying(false)
    }

    // Mixer State Management Intent
    else if (lower.includes("clear mix") || lower.includes("reset")) {
      activeSounds.forEach(s => removeSound(s.id))
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice control is not supported in this browser (Try Chrome).")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
      setTranscript("Listening...")
    }
  }

  useEffect(() => {
    if (!recognition) return

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(`"${text}"`)
      handleCommand(text)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error)
      setIsListening(false)
      setTranscript("Error listening.")
    }
  }, [recognition])

  return (
    <div className="flex items-center gap-4">
      {transcript && (
        <span className="text-xs text-primary animate-fade-in px-2 py-1 bg-primary/10 rounded-full">
          {transcript}
        </span>
      )}

      <button
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all ${isListening
            ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          }`}
        title="Voice Control"
      >
        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>
    </div>
  )
}