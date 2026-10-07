import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, QrCode, ArrowRight, X } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { MarketingShell } from "../components/MarketingShell";
import { JsonLd } from "../components/JsonLd";
import { Button } from "../components/ui/button";
import { marketingMeta } from "../constants/siteCopy";
import { buildFaqSchema } from "../utils/seoSchema";
import { cn } from "../utils/cn";

const meta = marketingMeta("/free-qr-code-generator");

const FAQS = [
  {
    question: "Is this QR code generator free?",
    answer:
      "Yes. You can create a QR code for any URL on this page at no cost. The image encodes the URL you enter. Deeplink (deeplink.in) does not require an account to download a basic QR PNG.",
  },
  {
    question: "Does a free QR code track scans?",
    answer:
      "No. A QR code that points at a normal website URL only opens that URL. Scan counts, locations, and device data need a tracked link behind the code. Create a Deeplink account to host a smart link, then generate a QR for that link.",
  },
  {
    question: "What should I put in the QR code for an app campaign?",
    answer:
      "Use a Deeplink smart link URL, not only the App Store or Play Store listing. A smart link can open the app when it is installed, fall back to the store or web, and record clicks and installs in analytics.",
  },
  {
    question: "Can I change the destination after printing?",
    answer:
      "Only if the URL inside the code still exists and you control where it routes. A Deeplink smart link lets you update the destination in the dashboard without reprinting. A QR that encodes a fixed website URL cannot be edited on paper.",
  },
];

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function qrImageUrl(data, size) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&data=${encodeURIComponent(data)}`;
}

export function FreeQrCodeGenerator() {
  const [input, setInput] = useState("https://");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const encodedUrl = useMemo(() => {
    if (!submitted) return "";
    return normalizeUrl(submitted);
  }, [submitted]);

  const previewUrl = encodedUrl ? qrImageUrl(encodedUrl, 280) : "";
  const downloadUrl = encodedUrl ? qrImageUrl(encodedUrl, 400) : "";

  useEffect(() => {
    if (!showTrackingModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowTrackingModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showTrackingModal]);

  const handleGenerate = (event) => {
    event.preventDefault();
    const next = normalizeUrl(input);
    if (!isValidHttpUrl(next)) {
      setError("Enter a full website or app link, for example https://example.com/offer.");
      setSubmitted("");
      setShowTrackingModal(false);
      return;
    }
    setError("");
    setSubmitted(next);
    setShowTrackingModal(true);
  };

  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <JsonLd data={buildFaqSchema(FAQS)} />

      <div className="container mx-auto px-6 pb-20 max-w-3xl">
        <div className="mb-10">
          <p className="eyebrow text-muted-foreground mb-4">Free tool</p>
          <h1 className="display-heading text-4xl sm:text-5xl mb-4">
            Free QR code generator
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deeplink (deeplink.in) lets you turn any URL into a QR code you can download as a PNG.
            For posters, packaging, and WhatsApp campaigns that need scan analytics, create a smart
            link first, then encode that Deeplink URL.
          </p>
        </div>

        <section className="soft-card p-6 sm:p-8 mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Create your QR code</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a website URL, app store link, or Deeplink smart link. The code is generated in your browser.
          </p>
          <form onSubmit={handleGenerate} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold mb-2 block">URL to encode</span>
              <input
                type="url"
                inputMode="url"
                autoComplete="url"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="https://example.com/product"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="brand" size="pill" className="w-full sm:w-auto">
              <QrCode className="w-5 h-5" />
              Generate QR code
            </Button>
          </form>

          <div
            className={cn(
              "mt-8 rounded-2xl border border-dashed border-border bg-secondary/40 p-6 flex flex-col items-center justify-center min-h-[320px]",
              !previewUrl && "text-muted-foreground"
            )}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt={`QR code for ${encodedUrl}`}
                  width={280}
                  height={280}
                  className="rounded-xl bg-white p-3"
                />
                <p className="mt-4 text-xs text-muted-foreground break-all text-center max-w-sm">
                  {encodedUrl}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <a href={downloadUrl} download="deeplink-qr-code.png" className="inline-flex">
                    <Button type="button" variant="brand-outline" size="pill-sm" className="w-full">
                      <Download className="w-4 h-4" />
                      Download PNG
                    </Button>
                  </a>
                  <Button
                    type="button"
                    variant="brand"
                    size="pill-sm"
                    onClick={() => setShowTrackingModal(true)}
                  >
                    Track scans with Deeplink
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-center max-w-xs">
                Enter a URL and generate a QR code. Nothing is stored until you create a Deeplink account and save a smart link.
              </p>
            )}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Free QR code versus a tracked Deeplink QR
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b border-border">Capability</th>
                  <th className="text-left p-3 border-b border-border">Free generator on this page</th>
                  <th className="text-left p-3 border-b border-border">Deeplink smart link + QR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Create a downloadable QR PNG", "Yes", "Yes"],
                  ["Encode any HTTPS URL", "Yes", "Yes"],
                  ["Click and install analytics", "No", "Yes"],
                  ["Deferred deep linking after install", "No", "Yes"],
                  ["Change destination without reprinting", "Only if you control that URL", "Yes, in the dashboard"],
                  ["UTM campaign labels", "Only if you type them into the URL", "Stored on the link"],
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
          <h2 className="text-2xl font-bold tracking-tight mb-4">How to track QR scans with Deeplink</h2>
          <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Create a free Deeplink account. </span>
              Sign up and add your app with a web fallback URL.
            </li>
            <li>
              <span className="font-semibold text-foreground">Create a smart link. </span>
              Set the path, optional UTM parameters, and the destination you want after a scan.
            </li>
            <li>
              <span className="font-semibold text-foreground">Generate the QR for that link. </span>
              Use this page with your Deeplink URL, or generate the QR from the dashboard link screen.
            </li>
            <li>
              <span className="font-semibold text-foreground">Read the analytics. </span>
              Review clicks, installs, and click-to-install conversion for that link after people scan the code.
            </li>
          </ol>
          <div className="mt-8">
            <Link to="/signup">
              <Button variant="brand" size="pill">
                Start free and track QR campaigns
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

      {showTrackingModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-tracking-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px]"
            aria-label="Close tracking offer"
            onClick={() => setShowTrackingModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-[1.75rem] bg-white text-foreground shadow-soft-lg border border-border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowTrackingModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="qr-tracking-modal-title" className="text-2xl font-bold tracking-tight mb-3 pr-10">
              Want to track every scan?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Your QR is ready. Create a free Deeplink account to add click analytics and change the destination later without reprinting.
            </p>
            <Link to="/signup" className="inline-flex w-full">
              <Button variant="brand" size="pill" className="group w-full">
                Create free account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setShowTrackingModal(false)}
              className="mt-4 w-full text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Continue with free QR only
            </button>
          </div>
        </div>
      )}
    </MarketingShell>
  );
}

export default FreeQrCodeGenerator;
