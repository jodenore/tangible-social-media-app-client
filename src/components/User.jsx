import { Link } from "react-router-dom";

function User({ user, isOwner = false }) {
  const displayName = user.displayName || user.username || "Tangible user";

  return (
    <Link to={`/profile/${user._id}`} className="group-user">
      {user.avatar ? (
        <img src={user.avatar} alt="" className="group-user-avatar" />
      ) : (
        <span className="group-user-avatar group-user-avatar-fallback" aria-hidden="true">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
      )}

      <span>
        <strong>
          {displayName}
          {isOwner && <em className="group-owner-pill">Owner</em>}
        </strong>
        <small>@{user.username || "tangible"}</small>
      </span>
    </Link>
  );
}

export default User;
