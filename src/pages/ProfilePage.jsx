import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPostsByAuthorId } from "../api/postsApi";
import { getUserById } from "../api/usersApi";
import Player from "../components/Player";
import Post from "../components/Post";
import PostModal from "../components/PostModal";

function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setStatus("loading");
        setError("");

        const [userData, postsData] = await Promise.all([
          getUserById(userId),
          getPostsByAuthorId(userId),
        ]);

        setUser(userData);
        setPosts(postsData);
        setStatus("success");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
        setStatus("error");
      }
    }

    loadProfile();
  }, [userId]);

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

  if (status === "loading") {
    return <p className="page-copy">Loading profile...</p>;
  }

  if (status === "error") {
    return <p className="page-copy">Could not load profile: {error}</p>;
  }

  if (!user) {
    return null;
  }

  const favouritePlayers = user.favouritePlayers || [];
  const groups = user.groups || [];

  return (
    <section className="page-panel">
      <p className="page-kicker">User Profile</p>

      <div className="profile-header">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.displayName}'s profile`}
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div>
          <h1>{user.displayName}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="page-copy">{user.bio || "No bio added yet."}</p>
        </div>
      </div>

      <div className="profile-detail-layout">
        <main className="profile-detail-main">
          <section aria-labelledby="profile-posts-title">
            <div className="profile-section-heading">
              <h2 id="profile-posts-title">Posts</h2>
              <span>{posts.length}</span>
            </div>

            {!posts.length && (
              <p className="page-copy">No posts have been shared yet.</p>
            )}

            {posts.length > 0 && (
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
          </section>
        </main>

        <aside className="profile-detail-aside">
          <section aria-labelledby="profile-players-title">
            <div className="profile-section-heading">
              <h2 id="profile-players-title">Favourite Players</h2>
              <span>{favouritePlayers.length}</span>
            </div>

            {!favouritePlayers.length && (
              <p className="page-copy">No favourite players added yet.</p>
            )}

            {favouritePlayers.length > 0 && (
              <div className="profile-player-cards">
                {favouritePlayers.map((player) => (
                  <Player key={player._id} player={player} card />
                ))}
              </div>
            )}
          </section>

          <section className="profile-groups" aria-labelledby="profile-groups-title">
            <div className="profile-section-heading">
              <h2 id="profile-groups-title">Groups</h2>
              <span>{groups.length}</span>
            </div>

            {!groups.length && (
              <p className="page-copy">No groups joined yet.</p>
            )}

            {groups.length > 0 && (
              <ul className="profile-groups-list">
                {groups.map((group) => (
                  <li key={group._id}>
                    <Link to={`/groups/${group._id}`}>
                      <strong>{group.name}</strong>
                      <span>{group.description || "A Tangible community."}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <PostModal
        post={selectedPost}
        show={Boolean(selectedPost)}
        onHide={() => setSelectedPost(null)}
        onPostUpdated={handlePostUpdated}
      />
    </section>
  );
}

export default ProfilePage;
