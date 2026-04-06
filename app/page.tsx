"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { Howl, Howler } from "howler";

type StoryPanel = {
  label: string;
  heading: string;
  body: string;
  background: string;
  bgPosition?: string;
  shakeIntensity?: number;
  ambientSound?: string;
  ambientReverb?: number;
};

const panels: StoryPanel[] = [
  {
    label: "I",
    heading: "The River",
    body: "I remember these stones, the rounded unsteady stone, the pointed one, the flat one where I could look around, and the dangerous one, slippery even when it looked dry...",
    background: "/Stepping_stones,_Hebden,_bench.jpg",
    ambientSound: "/sounds/river-sound-effect.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "II",
    heading: "The Road",
    body: "The road is wider now, it looks carelessly done. Yet even with these felled trees and trampled bushes, walking here always makes me happy...",
    background: "/road.png",
    ambientSound: "/sounds/old-road-with-felled-trees.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "III",
    heading: "The Sky",
    body: "I don't remember the sky looking this way, I can't think of any other word to describe it other than... Glassy...",
    background: "/sky.png",
    ambientSound: "/sounds/light-breeze-glassy-sky.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "IV",
    heading: "The House",
    body: "Things have changed, the screw pine is gone, so too is the ajoupa. The clove tree and lawn are just as I remember. Now there's a house in all white, it's strange to see a car in the yard...",
    background: "/Old-white-house.png",
    ambientSound: "/sounds/the-house.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "V",
    heading: "The Children",
    body: "There are two children under the big mango tree, a boy and a little girl. I wave and call out to them, but they aren't responding. I'll try to walk towards them...",
    background: "/mango-tree-raw-green-mangoes-han.png",
    bgPosition: "bottom center",
    ambientSound: "/sounds/children-by-the-mango-tree.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "VI",
    heading: "The Moment",
    body: '"I used to live here once..." I say as I get closer, still to no response. I move in closer and instinctively reach out to them...',
    background: "/mango-tree-raw-green-mangoes-reaching-out.png",
    bgPosition: "bottom center",
    ambientSound: "/sounds/children-by-the-mango-tree.mp3",
    ambientReverb: 0.30,
  },
  {
    label: "VII",
    heading: "The Gaze",
    body: "The boy turns to look at me, his grey eyes staring into mine. However, his expression doesn't change. \"Hasn't it gone cold all of a sudden...\", he remarks to the girl. She agrees, and they both leave...",
    background: "/vector-silhouette-boy-white-bac.png",
    shakeIntensity: 1,
    ambientSound: "/sounds/eerie-background.mp3",
    ambientReverb: 0.15,
  },
  {
    label: "VIII",
    heading: "The Silence",
    body: "My arms fall back to my sides as I watch them run across the grass to the house. I think... no. I understand now...",
    background: "",
    ambientSound: "/sounds/silence.mp3",
    ambientReverb: 0.15,
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

const InteractionIcon = () => (
  <span className="interaction-icon" aria-hidden="true">
    <svg
      className="interaction-icon-svg"
      viewBox="0 0 24 24"
      role="img"
      focusable="false"
      aria-hidden="true"
    >
      <path
        d="M4 10.2L12 4l8 6.2V20h-5.2v-6.1H9.2V20H4v-9.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

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
  const ambientHowlRef = useRef<Howl | null>(null);
  const activeAmbientSrcRef = useRef<string | null>(null);
  const fadingAmbientHowlRef = useRef<Howl | null>(null);
  const fadingAmbientTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activePanel, setActivePanel] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isHouseCrossfadeActive, setIsHouseCrossfadeActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [audioUnlockNonce, setAudioUnlockNonce] = useState(0);

  const reverbNodesRef = useRef<{
    dryGain: GainNode;
    wetGain: GainNode;
    initialized: boolean;
  } | null>(null);

  const [playTreeSoundSoft] = useSound("/sounds/woman-saying-hey.mp3", {
    volume: 0.28,
    interrupt: true,
  });

  const [playTreeSoundLoud] = useSound("/sounds/woman-saying-hey.mp3", {
    volume: 0.72,
    interrupt: true,
  });

  const [playPageTurnOne] = useSound("/sounds/page-turn-1.mp3", {
    volume: 0.10,
    interrupt: true,
  });

  const [playPageTurnTwo] = useSound("/sounds/page-turn-2.mp3", {
    volume: 0.10,
    interrupt: true,
  });

  const playRandomPageTurnSound = useCallback(() => {
    if (Math.random() < 0.5) {
      playPageTurnOne();
      return;
    }

    playPageTurnTwo();
  }, [playPageTurnOne, playPageTurnTwo]);

  const setupReverbRouting = useCallback(() => {
    if (typeof window === "undefined") return;
    if (reverbNodesRef.current?.initialized) return;

    const ctx = Howler.ctx;
    const masterGain = Howler.masterGain;
    if (!ctx || !masterGain) return;

    const createImpulse = (durationSec: number, decay: number) => {
      const sampleRate = ctx.sampleRate;
      const length = Math.max(1, Math.floor(sampleRate * durationSec));
      const impulse = ctx.createBuffer(2, length, sampleRate);

      for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const fade = (1 - t) ** decay;
          channelData[i] = (Math.random() * 2 - 1) * fade;
        }
      }

      return impulse;
    };

    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const convolver = ctx.createConvolver();

    convolver.buffer = createImpulse(1.25, 2.5);
    dryGain.gain.value = 1;
    wetGain.gain.value = 0;

    masterGain.disconnect();
    masterGain.connect(dryGain);
    masterGain.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    reverbNodesRef.current = {
      dryGain,
      wetGain,
      initialized: true,
    };
  }, []);

  const setReverbMix = useCallback((wet: number, dry = 1) => {
    setupReverbRouting();
    if (!reverbNodesRef.current) return;

    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
    const now = Howler.ctx?.currentTime ?? 0;
    const rampTime = 0.05;

    const nextWet = clamp01(wet);
    const nextDry = clamp01(dry);

    reverbNodesRef.current.wetGain.gain.cancelScheduledValues(now);
    reverbNodesRef.current.dryGain.gain.cancelScheduledValues(now);
    reverbNodesRef.current.wetGain.gain.setValueAtTime(reverbNodesRef.current.wetGain.gain.value, now);
    reverbNodesRef.current.dryGain.gain.setValueAtTime(reverbNodesRef.current.dryGain.gain.value, now);
    reverbNodesRef.current.wetGain.gain.linearRampToValueAtTime(nextWet, now + rampTime);
    reverbNodesRef.current.dryGain.gain.linearRampToValueAtTime(nextDry, now + rampTime);
  }, [setupReverbRouting]);

  const clamp01 = useCallback((value: number) => Math.min(1, Math.max(0, value)), []);
  const AMBIENT_CROSSFADE_MS = 900;
  const AMBIENT_FIXED_VOLUME = 0.013;
  const PANEL_FOUR_INTERACTION_SOUND = "/sounds/the-ajoupa.mp3";

  const stopFadingAmbientSound = useCallback(() => {
    if (fadingAmbientTimeoutRef.current) {
      clearTimeout(fadingAmbientTimeoutRef.current);
      fadingAmbientTimeoutRef.current = null;
    }

    if (!fadingAmbientHowlRef.current) return;
    fadingAmbientHowlRef.current.stop();
    fadingAmbientHowlRef.current.unload();
    fadingAmbientHowlRef.current = null;
  }, []);

  const queueAmbientFadeOutAndDispose = useCallback(
    (howl: Howl) => {
      stopFadingAmbientSound();

      const startVolume = howl.volume();
      howl.fade(startVolume, 0, AMBIENT_CROSSFADE_MS);
      fadingAmbientHowlRef.current = howl;
      fadingAmbientTimeoutRef.current = setTimeout(() => {
        if (!fadingAmbientHowlRef.current) return;
        fadingAmbientHowlRef.current.stop();
        fadingAmbientHowlRef.current.unload();
        fadingAmbientHowlRef.current = null;
        fadingAmbientTimeoutRef.current = null;
      }, AMBIENT_CROSSFADE_MS + 60);
    },
    [stopFadingAmbientSound]
  );

  const stopAmbientSound = useCallback(() => {
    if (!ambientHowlRef.current) return;

    ambientHowlRef.current.stop();
    ambientHowlRef.current.unload();
    ambientHowlRef.current = null;
    activeAmbientSrcRef.current = null;
    stopFadingAmbientSound();
  }, [stopFadingAmbientSound]);

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

        playRandomPageTurnSound();
        scrollToPanel(currentIndex + 1);
      }, AUTO_ADVANCE_MS);
    },
    [autoPlayEnabled, clearAutoPlayTimer, playRandomPageTurnSound, scrollToPanel, showIntro, stopAutoPlay]
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

      if (index !== activePanel) {
        playRandomPageTurnSound();
      }

      scrollToPanel(index);
    },
    [activePanel, clearIdleTimer, playRandomPageTurnSound, scrollToPanel, stopAutoPlay]
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

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleTreeHitboxClick = useCallback(
    (panelIndex: number) => {
      if (panelIndex === 4) {
        setReverbMix(0.22, 0.95);
        playTreeSoundSoft();
        return;
      }

      if (panelIndex === 5) {
        setReverbMix(0.5, 0.85);
        playTreeSoundLoud();
      }
    },
    [playTreeSoundLoud, playTreeSoundSoft, setReverbMix]
  );

  const handleHouseHoverEnter = useCallback(() => {
    setIsHouseCrossfadeActive(true);
  }, []);

  const handleHouseTap = useCallback(() => {
    // Touch devices do not have hover, so tapping should explicitly reveal panel 4's overlay.
    setIsHouseCrossfadeActive(true);
  }, []);

  const handleHouseHoverLeave = useCallback(() => {
    setIsHouseCrossfadeActive(false);
  }, []);

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
    Howler.mute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (showIntro) return;

    if (Howler.ctx?.state !== "suspended") {
      setIsAudioUnlocked(true);
    }

    const unlockAudio = () => {
      if (Howler.ctx?.state === "suspended") {
        void Howler.ctx.resume().then(() => {
          setIsAudioUnlocked(true);
        });
      } else {
        setIsAudioUnlocked(true);
      }

      // Force ambient effect to retry playback after the browser unlock gesture.
      setAudioUnlockNonce((prev) => prev + 1);
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) return;
    void audioUnlockNonce;

    const currentAmbient = ambientHowlRef.current;
    if (!currentAmbient || currentAmbient.playing()) return;

    if (Howler.ctx?.state === "suspended") {
      void Howler.ctx.resume();
    }

    currentAmbient.play();
  }, [audioUnlockNonce, showIntro]);

  useEffect(() => {
    if (showIntro) {
      stopAmbientSound();
      return;
    }

    const panel = panels[activePanel];
    const usePanelFourInteractionSound = activePanel === 3 && isHouseCrossfadeActive;
    const ambientSrc = usePanelFourInteractionSound
      ? PANEL_FOUR_INTERACTION_SOUND
      : panel.ambientSound;
    const ambientVolume = AMBIENT_FIXED_VOLUME;
    const ambientReverb = clamp01(panel.ambientReverb ?? 0);
    const currentAmbient = ambientHowlRef.current;
    const currentAmbientSrc = activeAmbientSrcRef.current;

    setReverbMix(ambientReverb, 1);

    if (!ambientSrc) {
      if (!currentAmbient) return;

      queueAmbientFadeOutAndDispose(currentAmbient);

      ambientHowlRef.current = null;
      activeAmbientSrcRef.current = null;
      return;
    }

    if (currentAmbient && currentAmbientSrc === ambientSrc) {
      currentAmbient.fade(currentAmbient.volume(), ambientVolume, 260);
      if (!currentAmbient.playing()) {
        currentAmbient.play();
      }
      return;
    }

    stopFadingAmbientSound();

    const incomingHowl = new Howl({
      src: [ambientSrc],
      loop: true,
      volume: 0,
      html5: false,
      onplayerror: () => {
        incomingHowl.once("unlock", () => {
          incomingHowl.play();
          incomingHowl.fade(0, ambientVolume, AMBIENT_CROSSFADE_MS);
        });
      },
    });

    if (Howler.ctx?.state === "suspended") {
      void Howler.ctx.resume();
    }

    incomingHowl.play();
    incomingHowl.fade(0, ambientVolume, AMBIENT_CROSSFADE_MS);

    if (currentAmbient) {
      queueAmbientFadeOutAndDispose(currentAmbient);
    }

    ambientHowlRef.current = incomingHowl;
    activeAmbientSrcRef.current = ambientSrc;
  }, [
    activePanel,
    clamp01,
    isHouseCrossfadeActive,
    queueAmbientFadeOutAndDispose,
    setReverbMix,
    showIntro,
    stopAmbientSound,
    stopFadingAmbientSound,
  ]);

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
      stopAmbientSound();
    };
  }, [clearAutoPlayTimer, clearIdleTimer, stopAmbientSound]);

  return (
    <main>
      {showIntro && (
        <div className="intro-overlay" aria-hidden="true">
          <div className="intro-content">
            <h1 className="intro-title">I Used To Live Here Once</h1>
            <div className="intro-interaction-hint">
              <p className="intro-interaction-hint-text">
                When you see this icon on a panel, you can interact with some parts of the image by clicking/tapping or
                hovering.
              </p>
              <div className="intro-interaction-hint-icon-row">
                <InteractionIcon />
              </div>
            </div>
          </div>
          {!isAudioUnlocked && (
            <>
              <p className="intro-sound-hint">Tap To Enable Sound</p>
              <p className="intro-headphone-hint">Headphones recommended for the best experience</p>
            </>
          )}
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
              <div
                className={`house-crossfade-layer${isHouseCrossfadeActive && activePanel === 3 ? " active" : ""}`}
                style={{ backgroundImage: "url('/ajoupa-house.png')" }}
                aria-hidden="true"
              />
            </div>

            <div className="parallax-track" ref={trackRef}>
              {panels.map((panel, panelIndex) => (
                <section key={panel.label} className="parallax-panel">
                  {panelIndex === 3 && (
                    <button
                      type="button"
                      className="house-hitbox"
                      onClick={handleHouseTap}
                      onPointerEnter={handleHouseHoverEnter}
                      onPointerLeave={handleHouseHoverLeave}
                      onFocus={handleHouseHoverEnter}
                      onBlur={handleHouseHoverLeave}
                      aria-label="Reveal the ajoupa"
                      data-manual-control="true"
                    />
                  )}
                  {(panelIndex === 4 || panelIndex === 5) && (
                    <button
                      type="button"
                      className="tree-hitbox"
                      onClick={() => handleTreeHitboxClick(panelIndex)}
                      aria-label={panelIndex === 4 ? "Play soft tree sound" : "Play loud tree sound"}
                      data-manual-control="true"
                    />
                  )}
                  <div className="panel-card-wrap">
                    {(panelIndex === 3 || panelIndex === 4 || panelIndex === 5) && (
                      <div className="panel-interaction-marker" aria-hidden="true">
                        <InteractionIcon />
                      </div>
                    )}
                    <div className="panel-inner">
                      <p className="panel-label">{panel.label}</p>
                      <h2 className="panel-heading">{panel.heading}</h2>
                      <p className="panel-body">{panel.body}</p>
                    </div>
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
          className="autoplay-toggle autoplay-toggle-left mute-toggle-left"
          onClick={handleMuteToggle}
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          data-manual-control="true"
        >
          {isMuted ? "Unmute Sound" : "Mute Sound"}
        </button>

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
