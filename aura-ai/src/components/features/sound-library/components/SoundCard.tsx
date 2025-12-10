"use client"

import { Track, usePlayerStore } from "@/store/playerStore"
import { Play, Pause, Plus, Search, Edit2, Trash2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchAI } from "@/lib/api"
import { useMixerStore } from "@/store/mixerStore"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SoundCardProps {
    track: Track
    onFindSimilar?: (id: string) => void
    isAdmin?: boolean
    isEditing?: boolean
    editValue?: string
    onEditStart?: () => void
    onEditCancel?: () => void
    onEditSave?: () => void
    onEditValueChange?: (val: string) => void
    onDelete?: () => void
}

/**
 * Global cache for waveform data to minimize redundant network requests.
 * Stores normalized amplitude arrays keyed by file URL.
 */
const waveformCache: Record<string, number[]> = {}

/**
 * Interactive Sound Unit Component.
 * Displays track metadata, visualizes audio waveform, and provides playback controls.
 * Handles user interactions (play/pause/layer), admin editing capabilities, and interaction logging.
 * Implements client-side caching for waveform data and intelligent state management for the global player.
 */
export default function SoundCard({
    track,
    onFindSimilar,
    isAdmin,
    isEditing,
    editValue,
    onEditStart,
    onEditCancel,
    onEditSave,
    onEditValueChange,
    onDelete
}: SoundCardProps) {
    if (!track.file_url) return null

    const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore()
    const { addSound, stopAll } = useMixerStore()
    const [waveform, setWaveform] = useState<number[]>([])

    const supabase = createClient()

    useEffect(() => {
        if (!track.file_url) return

        // Check in-memory cache first to avoid re-fetching on mount
        if (waveformCache[track.file_url]) {
            setWaveform(waveformCache[track.file_url])
            return
        }

        // Fetch waveform data from the backend analysis service
        const fetchWaveform = async () => {
            try {
                const data = await fetchAI("/analyze-waveform", {
                    method: "POST",
                    body: JSON.stringify({ file_url: track.file_url }),
                })
                const wave = data.waveform || []

                waveformCache[track.file_url] = wave
                setWaveform(wave)
            } catch (e) {
                console.error(e)
            }
        }
        fetchWaveform()
    }, [track.file_url])

    const isCurrent = currentTrack?.id === track.id
    const isActive = isCurrent && isPlaying

    const handleClick = async () => {
        if (isCurrent) {
            togglePlay()
        } else {
            // Ensure single-source playback by stopping the mixer first
            stopAll()
            setTrack(track)

            // Asynchronously log user interaction for preference learning
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    await supabase.from("user_interactions").insert({
                        user_id: user.id,
                        sound_id: track.id,
                        interaction_type: "play",
                    })
                }
            } catch (e) {
                console.error("Failed to log interaction", e)
            }
        }
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer h-48 flex flex-col justify-between",
                "bg-black/40 backdrop-blur-md border-white/10 shadow-lg",
                "hover:bg-black/60 hover:border-white/20 hover:shadow-xl hover:-translate-y-1",
                isCurrent
                    ? "border-primary/50 bg-primary/10 ring-1 ring-primary/50 shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]"
                    : ""
            )}
        >
            {/* Control Header */}
            <div className="flex items-start justify-between relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                </div>

                <div className="flex gap-2">
                    {onFindSimilar && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onFindSimilar(track.id)
                            }}
                            className="p-2 rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:text-white transition-all"
                            title="Find similar sounds"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            addSound(track)
                        }}
                        className="p-2 rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all"
                        title="Layer this sound"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Waveform Visualization Layer */}
            <div className="flex items-end justify-center h-16 gap-0.5 opacity-50 group-hover:opacity-80 transition-opacity w-full">
                {waveform.length > 0 ? (
                    waveform.map((amp, i) => (
                        <div
                            key={i}
                            style={{ height: `${Math.max(10, amp * 100)}%` }}
                            className="w-1 bg-primary rounded-t-sm transition-all duration-500"
                        />
                    ))
                ) : (
                    // Fallback visual pattern for unloaded waveforms
                    <div className="flex items-end gap-1 w-full h-full justify-center opacity-30">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-muted-foreground/50 rounded-t-sm"
                                style={{ height: `${30 + Math.random() * 40}%` }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Metadata Footer */}
            <div className="relative z-10">
                {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            value={editValue}
                            onChange={(e) => onEditValueChange?.(e.target.value)}
                            className="bg-black/20 border rounded px-2 py-1 text-sm w-full"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onEditSave?.()
                                if (e.key === 'Escape') onEditCancel?.()
                            }}
                        />
                        <button onClick={onEditSave} className="text-green-400 hover:bg-white/10 p-1 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={onEditCancel} className="text-red-400 hover:bg-white/10 p-1 rounded"><X className="w-4 h-4" /></button>
                    </div>
                ) : (
                    <>
                        <h3 className="font-semibold leading-none tracking-tight truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {track.category || "Sound"}
                        </p>
                    </>
                )}
            </div>

            {/* Administrative Overlays */}
            {isAdmin && !isEditing && (
                <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onEditStart}
                        className="p-1.5 hover:bg-white/10 rounded text-blue-400"
                        title="Rename"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-white/10 rounded text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    )
}
