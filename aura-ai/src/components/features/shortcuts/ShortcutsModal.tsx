"use client"

import { X, Keyboard } from "lucide-react"
import { useEffect } from "react"

/**
 * Keyboard Shortcuts Modal.
 * Displays a list of available global hotkeys and handles escape key interaction for closure.
 */
export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const shortcuts = [
    { key: "Space", action: "Play / Pause" },
    { key: "M", action: "Mute / Unmute" },
    { key: "B", action: "Breathwork Mode" },
    { key: "G", action: "Galaxy View" },
    { key: "?", action: "Show Shortcuts" },
    { key: "Esc", action: "Close Modal" },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-card border border-border/50 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" /> Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {item.action}
              </span>
              <kbd className="px-2.5 py-1 bg-muted/50 border border-border rounded-md text-xs font-mono font-bold min-w-[2rem] text-center text-foreground">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Press <kbd className="font-mono bg-muted/30 px-1 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}