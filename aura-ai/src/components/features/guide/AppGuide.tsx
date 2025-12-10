"use client"

import { useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride"
import { usePathname } from "next/navigation"
import { HelpCircle, ChevronRight, X, Sparkles, MonitorSmartphone } from "lucide-react"

const CustomTooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
}: TooltipRenderProps) => {
    return (
        <div
            {...tooltipProps}
            className="relative max-w-sm rounded-3xl p-[2px] bg-gradient-to-br from-white/20 via-primary/50 to-purple-500/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu transition-all duration-300 hover:scale-[1.02]"
        >
            <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-6 relative overflow-hidden border border-white/5">

                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

                <div className="relative z-10 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {step.title}
                        </h3>
                    </div>
                    <button {...closeProps} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 text-gray-300 text-sm leading-relaxed mb-6">
                    {step.content}
                </div>

                <div className="relative z-10 flex cursor-pointer justify-between items-center">
                    <div className="text-xs text-white/30 font-mono tracking-widest">
                        STEP {index + 1}
                    </div>

                    <div className="flex gap-3">
                        {index > 0 && (
                            <button
                                {...backProps}
                                className="px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                                BACK
                            </button>
                        )}

                        <button
                            {...primaryProps}
                            className="group relative px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs overflow-hidden shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                {isLastStep ? "FINISH" : "NEXT"} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-50 blur-sm group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Onboarding Tour Controller.
 * Manages the first-time user experience walk-through.
 * Utilizes a custom 3D glassmorphic tooltip design to highlight key UI elements defined by data attributes.
 */
export default function AppGuide() {
    const [run, setRun] = useState(false)
    const pathname = usePathname()

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            title: "Welcome to Aura AI",
            content: "Experience the next generation of soundscapes. Let us show you around your new 3D audio environment.",
            disableBeacon: true,
        },
        {
            target: '[data-tour="search-bar"]',
            placement: 'bottom',
            title: "Smart Semantic Search",
            content: "Don't just search for keywords. Describe a feeling, a scene, or a vibe. Our AI understands context.",
        },
        {
            target: '[data-tour="sound-grid"]',
            placement: 'center',
            title: "Live Sound Library",
            content: "Explore thousands of generated sounds. Hover over cards to preview waves, edit (if admin), or add to your mixer.",
        },
        {
            target: '[data-tour="player-controls"]',
            placement: 'right',
            title: "Spatial Mixer",
            content: "Control volume, toggles, and mix multiple sounds together to create your perfect atmosphere.",
        },
        {
            target: '[data-tour="face-dj"]',
            placement: 'right',
            title: "Face DJ Magic",
            content: "Control the music with your expressions! Smile to play, frown to pause. It's magic.",
        }
    ]

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem("aura_guide_seen")
        if (!hasSeenGuide && pathname === "/") {
            setRun(true)
        }
    }, [pathname])

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data
        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setRun(false)
            localStorage.setItem("aura_guide_seen", "true")
        }
    }

    const startTour = () => {
        setRun(true)
    }

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                continuous
                showSkipButton
                showProgress
                tooltipComponent={CustomTooltip}
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        zIndex: 10000,
                        arrowColor: 'transparent',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(5px)',
                    }
                }}
            />

            <button
                onClick={startTour}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-110 hover:bg-black/80 hover:border-primary/50 transition-all duration-300 group"
                aria-label="Start Tour"
            >
                <HelpCircle className="w-6 h-6 animate-pulse group-hover:animate-none" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    3D Guide
                </span>
            </button>
        </>
    )
}
