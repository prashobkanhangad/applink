import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { MarketingShell } from "../components/MarketingShell";

export function NotFound() {
  return (
    <MarketingShell>
      <PageMeta
        title="Page not found"
        description="This page is not on Deeplink."
        path="/404"
        noIndex
      />
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <h1 className="display-heading text-4xl mb-4">Page not found</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Deeplink (deeplink.in) does not have a page at this address. The link may be mistyped, or the page may have moved.
        </p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="underline underline-offset-2">Go to the Deeplink homepage</Link></li>
          <li><Link to="/guides" className="underline underline-offset-2">Read the deep linking guides</Link></li>
          <li><Link to="/pricing" className="underline underline-offset-2">View Deeplink pricing</Link></li>
        </ul>
      </div>
    </MarketingShell>
  );
}
