"use client";

/**
 * Particles background, adapted from a 21st.dev component for Pop Consulting:
 * - particles.js (MIT) is self-hosted in public/vendor instead of loaded from a CDN;
 * - colours come from props (the site has no dark mode to detect);
 * - it fills its positioned parent instead of a fixed h-screen;
 * - it pauses when off-screen and holds still under prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";

export type ParticlesPalette = {
  /** One colour, or several picked at random per particle. */
  particles: string | string[];
  lines: string;
  accent: string;
};

export type ParticlesProps = {
  palette?: ParticlesPalette;
  className?: string;
  /** Particles per 800×800 CSS px; particles.js scales this to the canvas area. */
  density?: number;
  /** Stop animating while true, e.g. when something opaque covers the layer. */
  paused?: boolean;
  id?: string;
};

type PJSInstance = { pJS: { fn: { vendors: { destroypJS: () => void } } } };
type PJSWindow = Window & {
  particlesJS?: (id: string, params: unknown) => void;
  pJSDom?: PJSInstance[] | null;
};

// particles.js uses arguments.callee, which ES modules (strict mode) forbid, so it
// can't be bundled. It is vendored in public/vendor and loaded as a classic script.
const SCRIPT_SRC = "/vendor/particles-2.0.0.min.js";
let scriptLoad: Promise<void> | undefined;
function loadParticlesScript(): Promise<void> {
  if ((window as PJSWindow).particlesJS) return Promise.resolve();
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = undefined;
      script.remove();
      reject(new Error(`Could not load ${SCRIPT_SRC}`));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

const DEFAULT_PALETTE: ParticlesPalette = {
  particles: "#00f5ff",
  lines: "#00d9ff",
  accent: "#0096c7",
};

export default function ParticlesComponent({
  palette = DEFAULT_PALETTE,
  className,
  density = 140,
  paused = false,
  id = "particles-js",
}: ParticlesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<() => void>(() => {});
  // Re-run only when the palette's values change, not on every new object.
  const paletteKey = JSON.stringify(palette);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = window as PJSWindow;
    const colors: ParticlesPalette = JSON.parse(paletteKey);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = false;
    let cancelled = false;
    let visible = false;

    const destroy = () => {
      el.querySelector("canvas")?.remove();
      if (w.pJSDom?.length) w.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
      // destroypJS nulls the global list; particlesJS needs an array to push into.
      w.pJSDom = [];
      running = false;
    };

    const start = () => {
      if (running || cancelled || !w.particlesJS) return;
      destroy();
      const moving = !still.matches;
      w.particlesJS(id, {
        particles: {
          number: { value: density, density: { enable: true, value_area: 800 } },
          color: { value: colors.particles },
          shape: { type: "circle", stroke: { width: 0.5, color: colors.accent } },
          opacity: {
            value: 0.7,
            random: true,
            anim: { enable: moving, speed: 1, opacity_min: 0.3 },
          },
          size: {
            value: 3,
            random: true,
            anim: { enable: moving, speed: 2, size_min: 1 },
          },
          line_linked: {
            enable: true,
            distance: 160,
            color: colors.lines,
            opacity: 0.4,
            width: 1.2,
          },
          move: { enable: moving, speed: 2, random: true, out_mode: "bounce" },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: moving, mode: "grab" },
            onclick: { enable: moving, mode: "push" },
            resize: true,
          },
          modes: {
            grab: { distance: 220, line_linked: { opacity: 0.8 } },
            push: { particles_nb: 4 },
            repulse: { distance: 180, duration: 0.4 },
          },
        },
        retina_detect: true,
      });
      running = true;
    };

    // Animate only while the layer is on screen and not paused by the parent.
    const sync = () => {
      if (visible && !pausedRef.current) start();
      else if (running) destroy();
    };
    syncRef.current = sync;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });

    const restart = () => {
      destroy();
      sync();
    };

    loadParticlesScript().then(
      () => {
        if (cancelled) return;
        visibility.observe(el);
        still.addEventListener("change", restart);
      },
      () => {
        // The static background stays; nothing else depends on the particles.
      },
    );

    return () => {
      cancelled = true;
      visibility.disconnect();
      still.removeEventListener("change", restart);
      syncRef.current = () => {};
      destroy();
    };
  }, [paletteKey, density, id]);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current();
  }, [paused]);

  return (
    <div
      ref={ref}
      id={id}
      aria-hidden="true"
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  );
}
