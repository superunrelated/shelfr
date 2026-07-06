import {
  Bullets,
  Callout,
  Checklist,
  CodeBlock,
  Eyebrow,
  Heading,
  Slide,
  SubHeading,
  TechGrid,
  TwoColumn,
} from '../components/Slide';

export const slides = [
  // 0. Joke
  <Slide key="joke-wing-it">
    <Eyebrow>Slide 1 of 1 in This Section</Eyebrow>
    <Heading>How to Wing a Presentation</Heading>
    <Checklist
      items={[
        'Open a new deck at 09:47pm for a 12pm talk.',
        'Pick a bold accent color. Confidence is 80% color palette.',
        'Write one slide titled "The Problem" — audience nods, you look prepared.',
        'Bury the part you don’t understand in a code block. Nobody reads code blocks live.',
        'End on "Questions?" — the universal signal that you’re done regardless of time left.',
      ]}
    />
    <p className="mt-8 font-mono text-sm text-slate-500">
      (this slide is itself the demonstration)
    </p>
  </Slide>,

  // Challenge
  <Slide key="challenge">
    <Eyebrow>Before We Go Further</Eyebrow>
    <Heading>Your Challenge</Heading>
    <SubHeading>
      Think of a website you use all the time that has something that sucks
      about it.
    </SubHeading>
    <Bullets
      items={[
        'Pick one — something small and specific, not "the whole site."',
        'Ask Claude to build a Chrome extension that fixes just that thing.',
        'That’s the entire brief. Everything after this slide is how.',
      ]}
    />
  </Slide>,

  // 1b. Extensions as a fix for enshittification
  <Slide key="extension-declutter">
    <Eyebrow>A Bigger Point</Eyebrow>
    <Heading>Enshittification Is Optional</Heading>
    <SubHeading>
      Every site you use is under pressure to extract more from you over time
      &mdash; more ads, more dark patterns, more friction on the way out. That
      decay happens in their code, on their server. You&rsquo;re not stuck
      reading it as shipped — a content script rewrites the page as it loads, in
      your browser, before you see it.
    </SubHeading>
    <Bullets
      items={[
        'Strip the ads, nag banners, and dark patterns the site won’t let you turn off.',
        'Add back the feature they removed, or the shortcut they never built.',
        'Pull the data out of the bloated page and use it somewhere sane.',
        'Client-side, unilateral, reversible — no API, no permission, no server of theirs involved.',
      ]}
    />
  </Slide>,

  // 1. Title
  <Slide key="title">
    <Eyebrow>Free Tools, Whipped Up Fast</Eyebrow>
    <Heading>Ship a Real Tool in an Afternoon</Heading>
    <SubHeading>
      Small hacks for your own everyday life &mdash; not startups. A Chrome
      extension and a live website, entirely free, nothing to install, nothing
      to maintain.
    </SubHeading>
    <p className="font-mono text-sm text-slate-500">
      Case study: github.com/superunrelated/shelfr
    </p>
  </Slide>,

  // 2b. The pain
  <Slide key="the-pain">
    <Eyebrow>Why This Usually Stalls</Eyebrow>
    <Heading>The Idea Dies at Deployment, Not at Code</Heading>
    <SubHeading>
      The tool itself is an evening of work. The infrastructure around it is
      where side projects go to die.
    </SubHeading>
    <TwoColumn
      left={
        <Bullets
          items={[
            'Database: standing one up, securing it, backing it up — for a tool with ten users, one of them you.',
            'Hosting: a box, a process manager, TLS, DNS — for a static bundle that never changes.',
            'Deployment: SSH-and-pray, or a CI/CD setup that takes longer than the feature.',
            'Auth: rolling your own login is the single easiest way to turn a weekend hack into a security incident.',
          ]}
        />
      }
      right={
        <Callout label="The real cost">
          None of this is hard exactly. It&rsquo;s just enough friction, enough
          risk, and enough hours that the annoyance stays unfixed and the idea
          dies in a notes app.
        </Callout>
      }
    />
  </Slide>,

  // 3. The pattern
  <Slide key="the-pattern">
    <Eyebrow>The Fix</Eyebrow>
    <Heading>Skip All of That</Heading>
    <SubHeading>
      Three free building blocks, none of which you stand up, patch, or secure
      yourself.
    </SubHeading>
    <TechGrid
      items={[
        {
          name: 'A Chrome extension',
          blurb:
            'Your hook into any website — grab data, add a button, automate a click. Free to build and free to install.',
        },
        {
          name: 'A static site',
          blurb:
            'Plain files hosted for free — no server process, nothing to keep alive.',
        },
        {
          name: 'A backend-as-a-service',
          blurb:
            'A generous free tier runs the database, login, and storage. You just call it.',
        },
      ]}
    />
  </Slide>,

  // 4. Case study
  <Slide key="case-study">
    <Eyebrow>Proof It Works</Eyebrow>
    <Heading>Case Study: Shelfr</Heading>
    <SubHeading>
      A product-research bookmarking tool, built exactly this way. Not the point
      of this talk &mdash; but a real example of the pattern holding up under
      real use.
    </SubHeading>
    <Bullets
      items={[
        'A website you browse and organize saved products on.',
        'A Chrome extension that saves whatever product you’re looking at, from any page, in one click.',
        'Same account, same data, both ends — with zero servers maintained by hand.',
      ]}
    />
  </Slide>,

  // 4b. Live demo
  <Slide key="live-demo">
    <Eyebrow>Buckle Up</Eyebrow>
    <Heading>Live Demo Time</Heading>
    <SubHeading>What could possibly go wrong?</SubHeading>
    <Bullets items={[]} />
  </Slide>,

  // 5. Tech stack, framed as commodity
  <Slide key="tech-stack">
    <Eyebrow>What&rsquo;s Under the Hood</Eyebrow>
    <Heading>Nothing Exotic</Heading>
    <SubHeading>
      Stock stack, stock defaults. The leverage is in the wiring, not any
      individual piece.
    </SubHeading>
    <TechGrid
      items={[
        {
          name: 'React 19 + Vite 8',
          blurb: 'No SSR, no meta-framework — just a client-rendered SPA.',
        },
        {
          name: 'TypeScript + Tailwind',
          blurb: 'Default configs, no design system to maintain.',
        },
        {
          name: 'Nx',
          blurb: 'Two apps, two shared libs, one repo, one lockfile.',
        },
        {
          name: 'GitHub Pages',
          blurb: 'Static hosting, free, on the same domain as the repo.',
        },
        {
          name: 'Supabase',
          blurb: 'Postgres + RLS + Auth + Storage + Edge Functions, free tier.',
        },
        {
          name: 'Manifest V3',
          blurb:
            'Popup, background service worker, content script — same build.',
        },
      ]}
    />
  </Slide>,

  // 6. Zero-maintenance hosting
  <Slide key="web-deploy">
    <Eyebrow>Hosting the SPA</Eyebrow>
    <Heading>GitHub Pages, Not a Server</Heading>
    <SubHeading>
      Static build output, `actions/deploy-pages` on push to{' '}
      <code className="text-cyan-300">main</code>. No box to keep patched, no
      process to keep alive — the deploy target is a CDN.
    </SubHeading>
    <CodeBlock>{`# .github/workflows/deploy.yml
on: push (main), workflow_dispatch
npm ci
nx build web          # VITE_SUPABASE_URL / ANON_KEY from repo secrets
actions/upload-pages-artifact  →  actions/deploy-pages`}</CodeBlock>
    <div className="mt-8">
      <Callout label="Gotcha">
        base: '/shelfr/' in vite.config + a 404.html SPA-redirect trick — the
        two things Pages doesn&rsquo;t give you for free with client-side
        routing.
      </Callout>
    </div>
  </Slide>,

  // 7. Zero-maintenance backend
  <Slide key="backend">
    <Eyebrow>Backend</Eyebrow>
    <Heading>Supabase Is the Entire Backend</Heading>
    <SubHeading>
      No custom API server. Postgres with RLS policies, Auth, Storage, and two
      Edge Functions for the bits that can&rsquo;t run client-side.
    </SubHeading>
    <TwoColumn
      left={
        <Bullets
          items={[
            'RLS policies scope every row to auth.uid() — no app-layer authz to write.',
            'scrape-url: server-side fetch + image rehost to Storage (CORS/CSP reasons).',
            'invite-member: the one mutation that needs a service-role key.',
          ]}
        />
      }
      right={
        <CodeBlock>{`npx supabase functions deploy scrape-url \\
  --project-ref your-project

npx supabase functions deploy invite-member \\
  --project-ref your-project`}</CodeBlock>
      }
    />
  </Slide>,

  // 8. Extension as superpower
  <Slide key="extension-architecture">
    <Eyebrow>MV3 Specifics</Eyebrow>
    <Heading>Three Contexts, One Manifest</Heading>
    <SubHeading>
      Permissions: activeTab, storage, scripting. Host permissions scoped to
      *.supabase.co and the web app&rsquo;s own origin — nothing broader.
    </SubHeading>
    <TechGrid
      items={[
        {
          name: 'popup.html',
          blurb: 'Toolbar UI, talks to background over runtime messaging.',
        },
        {
          name: 'background.ts',
          blurb: 'MV3 service worker — no persistent state, wakes on events.',
        },
        {
          name: 'contentScript.ts',
          blurb:
            'Injected only on the web app origin — bridges the auth session into the extension.',
        },
        {
          name: 'manifest.json',
          blurb:
            'Not Vite-native — a custom plugin copies it + icons post-build.',
        },
      ]}
    />
  </Slide>,

  // 9. Extension build pipeline
  <Slide key="extension-build">
    <Eyebrow>Building the Extension</Eyebrow>
    <Heading>Same Tools, Different Output Shape</Heading>
    <SubHeading>
      No special framework needed. The same build tool used for the website
      packages the extension&rsquo;s scripts too &mdash; just pointed at
      Chrome&rsquo;s expected folder shape instead of a normal web page.
    </SubHeading>
    <CodeBlock>{`npm run build:extension
#  -> builds popup.html, background.ts, contentScript.ts
#  -> copies manifest.json + icons into dist/extension

npm run zip:extension
#  -> zips dist/extension into a single .zip, ready to upload`}</CodeBlock>
  </Slide>,

  // 10. Publishing to Chrome Web Store
  <Slide key="store-publish">
    <Eyebrow>Only If You Want Users</Eyebrow>
    <Heading>Getting Into the Chrome Web Store</Heading>
    <SubHeading>
      This is only for other people to install it. For yourself, or for handing
      it to a friend, skip all of it —{' '}
      <code className="text-cyan-300">npm run zip:extension</code>, send the
      zip, they load it unpacked. Done.
    </SubHeading>
    <Checklist
      items={[
        'Build and zip the extension',
        'Write the listing: name, description, category, screenshots',
        'Justify every permission you ask for (storage, scripting, activeTab...)',
        'Publish a privacy policy explaining what data is collected',
        'Upload the zip to the Chrome Web Store developer dashboard',
      ]}
    />
    <div className="mt-6">
      <Callout label="Automate what you can">
        Even here, generate the screenshots with a script instead of
        hand-cropping them every release.
      </Callout>
    </div>
  </Slide>,

  // 11. Recap / replicate checklist
  <Slide key="recap">
    <Eyebrow>Recap</Eyebrow>
    <Heading>How to Whip One Up Yourself</Heading>
    <Checklist
      items={[
        'Start with an everyday annoyance, not a product idea — scope to that one thing.',
        'Build the interface with whatever you already know.',
        'Host it free, as static files — no server process to run.',
        'Use a free backend-as-a-service instead of building one — database, login, storage included.',
        'If you need to hook into other websites, wrap it as a browser extension.',
        'Store review optional — for personal use, just hand over the zip and load it unpacked.',
        'Budget an hour or two, not a sprint — this is meant to be fast.',
      ]}
    />
  </Slide>,

  // 12. Main takeaways
  <Slide key="takeaways">
    <Eyebrow>Main Takeaways</Eyebrow>
    <Heading>Two Things Worth Remembering</Heading>
    <TwoColumn
      left={
        <Callout label="Chrome extensions">
          Super powerful, and criminally underused. A content script gets you
          root on any website you visit — read it, reshape it, pull data out of
          it. No API, no permission, no backend required.
        </Callout>
      }
      right={
        <Callout label="Supabase">
          Saves you from the backend hellscape. Postgres, auth, storage, and RLS
          — the entire category of work you&rsquo;d otherwise be standing up,
          patching, and securing yourself — gone.
        </Callout>
      }
    />
  </Slide>,

  // 13. Closing / Q&A
  <Slide key="closing">
    <Eyebrow>Thanks</Eyebrow>
    <Heading>Questions?</Heading>
    <SubHeading>
      The point isn&rsquo;t Shelfr. It&rsquo;s that the small annoyance you
      shrugged off this week is an hour and zero dollars away from being fixed
      &mdash; just this pattern.
    </SubHeading>
    <p className="font-mono text-sm text-slate-500">
      apps/presentation &middot; github.com/superunrelated/shelfr
    </p>
  </Slide>,
];
