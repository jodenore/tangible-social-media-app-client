import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { createPost } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function PostComposer({ onPostCreated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
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

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const postDetails = { content: trimmedContent };

      if (selectedPlayerId) {
        postDetails.player = selectedPlayerId;
      }

      if (image.trim()) {
        postDetails.image = image.trim();
      }

      const newPost = await createPost(postDetails);

      onPostCreated(newPost);
      setContent("");
      setImage("");
      setSelectedPlayerId("");
      setStatus("success");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setStatus("error");
    }
  }

  return (
    <section className="post-composer" aria-labelledby="post-composer-title">
      <div className="post-composer-header">
        <div className="composer-avatar" aria-hidden="true">
          {currentUser.displayName?.slice(0, 1).toUpperCase()}
        </div>

        <div>
          <h2 id="post-composer-title">Share an observation</h2>
          <p>@{currentUser.username}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="post-composer-form">
        <label htmlFor="post-content">Your take</label>
        <textarea
          id="post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What are you seeing in their game?"
          maxLength="1000"
          required
        />

        {favouritePlayers.length > 0 ? (
          <>
            <label htmlFor="post-player">Link a favourite player (optional)</label>
            <select
              id="post-player"
              value={selectedPlayerId}
              onChange={(event) => setSelectedPlayerId(event.target.value)}
            >
              <option value="">No player selected</option>
              {favouritePlayers.map((player) => (
                <option value={player._id} key={player._id}>
                  {player.fullName} · {player.currentTeam}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="composer-hint">
            Add favourite players to your profile to link them in a post.
          </p>
        )}

        <label htmlFor="post-image">Image URL (optional)</label>
        <input
          id="post-image"
          type="url"
          value={image}
          onChange={(event) => setImage(event.target.value)}
          placeholder="https://example.com/image.jpg"
        />

        <div className="post-composer-actions">
          <p>{content.length}/1000</p>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {status === "success" && <p className="composer-success">Post shared.</p>}
      {status === "error" && <p className="composer-error">{error}</p>}
    </section>
  );
}

export default PostComposer;
