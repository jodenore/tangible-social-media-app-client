import { useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { likeComment, unlikeComment } from "../api/commentsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function formatCommentDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function Comment({ comment, onCommentUpdated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const likes = comment.likes || [];
  const isLiked = likes.some((like) => {
    const likeId = typeof like === "string" ? like : like._id;
    return String(likeId) === String(currentUser?._id);
  });

  async function handleLikeToggle() {
    if (!currentUser) {
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const updateLike = isLiked ? unlikeComment : likeComment;
      const updatedComment = await updateLike(comment._id);

      onCommentUpdated(updatedComment);
      setStatus("idle");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setStatus("error");
    }
  }

  const authorName = comment.author?.displayName || "Tangible user";

  return (
    <article className="comment-item">
      <p className="comment-author">{authorName}</p>
      <p className="comment-meta">
        @{comment.author?.username || "tangible"} · {formatCommentDate(comment.createdAt)}
      </p>
      <p className="comment-content">{comment.content}</p>

      {currentUser ? (
        <button
          type="button"
          className={`comment-like-button ${isLiked ? "is-liked" : ""}`}
          onClick={handleLikeToggle}
          disabled={status === "loading"}
          aria-pressed={isLiked}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </button>
      ) : (
        <Link to="/login" className="comment-like-login">
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </Link>
      )}

      {error && <p className="comment-error">{error}</p>}
    </article>
  );
}

export default Comment;
