"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useMixerStore } from "@/store/mixerStore"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Message {
  role: "user" | "model"
  text: string
}

/**
 * Conversational UI for the AI Relax Coach.
 * Handles real-time message exchange, maintains chat history,
 * and processes structured command responses to drive the audio mixer state.
 */
export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello. I am Aura. How are you feeling right now?" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { addSound, updateVolume, setMixerOpen, setMood } = useMixerStore()
  const supabase = createClient()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input
    if (!textToSend.trim() || isLoading) return

    setInput("")
    setMessages(prev => [...prev, { role: "user", text: textToSend }])
    setIsLoading(true)

    try {
      const history = messages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))

      const res = await fetch("/api/ai-coach", {
        method: "POST",
        body: JSON.stringify({ message: textToSend, history }),
      })

      const data = await res.json()

      const rawText = data.response || ""

      if (!rawText) {
        throw new Error(data.error || "Invalid response from AI")
      }

      let cleanText = rawText
      let mixCommand = null

      // Robustly parse JSON commands embedded in the response text using regex heuristics.
      const hiddenMatch = rawText.match(/\|\|\|JSON([\s\S]*?)\|\|\|/i)
      const markdownMatch = rawText.match(/```json([\s\S]*?)```/i)

      if (hiddenMatch) {
        cleanText = rawText.replace(hiddenMatch[0], "").trim()
        try { mixCommand = JSON.parse(hiddenMatch[1]) } catch (e) { console.error(e) }
      }
      else if (markdownMatch) {
        cleanText = rawText.replace(markdownMatch[0], "").trim()
        try { mixCommand = JSON.parse(markdownMatch[1]) } catch (e) { console.error(e) }
      }

      setMessages(prev => [...prev, { role: "model", text: cleanText }])

      if (mixCommand && mixCommand.mix) {
        setMixerOpen(true)

        const { data: tracks } = await supabase
          .from("sounds")
          .select("*")
          .in("id", mixCommand.mix.map((m: any) => m.id))

        if (tracks) {
          tracks.forEach(track => {
            const mixConfig = mixCommand.mix.find((m: any) => m.id === track.id)
            addSound({ ...track, category: "AI Mix" })
            if (mixConfig?.volume) {
              setTimeout(() => updateVolume(track.id, mixConfig.volume), 100)
            }
          })
        }
      }

    } catch (error) {
      console.error(error)
      toast.error("Connection Error", {
        description: "Could not reach the AI Coach."
      })
      setMessages(prev => [...prev, { role: "model", text: "I'm having trouble connecting right now. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-accent/20 flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary" />
        <span className="font-semibold">AI Relaxation Coach</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8 mt-4 animate-in fade-in slide-in-from-bottom-4">
            {[
              { icon: "😴", text: "I can't sleep" },
              { icon: "⚡", text: "Boost my focus" },
              { icon: "🧘", text: "Help me meditate" },
              { icon: "🌧️", text: "I need rain sounds" }
            ].map((chip) => (
              <button
                key={chip.text}
                onClick={() => handleSend(chip.text)}
                className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-accent transition-colors bg-card/50"
              >
                <span className="text-2xl">{chip.icon}</span>
                <span className="text-sm font-medium">{chip.text}</span>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
            `}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`
              p-3 rounded-lg text-sm leading-relaxed
              max-w-[85%] md:max-w-[70%] lg:max-w-[600px]
              ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/50"}
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tell me how you feel..."
            className="flex-1 bg-accent/50 border-0 rounded-md px-4 focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}