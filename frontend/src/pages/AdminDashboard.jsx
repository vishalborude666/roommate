import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState("users");

  const load = async () => {
    const [s, u, l] = await Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/listings")]);
    setStats(s.data);
    setUsers(u.data.users);
    setListings(l.data.listings);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id, isActive) => {
    await api.patch(`/admin/users/${id}/status`, { isActive: !isActive });
    load();
  };

  const removeListing = async (id) => {
    if (!confirm("Remove this listing?")) return;
    await api.delete(`/admin/listings/${id}`);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin overview</h1>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Users", stats.totalUsers],
            ["Tenants", stats.totalTenants],
            ["Owners", stats.totalOwners],
            ["Active listings", stats.activeListings],
            ["Total listings", stats.totalListings],
            ["Interests sent", stats.totalInterests],
            ["Accepted matches", stats.acceptedInterests],
            ["Messages sent", stats.totalMessages],
          ].map(([label, value]) => (
            <div key={label} className="card p-4">
              <p className="text-2xl font-display font-semibold text-ink">{value}</p>
              <p className="text-xs uppercase tracking-wide text-slatex-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-2">
        <button onClick={() => setTab("users")} className={tab === "users" ? "btn-primary" : "btn-secondary"}>
          Users
        </button>
        <button onClick={() => setTab("listings")} className={tab === "listings" ? "btn-primary" : "btn-secondary"}>
          Listings
        </button>
      </div>

      {tab === "users" && (
        <div className="mt-4 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slatex-50 text-left text-xs uppercase tracking-wide text-slatex-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slatex-100">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3 text-slatex-600">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.isActive ? "Active" : "Deactivated"}</td>
                  <td className="p-3">
                    {u.role !== "admin" && (
                      <button className="text-xs font-medium text-moss-600 hover:underline" onClick={() => toggleActive(u._id, u.isActive)}>
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "listings" && (
        <div className="mt-4 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slatex-50 text-left text-xs uppercase tracking-wide text-slatex-600">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Rent</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} className="border-t border-slatex-100">
                  <td className="p-3">{l.title}</td>
                  <td className="p-3 text-slatex-600">{l.owner?.name}</td>
                  <td className="p-3">₹{l.rent.toLocaleString("en-IN")}</td>
                  <td className="p-3">{l.status}</td>
                  <td className="p-3">
                    <button className="text-xs font-medium text-clay-600 hover:underline" onClick={() => removeListing(l._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
