"use client"

/**
 * FeatureSteps, adapted from a 21st.dev block for Pop Consulting:
 * - plain <img> instead of next/image (this is an Astro site);
 * - lucide Check instead of a text glyph;
 * - steps are buttons: click to jump (and stop auto-advance), hover/focus pauses it;
 * - auto-advance stops off-screen and never runs under prefers-reduced-motion;
 * - optional `points` per feature and an optional `description` under the title;
 * - inactive steps dim by colour rather than opacity, to keep text contrast.
 */
import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  step: string
  title?: string
  content: string
  image: string
  /** Alt text for the image; defaults to the step label. */
  alt?: string
  /** Optional detail shown while this feature is active. */
  points?: string[]
}

interface FeatureStepsProps {
  features: Feature[]
  className?: string
  title?: string
  description?: string
  /** id for the heading, so a wrapping <section> can use aria-labelledby. */
  titleId?: string
  autoPlayInterval?: number
  imageHeight?: string
}

const TICK = 100

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  description,
  titleId,
  autoPlayInterval = 3000,
  imageHeight = "lg:h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  const autoPlaying = !stopped && !hovering && onScreen && !reduceMotion

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!autoPlaying) return
    const step = 100 / (autoPlayInterval / TICK)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step < 100) return prev + step
        setCurrentFeature((f) => (f + 1) % features.length)
        return 0
      })
    }, TICK)
    return () => clearInterval(timer)
  }, [autoPlaying, autoPlayInterval, features.length])

  const select = (index: number) => {
    setCurrentFeature(index)
    setProgress(0)
    setStopped(true) // the visitor has taken over
  }

  const active = features[currentFeature]

  return (
    <div
      ref={rootRef}
      className={cn("p-8 md:p-12", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false)
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-10 max-w-2xl md:mb-14">
          <h2 id={titleId} className="text-5xl font-bold sm:text-6xl">
            {title}
          </h2>
          {description && <p className="mt-5 text-lg text-muted-foreground">{description}</p>}
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12">
          <ol className="order-2 md:order-1 space-y-3">
            {features.map((feature, index) => {
              const isActive = index === currentFeature
              return (
                <li key={feature.step}>
                  <button
                    type="button"
                    onClick={() => select(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full items-start gap-5 rounded-2xl p-3 text-left transition-colors hover:bg-muted md:gap-6 md:p-4"
                  >
                    <span
                      className={cn(
                        "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-300 md:size-10",
                        isActive
                          ? "scale-110 border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground bg-muted text-foreground",
                      )}
                    >
                      {index <= currentFeature ? (
                        <Check aria-hidden="true" className="size-5" strokeWidth={2.75} />
                      ) : (
                        <span className="font-display text-lg font-semibold">{index + 1}</span>
                      )}
                    </span>

                    <span className="flex-1">
                      {/* Inactive steps dim by colour, not opacity, so their text keeps 4.5:1. */}
                      <span
                        className={cn(
                          "block font-display text-2xl font-bold transition-colors duration-500 md:text-3xl",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {feature.title || feature.step}
                      </span>
                      <span className="mt-1 block text-base text-muted-foreground md:text-lg">
                        {feature.content}
                      </span>
                      {/* Countdown to the next step while auto-advancing. */}
                      {isActive && autoPlaying && (
                        <span aria-hidden="true" className="mt-4 block h-0.5 w-full overflow-hidden rounded-full bg-border">
                          <span
                            className="block h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                          />
                        </span>
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && feature.points?.length ? (
                      <motion.ul
                        key="points"
                        className="grid gap-2.5 overflow-hidden pt-1 pb-3 pl-[4.25rem] pr-3 sm:grid-cols-2 sm:gap-x-6 md:pl-[5rem]"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        {feature.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5">
                            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-ink" strokeWidth={2.5} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </li>
              )
            })}
          </ol>

          <div
            className={cn(
              "order-1 md:order-2 relative h-[220px] sm:h-[300px] md:h-[360px] overflow-hidden rounded-3xl md:sticky md:top-24",
              imageHeight,
            )}
            style={{ perspective: 1200 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                className="absolute inset-0 overflow-hidden rounded-3xl"
                initial={reduceMotion ? { opacity: 0 } : { y: 100, opacity: 0, rotateX: -20 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, rotateX: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { y: -100, opacity: 0, rotateX: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <img
                  src={active.image}
                  alt={active.alt ?? active.step}
                  className="h-full w-full object-cover"
                  width={1400}
                  height={933}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
