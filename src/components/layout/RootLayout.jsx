import { NavLink, Outlet } from "react-router-dom";
import { Search, Shield, UserRound } from "lucide-react";

function RootLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" className="brand-link">
            <span className="brand-mark">T</span>
            <span>Tangible</span>
          </NavLink>

          <div className="nav-links">
            <NavLink to="/" end>
              Feed
            </NavLink>
            <NavLink to="/players">Players</NavLink>
            <NavLink to="/groups">Groups</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </div>

          <div className="nav-actions">
            <button type="button" className="icon-button" aria-label="Search">
              <Search size={18} aria-hidden="true" />
            </button>
            <NavLink to="/login" className="nav-login">
              Login
            </NavLink>
            <NavLink to="/profile/current" className="icon-button" aria-label="Profile">
              <UserRound size={18} aria-hidden="true" />
            </NavLink>
            <NavLink to="/admin" className="icon-button" aria-label="Admin dashboard">
              <Shield size={18} aria-hidden="true" />
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
