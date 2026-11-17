/** Strukturirani podaci (schema.org) kao <script type="application/ld+json">. "<" se escapuje radi sigurnosti. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
