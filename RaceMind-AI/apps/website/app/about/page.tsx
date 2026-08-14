import { Card } from "@racemind/ui";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">About</h1>

      <div className="mt-8 space-y-6 text-ink-secondary">
        <p className="text-lg leading-relaxed">
          RaceMind AI started from a simple frustration: sim racing telemetry tools show you a lot
          of numbers, but none of them tell you what to do with them. A real race engineer
          doesn&apos;t just read out the gap - they call the box lap before you have to ask.
        </p>
        <p className="leading-relaxed">
          It&apos;s built as an original implementation - a normalized telemetry layer underneath
          a rule-based strategy engine, with an LLM-driven AI Engineer for the conversational
          layer on top. Every strategy call is explainable: no black-box model, just modules you
          can read and test independently - tyre wear, fuel, undercut, overcut, traffic, weather.
        </p>
        <p className="leading-relaxed">
          It targets the Codemasters/EA F1 titles first (F1 23 through F1 26), with the
          architecture built to extend to Assetto Corsa, ACC, iRacing, Le Mans Ultimate, and
          rFactor 2 as those providers land.
        </p>
      </div>

      <Card className="mt-12">
        <h2 className="font-medium text-ink-primary">Open source</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          MIT licensed. Contributions - a new strategy heuristic, a telemetry parser for a game
          year, a UI improvement - are welcome via GitHub.
        </p>
      </Card>
    </div>
  );
}
