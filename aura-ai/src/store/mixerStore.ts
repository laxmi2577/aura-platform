import { create } from 'zustand'
import { Track } from './playerStore'

/**
 * Extended Track Definition.
 * Augments the base Track interface with mixer-specific properties.
 * Includes volume state for individual layer control.
 */
export interface MixerSound extends Track {
  volume: number
}

/**
 * Multi-Track Audio State Interface.
 * Manages the sound mixer's global state, including active layers, UI visibility, and emotional context.
 * Provides actions for manipulating the sound stage and synchronizing the mixer engine.
 */
interface MixerState {
  activeSounds: MixerSound[]
  isOpen: boolean
  currentMood: string | null
  addSound: (track: Track) => void
  removeSound: (id: string) => void
  updateVolume: (id: string, volume: number) => void
  toggleMixer: () => void
  setMixerOpen: (isOpen: boolean) => void
  setMood: (mood: string | null) => void
  stopAll: () => void
}

/**
 * Global Mixer Store.
 * Centralized state management for the application's multi-track mixing capabilities.
 * Handles the addition/removal of tracks, volume updates, and managing the overall "mix" state.
 * persist active sounds and volume levels.
 */
export const useMixerStore = create<MixerState>((set) => ({
  activeSounds: [],
  isOpen: false,
  currentMood: null,

  addSound: (track) => set((state) => {
    // Idempotency check to prevent duplicate layers of the same track
    if (state.activeSounds.find(s => s.id === track.id)) return state
    return { activeSounds: [...state.activeSounds, { ...track, volume: 0.7 }] }
  }),

  removeSound: (id) => set((state) => ({
    activeSounds: state.activeSounds.filter((s) => s.id !== id)
  })),

  updateVolume: (id, volume) => set((state) => ({
    activeSounds: state.activeSounds.map((s) =>
      s.id === id ? { ...s, volume } : s
    )
  })),

  toggleMixer: () => set((state) => ({ isOpen: !state.isOpen })),
  setMixerOpen: (isOpen) => set({ isOpen }),
  setMood: (mood) => set({ currentMood: mood }),

  // Resets the entire mixing desk, clearing all active layers and mood state
  stopAll: () => set({ activeSounds: [], currentMood: null })
}))