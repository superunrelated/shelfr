import { Link } from 'react-router-dom';
import {
  RiBookmarkLine,
  RiSearchLine,
  RiScalesLine,
  RiPriceTag3Line,
  RiSmartphoneLine,
  RiChromeLine,
} from '@remixicon/react';

const FEATURES = [
  {
    icon: RiBookmarkLine,
    title: 'Save from anywhere',
    description:
      'Paste a product URL and we extract the image, price, and details automatically.',
  },
  {
    icon: RiSearchLine,
    title: 'Organise your research',
    description:
      'Group products into collections. Rate, sort, and filter to find exactly what you need.',
  },
  {
    icon: RiScalesLine,
    title: 'Compare side-by-side',
    description:
      'Select products and compare them in a ranked table. Pick a winner in one click.',
  },
  {
    icon: RiPriceTag3Line,
    title: 'Track price changes',
    description:
      'Rescrape products to spot price drops. See savings at a glance.',
  },
  {
    icon: RiSmartphoneLine,
    title: 'Mobile ready',
    description:
      'Browse your saved products in-store. Full mobile experience with touch-friendly controls.',
  },
  {
    icon: RiChromeLine,
    title: 'Chrome extension',
    description:
      'Save products directly from any product page without leaving the site.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-[#1c1e2a] flex items-center justify-center">
            <RiBookmarkLine size={18} className="text-white" />
          </div>
          <span
            className="text-2xl font-semibold tracking-tight text-[#1c1e2a]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            shelf<span className="text-amber-500">r</span>
          </span>
        </div>
        <Link
          to="/auth"
          className="text-xs font-medium text-[#1c1e2a] border border-neutral-200 rounded px-4 py-2 hover:bg-neutral-100 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-20 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <h1
            className="text-4xl md:text-5xl font-bold text-[#1c1e2a] leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Research products.
            <br />
            Make better <span className="text-amber-500">decisions</span>.
          </h1>
          <p className="text-base md:text-lg text-neutral-500 mt-5 leading-relaxed max-w-lg">
            Shelfr is a visual bookmarking tool for product research. Save items
            from any store, organise them into collections, compare options, and
            track your decisions from browsing to buying.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#1c1e2a] text-white text-sm font-medium hover:bg-[#2a2d3d] transition-colors"
            >
              Get started
            </Link>
            <span className="text-xs text-neutral-400">Free to use</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="h-px bg-neutral-200" />
      </div>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium mb-8">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-[#1c1e2a] flex items-center justify-center">
                <f.icon size={18} className="text-white" />
              </div>
              <h3
                className="text-[15px] font-semibold text-[#1c1e2a]"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                {f.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 max-w-6xl mx-auto border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-neutral-400"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            shelf<span className="text-amber-400">r</span>
          </span>
          <span className="text-[11px] text-neutral-300">
            Built for better buying decisions
          </span>
        </div>
      </footer>
    </div>
  );
}
