import { useEffect, useState } from "react";
import { Eye, Heart, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getPlayerById } from "../api/playersApi";
import {
  addFavouritePlayer,
  removeFavouritePlayer,
} from "../api/usersApi";
import {
  selectCurrentUser,
  setCurrentUser,
} from "../features/auth/authSlice";
import "./PlayerDetailsPage.css";

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
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
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
    if (!currentUser || !player) return;

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

  if (status === "loading") return <p className="page-copy">Loading player...</p>;
  if (status === "error") {
    return <p className="page-copy">Could not load player: {error}</p>;
  }
  if (!player) return null;

  const galleryImages = player.gallery?.slice(0, 4) || [];

  return (
    <section className="player-details-page">
      <div className="player-hero">
        {player.image && (
          <img src={player.image} alt="" className="player-hero-cover" />
        )}
        <div className="player-hero-shade" aria-hidden="true" />

        <div className="player-gallery-fragments" aria-hidden="true">
          {galleryImages.map((image) => (
            <img key={image._id || image.url} src={image.url} alt="" />
          ))}
        </div>

        <div className="player-hero-content">
          <p className="player-hero-kicker">{player.sport}</p>
          <h1>{player.fullName}</h1>
          <p className="player-hero-team">
            {player.currentTeam || "Independent"}
            {player.position && ` · ${player.position}`}
          </p>

          <div className="player-hero-actions">
            {currentUser ? (
              <button
                type="button"
                className={`player-hero-favourite ${isFavourited ? "is-favourited" : ""}`}
                onClick={handleFavouriteToggle}
                disabled={favouriteStatus === "loading"}
              >
                <Heart
                  size={17}
                  fill={isFavourited ? "currentColor" : "none"}
                  aria-hidden="true"
                />
                {favouriteStatus === "loading"
                  ? "Updating..."
                  : isFavourited
                    ? "Favourited"
                    : "Add to favourites"}
              </button>
            ) : (
              <Link to="/login" className="player-hero-favourite">
                <Heart size={17} aria-hidden="true" />
                Log in to favourite
              </Link>
            )}
          </div>

          {favouriteError && (
            <p className="player-favourite-error">{favouriteError}</p>
          )}
        </div>
      </div>

      <div className="player-details-layout">
        <section className="player-glass-panel player-biography">
          <p className="player-section-kicker">Profile</p>
          <h2>About {player.fullName.split(" ")[0]}</h2>
          <p>{player.bio || "No player biography has been added yet."}</p>
        </section>

        <section className="player-glass-panel player-profile-facts">
          <p className="player-section-kicker">Player details</p>
          <dl>
            <div><dt>Team</dt><dd>{player.currentTeam || "—"}</dd></div>
            <div><dt>Position</dt><dd>{player.position || "—"}</dd></div>
            <div><dt>Age</dt><dd>{player.age ?? "—"}</dd></div>
            <div><dt>Sport</dt><dd>{player.sport}</dd></div>
          </dl>
        </section>

        <section className="player-glass-panel player-metrics">
          <div><Sparkles size={18} aria-hidden="true" /><span>Potential</span><strong>{player.potentialRating}</strong></div>
          <div><Heart size={18} aria-hidden="true" /><span>Favourites</span><strong>{player.favouritesCount}</strong></div>
          <div><Eye size={18} aria-hidden="true" /><span>Views</span><strong>{player.views}</strong></div>
        </section>

        {galleryImages.length > 0 && (
          <section className="player-mobile-gallery" aria-label="Player gallery">
            <p className="player-section-kicker">Gallery</p>
            <div>
              {galleryImages.map((image) => (
                <img
                  key={image._id || image.url}
                  src={image.url}
                  alt={image.caption || `${player.fullName} ${image.type}`}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

export default PlayerDetailsPage;
