import { useEffect, useState } from "react";

import { getPosts } from "../api/postsApi";
import PostComposer from "../components/PostComposer";
import Post from "../components/Post";
import PostModal from "../components/PostModal";

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setStatus("loading");
        setError("");

        const postsData = await getPosts();
        setPosts(postsData);
        setStatus("success");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
        setStatus("error");
      }
    }

    loadPosts();
  }, []);

  function handlePostCreated(newPost) {
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  }

  function handlePostUpdated(updatedPost) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post,
      ),
    );

    setSelectedPost((currentPost) =>
      currentPost?._id === updatedPost._id ? updatedPost : currentPost,
    );
  }

  return (
    <section className="page-panel">
      <p className="page-kicker">Global Feed</p>
      <h1>Rising Star Conversations</h1>
      <p className="page-copy">
        Join the conversation around the athletes shaping what comes next.
      </p>

      <PostComposer onPostCreated={handlePostCreated} />

      {status === "loading" && <p className="page-copy">Loading posts...</p>}

      {status === "error" && (
        <p className="page-copy">Could not load posts: {error}</p>
      )}

      {status === "success" && !posts.length && (
        <p className="page-copy">No posts have been shared yet.</p>
      )}

      {status === "success" && posts.length > 0 && (
        <div className="feed-list">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onOpen={setSelectedPost}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      <PostModal
        post={selectedPost}
        show={Boolean(selectedPost)}
        onHide={() => setSelectedPost(null)}
        onPostUpdated={handlePostUpdated}
      />
    </section>
  );
}

export default FeedPage;
