import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Pencil } from "lucide-react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getPostsByAuthorId } from "../api/postsApi";
import { getUserById, updateUser } from "../api/usersApi";
import { uploadUserAvatar } from "../api/uploadsApi";
import ImageUploadField from "../components/ImageUploadField";
import ProfileMediaGrid from "../components/ProfileMediaGrid";
import Post from "../components/Post";
import PostModal from "../components/PostModal";
import {
  selectCurrentUser,
  setCurrentUser,
} from "../features/auth/authSlice";

function ProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("idle");
  const [editError, setEditError] = useState("");
  const [profileFields, setProfileFields] = useState({
    displayName: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

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

  function handlePostDeleted(postId) {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId),
    );
    setSelectedPost(null);
  }

  function openEditModal() {
    setProfileFields({
      displayName: user.displayName || "",
      bio: user.bio || "",
    });
    setAvatarFile(null);
    setEditError("");
    setIsEditOpen(true);
  }

  function handleProfileFieldChange(event) {
    setProfileFields((currentFields) => ({
      ...currentFields,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    try {
      setEditStatus("loading");
      setEditError("");

      let uploadedUser = null;

      if (avatarFile) {
        const uploadResult = await uploadUserAvatar(avatarFile);
        uploadedUser = uploadResult.user;
      }

      const updatedUser = await updateUser(user._id, profileFields);
      const savedUser = { ...uploadedUser, ...updatedUser };
      const profileChanges = { ...savedUser };
      delete profileChanges.favouritePlayers;
      delete profileChanges.groups;

      setUser((currentProfile) => ({ ...currentProfile, ...profileChanges }));
      dispatch(setCurrentUser({ ...currentUser, ...profileChanges }));
      setIsEditOpen(false);
      setEditStatus("success");
    } catch (requestError) {
      setEditError(requestError.response?.data?.message || requestError.message);
      setEditStatus("error");
    }
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
  const isCurrentUser = String(user._id) === String(currentUser?._id);

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

        <div className="profile-header-copy">
          <h1>{user.displayName}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="page-copy">{user.bio || "No bio added yet."}</p>
        </div>

        {isCurrentUser && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={openEditModal}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit profile
          </button>
        )}
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
                    onPostDeleted={handlePostDeleted}
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
              <ProfileMediaGrid
                items={favouritePlayers}
                getImage={(player) => player.image}
                getLabel={(player) => player.fullName}
                getPath={(player) => `/players/${player._id}`}
              />
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
              <ProfileMediaGrid
                items={groups}
                getImage={(group) => group.image}
                getLabel={(group) => group.name}
                getPath={(group) => `/groups/${group._id}`}
              />
            )}
          </section>
        </aside>
      </div>

      <PostModal
        post={selectedPost}
        show={Boolean(selectedPost)}
        onHide={() => setSelectedPost(null)}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
      />

      <Modal
        show={isEditOpen}
        onHide={() => setIsEditOpen(false)}
        centered
        contentClassName="profile-edit-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit profile</Modal.Title>
        </Modal.Header>

        <form onSubmit={handleProfileSave}>
          <Modal.Body>
            <div className="profile-edit-fields">
              <label htmlFor="profile-display-name">Display name</label>
              <input
                id="profile-display-name"
                name="displayName"
                type="text"
                value={profileFields.displayName}
                onChange={handleProfileFieldChange}
                maxLength="80"
                required
              />

              <ImageUploadField
                label="New avatar"
                onFileSelected={setAvatarFile}
              />

              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                name="bio"
                value={profileFields.bio}
                onChange={handleProfileFieldChange}
                maxLength="300"
                rows="4"
                placeholder="Tell the community what you are watching."
              />
              <p className="profile-edit-count">
                {profileFields.bio.length}/300
              </p>
            </div>

            {editError && <p className="profile-edit-error">{editError}</p>}
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              className="profile-edit-cancel"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-edit-save"
              disabled={editStatus === "loading"}
            >
              {editStatus === "loading" ? "Saving..." : "Save changes"}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </section>
  );
}

export default ProfilePage;
