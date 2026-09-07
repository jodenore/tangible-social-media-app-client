import { useState } from "react";
import { ImagePlus, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { createPost } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import { uploadImage } from "../api/uploadsApi";

import ImageUploadField from "./ImageUploadField";

function PostComposer({ onPostCreated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  if (!currentUser) {
    return (
      <section className="composer-guest">
        <p>Want to add your perspective?</p>
        <Link to="/login">Log in to post</Link>
      </section>
    );
  }

  const favouritePlayers = currentUser.favouritePlayers || [];

  function handleImageFieldToggle() {
    if (showImageField) {
      setImageFile(null);
    }

    setShowImageField((isVisible) => !isVisible);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setError("");

      const postDetails = { content: trimmedContent };

      if (selectedPlayerId) {
        postDetails.player = selectedPlayerId;
      }

      if (imageFile) {
        setStatus("uploading");

        const uploadedImage = await uploadImage(imageFile, "posts");

        postDetails.image = uploadedImage.url;
      }

      setStatus("posting");

      const newPost = await createPost(postDetails);

      onPostCreated(newPost);
      setContent("");
      setImageFile(null);
      setSelectedPlayerId("");
      setShowImageField(false);
      setShowPlayerPicker(false);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setStatus("error");
    }
  }

  return (
    <section className="post-composer" aria-labelledby="post-composer-title">
      <form onSubmit={handleSubmit} className="post-composer-form">
        {currentUser.avatar ? (
          <img src={currentUser.avatar} alt="" className="composer-avatar" />
        ) : (
          <div className="composer-avatar" aria-hidden="true">
            {currentUser.displayName?.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="composer-surface">
          <label htmlFor="post-content" className="visually-hidden">
            Your take
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's your take?"
            maxLength="1000"
            required
          />

          {showImageField && (
            <ImageUploadField onFileSelected={setImageFile} />
          )}

          {showPlayerPicker && favouritePlayers.length > 0 && (
            <div className="composer-player-picker">
              <p>Link a favourite player</p>
              <div role="listbox" aria-label="Favourite players">
                <button
                  type="button"
                  className={!selectedPlayerId ? "is-selected" : ""}
                  aria-selected={!selectedPlayerId}
                  onClick={() => setSelectedPlayerId("")}
                >
                  <span className="composer-player-icon composer-player-icon-fallback">
                    —
                  </span>
                  <span>No player selected</span>
                </button>

                {favouritePlayers.map((player) => (
                  <button
                    type="button"
                    key={player._id}
                    className={selectedPlayerId === player._id ? "is-selected" : ""}
                    aria-selected={selectedPlayerId === player._id}
                    onClick={() => setSelectedPlayerId(player._id)}
                  >
                    {player.iconImage || player.image ? (
                      <img
                        src={player.iconImage || player.image}
                        alt=""
                        className="composer-player-icon"
                      />
                    ) : (
                      <span className="composer-player-icon composer-player-icon-fallback">
                        {player.fullName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>
                      <strong>{player.fullName}</strong>
                      <small>{player.currentTeam || player.sport}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="post-composer-actions">
            <div className="composer-tool-actions">
              <button
                type="button"
                className={showImageField ? "is-active" : ""}
                onClick={handleImageFieldToggle}
              >
                <ImagePlus size={18} aria-hidden="true" />
                Image
              </button>

              {favouritePlayers.length > 0 && (
                <button
                  type="button"
                  className={showPlayerPicker ? "is-active" : ""}
                  onClick={() => setShowPlayerPicker((isVisible) => !isVisible)}
                >
                  <UserRound size={18} aria-hidden="true" />
                  Player
                </button>
              )}
            </div>

            <div className="composer-submit-actions">
              <p>{content.length}/1000</p>
              <button
                type="submit"
                disabled={status === "uploading" || status === "posting"}
              >
                {status === "uploading"
                  ? "Uploading..."
                  : status === "posting"
                    ? "Posting..."
                    : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {status === "success" && <p className="composer-success">Post shared.</p>}
      {status === "error" && <p className="composer-error">{error}</p>}
    </section>
  );
}

export default PostComposer;
