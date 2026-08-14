import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/download", label: "Download" },
    { href: "/docs", label: "Documentation" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "https://github.com/racemind-ai", label: "GitHub" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-electric text-[11px] text-white">
              R
            </span>
            <span>RaceMind<span className="text-electric">AI</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            An AI race engineer for sim racing telemetry. Open source, built for F1 23-26 today,
            more sims on the way.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-xs font-medium uppercase tracking-wider text-ink-muted">{heading}</h4>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-secondary hover:text-ink-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-6 py-6 text-center text-xs text-ink-muted">
        MIT licensed. Not affiliated with EA, Codemasters, or any game publisher.
      </div>
    </footer>
  );
}
