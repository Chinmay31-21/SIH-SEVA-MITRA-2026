export function KrishiLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Krishi Mitra logo">
      <rect width="48" height="48" rx="12" fill="oklch(0.37 0.075 152)" />
      {/* leaf */}
      <path
        d="M24 10c7 3.5 11 9 11 15.5C35 32.5 29.5 37 24 37s-11-4.5-11-11.5C13 19 17 13.5 24 10Z"
        fill="oklch(0.82 0.15 90 / 0.18)"
      />
      <path
        d="M24 10c7 3.5 11 9 11 15.5C35 32.5 29.5 37 24 37s-11-4.5-11-11.5C13 19 17 13.5 24 10Z"
        stroke="oklch(0.82 0.15 90)"
        strokeWidth="2"
      />
      {/* stem / circuit line */}
      <path d="M24 37V20" stroke="oklch(0.82 0.15 90)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 26l5-4M24 30l-5-4" stroke="oklch(0.82 0.15 90)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="29" cy="22" r="1.6" fill="oklch(0.82 0.15 90)" />
      <circle cx="19" cy="26" r="1.6" fill="oklch(0.82 0.15 90)" />
    </svg>
  );
}
