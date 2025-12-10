"use client"

import AudioPlayer from "@/components/features/audio-player/AudioPlayer"
import MixerEngine from "@/components/features/sound-mixer/MixerEngine"
import SoundMixer from "@/components/features/sound-mixer/SoundMixer"
import { useMixerStore } from "@/store/mixerStore"
import { usePlayerStore } from "@/store/playerStore"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  SlidersHorizontal,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Wind,
  ChevronLeft,
  ChevronRight,
  Music,
  BrainCircuit,
  Sparkles,
  Activity,
  Clock,
  Upload,
  Maximize2,
  Smile,
} from "lucide-react"
import { useTheme } from "next-themes"
import Visualizer from "@/components/features/audio-player/Visualizer"
import VoiceControl from "@/components/features/voice-control/VoiceControl"
import SleepTimer from "@/components/features/audio-player/SleepTimer"
import BreathCircle from "@/components/features/breathwork/BreathCircle"
import GlobalPulse from "@/components/features/social/GlobalPulse"
import MoodBackground from "@/components/features/theme/MoodBackground"
import ShortcutsModal from "@/components/features/shortcuts/ShortcutsModal"
import ZenControls from "@/components/features/zen-mode/ZenControls"
import FaceDJ from "@/components/features/face-dj/FaceDJ"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import SystemHealth from "@/components/features/system/SystemHealth"
import AppGuide from "@/components/features/guide/AppGuide"
import AuraLogo from "@/components/ui/AuraLogo"

/**
 * Global layout wrapper for authenticated application routes.
 * Manages persistent state for audio playback, theming, and navigation.
 * Orchestrates cross-cutting concerns like keyboard shortcuts, authentication checks, and responsive sidebar behavior.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBreathing, setIsBreathing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isFaceDJOpen, setIsFaceDJOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { toggleMixer, activeSounds } = useMixerStore()
  const { togglePlay, toggleMute, isZenMode, toggleZenMode } = usePlayerStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      } else {
        setUserEmail(user.email || null)
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return
      if ((target as HTMLElement).isContentEditable) return

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault()
          togglePlay()
          break
        case "m":
          toggleMute()
          break
        case "b":
          setIsBreathing((prev) => !prev)
          break
        case "g":
          router.push("/galaxy")
          break
        case "?":
          setShowShortcuts((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, toggleMute, router])

  if (isLoading)
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <div className="hidden md:flex w-64 flex-col border-r border-border/50 p-4 gap-4">
          <div className="mb-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    )

  const NAV_ITEMS = [
    { name: "Library", href: "/", icon: Music },
    { name: "AI Coach", href: "/coach", icon: BrainCircuit },
    { name: "Galaxy", href: "/galaxy", icon: Sparkles },
    { name: "Brainwaves", href: "/binaural", icon: Wind },
    { name: "Insights", href: "/dashboard", icon: Activity },
    { name: "History", href: "/history", icon: Clock },
    ...(userEmail === "laxmiranjansahu2002@gmail.com"
      ? [{ name: "Upload", href: "/admin/upload", icon: Upload }]
      : []),
    { name: "Face DJ", href: "#", icon: Smile, action: () => setIsFaceDJOpen(true) },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between mb-8">
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
            <AuraLogo className="w-8 h-8" />

            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 tracking-tight">
              Aura AI
            </h1>
          </div>
        )}

        {!isMobileMenuOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground ml-auto"
          >
            {isCollapsed ? <AuraLogo className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>


      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map((link) => {
          if (link.action) {
            return (
              <button
                key={link.name}
                data-tour={link.name === "Face DJ" ? "face-dj" : undefined}
                onClick={() => {
                  link.action!()
                  setIsCollapsed(false)
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground ${isCollapsed && !isMobileMenuOpen ? "justify-center" : ""
                  }`}
                title={isCollapsed ? link.name : ""}
              >
                <link.icon className="w-8 h-8 shrink-0" />
                {(!isCollapsed || isMobileMenuOpen) && <span>{link.name}</span>}
              </button>
            )
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors ${pathname === link.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                } ${isCollapsed && !isMobileMenuOpen ? "justify-center" : ""}`}
              title={isCollapsed ? link.name : ""}
            >
              <link.icon className="w-8 h-8 shrink-0" />
              {(!isCollapsed || isMobileMenuOpen) && <span>{link.name}</span>}
            </Link>
          )
        })}

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-lg font-medium text-red-500 hover:bg-red-500/10 transition-colors ${isCollapsed && !isMobileMenuOpen ? "justify-center" : ""
            }`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="w-8 h-8 shrink-0" />
          {(!isCollapsed || isMobileMenuOpen) && <span>Sign Out</span>}
        </button>
      </nav>

      <div className="pt-6 border-t border-border/50 space-y-4" />
    </div>
  )

  return (
    <div className={cn(
      "flex h-screen overflow-hidden relative transition-colors duration-500",
      isZenMode ? "bg-black text-white" : "bg-background text-foreground"
    )}>
      <MoodBackground />

      {!isZenMode && (
        <aside
          className={`hidden md:flex flex-col border-r bg-card/80 backdrop-blur-md relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
            }`}
        >
          <SidebarContent />
        </aside>
      )}

      {!isZenMode && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
          <span className="font-bold text-3xl">Aura AI</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="w-8 h-8" />
              ) : (
                <Moon className="w-8 h-8" />
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {isMobileMenuOpen && !isZenMode && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-3/4 max-w-xs bg-card h-full shadow-2xl animate-in slide-in-from-left duration-300 border-r">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground"
            >
              <X className="w-8 h-8" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <AppGuide />

      <main
        className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative z-10 scroll-smooth"
        style={{ paddingBottom: isZenMode ? "0" : "120px" }}
      >
        {!isZenMode && (
          <div className="flex justify-end items-center mb-6 gap-4">
            <GlobalPulse />

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex p-2 rounded-full hover:bg-accent border border-border/50 text-muted-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-9 h-9" />
              ) : (
                <Moon className="w-9 h-9" />
              )}
            </button>
          </div>
        )}

        {!isZenMode ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/20 font-mono text-sm tracking-[0.5em] animate-pulse">
              BREATHE
            </p>
          </div>
        )}
      </main>

      {!isZenMode && (
        <div data-tour="player-controls" className="fixed bottom-0 left-0 right-0 h-24 border-t bg-card/90 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <div className="hidden md:block text-lg text-muted-foreground">Main Player</div>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            <SystemHealth />

            <div className="hidden sm:block">
              <Visualizer />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBreathing(true)}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                title="Breathwork"
              >
                <Wind className="w-8 h-8" />
              </button>

              <button
                onClick={toggleZenMode}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                title="Enter Zen Mode"
              >
                <Maximize2 className="w-8 h-8" />
              </button>

              <SleepTimer />
              <VoiceControl />

              <button
                onClick={toggleMixer}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <SlidersHorizontal className="w-8 h-8" />
                <span className="hidden md:inline text-base font-medium">
                  Mixer
                </span>
                {activeSounds.length > 0 && (
                  <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[10px]">
                    {activeSounds.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AudioPlayer />
      <MixerEngine />
      <SoundMixer />

      {isZenMode && <ZenControls />}

      {isBreathing && <BreathCircle onClose={() => setIsBreathing(false)} />}
      {isFaceDJOpen && <FaceDJ onClose={() => setIsFaceDJOpen(false)} />}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
