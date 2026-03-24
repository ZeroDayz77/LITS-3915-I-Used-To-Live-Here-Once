"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const panels = [
  {
    label: "I",
    heading: "The River",
    body: "I remember these stones, the rounded unsteady stone, the pointed one, the flat one where I could look around, and the dangerous one, slippery even when it looked dry...",
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
    body: '"I used to live here once..." I said as I got closer, still to no response. I moved in closer, instinctively I tried to reach out to them...',
    background: "/mango-tree-raw-green-mangoes-reaching-out.png",
    bgPosition: "bottom center",
  },
  {
    label: "VII",
    heading: "The Gaze",
    body: "The boy then turned to look at me, his grey eyes stared into mine. However his experssion didnt change. \"Hasn't it gone cold all of a sudden...\", he remarked to the girl. She agreed and they both left...",
    background: "/vector-silhouette-boy-white-bac.png",
    shakeIntensity: 1,
  },
  {
    label: "VIII",
    heading: "The Silence",
    body: "My arms feel back to my side as I watched them run across the gress to the house. That was when I understood...",
    background: "",
  },
];

const clampShakeIntensity = (value: number | undefined) =>
  Math.min(10, Math.max(0, value ?? 0));

const randomShakeTarget = (intensity: number) => {
  const maxDisplacementPx = intensity * 2.2;
  const angle = Math.random() * Math.PI * 2;
  const radius = maxDisplacementPx * (0.45 + Math.random() * 0.55);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

const shakeStepDurationMs = (intensity: number) => {
  const t = intensity / 10;
  return Math.round(420 - t * 320);
};

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgVisualRef = useRef<{ opacity: number; scale: number }[]>(
    panels.map((_, i) => ({ opacity: i === 0 ? 1 : 0, scale: 1 }))
  );
  const shakeOffsetsRef = useRef<{ x: number; y: number }[]>([]);
  const shakeStateRef = useRef<
    {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      startTime: number;
      durationMs: number;
      returningToCenter: boolean;
    }[]
  >([]);
  const shakeRafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activePanel, setActivePanel] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const IDLE_TIMEOUT_MS = 1000;
  const AUTO_ADVANCE_MS = 7000;

  const applyBackgroundTransform = useCallback((index: number) => {
    const bg = bgRefs.current[index];
    if (!bg) return;

    const visual = bgVisualRef.current[index] ?? { opacity: 0, scale: 1 };
    const shake = shakeOffsetsRef.current[index] ?? { x: 0, y: 0 };
    const weightedX = shake.x * visual.opacity;
    const weightedY = shake.y * visual.opacity;

    bg.style.opacity = String(visual.opacity);
    bg.style.transform = `translate3d(${weightedX.toFixed(2)}px, ${weightedY.toFixed(2)}px, 0) scale(${visual.scale.toFixed(4)})`;
  }, []);

  useEffect(() => {
    const supportsScrollRestoration = typeof window !== "undefined" && "scrollRestoration" in window.history;
    const previousScrollRestoration = supportsScrollRestoration ? window.history.scrollRestoration : null;

    if (supportsScrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    // Force a fresh start at panel 1 even after hard refresh.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      if (supportsScrollRestoration && previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = showIntro ? "hidden" : "";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showIntro]);

  useEffect(() => {
    shakeOffsetsRef.current = panels.map(() => ({ x: 0, y: 0 }));
    shakeStateRef.current = panels.map(() => ({
      fromX: 0,
      fromY: 0,
      toX: 0,
      toY: 0,
      startTime: performance.now(),
      durationMs: 220,
      returningToCenter: false,
    }));

    const lerpNum = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

    const tick = (now: number) => {
      for (let i = 0; i < panels.length; i++) {
        const intensity = clampShakeIntensity(panels[i].shakeIntensity);

        if (intensity <= 0) {
          shakeOffsetsRef.current[i] = { x: 0, y: 0 };
          applyBackgroundTransform(i);
          continue;
        }

        const current = shakeStateRef.current[i];
        const elapsed = now - current.startTime;
        const progress = Math.min(1, elapsed / current.durationMs);
        const eased = easeInOutQuad(progress);

        const x = lerpNum(current.fromX, current.toX, eased);
        const y = lerpNum(current.fromY, current.toY, eased);
        shakeOffsetsRef.current[i] = { x, y };
        applyBackgroundTransform(i);

        if (progress >= 1) {
          const returning = !current.returningToCenter;
          const target = returning ? { x: 0, y: 0 } : randomShakeTarget(intensity);

          shakeStateRef.current[i] = {
            fromX: x,
            fromY: y,
            toX: target.x,
            toY: target.y,
            startTime: now,
            durationMs: shakeStepDurationMs(intensity),
            returningToCenter: returning,
          };
        }
      }

      shakeRafRef.current = requestAnimationFrame(tick);
    };

    shakeRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (shakeRafRef.current !== null) {
        cancelAnimationFrame(shakeRafRef.current);
      }
    };
  }, [applyBackgroundTransform]);

  const scrollToPanel = useCallback((index: number) => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const panelHeight = maxScroll / (panels.length - 1);
    window.scrollTo({ top: index * panelHeight, behavior: "smooth" });
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (!idleTimerRef.current) return;
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const clearAutoPlayTimer = useCallback(() => {
    if (!autoPlayTimerRef.current) return;
    clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = null;
  }, []);

  const stopAutoPlay = useCallback(
    (disableUntilResume: boolean) => {
      clearAutoPlayTimer();
      setIsAutoPlaying(false);
      if (disableUntilResume) {
        setAutoPlayEnabled(false);
      }
    },
    [clearAutoPlayTimer]
  );

  const startAutoPlay = useCallback(
    (force = false) => {
      if (showIntro || (!autoPlayEnabled && !force)) return;

      clearAutoPlayTimer();
      setIsAutoPlaying(true);

      autoPlayTimerRef.current = setInterval(() => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;

        const panelHeight = maxScroll / (panels.length - 1);
        const currentIndex = Math.round(window.scrollY / panelHeight);

        if (currentIndex >= panels.length - 1) {
          stopAutoPlay(false);
          return;
        }

        scrollToPanel(currentIndex + 1);
      }, AUTO_ADVANCE_MS);
    },
    [autoPlayEnabled, clearAutoPlayTimer, scrollToPanel, showIntro, stopAutoPlay]
  );

  const scheduleIdleAutoplay = useCallback(() => {
    if (showIntro || !autoPlayEnabled) return;

    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      startAutoPlay();
    }, IDLE_TIMEOUT_MS);
  }, [autoPlayEnabled, clearIdleTimer, showIntro, startAutoPlay]);

  const handleManualNavigation = useCallback(
    (index: number) => {
      clearIdleTimer();
      stopAutoPlay(true);
      scrollToPanel(index);
    },
    [clearIdleTimer, scrollToPanel, stopAutoPlay]
  );

  const handleAutoPlayButtonClick = useCallback(() => {
    clearIdleTimer();

    if (isAutoPlaying) {
      stopAutoPlay(true);
      return;
    }

    setAutoPlayEnabled(true);
    startAutoPlay(true);
  }, [clearIdleTimer, isAutoPlaying, startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    if (showIntro) {
      clearIdleTimer();
      stopAutoPlay(false);
      return;
    }

    if (!autoPlayEnabled) {
      clearIdleTimer();
      return;
    }

    scheduleIdleAutoplay();

    const handleUserInteraction = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-manual-control='true']")) {
        return;
      }

      clearIdleTimer();
      stopAutoPlay(true);
    };

    window.addEventListener("pointerdown", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      clearIdleTimer();
    };
  }, [autoPlayEnabled, clearIdleTimer, scheduleIdleAutoplay, showIntro, stopAutoPlay]);

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

      const panelIndex = Math.min(Math.round(progress * (panels.length - 1)), panels.length - 1);
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

        bgVisualRef.current[i] = { opacity, scale };
        applyBackgroundTransform(i);
      });

      // Mood shift for the environment, with a delayed text transition so it stays
      // dark on bright panels and only brightens once the glass has darkened enough.
      const mood = Math.min(1, progress ** 1.25 + progress * 0.08);
      const textContrastStart = 0.22;
      const textContrastRange = 0.17;
      const textMoodBase = Math.min(1, Math.max(0, (mood - textContrastStart) / textContrastRange));
      const textMood = textMoodBase ** 0.85;
      const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

      const bgVal = lerp(255, 0, mood);
      document.documentElement.style.setProperty("--color-bg", `rgb(${bgVal},${bgVal},${bgVal})`);

      const tR = lerp(26, 232, textMood);
      const tG = lerp(26, 224, textMood);
      const tB = lerp(26, 212, textMood);
      document.documentElement.style.setProperty("--color-text", `rgb(${tR},${tG},${tB})`);

      const panelVal = lerp(255, 2, mood);
      const panelAlpha = 0.58 + mood * 0.3;
      document.documentElement.style.setProperty("--panel-bg", `rgba(${panelVal},${panelVal},${panelVal},${panelAlpha.toFixed(3)})`);

      const borderVal = lerp(255, 126, mood);
      const borderAlpha = 0.33 - mood * 0.25;
      document.documentElement.style.setProperty("--panel-border", `rgba(${borderVal},${borderVal},${borderVal},${borderAlpha.toFixed(3)})`);

      const vignetteInset = lerp(78, 36, mood);
      const vignetteStrength = 0.16 + mood * 0.74;
      document.documentElement.style.setProperty("--vignette-inset", `${vignetteInset}%`);
      document.documentElement.style.setProperty("--vignette-strength", `${vignetteStrength.toFixed(3)}`);

      const washAlpha = 0.42 - mood * 0.41;
      document.documentElement.style.setProperty("--bg-wash", `rgba(255,255,255,${washAlpha.toFixed(3)})`);

      const aR = lerp(139, 201, mood);
      const aG = lerp(94, 169, mood);
      const aB = lerp(42, 110, mood);
      document.documentElement.style.setProperty("--color-accent", `rgb(${aR},${aG},${aB})`);

      document.documentElement.style.setProperty("--mood-overlay", `rgba(0,0,0,${(0.18 + mood * 0.8).toFixed(3)})`);

      if (!isSnapping) {
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const target = getSnapTarget();
          if (Math.abs(window.scrollY - target) < 2) return;
          isSnapping = true;
          window.scrollTo({ top: target, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, 800);
        }, 120);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, [applyBackgroundTransform]);

  useEffect(() => {
    return () => {
      clearIdleTimer();
      clearAutoPlayTimer();
    };
  }, [clearAutoPlayTimer, clearIdleTimer]);

  return (
    <main>
      {showIntro && (
        <div className="intro-overlay" aria-hidden="true">
          <h1 className="intro-title">I Used To Live Here Once</h1>
        </div>
      )}

      <div className={`story-shell${showIntro ? "" : " intro-complete"}`}>
        <div className="parallax-wrapper">
          <div className="parallax-sticky">
            <div className="bg-layer">
              {panels.map((panel, i) => (
                <div
                  key={panel.label}
                  ref={(el) => {
                    bgRefs.current[i] = el;
                  }}
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
              onClick={() => handleManualNavigation(i)}
              aria-label={`Go to panel ${i + 1}`}
              data-manual-control="true"
            />
          ))}
        </nav>

        <button
          type="button"
          className="autoplay-toggle autoplay-toggle-left"
          onClick={handleAutoPlayButtonClick}
          aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          data-manual-control="true"
        >
          {isAutoPlaying ? "Pause Auto Play" : "Resume Auto Play"}
        </button>

        <button
          type="button"
          className="chevron chevron-left"
          onClick={() => handleManualNavigation(Math.max(0, activePanel - 1))}
          aria-label="Previous panel"
          disabled={activePanel === 0}
          data-manual-control="true"
        >
          &#8249;
        </button>

        <button
          type="button"
          className="chevron chevron-right"
          onClick={() => handleManualNavigation(Math.min(panels.length - 1, activePanel + 1))}
          aria-label="Next panel"
          disabled={activePanel === panels.length - 1}
          data-manual-control="true"
        >
          &#8250;
        </button>

        {activePanel === panels.length - 1 && (
          <button
            type="button"
            className="restart-panel-button"
            onClick={() => handleManualNavigation(0)}
            aria-label="Return to first panel"
            data-manual-control="true"
          >
            Back To First Panel
          </button>
        )}
      </div>
    </main>
  );
}
