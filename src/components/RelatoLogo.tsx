export const RELATO_LOGO_SVG = `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <g id="relato-mark">
    <!-- Left ribbon / wave (charcoal) -->
    <path d="M120 280 C110 240, 130 190, 180 185 C230 180, 260 230, 270 270 C240 275, 200 280, 175 250 C160 230, 150 240, 145 265 C140 290, 135 300, 120 280 Z" fill="#2E2E2E" />
    <!-- Center connecting oval loop (soft blush peach) -->
    <ellipse cx="230" cy="245" rx="38" ry="24" transform="rotate(-30 230 245)" stroke="#D4A396" stroke-width="14" fill="none" stroke-linecap="round" />
    <!-- Right ribbon / wave (charcoal) -->
    <path d="M210 250 C235 295, 275 315, 315 295 C335 285, 345 255, 350 220 C340 240, 325 270, 290 270 C260 270, 235 245, 210 250 Z" fill="#2E2E2E" />
  </g>
</svg>`;

export function RelatoLogo({ className = "h-8", showText = true, textClassName = "text-2xl" }: { className?: string; showText?: boolean; textClassName?: string }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact geometrical representation of the Relato uploaded twin infinity / interlocking ribbon emblem */}
      <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full aspect-[4/3] drop-shadow-xs">
        {/* Left Charcoal Loop */}
        <path
          d="M32 68 C22 45 42 24 64 24 C82 24 94 42 98 62 C88 64 78 54 72 44 C66 36 50 36 44 48 C38 60 42 70 32 68 Z"
          fill="#2B2B2B"
        />
        {/* Blush Inner Core Intersect */}
        <ellipse
          cx="82"
          cy="58"
          rx="15"
          ry="10"
          transform="rotate(-28 82 58)"
          stroke="#DCA89C"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Charcoal Loop */}
        <path
          d="M72 62 C82 82 102 96 124 88 C136 84 144 68 144 46 C138 62 124 76 108 74 C94 72 82 56 72 62 Z"
          fill="#2B2B2B"
        />
      </svg>
      {showText && (
        <span className={`font-['Plus_Jakarta_Sans',sans-serif] font-medium tracking-tight text-[#2B2B2B] lowercase ${textClassName}`}>
          relato
        </span>
      )}
    </div>
  );
}
