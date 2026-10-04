import { Link, useParams } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { MarketingShell } from "../../components/MarketingShell";
import { JsonLd } from "../../components/JsonLd";
import { NotFound } from "../NotFound";
import { GUIDES, guidePath } from "../../content/guides";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "../../utils/seoSchema";

export function GuidePage() {
  const { slug } = useParams();
  const guide = GUIDES.find((entry) => entry.slug === slug);

  if (!guide) {
    return <NotFound />;
  }

  const path = guidePath(guide);

  return (
    <MarketingShell>
      <PageMeta
        title={guide.title}
        description={guide.description}
        path={path}
        ogType="article"
      />
      <JsonLd
        data={buildArticleSchema({
          type: "TechArticle",
          title: guide.title,
          description: guide.description,
          path,
          datePublished: guide.datePublished,
          dateModified: guide.datePublished,
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path },
        ])}
      />
      <JsonLd data={buildFaqSchema(guide.faqs)} />

      <article className="container mx-auto px-6 pb-20 max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="underline underline-offset-2">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/guides" className="underline underline-offset-2">Guides</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground" aria-current="page">{guide.title}</li>
          </ol>
        </nav>

        <h1 className="display-heading text-4xl mb-6">{guide.title}</h1>
        <p className="text-lg text-foreground leading-relaxed mb-10">{guide.directAnswer}</p>

        {guide.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-muted-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Steps</h2>
          <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
            {guide.steps.map((step) => (
              <li key={step.title}>
                <span className="font-semibold text-foreground">{step.title}. </span>
                {step.text}
              </li>
            ))}
          </ol>
        </section>

        {guide.table && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">{guide.table.caption}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr>
                    {guide.table.headers.map((header) => (
                      <th key={header || "blank"} className="text-left p-3 border-b border-border font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.table.rows.map((row) => (
                    <tr key={row.join("|")} className="align-top">
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
        )}

        {guide.example && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">{guide.example.heading}</h2>
            <p className="text-muted-foreground leading-relaxed">{guide.example.text}</p>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
          <div className="space-y-6">
            {guide.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Get started</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Create a Deeplink account to make a link, set a web fallback, and review click and install analytics.
          </p>
          <p className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/signup" className="underline underline-offset-2">Create a Deeplink account</Link>
            <Link to="/pricing" className="underline underline-offset-2">Read about Deeplink pricing</Link>
            <a href="https://docs.deeplink.in/" className="underline underline-offset-2">Open the Deeplink documentation</a>
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
