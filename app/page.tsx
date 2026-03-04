"use client";

import { useEffect, useRef, useState } from "react";

const panels = [
  {
    label: "I",
    heading: "The Road",
    body: "She stood at the top of the road that had always been there — the familiar stones, the familiar sky.",
  },
  {
    label: "II",
    heading: "The Stepping Stones",
    body: "The river was low. She crossed it stone by stone, the way she had done a hundred times before.",
  },
  {
    label: "III",
    heading: "The House",
    body: "The house was unchanged. Or almost unchanged. She walked toward it across the grass.",
  },
  {
    label: "IV",
    heading: "The Children",
    body: "Two children played near the veranda. She called out to them, but they did not hear.",
  },
  {
    label: "V",
    heading: "The Silence",
    body: "They turned and ran inside. The sky above her was cold and far away.",
  },
];

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = scrollTop / maxScroll;
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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      <div className="parallax-wrapper">
        <div className="parallax-sticky">
          <div className="parallax-track" ref={trackRef}>
            {panels.map((panel, i) => (
              <section key={i} className="parallax-panel">
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
          <span
            key={i}
            className={`progress-dot${i === activePanel ? " active" : ""}`}
          />
        ))}
      </nav>
    </main>
  );
}
