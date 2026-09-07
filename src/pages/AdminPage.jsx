import { useEffect, useMemo, useState } from "react";

import {
  createPlayer,
  deletePlayer,
  getPlayers,
  updatePlayer as updatePlayerRecord,
} from "../api/playersApi";
import {
  uploadPlayerGalleryImages,
  uploadPlayerIcon,
  uploadPlayerImage,
} from "../api/uploadsApi";
import ImageUploadField from "../components/ImageUploadField";
import AdminTabs from "../components/AdminTabs";
import "./AdminPage.css";

function getPlayerInitial(name) {
  return name?.slice(0, 1).toUpperCase() || "P";
}

const initialPlayerForm = {
  fullName: "",
  slug: "",
  sport: "",
  position: "",
  currentTeam: "",
  age: "",
  potentialRating: "75",
};

function AdminPage() {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("players");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState("");
  const [playerForm, setPlayerForm] = useState(initialPlayerForm);
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [iconImageFile, setIconImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryDetails, setGalleryDetails] = useState({
    type: "action",
    caption: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [primaryPickerKey, setPrimaryPickerKey] = useState(0);
  const [iconPickerKey, setIconPickerKey] = useState(0);
  const [galleryPickerKey, setGalleryPickerKey] = useState(0);

  useEffect(() => {
    async function loadPlayers() {
      try {
        setStatus("loading");
        const playersData = await getPlayers({ sortBy: "potential" });
        setPlayers(playersData);
        setSelectedPlayerId(playersData[0]?._id || "");
        setStatus("idle");
      } catch (requestError) {
        setMessage(
          requestError.response?.data?.message || requestError.message,
        );
        setStatus("error");
      }
    }

    loadPlayers();
  }, []);

  const selectedPlayer = useMemo(
    () => players.find((player) => player._id === selectedPlayerId),
    [players, selectedPlayerId],
  );

  function updatePlayer(updatedPlayer) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player._id === updatedPlayer._id ? updatedPlayer : player,
      ),
    );
  }

  function handlePlayerChange(event) {
    setSelectedPlayerId(event.target.value);
    setPrimaryImageFile(null);
    setIconImageFile(null);
    setGalleryFiles([]);
    setGalleryDetails({ type: "action", caption: "" });
    setPrimaryPickerKey((currentKey) => currentKey + 1);
    setIconPickerKey((currentKey) => currentKey + 1);
    setGalleryPickerKey((currentKey) => currentKey + 1);
    setMessage("");
  }

  function handlePlayerFormChange(event) {
    const { name, value } = event.target;

    setPlayerForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleEditPlayer(player) {
    setEditingPlayerId(player._id);
    setPlayerForm({
      fullName: player.fullName || "",
      slug: player.slug || "",
      sport: player.sport || "",
      position: player.position || "",
      currentTeam: player.currentTeam || "",
      age: player.age?.toString() || "",
      potentialRating: player.potentialRating?.toString() || "75",
    });
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingPlayerId("");
    setPlayerForm(initialPlayerForm);
    setMessage("");
  }

  async function handlePlayerFormSubmit(event) {
    event.preventDefault();

    try {
      const isEditing = Boolean(editingPlayerId);
      setStatus(isEditing ? "updating-player" : "creating-player");
      setMessage("");

      const playerData = {
        ...playerForm,
        age: playerForm.age ? Number(playerForm.age) : undefined,
        potentialRating: Number(playerForm.potentialRating),
      };
      const player = isEditing
        ? await updatePlayerRecord(editingPlayerId, playerData)
        : await createPlayer(playerData);

      if (isEditing) {
        updatePlayer(player);
      } else {
        setPlayers((currentPlayers) => [player, ...currentPlayers]);
      }
      setSelectedPlayerId(player._id);
      setEditingPlayerId("");
      setPlayerForm(initialPlayerForm);
      setMessage(
        isEditing
          ? `${player.fullName} was updated.`
          : `${player.fullName} was created.`,
      );
      setStatus("success");
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message || requestError.message,
      );
      setStatus("error");
    }
  }

  async function handleDeletePlayer(player) {
    const shouldDelete = window.confirm(
      `Delete ${player.fullName}? This cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setStatus(`deleting-${player._id}`);
      setMessage("");
      await deletePlayer(player._id);

      setPlayers((currentPlayers) =>
        currentPlayers.filter((currentPlayer) => currentPlayer._id !== player._id),
      );
      setSelectedPlayerId((currentPlayerId) =>
        currentPlayerId === player._id ? "" : currentPlayerId,
      );
      if (editingPlayerId === player._id) {
        handleCancelEdit();
      }
      setMessage(`${player.fullName} was deleted.`);
      setStatus("success");
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message || requestError.message,
      );
      setStatus("error");
    }
  }

  async function handlePrimaryImageSubmit(event) {
    event.preventDefault();

    if (!selectedPlayer || !primaryImageFile) {
      return;
    }

    try {
      setStatus("uploading-primary");
      setMessage("");

      const data = await uploadPlayerImage(
        selectedPlayer.slug,
        primaryImageFile,
      );

      updatePlayer(data.player);
      setPrimaryImageFile(null);
      setPrimaryPickerKey((currentKey) => currentKey + 1);
      setMessage("Primary player image updated.");
      setStatus("success");
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message || requestError.message,
      );
      setStatus("error");
    }
  }

  async function handleGallerySubmit(event) {
    event.preventDefault();

    if (!selectedPlayer || !galleryFiles.length) {
      return;
    }

    try {
      setStatus("uploading-gallery");
      setMessage("");

      const data = await uploadPlayerGalleryImages(
        selectedPlayer.slug,
        galleryFiles,
        galleryDetails,
      );

      updatePlayer(data.player);
      setGalleryFiles([]);
      setGalleryDetails({ type: "action", caption: "" });
      setGalleryPickerKey((currentKey) => currentKey + 1);
      setMessage(`${data.images.length} gallery image(s) added.`);
      setStatus("success");
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message || requestError.message,
      );
      setStatus("error");
    }
  }

  async function handleIconImageSubmit(event) {
    event.preventDefault();

    if (!selectedPlayer || !iconImageFile) {
      return;
    }

    try {
      setStatus("uploading-icon");
      setMessage("");

      const data = await uploadPlayerIcon(selectedPlayer.slug, iconImageFile);

      updatePlayer(data.player);
      setIconImageFile(null);
      setIconPickerKey((currentKey) => currentKey + 1);
      setMessage("Player icon updated.");
      setStatus("success");
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message || requestError.message,
      );
      setStatus("error");
    }
  }

  return (
    <section className="page-panel">
      <p className="page-kicker">Admin</p>
      <h1>Admin Dashboard</h1>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "players" && (
        <section
          aria-labelledby="admin-players-tab"
          className="admin-players-panel"
          id="admin-players-panel"
          role="tabpanel"
        >
          <section className="admin-create-player">
            <h2>{editingPlayerId ? "Edit player" : "Create player"}</h2>
            <form className="admin-player-form" onSubmit={handlePlayerFormSubmit}>
              <label htmlFor="admin-player-name">
                Full name
                <input
                  id="admin-player-name"
                  name="fullName"
                  onChange={handlePlayerFormChange}
                  required
                  value={playerForm.fullName}
                />
              </label>
              <label htmlFor="admin-player-slug">
                Slug
                <input
                  id="admin-player-slug"
                  name="slug"
                  onChange={handlePlayerFormChange}
                  pattern="[a-z0-9-]+"
                  required
                  value={playerForm.slug}
                />
              </label>
              <label htmlFor="admin-player-sport">
                Sport
                <input
                  id="admin-player-sport"
                  name="sport"
                  onChange={handlePlayerFormChange}
                  required
                  value={playerForm.sport}
                />
              </label>
              <label htmlFor="admin-player-position">
                Position
                <input
                  id="admin-player-position"
                  name="position"
                  onChange={handlePlayerFormChange}
                  value={playerForm.position}
                />
              </label>
              <label htmlFor="admin-player-team">
                Current team
                <input
                  id="admin-player-team"
                  name="currentTeam"
                  onChange={handlePlayerFormChange}
                  value={playerForm.currentTeam}
                />
              </label>
              <label htmlFor="admin-player-age">
                Age
                <input
                  id="admin-player-age"
                  max="25"
                  min="10"
                  name="age"
                  onChange={handlePlayerFormChange}
                  type="number"
                  value={playerForm.age}
                />
              </label>
              <label htmlFor="admin-player-potential">
                Potential rating
                <input
                  id="admin-player-potential"
                  max="100"
                  min="1"
                  name="potentialRating"
                  onChange={handlePlayerFormChange}
                  required
                  type="number"
                  value={playerForm.potentialRating}
                />
              </label>
              <div className="admin-player-form-actions">
                <button
                  disabled={
                    status === "creating-player" || status === "updating-player"
                  }
                  type="submit"
                >
                  {status === "creating-player"
                    ? "Creating..."
                    : status === "updating-player"
                      ? "Saving..."
                      : editingPlayerId
                        ? "Save changes"
                        : "Create player"}
                </button>
                {editingPlayerId && (
                  <button
                    className="admin-cancel-edit"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-delete-players">
            <div className="admin-section-heading">
              <h2>Manage players</h2>
              <span>{players.length} total</span>
            </div>
            <ul className="admin-player-list">
              {players.map((player) => (
                <li key={player._id}>
                  <div>
                    <strong>{player.fullName}</strong>
                    <span>{player.sport}</span>
                  </div>
                  <div className="admin-player-row-actions">
                    <button
                      className="admin-edit-player"
                      onClick={() => handleEditPlayer(player)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      disabled={status === `deleting-${player._id}`}
                      onClick={() => handleDeletePlayer(player)}
                      type="button"
                    >
                      {status === `deleting-${player._id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </section>
      )}

      {activeTab === "media" && (
        <div
          aria-labelledby="admin-media-tab"
          className="admin-layout"
          id="admin-media-panel"
          role="tabpanel"
        >
        <aside className="admin-player-picker">
          <h2>Player media</h2>

          <label htmlFor="admin-player-select">
            Choose player
            <select
              id="admin-player-select"
              value={selectedPlayerId}
              onChange={handlePlayerChange}
              disabled={status === "loading"}
            >
              {players.map((player) => (
                <option value={player._id} key={player._id}>
                  {player.fullName}
                </option>
              ))}
            </select>
          </label>

          {selectedPlayer && (
            <div className="admin-player-summary">
              {selectedPlayer.iconImage || selectedPlayer.image ? (
                <img
                  src={selectedPlayer.iconImage || selectedPlayer.image}
                  alt=""
                />
              ) : (
                <div className="admin-player-image-fallback" aria-hidden="true">
                  {getPlayerInitial(selectedPlayer.fullName)}
                </div>
              )}

              <div>
                <strong>{selectedPlayer.fullName}</strong>
                <span>{selectedPlayer.slug}</span>
              </div>
            </div>
          )}
        </aside>

        <section className="admin-media-manager" aria-label="Player media uploads">
          <h2>{selectedPlayer?.fullName || "Choose a player"}</h2>

          <section className="admin-media-section">
            <h3>Primary image</h3>
            <p>Used in player cards, search, posts, and the profile header.</p>

            <form className="admin-media-form" onSubmit={handlePrimaryImageSubmit}>
              <ImageUploadField
                key={primaryPickerKey}
                label="Choose profile image"
                onFileSelected={setPrimaryImageFile}
              />
              <button
                type="submit"
                disabled={!primaryImageFile || status === "uploading-primary"}
              >
                {status === "uploading-primary" ? "Uploading..." : "Set primary image"}
              </button>
            </form>
          </section>

          <section className="admin-media-section">
            <h3>Gallery images</h3>
            <p>Add up to four action, training, game, or portrait images.</p>

            <form className="admin-media-form" onSubmit={handleGallerySubmit}>
              <label htmlFor="admin-gallery-images">
                Choose gallery images
                <input
                  key={galleryPickerKey}
                  id="admin-gallery-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(event) =>
                    setGalleryFiles(
                      Array.from(event.target.files || []).slice(0, 4),
                    )
                  }
                />
              </label>

              {galleryFiles.length > 0 && (
                <p className="page-copy">{galleryFiles.length} image(s) selected.</p>
              )}

              <div className="admin-gallery-details">
                <label htmlFor="admin-gallery-type">
                  Image type
                  <select
                    id="admin-gallery-type"
                    value={galleryDetails.type}
                    onChange={(event) =>
                      setGalleryDetails((currentDetails) => ({
                        ...currentDetails,
                        type: event.target.value,
                      }))
                    }
                  >
                    <option value="action">Action</option>
                    <option value="training">Training</option>
                    <option value="game">Game</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </label>

                <label htmlFor="admin-gallery-caption">
                  Caption
                  <input
                    id="admin-gallery-caption"
                    type="text"
                    value={galleryDetails.caption}
                    onChange={(event) =>
                      setGalleryDetails((currentDetails) => ({
                        ...currentDetails,
                        caption: event.target.value,
                      }))
                    }
                    placeholder="Optional shared caption"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!galleryFiles.length || status === "uploading-gallery"}
              >
                {status === "uploading-gallery" ? "Uploading..." : "Add gallery images"}
              </button>
            </form>
          </section>

          <section className="admin-media-section">
            <h3>Player icon</h3>
            <p>
              Upload a 250 x 250 square headshot for compact player icons.
            </p>

            <form className="admin-media-form" onSubmit={handleIconImageSubmit}>
              <ImageUploadField
                key={iconPickerKey}
                label="Choose 250 x 250 icon"
                onFileSelected={setIconImageFile}
              />
              <button
                type="submit"
                disabled={!iconImageFile || status === "uploading-icon"}
              >
                {status === "uploading-icon" ? "Uploading..." : "Set player icon"}
              </button>
            </form>
          </section>

          {message && (
            <p
              className={`admin-upload-message ${status === "error" ? "is-error" : "is-success"}`}
              role={status === "error" ? "alert" : undefined}
            >
              {message}
            </p>
          )}
        </section>
        </div>
      )}

      {message && activeTab === "players" && (
        <p
          className={`admin-upload-message ${status === "error" ? "is-error" : "is-success"}`}
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </section>
  );
}
export default AdminPage;
