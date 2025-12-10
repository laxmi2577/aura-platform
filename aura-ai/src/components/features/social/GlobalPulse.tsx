"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePlayerStore } from "@/store/playerStore"
import { Globe2 } from "lucide-react"

interface UserPresence {
  user_id: string
  city: string
  track_title: string | null
  online_at: string
  presence_ref?: string
}

/**
 * Real-time Global Presence Indicator.
 * Leverages Supabase Presence to broadcast and subscribe to user activity events.
 * Displays aggregate active user counts and highlights global listening activity.
 */
export default function GlobalPulse() {
  const { currentTrack } = usePlayerStore()
  const [peers, setPeers] = useState<UserPresence[]>([])
  const [city, setCity] = useState("Unknown")
  const supabase = createClient()

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const cityName = tz.split("/")[1]?.replace(/_/g, " ") || "Earth"
    setCity(cityName)
  }, [])

  useEffect(() => {
    const userId = Math.random().toString(36).substring(7)
    const channel = supabase.channel('global-aura')

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const users: UserPresence[] = []

        for (const id in newState) {
          const stateList = newState[id]
          if (stateList && stateList.length > 0) {
            const userState = stateList[0] as unknown as UserPresence
            if (userState.user_id !== userId) {
              users.push(userState)
            }
          }
        }
        setPeers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            city: city,
            track_title: currentTrack?.title || "Silence",
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [city])

  // Broadcast presence update when track changes
  useEffect(() => {
    const updatePresence = async () => {
      const channel = supabase.channel('global-aura')
      await channel.track({
        user_id: Math.random().toString(36).substring(7),
        city: city,
        track_title: currentTrack?.title || "Silence",
        online_at: new Date().toISOString(),
      })
    }
    if (currentTrack) updatePresence()
  }, [currentTrack, city])

  if (peers.length === 0) return null

  const activePeer = peers[peers.length - 1]

  return (
    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Globe2 className="w-3 h-3" />
        <span>
          {peers.length} online.
          {activePeer.track_title && activePeer.track_title !== "Silence" ? (
            <span className="ml-1 font-medium text-primary">
              Someone in {activePeer.city} is playing "{activePeer.track_title}"
            </span>
          ) : (
            <span className="ml-1">Vibing together.</span>
          )}
        </span>
      </div>
    </div>
  )
}