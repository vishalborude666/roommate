import ScoreRing from "./ScoreRing";

export default function ListingCard({ listing, score, explanation, source, onExpress, expressed, footer }) {
  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold text-ink">{listing.title}</h3>
          <span className="rounded-full bg-moss-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-moss-600">
            {listing.roomType}
          </span>
        </div>
        <p className="mt-1 text-sm text-slatex-600">
          {listing.location} · ₹{listing.rent.toLocaleString("en-IN")}/mo · {listing.furnishing}
        </p>
        <p className="mt-1 text-xs text-slatex-400">
          Available from {new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        {listing.description && <p className="mt-2 text-sm text-slatex-600 line-clamp-2">{listing.description}</p>}
        {explanation && <p className="mt-2 text-xs italic text-moss-600">{explanation}</p>}
      </div>

      {score != null && (
        <div className="flex shrink-0 flex-col items-center gap-1">
          <ScoreRing score={score} source={source} />
          <span className="text-[11px] text-slatex-400">match</span>
        </div>
      )}

      <div className="flex shrink-0 flex-col gap-2">
        {onExpress &&
          (expressed ? (
            <span className="btn-secondary cursor-default text-moss-600">Interest sent</span>
          ) : (
            <button className="btn-primary" onClick={onExpress}>
              Express interest
            </button>
          ))}
        {footer}
      </div>
    </div>
  );
}
