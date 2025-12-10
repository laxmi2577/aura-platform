import SoundLibrary from "@/components/features/sound-library/SoundLibrary"

/**
 * Main library view.
 * Displays the core collection of ambient soundscapes for user selection.
 */
export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Explore your collection of ambient soundscapes.
        </p>
      </div>

      <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
        <SoundLibrary />
      </div>
    </div>
  )
}