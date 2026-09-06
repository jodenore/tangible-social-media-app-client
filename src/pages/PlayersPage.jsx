import { useEffect, useState } from "react";
import { getPlayers } from "../api/playersApi";
import { Link } from "react-router-dom";

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      try {
        setStatus("loading");

        const playersData = await getPlayers();

        setPlayers(playersData);
        setStatus("success");
      } catch (error) {
        setError(error.message);
        setStatus("error");
      }
    }

    loadPlayers();
  }, []);

  return (
    <section className="page-panel">
      <p className="page-kicker">Player Discovery</p>
      <h1>Players</h1>
      <p className="page-copy">
        This page fetches real player profiles from your Tangible API.
      </p>

      {status === "loading" && <p className="page-copy">Loading players...</p>}

      {status === "error" && (
        <p className="page-copy">Could not load players: {error}</p>
      )}

      {status === "success" && (
        <div className="template-grid three-column">
          {players.map((player) => (
            <Link
              to={`/players/${player._id}`}
              className="template-card player-card-link"
              key={player._id}
            >
              <p className="template-label">{player.sport}</p>
              <h2>{player.fullName}</h2>
              <p>{player.position}</p>
              <p>{player.currentTeam}</p>
              <p>Potential: {player.potentialRating}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default PlayersPage;
