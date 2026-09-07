import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { createComment } from "../api/commentsApi";
import { selectCurrentUser } from "../features/auth/authSlice";

function CommentComposer({ postId, onCommentCreated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  if (!currentUser) {
    return (
      <p className="comment-login-prompt">
        <Link to="/login">Log in</Link> to join the discussion.
      </p>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setStatus("loading");
      setError("");

      const comment = await createComment({
        post: postId,
        content: trimmedContent,
      });

      onCommentCreated(comment);
      setContent("");
      setStatus("idle");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
      setStatus("error");
    }
  }

  return (
    <form className="comment-composer" onSubmit={handleSubmit}>
      <label htmlFor={`comment-content-${postId}`}>Add a comment</label>
      <textarea
        id={`comment-content-${postId}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Add to the conversation"
        maxLength="500"
        required
      />

      <div className="comment-composer-actions">
        <p>{content.length}/500</p>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Posting..." : "Comment"}
        </button>
      </div>

      {status === "error" && <p className="comment-error">{error}</p>}
    </form>
  );
}

export default CommentComposer;
