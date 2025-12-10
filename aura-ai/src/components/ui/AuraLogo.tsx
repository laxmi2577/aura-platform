"use client"

/**
 * Brand Identity Mark.
 * Renders the scalable vector graphic (SVG) logo with dynamic gradient fills and animation support.
 * Encapsulates brand colors and geometry for consistent visual identity across the application.
 */
export default function AuraLogo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="45" stroke="url(#aura-gradient)" strokeWidth="4" className="animate-pulse opacity-50" />

            <circle cx="50" cy="50" r="35" stroke="url(#aura-gradient)" strokeWidth="8" />

            <path
                d="M50 25L70 65H30L50 25Z"
                fill="url(#aura-gradient)"
                className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            />

            <defs>
                <linearGradient id="aura-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#c084fc" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        </svg>
    )
}
