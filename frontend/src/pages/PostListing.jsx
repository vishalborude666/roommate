import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const initial = {
  title: "",
  location: "",
  rent: "",
  availableFrom: "",
  roomType: "single",
  furnishing: "semi-furnished",
  description: "",
  amenities: "",
};

export default function PostListing() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/listings", {
        ...form,
        rent: Number(form.rent),
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      });
      navigate("/owner");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Post a room</h1>
      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        {error && <p className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">{error}</p>}

        <div>
          <label className="label">Title</label>
          <input required className="input" placeholder="Sunny 1BHK near IT park" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Location</label>
          <input required className="input" placeholder="Kothrud, Pune" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Rent (₹/month)</label>
            <input required type="number" min="0" className="input" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
          </div>
          <div>
            <label className="label">Available from</label>
            <input required type="date" className="input" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Room type</label>
            <select className="input" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
              {["single", "shared", "1BHK", "2BHK", "PG"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Furnishing</label>
            <select className="input" value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
              {["unfurnished", "semi-furnished", "fully-furnished"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Amenities (comma separated)</label>
          <input className="input" placeholder="WiFi, Washing machine, Parking" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
        </div>
        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Posting…" : "Post listing"}
        </button>
      </form>
    </div>
  );
}
