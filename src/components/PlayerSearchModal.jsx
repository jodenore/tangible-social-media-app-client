import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";

import { getPlayers } from "../api/playersApi";

const defaultFilters = {
  search: "",
  sport: "",
  position: "",
  sortBy: "potential",
};

function getUniqueOptions(players, key) {
  return [
    ...new Set(players.map((player) => player[key]).filter(Boolean)),
  ].sort((first, second) => first.localeCompare(second));
}

function PlayerSearchModal({ show, onHide }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadPlayers(params = {}) {
    try {
      setStatus("loading");
      setError("");

      const playersData = await getPlayers(params);
      setPlayers(playersData);
      setStatus("success");

      return playersData;
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setStatus("error");
      return [];
    }
  }

  useEffect(() => {
    if (!show) {
      return;
    }

    async function loadInitialPlayers() {
      const playersData = await loadPlayers(defaultFilters);
      setAllPlayers(playersData);
    }

    loadInitialPlayers();
  }, [show]);

  function handleFilterChange(event) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    );

    await loadPlayers(activeFilters);
  }

  async function handleReset() {
    setFilters(defaultFilters);
    await loadPlayers(defaultFilters);
  }

  const sportOptions = getUniqueOptions(allPlayers, "sport");
  const positionOptions = getUniqueOptions(allPlayers, "position");

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="player-search-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Find players</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form className="player-search-form" onSubmit={handleSubmit}>
          <label htmlFor="player-search-query">Search players</label>
          <input
            id="player-search-query"
            type="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Name, team, or position"
          />

          <div className="player-search-filter-grid">
            <label>
              Sport
              <select
                name="sport"
                value={filters.sport}
                onChange={handleFilterChange}
              >
                <option value="">All sports</option>
                {sportOptions.map((sport) => {
                  return (
                    <option value={sport} key={sport}>
                      {sport}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Position
              <select
                name="position"
                value={filters.position}
                onChange={handleFilterChange}
              >
                <option value="">All positions</option>
                {positionOptions.map((position) => (
                  <option value={position} key={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sort by
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="potential">Potential</option>
                <option value="views">Most viewed</option>
                <option value="age">Youngest</option>
              </select>
            </label>
          </div>

          <div className="player-search-actions">
            <button type="button" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <section
          className="player-search-results"
          aria-labelledby="search-results-title"
        >
          <div>
            <h2 id="search-results-title">Results</h2>
            {status === "success" && <span>{players.length}</span>}
          </div>

          {status === "loading" && <p>Loading players...</p>}
          {status === "error" && <p className="player-search-error">{error}</p>}
          {status === "success" && !players.length && <p>No players found.</p>}

          {status === "success" && players.length > 0 && (
            <ul>
              {players.map((player) => (
                <li key={player._id}>
                  <Link
                    to={`/players/${player._id}`}
                    onClick={onHide}
                    className="player-search-result"
                  >
                    <span>
                      <strong>{player.fullName}</strong>
                      <small>{player.currentTeam || "No team listed"}</small>
                    </span>
                    <span>{player.position || "—"}</span>
                    <b>{player.potentialRating}</b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Modal.Body>
    </Modal>
  );
}

export default PlayerSearchModal;
