import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectAuthStatus,
  selectAuthToken,
  selectCurrentUser,
} from "../features/auth/authSlice";

function AdminRoute() {
  const token = useSelector(selectAuthToken);
  const status = useSelector(selectAuthStatus);
  const currentUser = useSelector(selectCurrentUser);

  if (token && status === "loading") {
    return <p className="page-copy">Checking permissions...</p>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
export default AdminRoute;
