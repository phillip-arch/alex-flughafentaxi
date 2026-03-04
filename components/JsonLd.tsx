import Script from 'next/script';

export default function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
