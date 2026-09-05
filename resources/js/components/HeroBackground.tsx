export default function HeroBackground() {
    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-60 sm:opacity-80 md:opacity-100"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="signal-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="signal-line-1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(14, 165, 168, 0.2)" />
                    <stop offset="100%" stopColor="rgba(14, 165, 168, 0.5)" />
                </linearGradient>
                <linearGradient id="signal-line-2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
                    <stop offset="100%" stopColor="rgba(37, 99, 235, 0.4)" />
                </linearGradient>
            </defs>

            <g>
                <path
                    d="M 520 40 C 660 40, 700 160, 830 260"
                    stroke="url(#signal-line-2)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 520 560 C 660 560, 700 420, 830 320"
                    stroke="url(#signal-line-1)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />

                <circle r="3" fill="#0ea5a8" filter="url(#signal-glow)" className="motion-reduce:hidden">
                    <animateMotion
                        dur="12s"
                        repeatCount="indefinite"
                        path="M 520 40 C 660 40, 700 160, 830 260"
                    />
                </circle>
                <circle r="3" fill="#0ea5a8" filter="url(#signal-glow)" className="motion-reduce:hidden">
                    <animateMotion
                        dur="14s"
                        repeatCount="indefinite"
                        path="M 520 560 C 660 560, 700 420, 830 320"
                    />
                </circle>
            </g>

            <g className="hidden md:block">
                <path
                    d="M 620 120 C 720 120, 760 200, 830 260"
                    stroke="url(#signal-line-2)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 620 480 C 720 480, 760 380, 830 320"
                    stroke="url(#signal-line-1)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />

                <circle r="3" fill="#0ea5a8" filter="url(#signal-glow)" className="motion-reduce:hidden">
                    <animateMotion
                        dur="10s"
                        repeatCount="indefinite"
                        path="M 620 120 C 720 120, 760 200, 830 260"
                    />
                </circle>
                <circle r="3" fill="#0ea5a8" filter="url(#signal-glow)" className="motion-reduce:hidden">
                    <animateMotion
                        dur="11s"
                        repeatCount="indefinite"
                        path="M 620 480 C 720 480, 760 380, 830 320"
                    />
                </circle>
            </g>
        </svg>
    );
}
