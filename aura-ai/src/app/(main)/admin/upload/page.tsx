"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Upload, Loader2, Music, BrainCircuit, CheckCircle2, FileAudio } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Admin portal for ingesting new audio assets.
 * Implements a pipeline that uploads raw audio, classifies it using a custom CNN,
 * generates metadata via generative model, and persists records to Supabase.
 */
export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [cnnPrediction, setCnnPrediction] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const supabase = createClient()

  // Simulates progress feedback for UX during asynchronous operations where real progress is unavailable.
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isUploading) {
      setProgress(10)
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev))
      }, 500)
    } else if (progress > 0 && progress < 100) {
      setProgress(100)
    }
    return () => clearInterval(interval)
  }, [isUploading])

  /**
   * Orchestrates the multi-step ingestion pipeline:
   * 1. Supabase Storage upload
   * 2. Neural Network classification (external microservice)
   * 3. Semantic analysis and tagging
   * 4. Database record insertion
   */
  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setCnnPrediction(null)
    setTags([])

    try {
      setStatus("Uploading MP3 to Cloud...")
      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("sounds")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("sounds")
        .getPublicUrl(fileName)

      setStatus("Running Neural Network (Classification)...")
      try {
        const cnnRes = await fetch("http://127.0.0.1:8000/classify-custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url: publicUrl }),
        })
        const cnnData = await cnnRes.json()
        setCnnPrediction(cnnData)
      } catch (e) { console.error("CNN Error:", e) }

      setStatus("AI Listening (Tagging)...")
      const res = await fetch("/api/admin/analyze-sound", {
        method: "POST",
        body: JSON.stringify({ fileUrl: publicUrl }),
      })
      const data = await res.json()
      const detectedTags = Array.isArray(data.tags) ? data.tags : []
      setTags(detectedTags)

      setStatus("Saving Metadata...")

      const { data: cat } = await supabase.from('categories').select('id').limit(1).single()

      await supabase.from("sounds").insert({
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        file_url: publicUrl,
        category_id: cat?.id,
        tags: detectedTags,
      })

      setStatus("Done!")
      setProgress(100)

      setTimeout(() => {
        setIsUploading(false)
        setFile(null)
        setTitle("")
        setStatus("")
        setProgress(0)
      }, 3000)

    } catch (e) {
      console.error(e)
      setStatus("Error!")
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Music className="w-8 h-8 text-primary" />
          AI Sound Ingestion
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload raw audio. Our AI pipeline will analyze, tag, and classify it automatically.
        </p>
      </div>

      <div
        className={cn(
          "relative h-64 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer",
          isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/5",
          file ? "border-green-500/50 bg-green-500/5" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
        }}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {file ? (
          <div className="text-center animate-in zoom-in-50">
            <FileAudio className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <p className="text-xl font-semibold text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <Upload className={cn("w-16 h-16 mx-auto mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
            <p className="text-xl font-medium">Drag & Drop MP3 here</p>
            <p className="text-sm text-muted-foreground mt-2">or click to browse</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <input
          placeholder="Sound Title (Optional)"
          className="w-full p-4 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none text-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {isUploading && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-primary flex items-center gap-2">
                {progress < 100 ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                {status}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {tags.length > 0 && (
            <div className="p-4 border rounded-xl bg-card">
              <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3">Generative Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cnnPrediction && (
            <div className="p-4 border border-purple-500/30 bg-purple-500/5 rounded-xl">
              <h3 className="text-xs font-bold uppercase text-purple-400 mb-3 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Neural Network
              </h3>
              <div className="space-y-1">
                <p className="text-lg font-bold">{cnnPrediction.label}</p>
                <div className="w-full bg-purple-900/20 h-1.5 rounded-full mt-2">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cnnPrediction.confidence * 100}%` }} />
                </div>
                <p className="text-xs text-purple-400/80 text-right mt-1">{(cnnPrediction.confidence * 100).toFixed(1)}% Confidence</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
        >
          {isUploading ? "Processing..." : "Upload & Analyze"}
        </button>
      </div>
    </div>
  )
}