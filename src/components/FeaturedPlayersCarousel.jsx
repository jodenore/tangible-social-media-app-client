import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

function getPlayerInitial(name) {
  return name?.slice(0, 1).toUpperCase() || "P";
}

function FeaturedPlayersCarousel({ players }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!players.length) {
    return null;
  }

  const activePlayer = players[activeIndex];

  function showPreviousPlayer() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? players.length - 1 : currentIndex - 1,
    );
  }

  function showNextPlayer() {
    setActiveIndex((currentIndex) =>
      currentIndex === players.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <aside
      className="featured-players"
      aria-labelledby="featured-players-title"
    >
      <div className="featured-players-heading">
        <div>
          <p className="page-kicker">Community Spotlight</p>
          <h2 id="featured-players-title">Most Favourited</h2>
        </div>

        <div className="featured-player-controls">
          <button
            type="button"
            onClick={showPreviousPlayer}
            aria-label="Show previous featured player"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNextPlayer}
            aria-label="Show next featured player"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Link
        to={`/players/${activePlayer._id}`}
        className="featured-player-card"
      >
        <div className="featured-player-image">
          {activePlayer.image ? (
            <img src={activePlayer.image} alt="" />
          ) : (
            <span>{getPlayerInitial(activePlayer.fullName)}</span>
          )}
        </div>

        <div className="featured-player-copy">
          <p>{activePlayer.sport}</p>
          <h3>{activePlayer.fullName}</h3>
          <span>{activePlayer.currentTeam || "Team not listed"}</span>

          <div>
            <span>{activePlayer.position || "Player"}</span>
            <strong>
              <Heart size={14} fill="currentColor" aria-hidden="true" />
              {activePlayer.favouritesCount}
            </strong>
          </div>
        </div>
      </Link>

      <p className="featured-player-count">
        {activeIndex + 1} of {players.length}
      </p>
    </aside>
  );
}

export default FeaturedPlayersCarousel;
