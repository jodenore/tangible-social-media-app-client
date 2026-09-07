import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { getPosts } from "../api/postsApi";
import { getPlayers } from "../api/playersApi";
import FeaturedPlayersCarousel from "../components/FeaturedPlayersCarousel";
import PostComposer from "../components/PostComposer";
import Post from "../components/Post";
import PostModal from "../components/PostModal";
import { selectCurrentUser } from "../features/auth/authSlice";

function FeedPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [posts, setPosts] = useState([]);
  const [featuredPlayers, setFeaturedPlayers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setStatus("loading");
        setError("");

        const [postsData, playersData] = await Promise.all([
          getPosts(),
          getPlayers({ sortBy: "favourites" }),
        ]);

        setPosts(postsData);
        setFeaturedPlayers(playersData.slice(0, 5));
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

  function handlePostDeleted(postId) {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId),
    );
    setSelectedPost(null);
  }

  // Guests can sample the conversation without gaining access to the entire feed.
  const visiblePosts = currentUser ? posts : posts.slice(0, 2);
  const previewPosts = currentUser ? [] : posts.slice(2);

  return (
    <section className="page-panel">
      <div className="feed-page-layout">
        <main className="feed-page-main">
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

      {status === "success" && visiblePosts.length > 0 && (
        <div className="feed-list">
          {visiblePosts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onOpen={setSelectedPost}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {!currentUser && previewPosts.length > 0 && (
        <>
          <div className="feed-preview-list" aria-hidden="true" inert="">
            {previewPosts.map((post) => (
              <Post
                key={post._id}
                post={post}
                onOpen={() => {}}
                onPostDeleted={() => {}}
                onPostUpdated={() => {}}
              />
            ))}
          </div>
        </>
      )}

        </main>

        {status === "success" && (
          <FeaturedPlayersCarousel players={featuredPlayers} />
        )}
      </div>

      <PostModal
        post={selectedPost}
        show={Boolean(selectedPost)}
        onHide={() => setSelectedPost(null)}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
      />
    </section>
  );
}

export default FeedPage;
