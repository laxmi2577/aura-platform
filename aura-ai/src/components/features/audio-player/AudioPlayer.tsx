"use client"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { audioAnalyzer } from "@/lib/audio/audioAnalyzer"

/**
 * Headless Audio Engine component.
 * Manages the HTML5 Audio element and connects it to the Web Audio API analyzer.
 * Handles playback state synchronization between the global store and the DOM.
 */
export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { isPlaying, volume, isMuted, currentTrack, setIsPlaying } = usePlayerStore()

  // Initialize audio context analysis bridge on mount
  useEffect(() => {
    if (audioRef.current) {
      audioAnalyzer.init(audioRef.current)
    }
  }, [])

  // Synchronize playback state with store commands
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const controlPlayback = async () => {
      try {
        if (isPlaying) {
          audioAnalyzer.resume()
          await audio.play()
        } else {
          audio.pause()
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Audio Playback Error:", error)
          setIsPlaying(false)
        }
      }
    }

    controlPlayback()
  }, [isPlaying, setIsPlaying])

  // Apply volume and mute state to the media element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack?.file_url && audio.src !== currentTrack.file_url) {
      audio.src = currentTrack.file_url
    }
  }, [currentTrack])

  // Enforce autoplay behavior on track transition
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => { })
    }
  }, [currentTrack, isPlaying])

  return (
    <audio
      ref={audioRef}
      crossOrigin="anonymous"
      onEnded={() => setIsPlaying(false)}
      onPause={() => setIsPlaying(false)}
      onPlay={() => setIsPlaying(true)}
      className="hidden"
    />
  )
}
