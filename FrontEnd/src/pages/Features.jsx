import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { MarketingShell } from "../components/MarketingShell";
import { marketingMeta } from "../constants/siteCopy";
import { DOCS_URL } from "../constants/publicSite";
import { PRODUCT_FEATURES } from "../content/productFacts";

const meta = marketingMeta("/features");

export function Features() {
  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <div className="container mx-auto px-6 pb-20 max-w-3xl">
        <h1 className="display-heading text-4xl mb-4">What you can do with Deeplink</h1>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Deeplink (deeplink.in) is a deep linking platform for teams that ship mobile apps and websites. The capabilities below are the ones implemented in the product today.
        </p>
        {PRODUCT_FEATURES.map((feature) => {
          const external = feature.href.startsWith("http");
          return (
            <section key={feature.title} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">{feature.description}</p>
              {external ? (
                <a href={DOCS_URL} className="text-sm font-semibold underline underline-offset-2">
                  Read the Deeplink documentation
                </a>
              ) : (
                <Link to={feature.href} className="text-sm font-semibold underline underline-offset-2">
                  Learn more about {feature.title.toLowerCase()}
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </MarketingShell>
  );
}
