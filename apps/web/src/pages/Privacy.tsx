import { Link } from 'react-router-dom';
import { RiBookmarkLine } from '@remixicon/react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-[#1c1e2a] flex items-center justify-center">
            <RiBookmarkLine size={18} className="text-white" />
          </div>
          <span
            className="text-2xl font-semibold tracking-tight text-[#1c1e2a]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            shelf<span className="text-amber-500">r</span>
          </span>
        </Link>
      </nav>

      <article className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <h1
          className="text-3xl font-bold text-[#1c1e2a] mb-2"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-400 mb-10">
          Last updated: April 2026
        </p>

        <div className="flex flex-col gap-8 text-sm text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              What data we collect
            </h2>
            <p className="mb-3">When you use the Shelfr Chrome extension:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <strong className="text-[#1c1e2a]">
                  Current tab URL and title
                </strong>{' '}
                — read only when you click "Add to shelf". This is used to save
                the product to your collection.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">
                  Collection preference
                </strong>{' '}
                — your last selected collection is stored locally in Chrome's
                storage so it's remembered between sessions.
              </li>
            </ul>
            <p className="mt-3 mb-3">When you use the Shelfr web app:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <strong className="text-[#1c1e2a]">Email and password</strong> —
                used for authentication via Supabase Auth.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">Product data</strong> —
                titles, prices, images, URLs, notes, and ratings you add to your
                collections.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              What we don't collect
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>We do not track your browsing history</li>
              <li>We do not collect analytics or telemetry</li>
              <li>We do not share any data with third parties</li>
              <li>We do not run ads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              Where data is stored
            </h2>
            <p>
              All user data is stored in a Supabase-hosted PostgreSQL database
              secured with Row Level Security policies. Each user can only
              access their own data and collections they've been invited to.
            </p>
            <p className="mt-2">
              Local extension storage (your collection preference) stays on your
              device and is never transmitted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              Data deletion
            </h2>
            <p>
              You can delete individual products, collections, or your entire
              account at any time. Deleting your account removes all associated
              data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              Permissions explained
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                <strong className="text-[#1c1e2a]">activeTab</strong> — allows
                reading the current tab's URL and title when you click the
                extension icon. No background access.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">storage</strong> — stores
                your last selected collection ID locally in Chrome. No sensitive
                data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              Contact
            </h2>
            <p>
              For questions about this privacy policy, open an issue at{' '}
              <a
                href="https://github.com/superunrelated/shelfr/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1c1e2a] underline hover:no-underline"
              >
                github.com/superunrelated/shelfr
              </a>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
