import { useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { likePost, unlikePost } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function formatPostDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function Post({ post, onOpen, onPostUpdated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [likeStatus, setLikeStatus] = useState("idle");
  const [likeError, setLikeError] = useState("");

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

  const authorName = post.author?.displayName || "Tangible user";

  return (
    <article className="feed-post" onClick={() => onOpen(post)}>
      <div className="feed-post-header">
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

        <div>
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
        </div>
      </div>

      <p className="feed-content">{post.content}</p>

      {post.image && <img src={post.image} alt="" className="feed-image" />}

      {(post.player || post.group) && (
        <div className="feed-context">
          {post.player && (
            <Link
              to={`/players/${post.player._id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {post.player.fullName}
            </Link>
          )}

          {post.group && (
            <Link
              to={`/groups/${post.group._id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {post.group.name}
            </Link>
          )}
        </div>
      )}

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
      </footer>

      {likeError && <p className="post-like-error">{likeError}</p>}
    </article>
  );
}

export default Post;
