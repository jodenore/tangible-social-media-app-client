import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { createGroup, getGroups } from "../api/groupsApi";
import { uploadGroupAvatar } from "../api/uploadsApi";
import ImageUploadField from "../components/ImageUploadField";
import {
  selectCurrentUser,
  setCurrentUser,
} from "../features/auth/authSlice";

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function MemberStack({ members }) {
  const visibleMembers = members.slice(0, 5);

  return (
    <div
      className="group-member-stack"
      aria-label={`${members.length} group members`}
    >
      {visibleMembers.map((member) =>
        member.avatar ? (
          <img
            src={member.avatar}
            alt=""
            className="group-member-avatar"
            key={member._id}
          />
        ) : (
          <span
            className="group-member-avatar group-member-avatar-fallback"
            aria-hidden="true"
            key={member._id}
          >
            {getInitials(member.displayName)}
          </span>
        ),
      )}
    </div>
  );
}

function GroupsPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createError, setCreateError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [groupFields, setGroupFields] = useState({
    name: "",
    slug: "",
    description: "",
    visibility: "public",
  });

  useEffect(() => {
    async function loadGroups() {
      try {
        setStatus("loading");
        setError("");

        const groupsData = await getGroups();
        setGroups(groupsData);
        setStatus("success");
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message);
        setStatus("error");
      }
    }

    loadGroups();
  }, []);

  function openCreateModal() {
    setGroupFields({
      name: "",
      slug: "",
      description: "",
      visibility: "public",
    });
    setAvatarFile(null);
    setCreateError("");
    setIsCreateOpen(true);
  }

  function handleGroupFieldChange(event) {
    const { name, value } = event.target;

    setGroupFields((currentFields) => ({
      ...currentFields,
      [name]: value,
      ...(name === "name" && !currentFields.slug
        ? {
            slug: value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
          }
        : {}),
    }));
  }

  async function handleCreateGroup(event) {
    event.preventDefault();

    try {
      setCreateStatus("loading");
      setCreateError("");

      const createdGroup = await createGroup(groupFields);
      let savedGroup = createdGroup;

      if (avatarFile) {
        const uploadResult = await uploadGroupAvatar(createdGroup._id, avatarFile);
        savedGroup = { ...createdGroup, image: uploadResult.image.url };
      }

      setGroups((currentGroups) => [savedGroup, ...currentGroups]);
      dispatch(
        setCurrentUser({
          ...currentUser,
          groups: [...(currentUser.groups || []), savedGroup],
        }),
      );
      setIsCreateOpen(false);
      setCreateStatus("success");
    } catch (requestError) {
      setCreateError(requestError.response?.data?.message || requestError.message);
      setCreateStatus("error");
    }
  }

  return (
    <section className="page-panel">
      <p className="page-kicker">Communities</p>
      <h1>Groups</h1>
      <div className="groups-page-intro">
        <p className="page-copy">
          Find people following the same next-up players and storylines.
        </p>
        {currentUser && (
          <button
            type="button"
            className="group-create-button"
            onClick={openCreateModal}
          >
            <Plus size={16} aria-hidden="true" />
            Create group
          </button>
        )}
      </div>

      {status === "loading" && <p className="page-copy">Loading groups...</p>}
      {status === "error" && (
        <p className="page-copy">Could not load groups: {error}</p>
      )}

      {status === "success" && (
        <section
          className="groups-results"
          aria-labelledby="groups-results-title"
        >
          <div className="groups-results-heading">
            <h2 id="groups-results-title">Communities</h2>
            <p>
              {groups.length} {groups.length === 1 ? "group" : "groups"}
            </p>
          </div>

          {!groups.length && (
            <p className="page-copy">No groups have been created yet.</p>
          )}

          {groups.length > 0 && (
            <ul className="groups-list">
              {groups.map((group) => {
                const members = group.members || [];

                return (
                  <li key={group._id}>
                    <Link
                      to={`/groups/${group._id}`}
                      className="group-list-row"
                    >
                      {group.image ? (
                        <img
                          src={group.image}
                          alt=""
                          className="group-mark group-mark-image"
                        />
                      ) : (
                        <span className="group-mark" aria-hidden="true">
                          {getInitials(group.name)}
                        </span>
                      )}

                      <span className="group-list-copy">
                        <strong>{group.name}</strong>
                        <span>{members.length} members</span>
                        {group.description && (
                          <small>{group.description}</small>
                        )}
                        <MemberStack members={members} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <Modal
        show={isCreateOpen}
        onHide={() => setIsCreateOpen(false)}
        centered
        contentClassName="group-create-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create group</Modal.Title>
        </Modal.Header>

        <form onSubmit={handleCreateGroup}>
          <Modal.Body>
            <div className="group-create-fields">
              <label htmlFor="group-name">Name</label>
              <input
                id="group-name"
                name="name"
                value={groupFields.name}
                onChange={handleGroupFieldChange}
                maxLength="80"
                required
              />

              <label htmlFor="group-slug">Slug</label>
              <input
                id="group-slug"
                name="slug"
                value={groupFields.slug}
                onChange={handleGroupFieldChange}
                maxLength="80"
                required
              />

              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                name="description"
                value={groupFields.description}
                onChange={handleGroupFieldChange}
                maxLength="500"
                rows="4"
              />

              <label htmlFor="group-visibility">Visibility</label>
              <select
                id="group-visibility"
                name="visibility"
                value={groupFields.visibility}
                onChange={handleGroupFieldChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <ImageUploadField
                label="Group image"
                onFileSelected={setAvatarFile}
              />
            </div>

            {createError && <p className="group-create-error">{createError}</p>}
          </Modal.Body>

          <Modal.Footer>
            <button
              type="button"
              className="group-create-cancel"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group-create-submit"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading" ? "Creating..." : "Create group"}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </section>
  );
}

export default GroupsPage;
