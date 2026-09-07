import { useEffect, useState } from "react";
import { getPlayerById } from "../api/playersApi";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  selectCurrentUser,
  setCurrentUser,
} from "../features/auth/authSlice";
import {
  addFavouritePlayer,
  removeFavouritePlayer,
} from "../api/usersApi";

function PlayerDetailsPage() {
  const { playerId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [player, setPlayer] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [favouriteStatus, setFavouriteStatus] = useState("idle");
  const [favouriteError, setFavouriteError] = useState("");

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

  const isFavourited = currentUser?.favouritePlayers?.some((favourite) => {
    const favouriteId =
      typeof favourite === "string" ? favourite : favourite._id;

    return String(favouriteId) === String(playerId);
  });

  async function handleFavouriteToggle() {
    if (!currentUser || !player) {
      return;
    }

    try {
      setFavouriteStatus("loading");
      setFavouriteError("");

      const updateFavourite = isFavourited
        ? removeFavouritePlayer
        : addFavouritePlayer;
      const updatedData = await updateFavourite(currentUser._id, player._id);

      dispatch(setCurrentUser(updatedData.user));
      setPlayer(updatedData.player);
      setFavouriteStatus("success");
    } catch (requestError) {
      setFavouriteError(
        requestError.response?.data?.message || requestError.message,
      );
      setFavouriteStatus("error");
    }
  }

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

          {currentUser ? (
            <button
              type="button"
              className="favourite-player-button"
              onClick={handleFavouriteToggle}
              disabled={favouriteStatus === "loading"}
            >
              {favouriteStatus === "loading"
                ? "Updating favourites..."
                : isFavourited
                  ? "Remove from favourites"
                  : "Add to favourites"}
            </button>
          ) : (
            <Link to="/login" className="favourite-player-login">
              Log in to add favourites
            </Link>
          )}

          {favouriteError && (
            <p className="favourite-player-error">{favouriteError}</p>
          )}
        </div>
      )}
    </section>
  );
}
export default PlayerDetailsPage;
