export default function StorylinePage() {
  return (
    <main className="content-page storyline-page">
      <section className="content-hero">
        <p className="content-kicker">Storyline and Plot</p>
        <h1>Key Narrative Moments</h1>
        <p>
          The plot is brief, but each moment is meaningful. The story moves from recognition, to
          encounter, to revelation with quiet precision.
        </p>
      </section>

      <section className="content-card-grid">
        <article className="content-card">
          <h2>1. Return</h2>
          <p>
            The narrator revisits a familiar route and recalls physical details with confidence. This
            opening creates trust in memory and establishes emotional attachment to place.
          </p>
        </article>

        <article className="content-card">
          <h2>2. Contact Attempt</h2>
          <p>
            She sees children and tries to speak. Their lack of recognition introduces dissonance:
            she is clearly present to herself, but absent to them.
          </p>
        </article>

        <article className="content-card">
          <h2>3. Realization</h2>
          <p>
            The children feel sudden cold and withdraw. In that instant the narrator recognizes what
            she has become, and the story closes on a restrained but devastating revelation.
          </p>
        </article>
      </section>
    </main>
  );
}
