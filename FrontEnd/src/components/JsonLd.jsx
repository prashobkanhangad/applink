/**
 * Inline JSON-LD. Rendered in the document body so prerendered HTML
 * contains the raw JSON without an extra escaping pass.
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
