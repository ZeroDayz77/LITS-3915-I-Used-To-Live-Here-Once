const worksCited = [
  "Davidov, Sergei. \"The Art of Parallax Scrolling: Enhancing Visual Storytelling Online.\" Commoninja.com, Common Ninja, 11 Apr. 2024, www.commoninja.com/blog/the-art-of-parallax-scrolling#Introduction-to-Parallax-Scrolling.",
  "Goodbrey, Daniel. \"The Sound of Digital Comics.\" Writing Visual Culture 7, 2015, www.herts.ac.uk/__data/assets/pdf_file/0004/100786/wvc-dc-7-goodbrey.pdf.",
  "Rhys, Jean. \"I Used to Live Here Once.\" Illustration by Stuart Hahn. Caribbean Beat, no. 12, Winter 1994, www.caribbean-beat.com/issue-12/i-used-live-here-once.",
  "Studios, Jig Reel. \"Camera Movement: Understanding Its Impact on Performance.\" JIG Reel Studios | Actors | Demo Reels | Los Angeles, 26 Mar. 2024, jigreelstudios.com/camera-movement-understanding-its-impact-on-performance/.",
];

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

function renderCitationWithLinks(entry: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match = urlPattern.exec(entry);
  let linkIndex = 0;

  while (match) {
    const matchedText = match[0];
    const matchStart = match.index;
    const matchEnd = matchStart + matchedText.length;
    const trimmed = matchedText.replace(/[.,;:!?)]*$/, "");
    const trailing = matchedText.slice(trimmed.length);
    const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

    nodes.push(entry.slice(lastIndex, matchStart));
    nodes.push(
      <a key={`${href}-${linkIndex}`} href={href} target="_blank" rel="noopener noreferrer">
        {trimmed}
      </a>
    );
    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = matchEnd;
    linkIndex += 1;
    match = urlPattern.exec(entry);
  }

  nodes.push(entry.slice(lastIndex));
  return nodes;
}

export default function ReferencesPage() {
  return (
    <main className="content-page references-page">
      <section className="content-hero">
        <p className="content-kicker">References</p>
        <h1>Works Cited (MLA 9 Format)</h1>
        <p>
          Final scholarly and media sources used in this project, formatted in MLA 9.
        </p>
      </section>

      <section className="references-section">
        <div className="works-cited-container">
          <h2 className="works-cited-heading">Works Cited</h2>
          <ul className="works-cited-list">
            {worksCited.map((entry) => (
              <li key={entry} className="citation-entry">{renderCitationWithLinks(entry)}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
