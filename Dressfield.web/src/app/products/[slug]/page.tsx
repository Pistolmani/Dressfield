import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/catalog/product-detail-client";
import { getStaticProductBySlug, getStaticProducts } from "@/lib/catalog";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const products = await getStaticProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStaticProductBySlug(slug);
  if (!product) return {};

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const description =
    product.shortDescription ??
    `${product.name} — ₾${product.basePrice.toFixed(2)} — DressField-ზე`;

  return {
    title: `${product.name} — DressField`,
    description,
    openGraph: {
      title: `${product.name} — DressField`,
      description,
      siteName: "DressField",
      locale: "ka_GE",
      type: "website",
      images: primaryImage
        ? [{ url: primaryImage.imageUrl, alt: primaryImage.altText ?? product.name }]
        : [],
    },
    other: {
      "product:price:amount": String(product.basePrice),
      "product:price:currency": "GEL",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getStaticProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.shortDescription ?? product.description,
            sku: product.sku,
            image: product.images.map((i) => i.imageUrl),
            offers: {
              "@type": "Offer",
              price: product.basePrice,
              priceCurrency: "GEL",
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "DressField" },
            },
          }),
        }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
