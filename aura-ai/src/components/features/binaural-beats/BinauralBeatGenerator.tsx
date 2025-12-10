"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, Brain, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import SineWaveVisualizer from "./SineWaveVisualizer"

const PRESETS = [
  { name: "Deep Sleep (Delta)", beat: 2, base: 100, desc: "Dreamless sleep, healing (0.5-4Hz)" },
  { name: "Meditation (Theta)", beat: 6, base: 150, desc: "Deep relaxation, creativity (4-8Hz)" },
  { name: "Relaxation (Alpha)", beat: 10, base: 200, desc: "Calm focus, stress reduction (8-13Hz)" },
  { name: "Active Focus (Beta)", beat: 20, base: 250, desc: "Concentration, problem solving (13-30Hz)" },
  { name: "High Performance (Gamma)", beat: 40, base: 300, desc: "Cognitive enhancement (30Hz+)" },
]

/**
 * Web Audio-based Binaural Beat Generator.
 * Creates two independent sine wave oscillators (Left & Right) with slightly offset frequencies.
 * The brain "hears" the difference (beat frequency), inducing specific mental states via entrainment.
 */
export default function BinauralBeatGenerator() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [baseFreq, setBaseFreq] = useState(200)
  const [beatFreq, setBeatFreq] = useState(10)
  const [volume, setVolume] = useState(0.5)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscLeftRef = useRef<OscillatorNode | null>(null)
  const oscRightRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const initAudio = () => {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext)
    const ctx = new Ctx()

    // Master Volume Mix Node
    const gain = ctx.createGain()
    gain.gain.value = volume
    gain.connect(ctx.destination)

    // Left Ear Channel (Single Sine Wave)
    const oscL = ctx.createOscillator()
    oscL.type = "sine"
    oscL.frequency.value = baseFreq
    const pannerL = ctx.createStereoPanner()
    pannerL.pan.value = -1
    oscL.connect(pannerL).connect(gain)

    // Right Ear Channel (Offset Frequency)
    const oscR = ctx.createOscillator()
    oscR.type = "sine"
    oscR.frequency.value = baseFreq + beatFreq
    const pannerR = ctx.createStereoPanner()
    pannerR.pan.value = 1
    oscR.connect(pannerR).connect(gain)

    audioCtxRef.current = ctx
    gainNodeRef.current = gain
    oscLeftRef.current = oscL
    oscRightRef.current = oscR

    oscL.start()
    oscR.start()
  }

  const togglePlay = () => {
    if (isPlaying) {
      oscLeftRef.current?.stop()
      oscRightRef.current?.stop()
      audioCtxRef.current?.close()
      setIsPlaying(false)
    } else {
      initAudio()
      setIsPlaying(true)
    }
  }

  // Real-time frequency modulation with smooth ramping to prevent audio artifacts
  useEffect(() => {
    if (!isPlaying) return

    const now = audioCtxRef.current?.currentTime || 0

    oscLeftRef.current?.frequency.linearRampToValueAtTime(baseFreq, now + 0.1)
    oscRightRef.current?.frequency.linearRampToValueAtTime(baseFreq + beatFreq, now + 0.1)
  }, [baseFreq, beatFreq, isPlaying])

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.1)
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close()
      }
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 p-6 border rounded-xl bg-card/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="text-primary" /> Generator
            </h2>
            <div className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
          </div>

          <div className="mb-6">
            <SineWaveVisualizer isPlaying={isPlaying} baseFreq={baseFreq} beatFreq={beatFreq} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <label className="font-medium">Brainwave (Beat): {beatFreq} Hz</label>
              <span className="text-muted-foreground">Target State</span>
            </div>
            <input
              type="range"
              min="1" max="50" step="0.5"
              value={beatFreq}
              onChange={(e) => setBeatFreq(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <label className="font-medium">Base Tone: {baseFreq} Hz</label>
              <span className="text-muted-foreground">Carrier Pitch</span>
            </div>
            <input
              type="range"
              min="50" max="400" step="5"
              value={baseFreq}
              onChange={(e) => setBaseFreq(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <label className="font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Volume</label>
            </div>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={togglePlay}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${isPlaying
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {isPlaying ? <><Pause /> Stop Session</> : <><Play /> Start Generator</>}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Headphones required for binaural effect.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Scientific Presets</h3>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setBeatFreq(p.beat); setBaseFreq(p.base); if (!isPlaying) togglePlay(); }}
              className={`w-full p-4 rounded-lg border text-left transition-all hover:border-primary ${beatFreq === p.beat ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card hover:bg-accent"
                }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">{p.name}</span>
                <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">{p.beat} Hz</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}