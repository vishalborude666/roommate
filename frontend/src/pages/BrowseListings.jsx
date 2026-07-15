import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";

export default function BrowseListings() {
  const [results, setResults] = useState([]);
  const [profileComplete, setProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: "", minRent: "", maxRent: "", roomType: "" });
  const [expressed, setExpressed] = useState({});

  const load = async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await api.get("/listings/browse", { params });
    setResults(data.results);
    setProfileComplete(data.profileComplete);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const express = async (listingId) => {
    try {
      await api.post(`/interests/listing/${listingId}`);
      setExpressed((prev) => ({ ...prev, [listingId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || "Could not send interest");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Browse rooms</h1>
        <Link to="/profile" className="text-sm font-medium text-moss-600 hover:underline">
          Edit preferences
        </Link>
      </div>

      {!profileComplete && (
        <div className="mt-4 card border-clay-500/30 bg-clay-500/5 p-4 text-sm text-clay-600">
          Complete your <Link to="/profile" className="font-semibold underline">tenant profile</Link> to see AI compatibility scores.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="card mt-6 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4"
      >
        <input className="input" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input className="input" placeholder="Min rent" type="number" value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} />
        <input className="input" placeholder="Max rent" type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} />
        <select className="input" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
          <option value="">Any type</option>
          {["single", "shared", "1BHK", "2BHK", "PG"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="btn-primary col-span-2 sm:col-span-4">Apply filters</button>
      </form>

      <div className="mt-6 flex flex-col gap-4">
        {loading && <p className="text-slatex-400">Loading listings…</p>}
        {!loading && results.length === 0 && <p className="text-slatex-400">No listings match your filters yet.</p>}
        {results.map(({ listing, score, explanation, source }) => (
          <ListingCard
            key={listing._id}
            listing={listing}
            score={score}
            explanation={explanation}
            source={source}
            onExpress={() => express(listing._id)}
            expressed={expressed[listing._id]}
          />
        ))}
      </div>
    </div>
  );
}
