export default function ScoreRing({ score, size = 64, source }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 80 ? "#456138" : clamped >= 50 ? "#D18C4A" : "#B3713A";

  return (
    <div className="relative inline-flex flex-col items-center" title={source === "rule-based" ? "Estimated (fallback scoring)" : "AI-scored"}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E3E8EA" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-semibold text-ink" style={{ fontSize: size * 0.28 }}>
        {clamped}
      </span>
      {source === "rule-based" && (
        <span className="mt-1 text-[9px] uppercase tracking-wide text-slatex-400 font-semibold">est.</span>
      )}
    </div>
  );
}
