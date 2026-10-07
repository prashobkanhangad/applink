import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  X,
  AlertTriangle,
} from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { MarketingShell } from "../components/MarketingShell";
import { JsonLd } from "../components/JsonLd";
import { Button } from "../components/ui/button";
import { marketingMeta } from "../constants/siteCopy";
import { buildFaqSchema } from "../utils/seoSchema";
import { cn } from "../utils/cn";

const meta = marketingMeta("/deep-link-tester");

const FAQS = [
  {
    question: "What does this deep link tester do?",
    answer:
      "Paste a URL and Deeplink (deeplink.in) shows the scheme, host, path, and query parameters. You can open the link in this browser. It does not replace testing on a real Android or iPhone with the app installed and uninstalled.",
  },
  {
    question: "Can this tool open my mobile app from a desktop browser?",
    answer:
      "Not reliably. Desktop browsers usually cannot launch your iOS or Android app. Use Open link for a quick web check, then repeat the same URL on a phone with Universal Links or Android App Links configured.",
  },
  {
    question: "Does testing a link here create analytics?",
    answer:
      "No. This page only inspects the URL you paste. Click and install analytics require a Deeplink smart link created in your account and opened by real users.",
  },
  {
    question: "What should I test after creating a Deeplink?",
    answer:
      "Test with the app installed and deleted. Confirm the path, web fallback, store redirect, and deferred first open. Use this tester to check the URL shape and UTMs before you run those device tests.",
  },
];

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function analyzeLink(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const utms = UTM_KEYS.filter((key) => url.searchParams.has(key)).map((key) => ({
      key,
      value: url.searchParams.get(key),
    }));
    const isHttps = url.protocol === "https:";
    const isHttp = url.protocol === "http:";
    const isCustomScheme = !isHttps && !isHttp;

    return {
      href: url.href,
      protocol: url.protocol.replace(":", ""),
      host: url.host || "(none)",
      pathname: url.pathname || "/",
      search: url.search || "",
      hash: url.hash || "",
      params,
      utms,
      isHttps,
      isHttp,
      isCustomScheme,
      checks: [
        {
          ok: isHttps || isCustomScheme,
          label: isHttps
            ? "HTTPS URL — suitable for Universal Links and Android App Links"
            : isCustomScheme
              ? "Custom scheme — can open an installed app, but is weaker for email, web, and QR"
              : "HTTP URL — prefer HTTPS for verified app links",
        },
        {
          ok: Boolean(url.host) || isCustomScheme,
          label: url.host
            ? `Host: ${url.host}`
            : "No host — custom schemes often use a host-like first segment instead",
        },
        {
          ok: url.pathname.length > 1,
          label:
            url.pathname.length > 1
              ? `Path: ${url.pathname}`
              : "Path is only / — deep links usually include a specific screen path",
        },
        {
          ok: utms.length > 0,
          label:
            utms.length > 0
              ? `UTM parameters found (${utms.length})`
              : "No UTM parameters — optional, but useful for campaign analytics",
        },
      ],
    };
  } catch {
    return { error: "Enter a valid URL, for example https://go.example.com/product/42 or myapp://product/42." };
  }
}

