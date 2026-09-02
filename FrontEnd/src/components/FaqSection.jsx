/**
 * Renders an FAQ block that stays in sync with FAQPage schema items.
 * Pass the same `faqs` array used for buildFaqSchema().
 */
export function FaqSection({ faqs = [], title = "FAQ" }) {
  if (!faqs.length) return null;
  return (
    <>
      <h2>{title}</h2>
      <div className="space-y-5 mb-4">
        {faqs.map(({ question, answer }) => (
          <div key={question}>
            <p className="font-semibold text-foreground mb-1">{question}</p>
            <p className="text-muted-foreground leading-relaxed mb-0">{answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
