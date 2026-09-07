import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getGroups } from "../api/groupsApi";

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
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

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

  return (
    <section className="page-panel">
      <p className="page-kicker">Communities</p>
      <h1>Groups</h1>
      <p className="page-copy">
        Find people following the same next-up players and storylines.
      </p>

      {status === "loading" && <p className="page-copy">Loading groups...</p>}
      {status === "error" && (
        <p className="page-copy">Could not load groups: {error}</p>
      )}

      {status === "success" && (
        <section className="groups-results" aria-labelledby="groups-results-title">
          <div className="groups-results-heading">
            <h2 id="groups-results-title">Communities</h2>
            <p>{groups.length} groups</p>
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
                    <Link to={`/groups/${group._id}`} className="group-list-row">
                      <span className="group-mark" aria-hidden="true">
                        {getInitials(group.name)}
                      </span>

                      <span className="group-list-copy">
                        <strong>{group.name}</strong>
                        <span>{members.length} members</span>
                        {group.description && <small>{group.description}</small>}
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
    </section>
  );
}

export default GroupsPage;
