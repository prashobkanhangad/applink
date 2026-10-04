import { Link } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { MarketingShell } from "../../components/MarketingShell";
import { marketingMeta } from "../../constants/siteCopy";
import { GUIDES, guidePath } from "../../content/guides";

const meta = marketingMeta("/guides");

export function GuidesIndex() {
  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <div className="container mx-auto px-6 pb-20 max-w-3xl">
        <h1 className="display-heading text-4xl mb-4">Deep linking guides</h1>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Deeplink (deeplink.in) publishes these guides so the product name is not confused with the generic phrase “deep link.” Each one starts with a direct answer, then the steps and limits of what the product actually does.
        </p>
        <ul className="space-y-6">
          {GUIDES.map((guide) => (
            <li key={guide.slug} className="soft-card p-6">
              <h2 className="text-xl font-bold mb-2">
                <Link to={guidePath(guide)} className="underline underline-offset-2">
                  {guide.title}
                </Link>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{guide.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </MarketingShell>
  );
}
