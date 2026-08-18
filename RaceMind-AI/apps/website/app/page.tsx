import { Card, CardTitle } from "@racemind/ui";
import { AudioWaveform, Gauge, MessagesSquare, Radio } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@racemind/ui";
import { TelemetryHeroPanel } from "@/components/TelemetryHeroPanel";

const FEATURES = [
  {
    icon: Gauge,
    title: "Strategy engine",
    body: "Pit windows, undercut and overcut viability, tyre-cliff prediction. Recalculated every lap from your actual wear and fuel data, not a generic model.",
  },
  {
    icon: Radio,
    title: "AI Engineer",
    body: "Ask a question over radio, get a radio-length answer. It only ever uses the telemetry you've actually given it - it won't invent a gap that isn't there.",
  },
  {
    icon: AudioWaveform,
    title: "Built on your telemetry",
    body: "A normalized data layer sits between the game and the app, so strategy logic never depends on one title's wire format.",
  },
  {
    icon: MessagesSquare,
    title: "Remembers how you drive",
    body: "Consistency, tyre management, and race-craft build into a profile across sessions, so advice tunes to you specifically over time.",
  },
];

const GAMES = ["F1 23", "F1 25", "F1 25: 2026 DLC"];
const COMING_SOON = ["Assetto Corsa", "ACC", "iRacing", "Le Mans Ultimate", "rFactor 2"];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid-fade">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-graphite px-3 py-1 text-xs text-ink-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
              Open source - F1 23 through F1 25: 2026 DLC today
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-ink-primary sm:text-5xl md:text-6xl">
              Your race engineer,
              <br />
              never misses a delta.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-secondary">
              RaceMind AI reads your telemetry lap by lap and calls the strategy before you have
              to ask - pit windows, undercuts, tyre and fuel calls, in real time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/download" className={buttonVariants({ size: "lg" })}>
                Download for free
              </Link>
              <Link href="/docs" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Read the docs
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <TelemetryHeroPanel />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-ink-primary sm:text-4xl">
              Four systems, one radio call.
            </h2>
            <p className="mt-4 text-ink-secondary">
              Everything runs locally against your session. Nothing here is guessing from a
              generic model - it&apos;s reading the lap you just drove.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <feature.icon className="h-5 w-5 text-electric" strokeWidth={1.75} />
                <h3 className="mt-4 text-lg font-medium text-ink-primary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{feature.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported games */}
      <section className="border-t border-border/60 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Card className="bg-graphite/60">
            <CardTitle>Supported today</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {GAMES.map((game) => (
                <span
                  key={game}
                  className="rounded-md border border-signal-green/30 bg-signal-green/10 px-3 py-1 font-mono text-sm text-signal-green"
                >
                  {game}
                </span>
              ))}
            </div>

            <p className="mb-3 mt-8 text-xs font-medium uppercase tracking-wider text-ink-muted">
              On the roadmap
            </p>
            <div className="flex flex-wrap gap-2">
              {COMING_SOON.map((game) => (
                <span
                  key={game}
                  className="rounded-md border border-border bg-graphite-light px-3 py-1 font-mono text-sm text-ink-muted"
                >
                  {game}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-xl border border-electric/20 bg-electric/[0.06] p-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink-primary">Get it running in one session.</h2>
            <p className="mt-2 text-ink-secondary">Free, open source, MIT licensed.</p>
          </div>
          <Link href="/download" className={buttonVariants({ size: "lg" })}>
            Download RaceMind AI
          </Link>
        </div>
      </section>
    </>
  );
}
