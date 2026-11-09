import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import GlyphPortal from "@/components/ui/glyph-portal";
import ParticlesBackground, {
  type ParticlesPalette,
} from "@/components/ui/particles-bg";

const WORD = "POP";
const FACE = '"Bricolage Grotesque Variable"';
const FALLBACK = '"Arial Black", Arial, sans-serif';

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

function BookButton({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      href="#contact"
      className={
        "inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
        (inverse
          ? "bg-ink text-white hover:bg-graphite focus-visible:outline-ink"
          : "bg-teal text-ink hover:bg-white focus-visible:outline-teal")
      }
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
          className="font-display font-extrabold leading-none text-brand-gradient text-[min(38svh,30vw)]"
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
    const timeout = window.setTimeout(() => finish(FALLBACK), 1600);
    document.fonts.load(`800 100px ${FACE}`, WORD).then(
      // Pass only the loaded face. The portal runs document.fonts.check() on every family it is
      // given and goes static if any fails; Safari fails system fonts such as Arial Black (absent on
      // iOS). The portal appends its own Arial Black fallback after that check.
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
          style={{
            "--gp-paper": "transparent",
            "--gp-ink": "#ffffff",
            "--gp-field": "#00c2ae",
            "--gp-foreground": "#161819",
          }}
          background={
            <div
              className="absolute inset-0 bg-brand-gradient"
              style={{ transform: "scale(var(--gp-field-scale,1))" }}
            />
          }
          front={
            <div data-pop-lede>
              <h1>{headline}</h1>
              <BookButton />
            </div>
          }
        >
          <div className="mx-auto w-full max-w-6xl flex flex-col items-start gap-12">
            <h2 className="max-w-3xl text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-bold leading-[1.05] text-ink">
              From AI ambition to results your business can see.
            </h2>
            <div className="grid w-full gap-8 md:grid-cols-3 md:gap-12">
              {reasons.map((r) => (
                <div key={r.title} className="border-t border-ink/25 pt-5">
                  <h3 className="text-xl font-semibold text-ink">{r.title}</h3>
                  <p className="mt-2 max-w-[38ch] text-ink">{r.body}</p>
                </div>
              ))}
            </div>
            <BookButton inverse />
          </div>
        </GlyphPortal>
      ) : (
        <StaticHero />
      )}
    </div>
  );
}
