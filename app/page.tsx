"use client";

import { useEffect, useRef, useState } from "react";

const panels = [
  {
    label: "I",
    heading: "The River",
    body: "I remember these stones, the rounded unsteady stone, the pointed one, the flat one where I could look around, and the dangerous one, slippery even when it looked dry..." ,
    background: "/Stepping_stones,_Hebden,_bench.jpg",
  },
  {
    label: "II",
    heading: "The Road",
    body: "The road is wider now, it looks carelessly done. Yet even with these felled trees and trampled bushes, walking here always makes me happy...",
    background: "/road.png",
  },
  {
    label: "III",
    heading: "The Sky",
    body: "I don't remember the sky looking this way, I can't think of any other word to describe it other than... Glassy...",
    background: "/sky.png",
  },
  {
    label: "IV",
    heading: "The House",
    body: "Things have changed, the screw pine is gone, so too is the ajoupa. The clove tree and lawn are just as I remember. Now's there's a house in all white, its strange to see a car in the yard...",
    background: "/Old-white-house.png",
  },
  {
    label: "V",
    heading: "The Children",
    body: "There were two children under the big mango tree, a boy and a little girl. I tried calling out to them, but they didn't respond. I started to walk towards them...",
    background: "/mango-tree-raw-green-mangoes-han.png",
    bgPosition: "bottom center",
  },
  {
    label: "VI",
    heading: "The Moment",
    body: "\"I used to live here once...\" I said as I got closer, still to no response. I moved in closer, instinctively I tried to reach out to them...",
    background: "/mango-tree-raw-green-mangoes-reaching-out.png",
    bgPosition: "bottom center",
  },
  {
    label: "VII",
    heading: "The Gaze",
    body: "The boy then turned to look at me, his grey eyes stared into mine. However his experssion didnt change. \"Hasn't it gone cold all of a sudden...\", he remarked to the girl. She agreed and they both left...",
    background: "/vector-silhouette-boy-white-bac.png",
  },
  {
    label: "VIII",
    heading: "The Silence",
    body: "My arms feel back to my side as I watched them run across the gress to the house. That was when I understood...",
    background: "",
  },
];

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePanel, setActivePanel] = useState(0);

  const scrollToPanel = (index: number) => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const panelHeight = maxScroll / (panels.length - 1);
    window.scrollTo({ top: index * panelHeight, behavior: "smooth" });
  };

  useEffect(() => {
    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;

    const getSnapTarget = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      const panelHeight = maxScroll / (panels.length - 1);
      const nearest = Math.round(window.scrollY / panelHeight);
      return Math.round(nearest * panelHeight);
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const totalWidth = (panels.length - 1) * window.innerWidth;
      const translateX = -(progress * totalWidth);

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${translateX}px)`;
      }

      const panelIndex = Math.min(
        Math.round(progress * (panels.length - 1)),
        panels.length - 1
      );
      setActivePanel((prev) => (prev !== panelIndex ? panelIndex : prev));

      // Fade + zoom each background image based on scroll position
      const exactProgress = progress * (panels.length - 1);
      bgRefs.current.forEach((bg, i) => {
        if (!bg) return;
        const dist = exactProgress - i;
        const opacity = Math.max(0, 1 - Math.abs(dist));
        let scale: number;
        if (dist >= 0) {
          scale = 1 - Math.min(dist, 1) * 0.15;
        } else {
          scale = 1 + Math.min(-dist, 1) * 0.15;
        }
        bg.style.opacity = String(opacity);
        bg.style.transform = `scale(${scale.toFixed(4)})`;
      });

      // Mood shift for the environment, with a delayed text transition so it stays
      // dark on bright panels and only brightens once the glass has darkened enough.
      const mood = Math.pow(progress, 2.5);
      const textContrastStart = 0.38;
      const textContrastRange = 0.24;
      const textMoodBase = Math.min(
        1,
        Math.max(0, (mood - textContrastStart) / textContrastRange)
      );
      const textMood = Math.pow(textMoodBase, 0.85);
      const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

      const bgVal = lerp(255, 3, mood);
      document.documentElement.style.setProperty("--color-bg", `rgb(${bgVal},${bgVal},${bgVal})`);

      const tR = lerp(26, 232, textMood), tG = lerp(26, 224, textMood), tB = lerp(26, 212, textMood);
      document.documentElement.style.setProperty("--color-text", `rgb(${tR},${tG},${tB})`);

      const panelVal = lerp(255, 6, mood);
      const panelAlpha = 0.55 + mood * 0.23;
      document.documentElement.style.setProperty("--panel-bg", `rgba(${panelVal},${panelVal},${panelVal},${panelAlpha.toFixed(3)})`);

      const borderVal = lerp(255, 156, mood);
      const borderAlpha = 0.35 - mood * 0.24;
      document.documentElement.style.setProperty("--panel-border", `rgba(${borderVal},${borderVal},${borderVal},${borderAlpha.toFixed(3)})`);

      const vignetteInset = lerp(78, 42, mood);
      const vignetteStrength = 0.1 + mood * 0.62;
      document.documentElement.style.setProperty("--vignette-inset", `${vignetteInset}%`);
      document.documentElement.style.setProperty("--vignette-strength", `${vignetteStrength.toFixed(3)}`);

      const washAlpha = 0.45 - mood * 0.4;
      document.documentElement.style.setProperty("--bg-wash", `rgba(255,255,255,${washAlpha.toFixed(3)})`);

      const aR = lerp(139, 201, mood), aG = lerp(94, 169, mood), aB = lerp(42, 110, mood);
      document.documentElement.style.setProperty("--color-accent", `rgb(${aR},${aG},${aB})`);

      document.documentElement.style.setProperty("--mood-overlay", `rgba(0,0,0,${(0.08 + mood * 0.68).toFixed(3)})`);

      if (!isSnapping) {
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const target = getSnapTarget();
          if (Math.abs(window.scrollY - target) < 2) return;
          isSnapping = true;
          window.scrollTo({ top: target, behavior: "smooth" });
          setTimeout(() => { isSnapping = false; }, 800);
        }, 120);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, []);

  return (
    <main>
      <div className="parallax-wrapper">
        <div className="parallax-sticky">
          <div className="bg-layer">
            {panels.map((panel, i) => (
              <div
                key={panel.label}
                ref={(el) => { bgRefs.current[i] = el; }}
                className="bg-image"
                style={{
                  backgroundImage: panel.background ? `url(${panel.background})` : "none",
                  backgroundPosition: panel.bgPosition ?? "center",
                  opacity: i === 0 ? 1 : 0,
                }}
              />
            ))}
          </div>

          <div className="parallax-track" ref={trackRef}>
            {panels.map((panel) => (
              <section key={panel.label} className="parallax-panel">
                <div className="panel-inner">
                  <p className="panel-label">{panel.label}</p>
                  <h2 className="panel-heading">{panel.heading}</h2>
                  <p className="panel-body">{panel.body}</p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <nav className="progress-bar" aria-label="Story progress">
        {panels.map((_, i) => (
          <button
            type="button"
            key={panels[i].label}
            className={`progress-dot${i === activePanel ? " active" : ""}`}
            onClick={() => scrollToPanel(i)}
            aria-label={`Go to panel ${i + 1}`}
          />
        ))}
      </nav>

      <button
        type="button"
        className="chevron chevron-left"
        onClick={() => scrollToPanel(Math.max(0, activePanel - 1))}
        aria-label="Previous panel"
        disabled={activePanel === 0}
      >
        &#8249;
      </button>
      <button
        type="button"
        className="chevron chevron-right"
        onClick={() => scrollToPanel(Math.min(panels.length - 1, activePanel + 1))}
        aria-label="Next panel"
        disabled={activePanel === panels.length - 1}
      >
        &#8250;
      </button>
    </main>
  );
}
