import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  selectAuthStatus,
  selectAuthToken,
  selectCurrentUser,
} from "../features/auth/authSlice";

function GuestRoute() {
  const token = useSelector(selectAuthToken);
  const status = useSelector(selectAuthStatus);
  const currentUser = useSelector(selectCurrentUser);

  if (token && status === "loading") {
    return <p className="page-copy">Checking your session...</p>;
  }

  if (token && currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
