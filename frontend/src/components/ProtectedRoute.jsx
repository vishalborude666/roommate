import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slatex-400">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
