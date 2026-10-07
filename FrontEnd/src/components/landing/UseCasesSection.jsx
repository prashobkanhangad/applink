import { Link } from "react-router-dom";
import { USE_CASES } from "../../content/productFacts";

export const UseCasesSection = () => {
  return (
    <section id="use-cases" className="py-24 lg:py-32 bg-surface-mint">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="display-heading text-3xl sm:text-4xl lg:text-[3.25rem] mb-6">
            Use cases
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The same Deeplink URL can be pasted into a message, an email, an ad, or a QR code. Routing does not change by channel.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {USE_CASES.map((item) => (
            <article key={item.title} className="soft-card p-7">
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.description}</p>
              <Link to={item.href} className="text-sm font-semibold underline underline-offset-2">
                {item.linkLabel}
              </Link>
              {item.title === "QR codes" && (
                <p className="mt-3">
                  <Link
                    to="/free-qr-code-generator"
                    className="text-sm font-semibold underline underline-offset-2"
                  >
                    Try the free QR code generator
                  </Link>
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
