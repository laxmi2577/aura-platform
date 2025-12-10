import { create } from 'zustand'

/**
 * Core Audio Asset Definition.
 * Represents the fundamental unit of playback within the application, containing metadata and resource locators.
 * Used across the library, player, and mixer contexts.
 */
export interface Track {
  id: string
  title: string
  file_url: string
  category: string
  color?: string
}

/**
 * Global Player State Interface.
 * Defines the contract for the singleton audio player state.
 * Manages playback transport (play/pause), volume, mute state, and the currently focused track.
 * Also holds view-state flags like Zen Mode.
 */
interface PlayerState {
  isPlaying: boolean
  isMuted: boolean
  isZenMode: boolean
  volume: number
  currentTrack: Track | null
  setIsPlaying: (isPlaying: boolean) => void
  setVolume: (volume: number) => void
  setTrack: (track: Track) => void
  togglePlay: () => void
  toggleMute: () => void
  toggleZenMode: () => void
}

/**
 * Primary Audio Store.
 * Controls the single-source playback engine and global application modes related to audio consumption.
 * Acts as the source of truth for the `AudioPlayer` headless component.
 */
export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  isMuted: false,
  isZenMode: false,
  volume: 0.5,
  currentTrack: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume, isMuted: false }),
  setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
}))