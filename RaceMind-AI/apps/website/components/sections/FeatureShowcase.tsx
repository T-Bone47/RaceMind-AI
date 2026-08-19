"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@racemind/ui";

const FEATURES = [
  {
    title: "Track Map & Traffic",
    subtitle: "GPS positioning in real-time",
    description: "Visualise the entire field. Spot the gaps to drop into after a pitstop, monitor blue flags, and see where your rivals are losing time. Full track maps for all official circuits.",
    image: "/features/track-map.png",
    reversed: false,
  },
  {
    title: "Setup Optimizer",
    subtitle: "Data-driven car setup",
    description: "Compare your telemetry against optimal laps to fine-tune aerodynamics, suspension, and tyre pressures. Stop guessing and let the data dictate your wings.",
    image: "/features/setup-optimizer.png",
    reversed: true,
  },
  {
    title: "Pit Stop Predictor",
    subtitle: "Never get undercut again",
    description: "AI calculates the exact lap you need to pit to jump the car ahead or defend against an undercut, factoring in pit lane time loss, out-lap pace, and tyre warm-up.",
    image: "/features/pit-stop-predictor.png",
    reversed: false,
  },
  {
    title: "Race Session Config",
    subtitle: "Customise for any league",
    description: "Configure race distance, tyre allocation, weather forecasts, and safety car probability before the lights go out. RaceMind adapts its models based on your specific session rules.",
    image: "/features/race-settings.png",
    reversed: true,
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-carbon relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-electric/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-electric/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
            Core Features
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Pro-level tools for every driver.
          </p>
        </div>

        <div className="flex flex-col gap-24 sm:gap-32">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "flex flex-col gap-12 lg:items-center",
                feature.reversed ? "lg:flex-row-reverse" : "lg:flex-row"
              )}
            >
              <motion.div
                initial={{ opacity: 0, x: feature.reversed ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col justify-center flex-1 lg:max-w-lg"
              >
                <div className="font-mono text-xs font-bold text-electric uppercase tracking-widest mb-2">
                  {feature.subtitle}
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-ink-secondary font-mono">
                  {feature.description}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                  <div className="h-1 w-1 rounded-full bg-electric"></div>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 w-full"
              >
                <div className="glass-panel p-2 rounded-2xl relative group">
                  {/* Glowing border effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-electric/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  <div className="relative rounded-xl overflow-hidden border border-white/5 bg-carbon aspect-[16/10]">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover object-left-top"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
