"use client"

import { fetchAI } from "@/lib/api"
import { useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import { Camera, X, Zap, Loader2, Smile } from "lucide-react"
import { useMixerStore } from "@/store/mixerStore"
import { usePlayerStore } from "@/store/playerStore"
import { toast } from "sonner"

/**
 * Facial Expression Music Controller.
 * Captures webcam input, performs server-side emotion analysis, and maps results to soundscape generation.
 * Handles webcam stream lifecycle, image capture, and store synchronization for auto-mixing.
 */
export default function FaceDJ({ onClose }: { onClose: () => void }) {
    const webcamRef = useRef<Webcam>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [emotion, setEmotion] = useState<string | null>(null)

    const { activeSounds, removeSound, addSound, updateVolume, setMixerOpen, setMood } = useMixerStore()
    const { setIsPlaying } = usePlayerStore()

    const capture = useCallback(async () => {
        if (!webcamRef.current) return
        const imageSrc = webcamRef.current.getScreenshot()
        if (!imageSrc) return

        setIsScanning(true)

        try {
            const data = await fetchAI("/analyze-face", {
                method: "POST",
                body: JSON.stringify({ image: imageSrc }),
            })

            setEmotion(data.emotion)

            // Auto-Mix Generation Logic
            activeSounds.forEach(s => removeSound(s.id))

            if (data.mix) {
                setMood(data.emotion)
                data.mix.forEach((track: any, i: number) => {
                    addSound({
                        id: track.id,
                        title: track.title,
                        file_url: track.file_url,
                        category: `Face: ${data.emotion}`
                    })
                    // Apply staggered volume ramping for layering effect
                    setTimeout(() => updateVolume(track.id, i === 0 ? 0.8 : 0.4), 100)
                })
                setIsPlaying(false)
                setMixerOpen(true)
                toast.success("Mood Detected: " + data.emotion, {
                    description: "Generating your custom mix..."
                })
                onClose()
            }

        } catch (e) {
            console.error("Face DJ Error:", e)
            toast.error("Face Analysis Failed", {
                description: "Check your webcam permissions or backend connection."
            })
        } finally {
            setIsScanning(false)
        }
    }, [webcamRef, activeSounds])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg animate-in fade-in">
            <button onClick={onClose} className="absolute top-8 right-8 p-2 text-white/50 hover:text-white">
                <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center gap-2">
                        <Smile className="w-8 h-8 text-pink-500" /> Face DJ
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        I'll scan your expression and play the perfect mix.
                    </p>
                </div>

                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl ring-4 ring-white/5">
                    {emotion ? (
                        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center animate-in zoom-in">
                            <span className="text-6xl mb-2">
                                {emotion === 'happy' ? '😊' : emotion === 'sad' ? '🌧️' : emotion === 'angry' ? '🔥' : '😐'}
                            </span>
                            <p className="text-xl font-bold capitalize text-white">{emotion}</p>
                            <p className="text-xs text-green-400 mt-1">Mix Generating...</p>
                        </div>
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.5}
                            className="w-full h-full object-cover mirror"
                            videoConstraints={{
                                width: 480,
                                height: 360,
                                facingMode: "user"
                            }}
                        />
                    )}

                    {isScanning && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    )}
                </div>

                {!emotion && (
                    <button
                        onClick={capture}
                        disabled={isScanning}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        <Camera className="w-5 h-5" />
                        {isScanning ? "Analyzing..." : "Scan Mood"}
                    </button>
                )}

                {emotion && (
                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-white underline"
                    >
                        Back to Dashboard
                    </button>
                )}
            </div>
        </div>
    )
}
