import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "/download", label: "Download" },
    { href: "/docs", label: "Documentation" },
  ],
  Resources: [
    { href: "https://github.com/T-Bone47/RaceMind-AI", label: "GitHub" },
    { href: "/docs", label: "API Reference" },
  ],
  Company: [
    { href: "/about", label: "About" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-carbon-lighter pt-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-electric text-xs font-bold text-carbon">
              R
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-white uppercase">
              RaceMind <span className="text-electric font-medium">AI</span>
            </span>
          </div>
          <p className="mt-4 font-mono text-xs font-medium uppercase tracking-widest text-electric">
            AI Race Engineer OS
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Connect telemetry, race strategy, driver analysis, AI insights and race engineering into one seamless open-source system.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              {heading}
            </h4>
            <ul className="mt-6 space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-electric"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 bg-carbon px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} RaceMind AI. MIT Licensed.
          </p>
          <p className="text-xs text-ink-muted">
            Not affiliated with EA, Codemasters, or any game publisher.
          </p>
        </div>
      </div>
    </footer>
  );
}
