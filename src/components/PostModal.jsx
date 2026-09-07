import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { getCommentsByPostId } from "../api/commentsApi";
import { deletePost } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import Comment from "./Comment";
import CommentComposer from "./CommentComposer";

function PostModal({ post, show, onHide, onPostDeleted, onPostUpdated }) {
  const currentUser = useSelector(selectCurrentUser);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("idle");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!show || !post) {
      return;
    }

    async function loadComments() {
      try {
        setStatus("loading");
        setError("");
        setComments([]);

        const commentsData = await getCommentsByPostId(post._id);
        setComments(commentsData);
        setStatus("success");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
        setStatus("error");
      }
    }

    loadComments();
  }, [post, show]);

  function handleCommentCreated(comment) {
    setComments((currentComments) => [...currentComments, comment]);
    onPostUpdated({
      ...post,
      commentsCount: (post.commentsCount || 0) + 1,
    });
  }

  function handleCommentUpdated(updatedComment) {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment,
      ),
    );
  }

  function handleCommentDeleted(commentId) {
    setComments((currentComments) =>
      currentComments.filter((comment) => comment._id !== commentId),
    );
    onPostUpdated({
      ...post,
      commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
    });
  }

  async function handleDeletePost() {
    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    try {
      setDeleteStatus("loading");
      setDeleteError("");
      await deletePost(post._id);
      onPostDeleted?.(post._id);
      onHide();
    } catch (requestError) {
      setDeleteError(
        requestError.response?.data?.message || requestError.message,
      );
      setDeleteStatus("error");
    }
  }

  if (!post) {
    return null;
  }

  const authorId = typeof post.author === "string" ? post.author : post.author?._id;
  const isAuthor = String(authorId) === String(currentUser?._id);

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="post-modal">
      <Modal.Header closeButton>
        <Modal.Title>Post discussion</Modal.Title>
        {isAuthor && (
          <button
            type="button"
            className="modal-post-delete"
            onClick={handleDeletePost}
            disabled={deleteStatus === "loading"}
          >
            <Trash2 size={15} aria-hidden="true" />
            {deleteStatus === "loading" ? "Deleting..." : "Delete"}
          </button>
        )}
      </Modal.Header>

      <Modal.Body>
        <article className="modal-post">
          <p className="modal-post-author">
            {post.author?.displayName || "Tangible user"}
          </p>
          <p className="modal-post-content">{post.content}</p>

          {post.image && <img src={post.image} alt="" className="feed-image" />}

          {deleteError && <p className="post-delete-error">{deleteError}</p>}

          {(post.player || post.group) && (
            <div className="feed-context">
              {post.player && (
                <Link to={`/players/${post.player._id}`} onClick={onHide}>
                  {post.player.fullName}
                </Link>
              )}
              {post.group && (
                <Link to={`/groups/${post.group._id}`} onClick={onHide}>
                  {post.group.name}
                </Link>
              )}
            </div>
          )}
        </article>

        <CommentComposer
          postId={post._id}
          onCommentCreated={handleCommentCreated}
        />

        <section className="comment-list" aria-labelledby="comments-title">
          <h2 id="comments-title">Comments ({post.commentsCount})</h2>

          {status === "loading" && <p>Loading comments...</p>}
          {status === "error" && <p className="comment-error">{error}</p>}
          {status === "success" && !comments.length && (
            <p>Start the conversation.</p>
          )}

          {comments.map((comment) => (
            <Comment
              comment={comment}
              key={comment._id}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </section>
      </Modal.Body>
    </Modal>
  );
}

export default PostModal;
