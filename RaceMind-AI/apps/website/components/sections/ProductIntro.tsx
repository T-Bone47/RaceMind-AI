"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const INTRO_CARDS = [
  {
    title: "Live Telemetry Analysis",
    description: "Monitor real-time data from F1 games. Throttle, braking, tyre temps, and wear delta compared to your benchmark.",
    image: "/features/telemetry.png",
    accent: "electric", // Cyan
  },
  {
    title: "AI Strategy Caller",
    description: "Calculates optimal pit windows, undercuts, and overcuts on the fly based on traffic, tyre deg, and weather.",
    image: "/features/race-strategy.png",
    accent: "signal", // Orange/Red
  },
  {
    title: "Post-Race Debrief",
    description: "Detailed breakdown of your stint performance. Where you lost time, where you gained, and how to improve.",
    image: "/features/performance-analysis.png",
    accent: "ink", // White/Gray
  },
];

export function ProductIntro() {
  return (
    <section id="how-it-works" className="border-t border-white/5 bg-carbon py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-electric">
            The System
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need on the pit wall.
          </p>
          <p className="mt-4 text-lg text-ink-secondary font-mono">
            RaceMind connects directly to your game&apos;s UDP stream. No manual input, just pure data-driven strategy.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {INTRO_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col glass-panel rounded-2xl overflow-hidden group"
            >
              <div className="relative aspect-[4/3] w-full border-b border-white/5 bg-black/40 overflow-hidden">
                {/* Overlay gradient to make it look embedded */}
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-lighter/80 to-transparent z-10"></div>
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-left-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6 bg-carbon-lighter/50">
                <div className="flex-1">
                  <h3 className="font-mono text-lg font-bold text-white uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
