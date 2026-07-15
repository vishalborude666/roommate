import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ScoreRing from "../components/ScoreRing";

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [l, i] = await Promise.all([api.get("/listings/mine"), api.get("/interests/owner")]);
    setListings(l.data.listings);
    setInterests(i.data.interests);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id, decision) => {
    await api.patch(`/interests/${id}/respond`, { decision });
    load();
  };

  const markFilled = async (id) => {
    await api.patch(`/listings/${id}/fill`);
    load();
  };

  if (loading) return <div className="p-10 text-center text-slatex-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Your listings</h1>
        <Link to="/owner/new" className="btn-primary">
          + Post a room
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {listings.length === 0 && <p className="text-slatex-400">You haven't posted any listings yet.</p>}
        {listings.map((l) => (
          <div key={l._id} className="card flex items-center justify-between p-5">
            <div>
              <h3 className="font-display text-lg font-semibold">{l.title}</h3>
              <p className="text-sm text-slatex-600">
                {l.location} · ₹{l.rent.toLocaleString("en-IN")}/mo ·{" "}
                <span className={l.status === "filled" ? "text-clay-600" : "text-moss-600"}>{l.status}</span>
              </p>
            </div>
            {l.status === "active" && (
              <button className="btn-secondary" onClick={() => markFilled(l._id)}>
                Mark as filled
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-ink">Interest requests</h2>
      <div className="mt-4 grid gap-4">
        {interests.length === 0 && <p className="text-slatex-400">No interest requests yet.</p>}
        {interests.map((i) => (
          <div key={i._id} className="card flex items-center justify-between gap-4 p-5">
            <ScoreRing score={i.compatibilityScore} size={56} />
            <div className="flex-1">
              <p className="font-medium text-ink">
                {i.tenant.name} <span className="text-slatex-400">is interested in</span> {i.listing?.title}
              </p>
              <p className="text-xs text-slatex-400">{i.tenant.email}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                  i.status === "accepted"
                    ? "bg-moss-50 text-moss-600"
                    : i.status === "declined"
                    ? "bg-clay-500/10 text-clay-600"
                    : "bg-slatex-50 text-slatex-600"
                }`}
              >
                {i.status}
              </span>
            </div>
            {i.status === "pending" && (
              <div className="flex gap-2">
                <button className="btn-primary" onClick={() => respond(i._id, "accepted")}>
                  Accept
                </button>
                <button className="btn-secondary" onClick={() => respond(i._id, "declined")}>
                  Decline
                </button>
              </div>
            )}
            {i.status === "accepted" && (
              <Link to="/chats" className="btn-secondary">
                Open chat
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
