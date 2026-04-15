const worksCited = [
  "Alpuim, Margarida, and Katja Ehrenberg. \"Why Images Are so Powerful - and What Matters When Choosing Them.\" Bonn Institute, 3 Aug. 2023, www.bonn-institute.org/en/news/psychology-in-journalism-5.",
  "Audio Wind. \"Winter Morning Ambience Sound Effect | Copyright Free Nature Sounds.\" YouTube, 2026, https://www.youtube.com/watch?v=Lkjhuss8byo.",
  "Davidov, Sergei. \"The Art of Parallax Scrolling: Enhancing Visual Storytelling Online.\" Commoninja.com, Common Ninja, 11 Apr. 2024, www.commoninja.com/blog/the-art-of-parallax-scrolling#Introduction-to-Parallax-Scrolling.",
  "Denisova, Alena, and Paul Cairns. \"First Person vs. Third Person Perspective in Digital Games.\" Proceedings of the 33rd Annual ACM Conference on Human Factors in Computing Systems - CHI '15, 2015, https://doi.org/10.1145/2702123.2702256.",
  "Devendran N. \"River Sound Effect.\" YouTube, 11 Feb. 2021, www.youtube.com/watch?v=iJQ2m99-ot0.",
  "Free Audio Zone. \"Dark Ambient Sound Effect - Eerie Background.\" YouTube, 2026, https://www.youtube.com/watch?v=g0yQmVGla5U.",
  "Free Copyright Free Sounds - For Video Contents. \"🎵 No Copyright Free Creepy Eerie Scary Whisper Sound Effect.\" YouTube, 31 Mar. 2019, www.youtube.com/watch?v=R72rCF-fsyk.",
  "Goodbrey, Daniel. \"The Sound of Digital Comics.\" Writing Visual Culture 7, 2015, www.herts.ac.uk/__data/assets/pdf_file/0004/100786/wvc-dc-7-goodbrey.pdf.",
  "“Home | Search the Archive | British Newspaper Archive.” The British  Newspaper Archive, britishnewspaperarchive.co.uk/.",
  "Jason Low. \"Sound Effects - Kids Laughing.\" YouTube, www.youtube.com/watch?v=NMPGKM9zg0M.",
  "nathanolson. \"Light Breeze Field Sound FX.\" YouTube, 10 Sept. 2015, www.youtube.com/watch?v=490z2QH6v5o.",
  "PureL - 5th Root. \"Page Turn Sound Effect.\" YouTube, 23 Dec. 2022, www.youtube.com/watch?v=SH_iqvnc0-4.",
  "poul bautist. \"Silence Sound Effect (Empty Room).\" YouTube, www.youtube.com/watch?v=VrfyB2gMAUg.",
  "Relaxing sounds. \"Footsteps grass sound effect.\" YouTube, 2026, https://www.youtube.com/watch?v=HgidfHqfGcg.",
  "Rhys, Jean. \"I Used to Live Here Once.\" Illustration by Stuart Hahn. Caribbean Beat, no. 12, Winter 1994, www.caribbean-beat.com/issue-12/i-used-live-here-once.",
  "Sicilia, Maria, et al. \"EFFECTS of INTERACTIVITY in a WEB SITE: The Moderating Effect of Need for Cognition.\" Journal of Advertising, vol. 34, no. 3, Nov. 2005, pp. 31-44, https://doi.org/10.1080/00913367.2005.10639202.",
  "Sonic Sounds. \"Family Gathering Sounds | Comforting Sound for Relaxation, Company and Loneliness.\" YouTube, 24 Oct. 2022, www.youtube.com/watch?v=irndVR28SHY.",
  "Sound Central. \"Riser - Sound Effect (Free).\" YouTube, 2026, https://www.youtube.com/watch?v=Am4wYTiHHx8&pp=ygUdc3VkZGVubHkgcmVhbGl6ZSBzb3VuZCBlZmZlY3Q%3D.",
  "Sound Library. \"Shuffle around House - Sound Effect for Editing.\" YouTube, 17 July 2020, www.youtube.com/watch?v=NV9vOf76XeY.",
  "SoundEffectsFactory. \"Book Page Turn Flip Sound Effect.\" YouTube, 14 Feb. 2012, www.youtube.com/watch?v=ugKjl3vk7TA.",
  "Studios, Jig Reel. \"Camera Movement: Understanding Its Impact on Performance.\" JIG Reel Studios | Actors | Demo Reels | Los Angeles, 26 Mar. 2024, www.jigreelstudios.com/camera-movement-understanding-its-impact-on-performance/.",
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
