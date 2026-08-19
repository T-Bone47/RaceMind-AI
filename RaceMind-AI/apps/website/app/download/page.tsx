import { Card } from "@racemind/ui";
import { MonitorDown, Apple, Terminal, Github, ChevronRight, Download } from "lucide-react";

export default function DownloadPage() {
  const GITHUB_REPO = "https://github.com/T-Bone47/RaceMind-AI";
  const GITHUB_RELEASES = "https://github.com/T-Bone47/RaceMind-AI/releases/latest";

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Get RaceMind <span className="text-electric">AI</span>
        </h1>
        <p className="mt-4 text-lg text-ink-secondary font-mono">
          RaceMind AI is open source. Download the latest release or explore the source code on GitHub.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Primary Windows Download */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-full border border-electric/30 bg-carbon relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-electric/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <MonitorDown className="h-8 w-8 text-electric" />
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">RaceMind AI Companion</h2>
                    <p className="text-sm font-mono text-ink-secondary mt-1">Windows 10 / 11 • 64-bit</p>
                  </div>
                </div>
                <div className="hidden sm:flex px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-ink-secondary">
                  V1 Distributable
                </div>
              </div>

              <p className="text-ink-secondary mb-10 text-lg leading-relaxed flex-grow">
                Connect RaceMind to your racing environment and access live telemetry, race strategy, AI race engineering and session analysis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <a
                  href={GITHUB_RELEASES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-electric px-6 py-4 text-sm font-bold uppercase tracking-wider text-carbon hover:bg-electric-dim transition-colors shadow-[0_0_20px_rgba(255,51,0,0.2)]"
                >
                  <Download className="h-5 w-5" />
                  Download for Windows
                </a>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Platforms & Github Card */}
        <div className="flex flex-col gap-4">
          <Card className="flex items-center p-6 border border-white/5 bg-carbon/50 opacity-60">
            <Apple className="h-6 w-6 text-ink-muted mr-4" />
            <div>
              <h3 className="text-base font-medium text-white">macOS</h3>
              <p className="text-xs text-ink-muted font-mono mt-1">Coming soon</p>
            </div>
          </Card>
          
          <Card className="flex items-center p-6 border border-white/5 bg-carbon/50 opacity-60">
            <Terminal className="h-6 w-6 text-ink-muted mr-4" />
            <div>
              <h3 className="text-base font-medium text-white">Linux</h3>
              <p className="text-xs text-ink-muted font-mono mt-1">Coming soon</p>
            </div>
          </Card>

          {/* Github Release Explanation Card */}
          <Card className="flex flex-col p-6 border border-white/10 bg-graphite/40 flex-grow relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-mono text-xs font-bold text-electric uppercase tracking-widest mb-4">
                Latest Release
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Github className="h-4 w-4 text-white" />
                <h4 className="text-white font-medium">RaceMind AI Companion</h4>
              </div>
              <p className="text-xs text-ink-secondary font-mono mb-4">Windows 10 / 11 • 64-bit</p>
              
              <div className="h-[1px] w-full bg-white/5 my-2"></div>
              
              <p className="text-sm text-ink-secondary my-4 flex-grow">
                RaceMind releases are distributed through GitHub. Open the latest release to download the Windows installer.
              </p>
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:text-electric-dim transition-colors mt-auto uppercase tracking-wide"
              >
                View Release <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <Github className="absolute -bottom-4 -right-4 h-32 w-32 text-white/[0.02] pointer-events-none" />
          </Card>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="mt-24 pt-16">
        <h2 className="text-2xl font-bold text-white mb-10 font-mono tracking-tighter uppercase flex items-center gap-4">
          <span className="text-electric">/</span> Installation Flow
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="relative border-l border-white/10 pl-6 lg:pl-8">
            <div className="font-mono text-[80px] leading-none font-black text-white/5 absolute -top-8 -left-2 pointer-events-none select-none">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10 flex items-center gap-3">
              <div className="h-2 w-2 bg-electric"></div>
              DOWNLOAD
            </h3>
            <p className="text-ink-secondary text-sm leading-relaxed relative z-10">
              Download the latest RaceMind AI Windows installer from GitHub Releases.
            </p>
          </div>
          <div className="relative border-l border-white/10 pl-6 lg:pl-8">
            <div className="font-mono text-[80px] leading-none font-black text-white/5 absolute -top-8 -left-2 pointer-events-none select-none">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10 flex items-center gap-3">
              <div className="h-2 w-2 bg-electric"></div>
              INSTALL
            </h3>
            <p className="text-ink-secondary text-sm leading-relaxed relative z-10">
              Run the <code className="text-electric bg-electric/10 px-1 py-0.5 rounded">.exe</code> installer and follow the standard Windows installation steps.
            </p>
          </div>
          <div className="relative border-l border-white/10 pl-6 lg:pl-8">
            <div className="font-mono text-[80px] leading-none font-black text-white/5 absolute -top-8 -left-2 pointer-events-none select-none">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-3 relative z-10 flex items-center gap-3">
              <div className="h-2 w-2 bg-electric"></div>
              LAUNCH
            </h3>
            <p className="text-ink-secondary text-sm leading-relaxed relative z-10">
              Open RaceMind AI Companion and connect it to your RaceMind backend/session to begin analysis.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
