import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";

import { getCommentsByPostId } from "../api/commentsApi";
import Comment from "./Comment";
import CommentComposer from "./CommentComposer";

function PostModal({ post, show, onHide, onPostUpdated }) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

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
      commentsCount: post.commentsCount + 1,
    });
  }

  function handleCommentUpdated(updatedComment) {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment,
      ),
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="post-modal">
      <Modal.Header closeButton>
        <Modal.Title>Post discussion</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <article className="modal-post">
          <p className="modal-post-author">
            {post.author?.displayName || "Tangible user"}
          </p>
          <p className="modal-post-content">{post.content}</p>

          {post.image && <img src={post.image} alt="" className="feed-image" />}

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
            />
          ))}
        </section>
      </Modal.Body>
    </Modal>
  );
}

export default PostModal;
