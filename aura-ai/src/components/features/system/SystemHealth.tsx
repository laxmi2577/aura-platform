"use client"

import { useState, useEffect, useRef } from "react"
import { fetchAI } from "@/lib/api"

/**
 * Backend Connectivity Monitor.
 * Periodically probes the Python microservice to ensure the inference engine is reachable.
 * Visualizes connection failures with a discrete status indicator to aid in troubleshooting without disrupting the UI.
 */
export default function SystemHealth() {
    const [isOffline, setIsOffline] = useState(false)
    const failureCount = useRef(0)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await fetchAI("/")

                failureCount.current = 0
                setIsOffline(false)

            } catch (e) {
                console.error("❌ Health Check Failed:", e)
                failureCount.current++
            }

            // Threshold-based visibility to prevent flickering during transient network hiccups
            if (failureCount.current >= 3) {
                setIsOffline(true)
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 5000)
        return () => clearInterval(interval)
    }, [])

    if (!isOffline) return null

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 animate-in fade-in slide-in-from-bottom-2 cursor-help"
            title="The generative brain is unreachable. Check your terminal logs."
        >
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Offline</span>
        </div>
    )
}
