import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "tenant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "owner" ? "/owner" : "/browse");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-slatex-600">Join as a tenant looking for a room, or an owner listing one.</p>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        {error && <p className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">{error}</p>}

        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {["tenant", "owner"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                  form.role === r ? "border-moss-600 bg-moss-50 text-moss-700" : "border-slatex-100 text-slatex-600"
                }`}
              >
                {r === "tenant" ? "Tenant, finding a room" : "Owner, listing a room"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slatex-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-moss-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
