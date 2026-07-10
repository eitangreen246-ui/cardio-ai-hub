export default function PulseDivider({ className = "" }: { className?: string }) {
  const path =
    "M0,22 L40,22 L48,9 L58,32 L66,13 L72,22 L150,22 L190,22 L198,9 L208,32 L216,13 L222,22 L300,22 L340,22 L348,9 L358,32 L366,13 L372,22 L450,22 L490,22 L498,9 L508,32 L516,13 L522,22 L600,22";
  return (
    <svg viewBox="0 0 600 44" fill="none" aria-hidden="true" preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id="pulseGradHome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--blue)" />
          <stop offset="1" stopColor="var(--coral)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={path}
        fill="none"
        stroke="url(#pulseGradHome)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pulse-trace"
      />
    </svg>
  );
}
