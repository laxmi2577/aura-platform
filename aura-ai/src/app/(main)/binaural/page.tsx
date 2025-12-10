import BinauralBeatGenerator from "@/components/features/binaural-beats/BinauralBeatGenerator"

/**
 * Route container for the Binaural Beats feature.
 * Renders the real-time sine wave generator for brain entrainment.
 */
export default function BinauralPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Binaural Brainwaves</h1>
        <p className="text-muted-foreground">
          Generate real-time sine waves to entrain your brain into specific states.
        </p>
      </div>

      <BinauralBeatGenerator />
    </div>
  )
}