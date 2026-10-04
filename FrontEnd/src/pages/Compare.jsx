import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { MarketingShell } from "../components/MarketingShell";
import { marketingMeta } from "../constants/siteCopy";

const meta = marketingMeta("/compare");

const rows = [
  ["Smart links for Android, iOS, and web", "Yes. One link, with a web fallback URL.", "TODO: [fact needed]"],
  ["Deferred deep linking", "Yes. Click intent can be restored on first open after install.", "TODO: [fact needed]"],
  ["iOS Universal Links and Android App Links", "Yes. Deeplink serves the association files for the link domain.", "TODO: [fact needed]"],
  ["Click and install analytics", "Yes. Clicks, installs, click-to-install rate, plus location, platform, and device.", "TODO: [fact needed]"],
  ["UTM parameters", "Yes. Stored on the link in the dashboard.", "TODO: [fact needed]"],
  ["REST API, webhooks, and SDKs", "Yes. Documented at docs.deeplink.in.", "TODO: [fact needed]"],
  ["Custom domains", "Yes. A verified custom domain or a chottu.link subdomain.", "TODO: [fact needed]"],
  ["QR code for a link", "Yes. The dashboard link screen can generate one.", "TODO: [fact needed]"],
  ["Published price list", "TODO: [fact needed] current public prices as static HTML.", "TODO: [fact needed]"],
];

export function Compare() {
  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <div className="container mx-auto px-6 pb-20 max-w-4xl">
        <h1 className="display-heading text-4xl mb-4">Deeplink capabilities</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Deeplink (deeplink.in) is listed here only for behavior this product implements. The other column is blank on purpose. This page does not rank competitors or repeat claims that have not been checked.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border">
            <thead>
              <tr>
                <th className="text-left p-3 border-b border-border">Capability</th>
                <th className="text-left p-3 border-b border-border">Deeplink</th>
                <th className="text-left p-3 border-b border-border">Other deep linking tools</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
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
        <p className="mt-8 text-sm">
          <Link to="/features" className="underline underline-offset-2">See Deeplink features</Link>
          {" · "}
          <Link to="/guides" className="underline underline-offset-2">Read the deep linking guides</Link>
        </p>
      </div>
    </MarketingShell>
  );
}
