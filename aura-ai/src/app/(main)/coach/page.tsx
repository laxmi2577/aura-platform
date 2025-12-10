import ChatInterface from "@/components/features/ai-coach/ChatInterface"

/**
 * AI Coach entry point.
 * Hosts the conversational interface for mood-based soundscape generation.
 */
export default function CoachPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
        <p className="text-muted-foreground">
          Chat with Aura to generate personalized soundscapes based on your mood.
        </p>
      </div>

      <ChatInterface />
    </div>
  )
}