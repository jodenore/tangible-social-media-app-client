import { useParams } from "react-router-dom";

function ProfilePage() {
  const { userId } = useParams();

  return (
    <section className="page-panel">
      <p className="page-kicker">User Profile</p>
      <h1>Profile</h1>
      <p className="page-copy">
        User profile data will load here. Route id: {userId}
      </p>
    </section>
  );
}

export default ProfilePage;
