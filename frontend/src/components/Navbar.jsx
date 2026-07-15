import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashLink =
    user?.role === "owner" ? "/owner" : user?.role === "admin" ? "/admin" : "/browse";

  return (
    <header className="sticky top-0 z-40 border-b border-slatex-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss-600 font-display text-sm font-semibold text-white">
            R
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">RooMatch</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={dashLink} className="text-sm font-medium text-slatex-600 hover:text-ink">
                Dashboard
              </Link>
              {user.role !== "admin" && (
                <Link to="/chats" className="text-sm font-medium text-slatex-600 hover:text-ink">
                  Chats
                </Link>
              )}
              <span className="hidden text-sm text-slatex-400 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="btn-secondary"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slatex-600 hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
