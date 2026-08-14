import Link from "next/link";

import { buttonVariants } from "@racemind/ui";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/download", label: "Download" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-carbon/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-electric text-[11px] text-white">
            R
          </span>
          <span className="tracking-tight text-ink-primary">RaceMind<span className="text-electric">AI</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-secondary transition-colors hover:text-ink-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-ink-secondary hover:text-ink-primary sm:block">
            Log in
          </Link>
          <Link href="/download" className={buttonVariants({ size: "sm" })}>
            Download
          </Link>
        </div>
      </div>
    </header>
  );
}
