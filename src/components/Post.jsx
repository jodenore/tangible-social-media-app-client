import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { deletePost, likePost, unlikePost } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function formatPostDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getPlayerInitial(name) {
  return name?.slice(0, 1).toUpperCase() || "P";
}

function Post({ post, onOpen, onPostDeleted, onPostUpdated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [likeStatus, setLikeStatus] = useState("idle");
  const [likeError, setLikeError] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("idle");
  const [deleteError, setDeleteError] = useState("");

  const likes = post.likes || [];
  const isLiked = likes.some((like) => {
    const likeId = typeof like === "string" ? like : like._id;
    return String(likeId) === String(currentUser?._id);
  });

  async function handleLikeToggle(event) {
    event.stopPropagation();

    if (!currentUser) {
      return;
    }

    try {
      setLikeStatus("loading");
      setLikeError("");

      const updateLike = isLiked ? unlikePost : likePost;
      const updatedPost = await updateLike(post._id);

      onPostUpdated(updatedPost);
      setLikeStatus("success");
    } catch (requestError) {
      setLikeError(
        requestError.response?.data?.message || requestError.message,
      );
      setLikeStatus("error");
    }
  }

  async function handleDeletePost(event) {
    event.stopPropagation();

    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    try {
      setDeleteStatus("loading");
      setDeleteError("");
      await deletePost(post._id);
      onPostDeleted?.(post._id);
    } catch (requestError) {
      setDeleteError(
        requestError.response?.data?.message || requestError.message,
      );
      setDeleteStatus("error");
    }
  }

  const authorName = post.author?.displayName || "Tangible user";
  const authorId = typeof post.author === "string" ? post.author : post.author?._id;
  const isAuthor = String(authorId) === String(currentUser?._id);

  return (
    <article className="feed-post" onClick={() => onOpen(post)}>
      <div className="feed-post-header">
        <div className="feed-avatar-area">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={`${authorName}'s profile`}
              className="feed-avatar"
            />
          ) : (
            <div className="feed-avatar feed-avatar-fallback" aria-hidden="true">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
          )}

          {post.player && (
            <Link
              to={`/players/${post.player._id}`}
              className="feed-player-pill"
              onClick={(event) => event.stopPropagation()}
            >
              {post.player.iconImage || post.player.image ? (
                <img src={post.player.iconImage || post.player.image} alt="" />
              ) : (
                <span aria-hidden="true">{getPlayerInitial(post.player.fullName)}</span>
              )}
              <strong>{post.player.fullName}</strong>
            </Link>
          )}
        </div>

        <div className="feed-author-copy">
          <Link
            to={`/profile/${post.author?._id}`}
            className="feed-author"
            onClick={(event) => event.stopPropagation()}
          >
            {authorName}
          </Link>
          <p className="feed-meta">
            @{post.author?.username || "tangible"} · {formatPostDate(post.createdAt)}
          </p>

          {post.group && (
            <Link
              to={`/groups/${post.group._id}`}
              className="feed-group-context"
              onClick={(event) => event.stopPropagation()}
            >
              {post.group.name}
            </Link>
          )}
        </div>
      </div>

      <p className="feed-content">{post.content}</p>

      {post.image && <img src={post.image} alt="" className="feed-image" />}

      <footer className="feed-post-footer">
        {currentUser ? (
          <button
            type="button"
            className={`post-like-button ${isLiked ? "is-liked" : ""}`}
            onClick={handleLikeToggle}
            disabled={likeStatus === "loading"}
            aria-pressed={isLiked}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </button>
        ) : (
          <Link
            to="/login"
            className="post-like-login"
            onClick={(event) => event.stopPropagation()}
          >
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </Link>
        )}

        <span>{post.commentsCount} comments</span>

        {isAuthor && (
          <button
            type="button"
            className="post-delete-button"
            onClick={handleDeletePost}
            disabled={deleteStatus === "loading"}
          >
            <Trash2 size={15} aria-hidden="true" />
            {deleteStatus === "loading" ? "Deleting..." : "Delete"}
          </button>
        )}
      </footer>

      {likeError && <p className="post-like-error">{likeError}</p>}
      {deleteError && <p className="post-delete-error">{deleteError}</p>}
    </article>
  );
}

export default Post;
