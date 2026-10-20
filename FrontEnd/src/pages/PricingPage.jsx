import { PageMeta } from "../components/PageMeta";
import { JsonLd } from "../components/JsonLd";
import { MarketingShell } from "../components/MarketingShell";
import { PricingSection } from "../components/landing/PricingSection";
import { marketingMeta } from "../constants/siteCopy";
import { plansWithVisiblePrice, readPrerenderedPlans } from "../content/pricingPlans";
import { buildSoftwareApplicationSchema, offersFromPlans } from "../utils/seoSchema";

const meta = marketingMeta("/pricing");

export function PricingPage() {
  const pricedPlans = plansWithVisiblePrice(readPrerenderedPlans());

  return (
    <MarketingShell>
      <PageMeta {...meta} />
      <JsonLd data={buildSoftwareApplicationSchema(offersFromPlans(pricedPlans))} />
      <div className="container mx-auto px-6 pt-4 max-w-3xl">
        <h1 className="display-heading text-4xl mb-4">Pricing</h1>
        <p className="text-muted-foreground leading-relaxed">
          Deeplink (deeplink.in) includes a free plan and paid plans. Each plan has a monthly click limit. Prices below are text from the pricing catalog when it is available at build time.
        </p>
      </div>
      <PricingSection showHeading={false} />
    </MarketingShell>
  );
}
