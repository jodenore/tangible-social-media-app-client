import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Search, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCurrentUser,
  logout,
  selectAuthToken,
  selectCurrentUser,
} from "../../features/auth/authSlice";
import PlayerSearchModal from "../PlayerSearchModal";

function RootLayout() {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const currentUser = useSelector(selectCurrentUser);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" className="brand-link">
            <span>Tangible</span>
          </NavLink>

          <div className="nav-links">
            <NavLink to="/" end>
              Feed
            </NavLink>
            <NavLink to="/players">Players</NavLink>
            <NavLink to="/groups">Groups</NavLink>
            {currentUser?.role === "admin" && (
              <NavLink to="/admin">Admin</NavLink>
            )}
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Search players"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={18} aria-hidden="true" />
            </button>

            {currentUser ? (
              <>
                <NavLink to="/profile/current" className="nav-profile-link">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt=""
                      className="nav-profile-avatar"
                    />
                  ) : (
                    <span
                      className="nav-profile-avatar nav-profile-avatar-fallback"
                      aria-hidden="true"
                    >
                      {currentUser.displayName?.slice(0, 1).toUpperCase() ||
                        "T"}
                    </span>
                  )}
                  <span>Welcome, {currentUser.displayName}!</span>
                </NavLink>

                <button
                  type="button"
                  className="nav-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-login">
                  Login
                </NavLink>
                <NavLink to="/register" className="nav-register">
                  Join Tangible
                </NavLink>
              </>
            )}

            {currentUser?.role === "admin" && (
              <NavLink
                to="/admin"
                className="icon-button"
                aria-label="Admin dashboard"
              >
                <Shield size={18} aria-hidden="true" />
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <PlayerSearchModal
        show={isSearchOpen}
        onHide={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

export default RootLayout;
