function FeedPage() {
  return (
    <section className="page-panel">
      <p className="page-kicker">Global Feed</p>
      <h1>Rising Star Conversations</h1>
      <p className="page-copy">
        This page will fetch public posts and group-approved posts the user can see.
      </p>

      <div className="template-grid">
        <article className="template-card">
          <p className="template-label">Post Card</p>
          <h2>AJ Dybantsa keeps adding counters</h2>
          <p>Author, player link, group link, likes, and comments will render here.</p>
        </article>
        <article className="template-card">
          <p className="template-label">Composer</p>
          <h2>Create a post</h2>
          <p>Public post by default, group post when a group is selected.</p>
        </article>
      </div>
    </section>
  );
}

export default FeedPage;
