import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import GlyphPortal from '@/components/ui/glyph-portal';

const WORD = 'POP';
const FACE = '"Bricolage Grotesque Variable"';
const FALLBACK = '"Arial Black", Arial, sans-serif';

const reasons = [
  {
    title: 'Executive judgement',
    body: 'We have sat in the leadership seat. We think in terms of P&L, risk and people, not just models and tools.',
  },
  {
    title: 'Strategy and delivery, together',
    body: 'The people who shape the plan are the people who build it. No handoffs, and no decks left on a shelf.',
  },
  {
    title: 'Small by design',
    body: 'You work directly with the two founders, every time. No junior teams learning on your budget.',
  },
];

const headline = 'AI strategy and implementation, led by former executives.';

function BookButton({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      href="#contact"
      className={
        'inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        (inverse
          ? 'bg-white text-ink hover:bg-sun focus-visible:outline-white'
          : 'bg-teal text-white hover:bg-teal-night focus-visible:outline-teal')
      }
    >
      Book a call <ArrowRight aria-hidden="true" className="size-4" />
    </a>
  );
}

/** Static version: server render, no-JS, and the moment before the brand font is ready. */
function StaticHero() {
  return (
    <section className="min-h-[calc(100svh-4rem)] grid place-items-center px-4 py-20 text-center">
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
      (faces) => finish(faces.length ? `${FACE}, ${FALLBACK}` : FALLBACK),
      () => finish(FALLBACK),
    );
    return () => {
      settled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  if (!family) return <StaticHero />;

  return (
    <div data-pop-hero>
      <GlyphPortal
        word={WORD}
        focusChar="O"
        fontFamily={family}
        fontWeight={800}
        interactive={false}
        scrollLength={2.2}
        enterLabel="Scroll to step inside"
        style={{
          '--gp-paper': '#f5faf7',
          '--gp-ink': '#0b2423',
          '--gp-field': '#007a74',
          '--gp-foreground': '#ffffff',
        }}
        background={
          <div
            className="absolute inset-0 bg-brand-gradient"
            style={{ transform: 'scale(var(--gp-field-scale,1))' }}
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
          <h2 className="max-w-3xl text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-bold leading-[1.05] text-white">
            From AI ambition to results your business can see.
          </h2>
          <div className="grid w-full gap-8 md:grid-cols-3 md:gap-12">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-white/35 pt-5">
                <h3 className="text-xl font-semibold text-white">{r.title}</h3>
                <p className="mt-2 max-w-[38ch] text-white">{r.body}</p>
              </div>
            ))}
          </div>
          <BookButton inverse />
        </div>
      </GlyphPortal>
    </div>
  );
}
