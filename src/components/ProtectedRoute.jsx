import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectAuthStatus, selectAuthToken } from "../features/auth/authSlice";

function ProtectedRoute() {
  const token = useSelector(selectAuthToken);
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  if (token && status === "loading") {
    return <p className="page-copy">Checking your session...</p>;
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
export default ProtectedRoute;