export function DeepLinkTester() {
  const [input, setInput] = useState("https://");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const analysis = useMemo(() => {
    if (!submitted) return null;
    return analyzeLink(submitted);
  }, [submitted]);

  useEffect(() => {
    if (!showSignupModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowSignupModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showSignupModal]);

  const handleTest = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    const result = analyzeLink(trimmed);
    if (!result || result.error) {
      setError(result?.error || "Enter a valid URL to test.");
      setSubmitted("");
      setShowSignupModal(false);
      return;
    }
    setError("");
    setSubmitted(trimmed);
    setShowSignupModal(true);
  };

  const handleCopy = async () => {
    if (!analysis?.href) return;
    try {
      await navigator.clipboard.writeText(analysis.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <JsonLd data={buildFaqSchema(FAQS)} />

      <div className="container mx-auto px-6 pb-20 max-w-3xl">
        <div className="mb-10">
          <p className="eyebrow text-muted-foreground mb-4">Free tool</p>
          <h1 className="display-heading text-4xl sm:text-5xl mb-4">
            Deep link tester
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deeplink (deeplink.in) helps you inspect a deep link before you ship it. Paste an HTTPS
            or custom-scheme URL to see the host, path, and UTM parameters, then open it in this
            browser. For click analytics and deferred routing, create a smart link in your account.
          </p>
        </div>

        <section className="soft-card p-6 sm:p-8 mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Test a deep link</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a campaign URL, Universal Link, Android App Link, or custom scheme.
          </p>
          <form onSubmit={handleTest} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold mb-2 block">Deep link URL</span>
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="https://go.example.com/product/42?utm_source=email"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="brand" size="pill" className="w-full sm:w-auto">
              <Link2 className="w-5 h-5" />
              Test deep link
            </Button>
          </form>

          {analysis && !analysis.error && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Normalized URL
                </p>
                <p className="text-sm break-all font-mono text-foreground">{analysis.href}</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <a href={analysis.href} target="_blank" rel="noopener noreferrer" className="inline-flex">
                    <Button type="button" variant="brand" size="pill-sm" className="w-full">
                      <ExternalLink className="w-4 h-4" />
                      Open link
                    </Button>
                  </a>
                  <Button type="button" variant="brand-outline" size="pill-sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied" : "Copy URL"}
                  </Button>
                  <Button
                    type="button"
                    variant="brand-outline"
                    size="pill-sm"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Track this with Deeplink
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ["Scheme", analysis.protocol],
                  ["Host", analysis.host],
                  ["Path", analysis.pathname],
                  ["Query", analysis.search || "(none)"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-sm break-all font-mono">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">Quick checks</h3>
                <ul className="space-y-3">
                  {analysis.checks.map((check) => (
                    <li key={check.label} className="flex gap-3 text-sm">
                      {check.ok ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={cn("leading-relaxed", check.ok ? "text-foreground" : "text-muted-foreground")}>
                        {check.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.utms.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">UTM parameters</h3>
                  <ul className="space-y-2 text-sm">
                    {analysis.utms.map((utm) => (
                      <li key={utm.key} className="flex gap-2 font-mono">
                        <span className="text-muted-foreground">{utm.key}=</span>
                        <span>{utm.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-border p-5">
                <h3 className="text-lg font-bold mb-2">Still test on a real device</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Open the URL on an Android phone with the app installed, then with it deleted.</li>
                  <li>Repeat on an iPhone. Confirm Universal Links open the app instead of Safari.</li>
                  <li>If you use deferred deep linking, install after the click and check first open.</li>
                </ol>
              </div>
            </div>
          )}

          {!analysis && (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-sm text-muted-foreground text-center">
              Enter a URL and run the tester. Results appear here. Device installs and analytics still require a Deeplink account.
            </div>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Browser tester versus a Deeplink smart link
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b border-border">Capability</th>
                  <th className="text-left p-3 border-b border-border">This free tester</th>
                  <th className="text-left p-3 border-b border-border">Deeplink smart link</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Parse scheme, host, path, UTMs", "Yes", "Yes"],
                  ["Open URL in the current browser", "Yes", "Yes"],
                  ["Click and install analytics", "No", "Yes"],
                  ["Deferred deep linking after install", "No", "Yes"],
                  ["Serve Universal Links / App Links files", "No", "Yes"],
                  ["Change destination without a new URL", "No", "Yes"],
                ].map((row) => (
                  <tr key={row[0]} className="align-top">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className="p-3 border-b border-border text-muted-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">How to ship a testable Deeplink</h2>
          <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Create a free account. </span>
              Add your app, Android package details, and iOS bundle details.
            </li>
            <li>
              <span className="font-semibold text-foreground">Create a smart link. </span>
              Set the path, web fallback, and optional UTM parameters.
            </li>
            <li>
              <span className="font-semibold text-foreground">Paste it here. </span>
              Confirm the URL shape, then open it on real devices.
            </li>
            <li>
              <span className="font-semibold text-foreground">Read analytics. </span>
              Review clicks, installs, and click-to-install conversion in the dashboard.
            </li>
          </ol>
          <div className="mt-8">
            <Link to="/signup">
              <Button variant="brand" size="pill">
                Create free account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <article key={faq.question} className="soft-card p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {showSignupModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deeplink-tester-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px]"
            aria-label="Close signup offer"
            onClick={() => setShowSignupModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-[1.75rem] bg-white text-foreground shadow-soft-lg border border-border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowSignupModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="deeplink-tester-modal-title" className="text-2xl font-bold tracking-tight mb-3 pr-10">
              Ready to track real clicks?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Your link looks ready to inspect. Create a free Deeplink account to host a smart link with analytics, fallbacks, and deferred deep linking.
            </p>
            <Link to="/signup" className="inline-flex w-full">
              <Button variant="brand" size="pill" className="group w-full">
                Create free account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setShowSignupModal(false)}
              className="mt-4 w-full text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Continue testing for free
            </button>
          </div>
        </div>
      )}
    </MarketingShell>
  );
}

export default DeepLinkTester;
