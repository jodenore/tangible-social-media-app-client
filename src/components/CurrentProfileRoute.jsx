import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  selectAuthStatus,
  selectCurrentUser,
} from "../features/auth/authSlice";

function CurrentProfileRoute() {
  const status = useSelector(selectAuthStatus);
  const currentUser = useSelector(selectCurrentUser);

  if (status === "loading") {
    return <p className="page-copy">Loading your profile...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/profile/${currentUser._id}`} replace />;
}

export default CurrentProfileRoute;
