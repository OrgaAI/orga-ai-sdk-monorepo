import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto">
        <div className="text-2xl font-extrabold text-[#6366f1] tracking-tight">
          Orga AI.
        </div>
        <div className="hidden md:flex gap-8">
          <a
            href="#features"
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors text-sm no-underline"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors text-sm no-underline"
          >
            How it works
          </a>
          <a
            href="https://docs.orga-ai.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors text-sm no-underline"
          >
            Docs
          </a>
          <a
            href="https://platform.orga-ai.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors text-sm no-underline"
          >
            Console
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-left py-32 px-4 max-w-[900px] mx-auto">
        <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-3">
          Conversational AI widget on top of @orga-ai/react
        </p>
        <h1 className="text-5xl md:text-6xl leading-tight mb-6 bg-gradient-to-r from-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
          Add voice &amp; video conversations with two script tags.
        </h1>
        <p className="text-xl text-[#94a3b8] mb-8">
          This page is a live CDN test harness for the Orga AI widget. Under the
          hood it runs on our <code className="text-[#e5e7eb]">@orga-ai/react</code> SDK to handle
          real-time conversational AI with audio and video.
        </p>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <a
            href="https://platform.orga-ai.com"
            target="_blank"
            className="bg-[#6366f1] text-white px-8 py-4 rounded-lg no-underline font-semibold transition-colors hover:bg-[#4f46e5] border border-transparent inline-block"
          >
            Get your API key
          </a>
          <a
            href="#how-it-works"
            className="bg-transparent text-[#f8fafc] px-8 py-4 rounded-lg no-underline font-semibold border border-[rgba(148,163,184,0.5)] hover:bg-[rgba(15,23,42,0.9)] transition-colors inline-block"
          >
            See how setup works
          </a>
        </div>

        <p className="text-sm text-[#94a3b8] max-w-[28rem]">
          You'll bring your own backend service (to keep your Orga API key
          secret), we'll handle the ephemeral tokens, media servers, and WebRTC
          plumbing.
        </p>

        <div className="flex flex-wrap gap-2 mt-8">
          <span className="rounded-full border border-[rgba(148,163,184,0.4)] px-3 py-1 text-xs text-[#94a3b8]">
            Audio &amp; video first
          </span>
          <span className="rounded-full border border-[rgba(148,163,184,0.4)] px-3 py-1 text-xs text-[#94a3b8]">
            Built on @orga-ai/react
          </span>
          <span className="rounded-full border border-[rgba(148,163,184,0.4)] px-3 py-1 text-xs text-[#94a3b8]">
            Open beta — no charge
          </span>
        </div>
      </section>

      {/* Widget Demo Section */}
      <div className="flex justify-center max-w-[1000px] mx-auto px-4">
        <div className="bg-[#1e293b] rounded-xl border border-dashed border-[rgba(148,163,184,0.5)] p-7 w-full">
          <h3 className="text-lg mb-2">Live Orga AI demo</h3>
          <p className="text-sm text-[#94a3b8] mb-4">
            This is the same conversational widget you'll embed in your own app
            — running on top of <code className="text-[#e5e7eb]">@orga-ai/react</code> and powered by your backend
            session endpoint. Try speaking or turning on video to see how it
            feels before you wire up your own keys.
          </p>
          <div data-orga-widget className="flex justify-center items-center" />
        </div>
      </div>

      {/* Features Grid */}
      <div
        id="features"
        className="max-w-[1200px] mx-auto my-24 px-8 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
            Multimodal
          </div>
          <h3 className="mb-4 text-[#6366f1]">Conversational AI with audio and video</h3>
          <p className="text-[#94a3b8]">
            Give users a full conversational interface — microphone, camera, text
            — without rebuilding the stack yourself. The CDN widget wires
            straight into our <code className="text-[#e5e7eb]">@orga-ai/react</code> components.
          </p>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
            Your backend
          </div>
          <h3 className="mb-4 text-[#6366f1]">Keep your API keys on the server</h3>
          <p className="text-[#94a3b8]">
            You run a tiny backend service that holds your Orga API key and calls
            our servers to exchange it for ephemeral tokens and{" "}
            <code className="text-[#e5e7eb]">iceServers</code>. The widget never sees the
            secret — only the short-lived session config.
          </p>
        </div>
        <div className="bg-[#1e293b] p-8 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
            Developer experience
          </div>
          <h3 className="mb-4 text-[#6366f1]">TypeScript-first SDKs</h3>
          <p className="text-[#94a3b8]">
            Build with our React SDK on the client and our Node SDK on the
            server. Strong typing helps you pass the right session config into
            the widget and makes future migrations safer.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1100px] mx-auto my-16 px-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#94a3b8] mb-2">
            How it works
          </div>
          <h2 className="text-3xl mb-2">Three pieces: API key, backend, widget.</h2>
          <p className="text-[#94a3b8] max-w-[32rem]">
            To run Orga AI in production you'll need an API key, a small backend
            service, and the widget snippet that this page is already using.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
              Step 1
            </div>
            <h3 className="mb-2">Get your API key</h3>
            <p className="text-[#94a3b8] text-sm">
              Sign up at <strong>platform.orga-ai.com</strong> and create an
              Orga AI project. You'll get a secret API key that must live on your
              backend, never in client-side code.
            </p>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
              Step 2
            </div>
            <h3 className="mb-2">Create a tiny backend service</h3>
            <p className="text-[#94a3b8] text-sm">
              Use our Node SDK (or your language of choice) to expose an endpoint
              like <code className="text-[#e5e7eb]">/orga/session</code>. It receives a request
              from your frontend, calls Orga with your API key, and returns an
              ephemeral token and <code className="text-[#e5e7eb]">iceServers</code> configuration.
            </p>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] mb-1">
              Step 3
            </div>
            <h3 className="mb-2">Mount the widget via CDN</h3>
            <p className="text-[#94a3b8] text-sm">
              Drop the two script tags and the{" "}
              <code className="text-[#e5e7eb]">data-orga-widget</code> div into your page.
              The widget calls your backend for the session config and then
              connects to Orga's infrastructure to handle the conversation. Make
              sure your backend's CORS settings allow requests from the origin
              where this page is hosted, otherwise the browser will block the
              call.
            </p>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section id="developers" className="max-w-[1100px] mx-auto my-16 px-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#94a3b8] mb-2">
            For developers
          </div>
          <h2 className="text-3xl mb-2">
            Front-end widget, back-end service, all in TypeScript.
          </h2>
          <p className="text-[#94a3b8] max-w-[32rem]">
            The CDN widget runs on top of <code className="text-[#e5e7eb]">@orga-ai/react</code>. Your backend
            can use our Node SDK to exchange your API key for an ephemeral token
            and <code className="text-[#e5e7eb]">iceServers</code>. No telemetry, just what's needed to
            run calls.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1f2937] to-[#020617] rounded-xl p-6 border border-[rgba(148,163,184,0.5)] font-mono text-sm overflow-x-auto text-[#e5e7eb]">
          <span className="text-[#6b7280]">
            // Frontend: two scripts + widget mount
          </span>
          <br />
          {/* 1. Load the Orga AI widget from the CDN */}
          <br />
          &lt;!-- 1. Load the Orga AI widget from the CDN --&gt;
          <br />
          &lt;script
          <br />
          &nbsp;&nbsp;src="https://widget-test-inky-one.vercel.app/init.global.js"
          <br />
          &nbsp;&nbsp;async
          &gt;&lt;/script&gt;
          <br />
          <br />
          &lt;!-- 2. Initialize it and point at your backend session endpoint
          --&gt;
          <br />
          &lt;script&gt;
          <br />
          &nbsp;&nbsp;OrgaWidget.initWidget(&#123;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;fetchSessionConfig: () =&gt;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fetch("/orga/session").then((res)
          =&gt; res.json()),
          <br />
          &nbsp;&nbsp;&#125;);
          <br />
          &lt;/script&gt;
          <br />
          <br />
          &lt;!-- 3. Place the widget near the bottom of your page --&gt;
          <br />
          &lt;div data-orga-widget /&gt;
          <br />
          <br />
          <span className="text-[#6b7280]">
            // Backend: minimal Node/Express (TypeScript)
          </span>
          <br />
          <span className="text-[#6b7280]">
            // Use our Node SDK as documented at docs.orga-ai.com
          </span>
          <br />
          import express, &#123; Request, Response &#125; from "express";
          <br />
          import cors from "cors";
          <br />
          import &#123; OrgaAI &#125; from "@orga-ai/node";
          <br />
          <br />
          const app = express();
          <br />
          <br />
          <span className="text-[#6b7280]">
            // IMPORTANT: allow CORS from the origin where your widget is hosted
          </span>
          <br />
          app.use(cors(&#123; origin: "https://your-widget-domain.com" &#125;));
          <br />
          <br />
          const orga = new OrgaAI(&#123;
          <br />
          &nbsp;&nbsp;apiKey: process.env.ORGA_API_KEY!,
          <br />
          &nbsp;&nbsp;debug: true,
          <br />
          &#125;);
          <br />
          <br />
          app.get("/api/orga-client-secrets", async (_req: Request, res:
          Response) =&gt; &#123;
          <br />
          &nbsp;&nbsp;try &#123;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;const creds = await orga.getSessionConfig();
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;res.json(creds);{" "}
          <span className="text-[#6b7280]">
            // &#123; ephemeralToken, iceServers &#125;
          </span>
          <br />
          &nbsp;&nbsp;&#125; catch (error) &#123;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;console.error("Failed to get Orga session
          config", error);
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;res.status(500).json(&#123; error: "Internal
          server error" &#125;);
          <br />
          &nbsp;&nbsp;&#125;
          <br />
          &#125;);
          <br />
          <br />
          app.listen(5000, () =&gt; &#123;
          <br />
          &nbsp;&nbsp;console.log("Backend listening on http://localhost:5000");
          <br />
          &#125;);
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-16 px-4 text-[#94a3b8] border-t border-[rgba(255,255,255,0.1)]">
        <p>&copy; 2025 Orga AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
