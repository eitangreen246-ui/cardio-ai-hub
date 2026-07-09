const TRACE =
  "M0 24 H44 L52 17 L60 24 H92 L100 31 L110 4 L118 41 L126 24 H164 L174 14 L184 24 H228 L236 17 L244 24 H276 L284 31 L294 4 L302 41 L310 24 H348 L358 14 L368 24 H400";

export default function EcgLine({
  className = "",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg viewBox="0 0 400 48" fill="none" aria-hidden="true" preserveAspectRatio="none" className={className}>
      <path d={TRACE} stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {animated && (
        <path d={TRACE} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ecg-trace" />
      )}
    </svg>
  );
}
