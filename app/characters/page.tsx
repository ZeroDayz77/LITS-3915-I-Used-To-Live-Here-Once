export default function CharactersPage() {
  return (
    <main className="content-page characters-page">
      <section className="content-hero">
        <p className="content-kicker">Character Study</p>
        <h1>The Returning Woman</h1>
        <p>
          The central figure is unnamed, which helps her become both individual and symbolic. She
          carries memory, longing, and disbelief as she revisits what once defined home.
        </p>
      </section>

      <section className="content-card-grid">
        <article className="content-card">
          <h2>Identity and Presence</h2>
          <p>
            She experiences the place as if she belongs to it, yet the living world does not
            recognize her. This creates tension between self-perception and social visibility.
          </p>
        </article>

        <article className="content-card">
          <h2>Visual Representation</h2>
          <p>
            A faded silhouette, translucent figure, or distant ghostly form can represent her. Use
            framing that keeps her near familiar spaces while still visually separated from them.
          </p>
        </article>

        <article className="content-card">
          <h2>Sound Design Direction</h2>
          <p>
            Light wind, rustling leaves, and flowing water can heighten unease. Ambient audio should
            feel natural at first, then gradually become hollow and colder as she reaches the house.
          </p>
        </article>
      </section>
    </main>
  );
}
