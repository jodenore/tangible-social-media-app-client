import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getGroupById, requestJoinGroup } from "../api/groupsApi";
import { getPostsByGroupId } from "../api/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import Player from "../components/Player";
import Post from "../components/Post";
import PostModal from "../components/PostModal";
import User from "../components/User";

function GroupDetailsPage() {
  const { groupId } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [joinStatus, setJoinStatus] = useState("idle");
  const [joinError, setJoinError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function loadGroupPage() {
      try {
        setStatus("loading");
        setError("");

        const [groupData, postsData] = await Promise.all([
          getGroupById(groupId),
          getPostsByGroupId(groupId),
        ]);

        setGroup(groupData);
        setPosts(postsData);
        setStatus("success");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
        setStatus("error");
      }
    }

    loadGroupPage();
  }, [groupId]);

  async function handleJoinRequest() {
    try {
      setJoinStatus("loading");
      setJoinError("");

      const updatedGroup = await requestJoinGroup(group._id);
      setGroup(updatedGroup);
      setJoinStatus("success");
    } catch (requestError) {
      setJoinError(requestError.response?.data?.message || requestError.message);
      setJoinStatus("error");
    }
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

  if (status === "loading") {
    return <p className="page-copy">Loading group...</p>;
  }

  if (status === "error") {
    return <p className="page-copy">Could not load group: {error}</p>;
  }

  if (!group) {
    return null;
  }

  // The members array preserves the order each member was accepted into the group.
  const members = group.members || [];
  const pendingMembers = group.pendingMembers || [];
  const favouritePlayers = group.favouritePlayers || [];
  const currentUserId = currentUser?._id;
  const isMember = members.some(
    (member) => String(member._id) === String(currentUserId),
  );
  const hasPendingRequest = pendingMembers.some(
    (member) => String(member._id) === String(currentUserId),
  );

  return (
    <section className="page-panel">
      <p className="page-kicker">Community Room</p>

      <header className="group-detail-header">
        <div>
          <h1>{group.name}</h1>
          <p className="group-detail-members">{members.length} members</p>
          <p className="page-copy">
            {group.description || "A Tangible community."}
          </p>
        </div>

        {!currentUser ? (
          <Link to="/login" className="group-join-button">
            Log in to join
          </Link>
        ) : isMember ? (
          <span className="group-membership-state">Joined</span>
        ) : hasPendingRequest || joinStatus === "success" ? (
          <span className="group-membership-state">Request pending</span>
        ) : (
          <button
            type="button"
            className="group-join-button"
            onClick={handleJoinRequest}
            disabled={joinStatus === "loading"}
          >
            {joinStatus === "loading" ? "Requesting..." : "Join group"}
          </button>
        )}
      </header>

      {joinError && <p className="group-join-error">{joinError}</p>}

      <div className="group-detail-layout">
        <main className="group-detail-main">
          <section className="group-posts" aria-labelledby="group-posts-title">
            <div className="group-section-heading">
              <h2 id="group-posts-title">Discussion</h2>
              <span>{posts.length} posts</span>
            </div>

            {!posts.length && (
              <p className="page-copy">No posts have been shared here yet.</p>
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

          <section className="group-members" aria-labelledby="group-members-title">
            <div className="group-section-heading">
              <h2 id="group-members-title">Members</h2>
              <span>{members.length}</span>
            </div>

            <div className="group-user-list">
              {members.map((member) => (
                <User
                  key={member._id}
                  user={member}
                  isOwner={String(member._id) === String(group.owner?._id)}
                />
              ))}
            </div>
          </section>
        </main>

        <aside className="group-detail-aside" aria-labelledby="group-players-title">
          <div className="group-section-heading">
            <h2 id="group-players-title">Favourite Players</h2>
            <span>{favouritePlayers.length}</span>
          </div>

          {!favouritePlayers.length && (
            <p className="page-copy">No favourite players added yet.</p>
          )}

          {favouritePlayers.length > 0 && (
            <div className="group-player-cards">
              {favouritePlayers.map((player) => (
                <Player key={player._id} player={player} card />
              ))}
            </div>
          )}
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

export default GroupDetailsPage;
