import { Link } from "react-router-dom";

function getPlayerInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Player({ player, card = false }) {
  if (card) {
    return (
      <Link to={`/players/${player._id}`} className="player-focus-card">
        <p>{player.sport}</p>
        <h3>{player.fullName}</h3>
        <span>{player.currentTeam || "No team listed"}</span>

        <div>
          <span>{player.position || "—"}</span>
          <strong>{player.potentialRating}</strong>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/players/${player._id}`} className="player-list-row">
      <span className="player-list-name" data-label="Player name">
        {player.image ? (
          <img src={player.image} alt="" className="player-list-avatar" />
        ) : (
          <span className="player-list-avatar player-list-avatar-fallback">
            {getPlayerInitials(player.fullName)}
          </span>
        )}
        <span>
          <strong>{player.fullName}</strong>
          <small>{player.sport}</small>
        </span>
      </span>

      <span data-label="Team">{player.currentTeam || "—"}</span>
      <span data-label="Position">{player.position || "—"}</span>
      <span data-label="Age">{player.age ?? "—"}</span>
      <span data-label="Rating" className="player-list-rating">
        {player.potentialRating}
      </span>
    </Link>
  );
}

export default Player;
