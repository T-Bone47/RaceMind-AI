import { Card } from "@racemind/ui";
import {
  AudioWaveform,
  Cloud,
  Fuel,
  Gauge,
  History,
  Radio,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const STRATEGY_MODULES = [
  { icon: TrendingUp, title: "Undercut analysis", body: "Weighs fresh-tyre pace against the gap ahead to call whether pitting first actually gains track position." },
  { icon: TrendingDown, title: "Overcut analysis", body: "The inverse call - stay out, hold track position while a rival is stationary, and still come out ahead." },
  { icon: Gauge, title: "Pit window", body: "Combines tyre-cliff and fuel projections into one earliest/optimal/latest lap range." },
  { icon: Users, title: "Traffic awareness", body: "Checks whether your projected pit exit lands clean or drops you into a pack." },
  { icon: Cloud, title: "Weather calls", body: "Flags a compound change before the forecast catches you out, not after." },
  { icon: Fuel, title: "Fuel modeling", body: "Live consumption rate against laps remaining, updated every lap." },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">Features</h1>
        <p className="mt-4 text-lg text-ink-secondary">
          Built as separable systems, not one black box. Each one below is independently testable
          against real telemetry - that&apos;s deliberate, so the strategy calls stay explainable.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="text-sm font-medium uppercase tracking-wider text-ink-muted">Strategy engine</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STRATEGY_MODULES.map((mod) => (
            <Card key={mod.title}>
              <mod.icon className="h-5 w-5 text-electric" strokeWidth={1.75} />
              <h3 className="mt-4 font-medium text-ink-primary">{mod.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{mod.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 sm:grid-cols-2">
        <Card>
          <Radio className="h-5 w-5 text-signal-green" strokeWidth={1.75} />
          <h3 className="mt-4 font-medium text-ink-primary">AI Engineer</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Radio-style Q&A grounded only in the context it&apos;s given - lap, position, gaps,
            tyre age. It won&apos;t fabricate a number it doesn&apos;t have.
          </p>
        </Card>
        <Card>
          <History className="h-5 w-5 text-signal-amber" strokeWidth={1.75} />
          <h3 className="mt-4 font-medium text-ink-primary">Driver profile</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Consistency and tyre-management scores build session over session with an exponential
            moving average, so one bad session doesn&apos;t overwrite months of data.
          </p>
        </Card>
        <Card className="sm:col-span-2">
          <AudioWaveform className="h-5 w-5 text-electric" strokeWidth={1.75} />
          <h3 className="mt-4 font-medium text-ink-primary">Game-agnostic telemetry layer</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Every provider - live UDP, a recorded replay, or a future sim adapter - normalizes into
            the same frame format before anything else touches it. Strategy logic, the dashboard,
            and the AI Engineer never know or care which game produced the data.
          </p>
        </Card>
      </section>
    </div>
  );
}
