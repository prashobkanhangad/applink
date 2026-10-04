import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from "../components/landing";
import { UseCasesSection } from "../components/landing/UseCasesSection";
import { PageMeta } from "../components/PageMeta";
import { JsonLd } from "../components/JsonLd";
import { marketingMeta, PRODUCT_DESCRIPTION } from "../constants/siteCopy";
import { HOME_FAQS } from "../content/homeFaq";
import { plansWithVisiblePrice, readPrerenderedPlans } from "../content/pricingPlans";
import {
  buildFaqSchema,
  buildHomeGraph,
  buildSoftwareApplicationSchema,
  offersFromPlans,
} from "../utils/seoSchema";

const meta = marketingMeta("/");

export const Home = () => {
  const pricedPlans = plansWithVisiblePrice(readPrerenderedPlans());

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={meta.title}
        description={PRODUCT_DESCRIPTION}
        path="/"
        imageAlt="Deeplink, a deep linking platform for apps and websites"
      />
      <JsonLd data={buildHomeGraph()} />
      <JsonLd data={buildSoftwareApplicationSchema(offersFromPlans(pricedPlans))} />
      <JsonLd data={buildFaqSchema(HOME_FAQS)} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <PricingSection />
        <section id="faq" className="py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="display-heading text-3xl sm:text-4xl mb-10 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {HOME_FAQS.map((faq) => (
                <article key={faq.question} className="soft-card p-6">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </main>
    </div>
  );
};

export default Home;
