import { useParams } from "react-router-dom";

function GroupDetailsPage() {
  const { groupId } = useParams();

  return (
    <section className="page-panel">
      <p className="page-kicker">Community Room</p>
      <h1>Group Details</h1>
      <p className="page-copy">
        Group data will load here. Route id: {groupId}
      </p>
    </section>
  );
}

export default GroupDetailsPage;
