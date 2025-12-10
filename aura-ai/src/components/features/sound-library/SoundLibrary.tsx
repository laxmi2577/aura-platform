"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import SoundCard from "./components/SoundCard"
import { Loader2, Search, Sparkles, X, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAI } from "@/lib/api"
import { usePlayerStore } from "@/store/playerStore"
import { toast } from "sonner"

/**
 * Main Sound Discovery Interface.
 * Orchestrates the browsing, searching, and recommendation experience.
 * Integrates semantic vector search for natural language queries and manages
 * admin-level capabilities for content management.
 * Handles state for sound lists, search contexts, and user personalization.
 */
export default function SoundLibrary() {
    const [sounds, setSounds] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Admin State Management
    const [userEmail, setUserEmail] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState("")
    const ADMIN_EMAIL = "laxmiranjansahu2002@gmail.com"

    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const supabase = createClient()
    const { currentTrack } = usePlayerStore()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserEmail(user.email || "")
            fetchDefaultSounds()
        }
        init()
    }, [])

    const fetchDefaultSounds = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from("sounds")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20)

            if (error) throw error
            setSounds(data || [])
        } catch (error) {
            console.error("Error fetching sounds:", error)
        } finally {
            setIsLoading(false)
            setIsSearching(false)
        }
    }

    // --- Content Management Handlers ---

    const handleDelete = async (sound: any) => {
        if (!confirm(`Are you sure you want to delete "${sound.title}"?`)) return

        try {
            // Delete from object storage
            const filePath = sound.file_url.split("/").pop()
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from("audio-files")
                    .remove([`public/${filePath}`])

                if (storageError) console.error("Storage delete error:", storageError)
            }

            // Delete record from database
            const { error: dbError } = await supabase
                .from("sounds")
                .delete()
                .eq("id", sound.id)

            if (dbError) throw dbError

            toast.success("Sound deleted successfully")
            setSounds(sounds.filter(s => s.id !== sound.id))

        } catch (e) {
            toast.error("Failed to delete sound")
            console.error(e)
        }
    }

    const handleRename = async () => {
        if (!editingId || !renameValue.trim()) return

        try {
            const { error } = await supabase
                .from("sounds")
                .update({ title: renameValue })
                .eq("id", editingId)

            if (error) throw error

            toast.success("Sound renamed")
            setSounds(sounds.map(s => s.id === editingId ? { ...s, title: renameValue } : s))
            setEditingId(null)
            setRenameValue("")

        } catch (e) {
            toast.error("Failed to rename")
            console.error(e)
        }
    }

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!searchQuery.trim()) {
            fetchDefaultSounds()
            return
        }

        setIsLoading(true)
        setIsSearching(true)

        try {
            console.log(`🧠 Asking AI to find: "${searchQuery}"...`)

            // Perform semantic search via vector embeddings
            const data = await fetchAI("/search", {
                method: "POST",
                body: JSON.stringify({
                    query: searchQuery,
                    match_count: 20
                }),
            })

            console.log("✅ AI Results:", data.results)
            setSounds(data.results || [])

        } catch (error) {
            console.error("Search failed:", error)
            toast.error("AI Brain Disconnected", {
                description: "Is the Python server running on port 8000?"
            })
            fetchDefaultSounds()
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch contextual recommendations based on current track
    useEffect(() => {
        if (!currentTrack) return

        const fetchRecommendations = async () => {
            try {
                const data = await fetchAI("/recommend", {
                    method: "POST",
                    body: JSON.stringify({ sound_id: currentTrack.id }),
                })
                setRecommendations(data.recommendations || [])
            } catch (e) {
                console.error("Recs Error:", e)
            }
        }
        fetchRecommendations()
    }, [currentTrack])


    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Skeleton UI for perceived performance */}
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-12 w-full rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-48 border rounded-xl p-4 flex flex-col justify-between"
                        >
                            <div className="flex justify-between">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Search Interface */}
            <div className="relative max-w-2xl mx-auto">
                {isSearching && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20 animate-pulse"></div>
                )}

                <form
                    data-tour="search-bar"
                    onSubmit={handleSearch}
                    className="relative flex items-center bg-card border rounded-full shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary"
                >
                    <div className="pl-4 text-muted-foreground">
                        {isSearching ? (
                            <Sparkles className="w-5 h-5 animate-pulse text-purple-500" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </div>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Describe a vibe (e.g., "I want to sleep in a forest")...'
                        className="flex-1 px-4 py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("")
                                fetchDefaultSounds()
                            }}
                            className="p-2 hover:bg-accent rounded-full mr-1"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Thinking..." : "Search"}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-2">
                    Powered by <strong>Vector Semantic Search</strong>
                </p>
            </div>

            {/* Content Output */}
            {sounds.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card/50">
                    <p className="text-lg font-medium">No sounds found.</p>
                    <p className="text-muted-foreground">Try a different description.</p>
                    <button
                        onClick={fetchDefaultSounds}
                        className="mt-4 text-primary hover:underline text-sm"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div data-tour="sound-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sounds.map((sound) => (
                        <SoundCard
                            key={sound.id}
                            track={{
                                id: sound.id,
                                title: sound.title,
                                file_url: sound.file_url,
                                color: sound.color,
                                category:
                                    isSearching && sound.similarity
                                        ? `Match: ${(sound.similarity * 100).toFixed(0)}%`
                                        : "Library",
                            }}
                            isAdmin={userEmail === ADMIN_EMAIL}
                            isEditing={editingId === sound.id}
                            editValue={editingId === sound.id ? renameValue : ""}
                            onEditStart={() => {
                                setEditingId(sound.id)
                                setRenameValue(sound.title)
                            }}
                            onEditCancel={() => {
                                setEditingId(null)
                                setRenameValue("")
                            }}
                            onEditSave={handleRename}
                            onEditValueChange={setRenameValue}
                            onDelete={() => handleDelete(sound)}
                        />
                    ))}
                </div>
            )}

            {/* Recommendations Row */}
            {recommendations.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-primary" />
                        Because you're listening to "{currentTrack?.title}"...
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recommendations.map((sound) => (
                            <SoundCard
                                key={sound.id}
                                track={{
                                    id: sound.id,
                                    title: sound.title,
                                    file_url: sound.file_url,
                                    category: "Recommended"
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
