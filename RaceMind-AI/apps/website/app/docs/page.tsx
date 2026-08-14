import { Card } from "@racemind/ui";
import { BookOpen, Cpu, Database, Radio } from "lucide-react";
import Link from "next/link";

const DOC_SECTIONS = [
  {
    icon: BookOpen,
    title: "Getting started",
    body: "Install, connect to a session, and get your first strategy call in under ten minutes.",
    href: "#",
  },
  {
    icon: Cpu,
    title: "Architecture",
    body: "How the telemetry abstraction, strategy engine, and AI Engineer layer together.",
    href: "#",
  },
  {
    icon: Database,
    title: "Backend API",
    body: "REST and WebSocket reference for the FastAPI service - auth, sessions, telemetry, strategy.",
    href: "#",
  },
  {
    icon: Radio,
    title: "Telemetry providers",
    body: "Writing a new provider, replaying a recorded session, and what's stubbed vs. implemented today.",
    href: "#",
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">Documentation</h1>
        <p className="mt-4 text-lg text-ink-secondary">
          Start here, or jump straight to the backend README on GitHub for setup and testing.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {DOC_SECTIONS.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className="h-full transition-colors hover:border-electric/50">
              <section.icon className="h-5 w-5 text-electric" strokeWidth={1.75} />
              <h3 className="mt-4 font-medium text-ink-primary">{section.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{section.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
