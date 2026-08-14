import { Card } from "@racemind/ui";
import { Apple, MonitorDown, Terminal } from "lucide-react";

const PLATFORMS = [
  { icon: MonitorDown, name: "Windows", note: "Windows 10/11, 64-bit", cta: "Download .exe" },
  { icon: Apple, name: "macOS", note: "Apple Silicon and Intel", cta: "Download .dmg" },
  { icon: Terminal, name: "Linux", note: "AppImage, most distros", cta: "Download .AppImage" },
];

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">Download</h1>
        <p className="mt-4 text-lg text-ink-secondary">
          Free and open source, MIT licensed. Pick your platform below.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <Card key={platform.name} className="flex flex-col items-start">
            <platform.icon className="h-6 w-6 text-electric" strokeWidth={1.75} />
            <h3 className="mt-4 text-lg font-medium text-ink-primary">{platform.name}</h3>
            <p className="mt-1 text-sm text-ink-muted">{platform.note}</p>
            <button
              type="button"
              className="mt-6 w-full rounded-md border border-border bg-graphite-light px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:border-electric/60"
            >
              {platform.cta}
            </button>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <h3 className="font-medium text-ink-primary">Build from source</h3>
        <p className="mt-2 text-sm text-ink-secondary">
          The full monorepo, including the backend, is on GitHub. See the README for the
          quickstart - Docker Compose brings up Postgres and the API in one command.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-carbon p-4 font-mono text-xs text-ink-secondary">
          <code>{`git clone https://github.com/racemind-ai/racemind-ai.git
cd racemind-ai
docker compose up postgres -d
pnpm install`}</code>
        </pre>
      </Card>
    </div>
  );
}
