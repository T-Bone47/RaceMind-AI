"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { buttonVariants, cn } from "@racemind/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs font-mono font-medium text-electric backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric"></span>
            </span>
            RACE ENGINEER ACTIVE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
          >
            NEVER MISS A <span className="text-gradient-electric">DELTA</span> AGAIN.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-ink-secondary md:text-xl font-mono"
          >
            RaceMind AI reads your sim racing telemetry lap by lap and calls the strategy before you have to ask. Pit windows, undercuts, tyre data, in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/download"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-electric text-carbon font-bold hover:bg-electric-dim uppercase tracking-wider px-8"
              )}
            >
              Download RaceMind
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "border border-white/10 hover:bg-white/5 uppercase tracking-wider font-mono font-bold px-8 text-white bg-transparent"
              )}
            >
              View Telemetry
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative mx-auto max-w-6xl"
        >
          {/* Subtle Glow Behind Image */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-electric/20 to-transparent blur-2xl opacity-50"></div>
          
          <div className="glass-panel overflow-hidden rounded-2xl relative">
            <div className="border-b border-white/5 bg-black/40 px-4 py-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-orange-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 font-mono text-[10px] uppercase text-ink-muted flex gap-4">
                <span>COM.RACEMIND.TELEMETRY</span>
                <span className="text-electric">LIVE</span>
              </div>
            </div>
            <div className="relative aspect-[16/9] w-full bg-carbon">
              <Image
                src="/features/1-overview.png"
                alt="RaceMind AI Live Telemetry Interface"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-electric/10 blur-[120px] rounded-full pointer-events-none"></div>
    </section>
  );
}
