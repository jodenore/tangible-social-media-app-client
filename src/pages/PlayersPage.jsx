import { useEffect, useState } from "react";
import { getPlayers } from "../api/playersApi";
import Player from "../components/Player";

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
        <section className="players-results" aria-labelledby="player-results-title">
          <div className="players-results-heading">
            <h2 id="player-results-title">Results</h2>
            <p>{players.length} players</p>
          </div>

          {!players.length && (
            <p className="page-copy">No players found.</p>
          )}

          {players.length > 0 && (
            <>
              <div className="players-column-headings" aria-hidden="true">
                <span>Player name</span>
                <span>Team</span>
                <span>Position</span>
                <span>Age</span>
                <span>Rating</span>
              </div>

              <ul className="players-list">
                {players.map((player) => (
                  <li key={player._id}>
                    <Player player={player} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </section>
  );
}

export default PlayersPage;
