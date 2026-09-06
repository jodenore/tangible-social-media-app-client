import { useState } from "react";
import { useEffect } from "react";
import { getPlayerById } from "../api/playersApi";
import { useParams } from "react-router-dom";

function PlayerDetailsPage() {
  const { playerId } = useParams();

  const [player, setPlayer] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      try {
        setStatus("loading");
        const playerData = await getPlayerById(playerId);
        setPlayer(playerData);
        setStatus("success");
      } catch (e) {
        setError(e.message);
        setStatus("error");
      }
    }
    loadPlayer();
  }, [playerId]);

  return (
    <section className="page-panel">
      <p className="page-kicker">Player Profile</p>
      <h1>{player ? player.fullName : "Player Details"}</h1>
      {status === "loading" && <p className="page-copy">Loading player...</p>}

      {status === "error" && (
        <p className="page-copy">Could not load player: {error}</p>
      )}

      {status === "success" && player && (
        <div className="template-card player-proof-card">
          <p className="template-label">{player.sport}</p>
          <h2>{player.position}</h2>
          <p>{player.currentTeam}</p>
          <p>{player.bio}</p>
          <p>Potential: {player.potentialRating}</p>
          <p>Views: {player.views}</p>
          <p>Favourites: {player.favouritesCount}</p>
        </div>
      )}
    </section>
  );
}
export default PlayerDetailsPage;
