export default function ResultsLoading() {
  return (
    <section
      className="container section"
      aria-busy="true"
      aria-label="Loading artisans"
    >
      <p role="status">Finding local skilled hands…</p>
      <div className="loading-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-photo" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    </section>
  );
}
