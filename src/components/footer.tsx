import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Data Sources", href: "/sources" },
  { label: "Statistics Lab", href: "/statistics" },
  { label: "AI Analyst", href: "/ai-analyst" },
];

const PLATFORM_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Training", href: "/training" },
  { label: "Courses", href: "/courses" },
  { label: "Learner Portal", href: "/learner" },
  { label: "Admin Panel", href: "/admin" },
];

const MINISTRY_LINKS = [
  { label: "MoSPI", href: "https://mospi.gov.in", external: true },
  { label: "iGOT Karmayogi", href: "https://igotkarmayogi.gov.in", external: true },
  { label: "NSSTA", href: "https://nssta.gov.in", external: true },
  { label: "NIC", href: "https://nic.in", external: true },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full border-t border-white/5 relative z-10">
      {/* Main footer grid */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="font-display text-xl text-primary font-bold tracking-tighter">
              StatIQ AI
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              AI-powered competency intelligence for India&apos;s Official Statistical System. Built for MoSPI. Aligned to iGOT, NSSTA, and DoPT frameworks.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              <span className="text-xs font-label-caps text-on-surface-variant">SIH 2026 · PS 26101</span>
            </div>
            <p className="text-xs text-on-surface-variant/60">
              MoSPI · Data Informatics &amp; Innovation Division
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant/60 tracking-widest text-xs uppercase">Product</h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform links */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant/60 tracking-widest text-xs uppercase">Platform</h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ministry links */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant/60 tracking-widest text-xs uppercase">Official Bodies</h4>
            <ul className="space-y-3">
              {MINISTRY_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {l.label}
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant/50 font-label-caps">
            © 2026 StatIQ AI. Precision Engineering for the Intelligence Era.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-on-surface-variant/40 font-label-caps">PRIVACY POLICY</span>
            <span className="text-xs text-on-surface-variant/40 font-label-caps">TERMS OF USE</span>
            <span className="text-xs text-on-surface-variant/40 font-label-caps">ACCESSIBILITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
