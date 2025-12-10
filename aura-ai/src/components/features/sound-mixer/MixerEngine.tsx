"use client"

import { useMixerStore } from "@/store/mixerStore"
import { useEffect, useRef } from "react"

/**
 * Headless Multi-Track Audio Engine.
 * Manages the concurrent playback of mixed audio tracks using an array of independent HTMLAudioElements.
 * Synchronizes volume and loop states based on the global mixer store.
 */
export default function MixerEngine() {
  const { activeSounds } = useMixerStore()

  return (
    <>
      {activeSounds.map((sound) => (
        <MixerChannel key={sound.id} sound={sound} />
      ))}
    </>
  )
}

function MixerChannel({ sound }: { sound: any }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !sound.file_url) return

    audio.loop = true
    audio.volume = sound.volume

    // Robust playback initiation handling promise rejection for seamless user experience
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Mixer Channel Error:", error)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = sound.volume
    }
  }, [sound.volume])

  if (!sound.file_url) return null

  return <audio ref={audioRef} src={sound.file_url} className="hidden" />
}