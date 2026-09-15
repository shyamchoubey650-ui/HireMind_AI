export default function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
      <path d="M11 9v14M21 9v14M11 16h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
