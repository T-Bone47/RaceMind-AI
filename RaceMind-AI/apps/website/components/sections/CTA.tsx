"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { buttonVariants, cn } from "@racemind/ui";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-carbon py-24 sm:py-32 border-t border-white/5">
      {/* Grid Background Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Ready to hit the track?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-ink-secondary font-mono"
          >
            Download RaceMind AI for Windows. Free and open-source.
            Compatible with F1 23, F1 24, and upcoming titles.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link
              href="/download"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-electric text-carbon font-bold hover:bg-electric-dim uppercase tracking-wider px-8"
              )}
            >
              Download Now
            </Link>
            <a
              href="https://github.com/T-Bone47/RaceMind-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono font-bold leading-6 text-white uppercase tracking-wider hover:text-electric transition-colors flex items-center gap-2"
            >
              View on GitHub <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
