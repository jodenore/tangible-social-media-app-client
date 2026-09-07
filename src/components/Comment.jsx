import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  deleteComment,
  likeComment,
  unlikeComment,
} from "../api/commentsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function formatCommentDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function Comment({ comment, onCommentUpdated, onCommentDeleted }) {
  const currentUser = useSelector(selectCurrentUser);
  const [status, setStatus] = useState("idle");
  const [deleteStatus, setDeleteStatus] = useState("idle");
  const [error, setError] = useState("");

  const likes = comment.likes || [];
  const isLiked = likes.some((like) => {
    const likeId = typeof like === "string" ? like : like._id;
    return String(likeId) === String(currentUser?._id);
  });
  const authorId =
    typeof comment.author === "string" ? comment.author : comment.author?._id;
  const isAuthor = String(authorId) === String(currentUser?._id);

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

  async function handleDelete() {
    if (!window.confirm("Delete this comment? This cannot be undone.")) {
      return;
    }

    try {
      setDeleteStatus("loading");
      setError("");
      await deleteComment(comment._id);
      onCommentDeleted?.(comment._id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setDeleteStatus("error");
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

      <div className="comment-actions">
        {currentUser ? (
          <button
            type="button"
            className={`comment-like-button ${isLiked ? "is-liked" : ""}`}
            onClick={handleLikeToggle}
            disabled={status === "loading" || deleteStatus === "loading"}
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

        {isAuthor && (
          <button
            type="button"
            className="comment-delete-button"
            onClick={handleDelete}
            disabled={status === "loading" || deleteStatus === "loading"}
          >
            <Trash2 size={14} aria-hidden="true" />
            {deleteStatus === "loading" ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {error && <p className="comment-error">{error}</p>}
    </article>
  );
}

export default Comment;
