import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const initial = {
  preferredLocations: "",
  budgetMin: "",
  budgetMax: "",
  moveInDate: "",
  roomTypePreference: "any",
  bio: "",
  lifestyle: { foodPreference: "any", smoking: false, pets: false, workSchedule: "flexible" },
};

export default function TenantProfile() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/tenant/profile").then(({ data }) => {
      if (data.profile) {
        setForm({
          ...data.profile,
          preferredLocations: (data.profile.preferredLocations || []).join(", "),
          moveInDate: data.profile.moveInDate ? data.profile.moveInDate.slice(0, 10) : "",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await api.put("/tenant/profile", {
        ...form,
        preferredLocations: form.preferredLocations.split(",").map((l) => l.trim()).filter(Boolean),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      });
      setSaved(true);
      setTimeout(() => navigate("/browse"), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    }
  };

  if (loading) return <div className="p-10 text-center text-slatex-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Your room preferences</h1>
      <p className="mt-1 text-sm text-slatex-600">This powers your AI compatibility scores across every listing.</p>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        {error && <p className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">{error}</p>}
        {saved && <p className="rounded-lg bg-moss-50 px-3 py-2 text-sm text-moss-600">Saved! Redirecting to listings…</p>}

        <div>
          <label className="label">Preferred locations (comma separated)</label>
          <input required className="input" placeholder="Kothrud, Baner, Hinjewadi" value={form.preferredLocations} onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget min (₹)</label>
            <input required type="number" min="0" className="input" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} />
          </div>
          <div>
            <label className="label">Budget max (₹)</label>
            <input required type="number" min="0" className="input" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Move-in date</label>
            <input required type="date" className="input" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Room type preference</label>
            <select className="input" value={form.roomTypePreference} onChange={(e) => setForm({ ...form, roomTypePreference: e.target.value })}>
              {["any", "single", "shared", "1BHK", "2BHK", "PG"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-slatex-100 p-4">
          <p className="label mb-3">Lifestyle</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Food</label>
              <select
                className="input"
                value={form.lifestyle.foodPreference}
                onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, foodPreference: e.target.value } })}
              >
                {["any", "veg", "non-veg"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Work schedule</label>
              <select
                className="input"
                value={form.lifestyle.workSchedule}
                onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, workSchedule: e.target.value } })}
              >
                {["day", "night", "flexible"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slatex-600">
              <input type="checkbox" checked={form.lifestyle.smoking} onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, smoking: e.target.checked } })} />
              Smoking OK
            </label>
            <label className="flex items-center gap-2 text-sm text-slatex-600">
              <input type="checkbox" checked={form.lifestyle.pets} onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, pets: e.target.checked } })} />
              Pets OK
            </label>
          </div>
        </div>

        <div>
          <label className="label">Short bio (optional)</label>
          <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <button className="btn-primary mt-2">Save preferences</button>
      </form>
    </div>
  );
}
