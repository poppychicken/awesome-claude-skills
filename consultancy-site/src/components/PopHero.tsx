import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import GlyphPortal from "@/components/ui/glyph-portal";
import ParticlesBackground, {
  type ParticlesPalette,
} from "@/components/ui/particles-bg";

const WORD = "POP";
const FACE = '"Bricolage Grotesque Variable"';
const FALLBACK = '"Arial Black", Arial, sans-serif';
/**
 * The "mounir" Axis Blend from 21st.dev (90deg linear: Abyss, Marine, Teal, Reef). It fills the
 * letters, then becomes the backdrop of the panel the zoom opens into. Defined in global.css.
 */
const FIELD_CLASS = "bg-hero-blend";

/**
 * Word height for a visible height H, as large as fits. The word is centred at 46% of H and the
 * top 64px of the scene sits under the site header, so the stack below it (32px gap, headline,
 * button, and on screens at least CUE_MIN_H tall a scroll cue) must end above the fold:
 *   64 + 0.46H + h/2 + 32 + stack + 12 <= H   =>   h <= 1.08H - 2(108 + stack)
 * Stack is ~185px with the cue and ~147px without it. Keep CUE_MIN_H in sync with global.css.
 */
const CUE_MIN_H = 1000;
const wordHeight = (H: number) =>
  Math.min(H * 0.55, Math.max(H * 0.3, 1.08 * H - (H >= CUE_MIN_H ? 586 : 510)));

// Site palette: mostly teal, some aqua, the odd sun spark, on charcoal.
const PARTICLES: ParticlesPalette = {
  particles: ["#00c2ae", "#00c2ae", "#5ff5dc", "#5ff5dc", "#ffd23f"],
  lines: "#00c2ae",
  accent: "#5ff5dc",
};

const reasons = [
  {
    title: "Executive judgement",
    body: "We have sat in the leadership seat. We think in terms of P&L, risk and people, not just models and tools.",
  },
  {
    title: "Strategy and delivery, together",
    body: "The people who shape the plan are the people who build it. No handoffs, and no decks left on a shelf.",
  },
  {
    title: "Small by design",
    body: "You work directly with the two founders, every time. No junior teams learning on your budget.",
  },
];

const headline = "Strategy, AI and digital transformation, led by former executives.";

function BookButton() {
  return (
    <a
      href="#contact"
      className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 font-medium text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      Book a call <ArrowRight aria-hidden="true" className="size-4" />
    </a>
  );
}

/** Static version: server render, no-JS, and the moment before the brand font is ready. */
function StaticHero() {
  return (
    <section data-pop-static className="relative min-h-[calc(100svh-4rem)] grid place-items-center px-4 py-20 text-center text-white">
      <div className="flex flex-col items-center gap-6">
        <p
          aria-hidden="true"
          className="font-display font-extrabold leading-none bg-hero-blend bg-clip-text text-transparent text-[min(50svh,34vw)]"
        >
          {WORD}
        </p>
        <h1 className="max-w-[30ch] text-[clamp(20px,1.2rem+0.9vw,30px)] font-semibold leading-tight">
          {headline}
        </h1>
        <BookButton />
      </div>
    </section>
  );
}

export default function PopHero() {
  const [family, setFamily] = useState<string | null>(null);
  // Once the zoom has filled the screen the particles are hidden, so stop drawing them.
  const [covered, setCovered] = useState(false);
  const coveredRef = useRef(false);
  const onProgress = useCallback((p: number) => {
    const next = p > 0.8;
    if (next !== coveredRef.current) {
      coveredRef.current = next;
      setCovered(next);
    }
  }, []);

  // The portal makes the hero much taller than the static poster, which pushes every section
  // down after the browser has already jumped to a #section link. Re-apply that jump once.
  useEffect(() => {
    if (!family) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [family]);

  useEffect(() => {
    // Glyph Portal measures the font once at mount, so wait for the brand face first.
    let settled = false;
    const finish = (value: string) => {
      if (!settled) {
        settled = true;
        setFamily(value);
      }
    };
    // Pass only the loaded face. The portal runs document.fonts.check() on every family it is
    // given and goes static if any fails; Safari fails system fonts such as Arial Black (absent on
    // iOS). The portal appends its own Arial Black fallback after that check.
    const timeout = window.setTimeout(
      () => finish(document.fonts.check(`800 100px ${FACE}`, WORD) ? FACE : FALLBACK),
      1600,
    );
    document.fonts.load(`800 100px ${FACE}`, WORD).then(
      (faces) => finish(faces.length ? FACE : FALLBACK),
      () => finish(FALLBACK),
    );
    return () => {
      settled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div data-pop-hero className="relative bg-charcoal">
      <div data-pop-particles>
        <ParticlesBackground
          palette={PARTICLES}
          density={110}
          paused={covered}
        />
      </div>
      {family ? (
        <GlyphPortal
          word={WORD}
          focusChar="O"
          fontFamily={family}
          fontWeight={800}
          interactive={false}
          scrollLength={2.2}
          enterLabel="Scroll to step inside"
          onProgress={onProgress}
          wordHeight={wordHeight}
          wordWidth={0.92}
          style={{
            "--gp-paper": "transparent",
            "--gp-ink": "#ffffff",
            // Used as the panel background when motion is off (reduced motion).
            "--gp-field": "#1d1f20",
            "--gp-foreground": "#ffffff",
          }}
          background={
            <div
              className={`absolute inset-0 ${FIELD_CLASS}`}
              style={{ transform: "scale(var(--gp-field-scale,1))" }}
            >
              {/* Lifts the blend's dark Abyss end off the charcoal ground so every letter
                  keeps its edge; fades out as the panel opens. */}
              <div
                className="absolute inset-0 bg-teal"
                style={{ opacity: "calc((1 - var(--gp-reveal, 0)) * 0.3)" }}
              />
              {/* Fades in with the panel text, graded to the blend: none over Abyss/Marine (already
                  8:1+ with white), building to 50% charcoal over Reef. Worst case 5.2:1 for white text. */}
              <div
                className="absolute inset-0"
                style={{
                  opacity: "var(--gp-reveal, 0)",
                  backgroundImage:
                    "linear-gradient(90deg, rgb(18 19 20 / 0) 0%, rgb(18 19 20 / 0) 33%, rgb(18 19 20 / 0.24) 67%, rgb(18 19 20 / 0.5) 100%)",
                }}
              />
            </div>
          }
          front={
            <div data-pop-lede>
              <h1>{headline}</h1>
              <BookButton />
              {/* Visual cue only; the portal's own skip link stays available to keyboard users. */}
              <span data-pop-cue aria-hidden="true">
                Scroll to step inside <ArrowDown className="size-4" />
              </span>
            </div>
          }
        >
          <div className="mx-auto w-full max-w-6xl flex flex-col items-start gap-12">
            <h2 className="max-w-3xl text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-bold leading-[1.05] text-white">
              From AI ambition to results your business can see.
            </h2>
            <div className="grid w-full gap-8 md:grid-cols-3 md:gap-12">
              {reasons.map((r) => (
                <div key={r.title} className="border-t border-white/30 pt-5">
                  <h3 className="text-xl font-semibold text-white">{r.title}</h3>
                  <p className="mt-2 max-w-[38ch] text-white">{r.body}</p>
                </div>
              ))}
            </div>
            <BookButton />
          </div>
        </GlyphPortal>
      ) : (
        <StaticHero />
      )}
    </div>
  );
}
