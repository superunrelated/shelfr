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
                  Active tab URL, title, and product data
                </strong>{' '}
                — read{' '}
                <strong className="text-[#1c1e2a]">
                  only when you click "Add to shelf"
                </strong>{' '}
                (or open the popup on a page). The extension runs a small
                extractor in the active tab to find the product's title,
                image(s), price, currency, and shop name from the page's
                structured data (JSON-LD, Open Graph / Twitter Card meta tags,
                microdata) and visible markup. Nothing is read in the background
                or before you click.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">
                  Collection preference
                </strong>{' '}
                — your last selected collection is stored locally in Chrome's
                storage so it's remembered between sessions.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">
                  Authentication tokens
                </strong>{' '}
                — your Supabase auth tokens are stored by the extension so you
                stay signed in.
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
              <li>
                The extension does not phone home; the only network requests are
                to your own Supabase project
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#1c1e2a] mb-2">
              How product data flows
            </h2>
            <ol className="list-decimal pl-5 flex flex-col gap-1.5">
              <li>You click the Shelfr extension icon on a product page.</li>
              <li>
                The extension reads structured data and visible product markup
                from that single page (active tab only).
              </li>
              <li>
                When you click "Add to shelf", the page URL plus the extracted
                data is sent to a Supabase Edge Function on your project. The
                edge function fetches the page server-side once to rehost the
                chosen product image into your project's storage bucket (so it
                stays available later even if the original site removes it).
              </li>
              <li>
                The product row is written to your Supabase database, where the
                web app shows it immediately via real-time updates.
              </li>
            </ol>
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
              Local extension storage (your collection preference and auth
              tokens) stays on your device and is never transmitted to anyone
              other than Supabase Auth.
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
                <strong className="text-[#1c1e2a]">activeTab</strong> — grants
                the extension a one-time read of the current tab's URL and DOM,
                only triggered by your click on the extension icon. It does not
                give background access to your browsing.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">scripting</strong> — required
                so the extension can run the product-data extractor inside the
                active tab when you click. It uses this <em>only</em> on the tab
                you're already looking at, <em>only</em> in response to your
                click, and <em>only</em> to read product fields (title, image,
                price, currency, shop name).
              </li>
              <li>
                <strong className="text-[#1c1e2a]">storage</strong> — stores
                your last selected collection ID and Supabase auth tokens
                locally in Chrome.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">
                  host permissions for <code>*.supabase.co</code>
                </strong>{' '}
                — needed to talk to the Supabase backend that holds your
                collections.
              </li>
              <li>
                <strong className="text-[#1c1e2a]">
                  host permissions + content script for{' '}
                  <code>superunrelated.github.io/shelfr/*</code>
                </strong>{' '}
                (and <code>localhost:4200/*</code> during development) — a tiny
                content script that runs only on the Shelfr web app's own
                origin. Its sole job is to bridge sign-in: when you sign in to
                the extension, the web app picks up the same session, and
                vice-versa. It does not run on any other site.
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
