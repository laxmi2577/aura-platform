"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import SoundCard from "@/components/features/sound-library/components/SoundCard"
import { Loader2, Clock, CalendarDays } from "lucide-react"
import Link from "next/link"

const getGroupLabel = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (itemDate.getTime() === today.getTime()) return "Today"
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday"
  return "Older"
}

/**
 * User activity hub.
 * Fetches and aggregates listening history using Supabase relational queries.
 * Implements client-side date grouping for chronological visualization.
 */
export default function HistoryPage() {
  const [groupedHistory, setGroupedHistory] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from("user_interactions")
          .select(`
            created_at,
            sounds ( id, title, file_url )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error

        const groups: Record<string, any[]> = { "Today": [], "Yesterday": [], "Older": [] }
        const seenIds = new Set()

        if (data) {
          for (const item of data) {
            // @ts-ignore
            const sound = item.sounds

            if (sound && !seenIds.has(sound.id)) {
              seenIds.add(sound.id)
              const groupName = getGroupLabel(item.created_at)
              if (!groups[groupName]) groups[groupName] = []

              groups[groupName].push({
                ...sound,
                played_at: item.created_at
              })
            }
          }
        }

        const cleanGroups: Record<string, any[]> = {}
        Object.keys(groups).forEach(key => {
          if (groups[key].length > 0) cleanGroups[key] = groups[key]
        })

        setGroupedHistory(cleanGroups)

      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading history...
      </div>
    )
  }

  if (Object.keys(groupedHistory).length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl">
        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No history yet</h3>
        <p className="text-muted-foreground mb-4">Start listening to build your profile.</p>
        <Link href="/" className="text-primary hover:underline">
          Go to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="w-8 h-8 text-primary" />
          Listening History
        </h1>
        <p className="text-muted-foreground">
          Your listening journey, organized by session.
        </p>
      </div>

      {Object.entries(groupedHistory).map(([label, items]) => (
        <div key={label} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">{label}</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {items.length} sounds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((sound) => (
              <SoundCard
                key={sound.id}
                track={{
                  id: sound.id,
                  title: sound.title,
                  file_url: sound.file_url,
                  category: new Date(sound.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}