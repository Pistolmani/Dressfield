import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/catalog/product-detail-client";
import { getProducts, getStaticProductBySlug } from "@/lib/catalog";

export const dynamicParams = false;

const STATIC_FALLBACK_SLUG = "catalog-preview";

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    const slugs = products
      .map((product) => product.slug.trim())
      .filter((slug): slug is string => slug.length > 0);

    if (slugs.length > 0) {
      return Array.from(new Set(slugs)).map((slug) => ({ slug }));
    }
  } catch {
    // Keep export builds deterministic when API is unavailable.
  }

  return [{ slug: STATIC_FALLBACK_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStaticProductBySlug(slug);

  if (!product) {
    if (slug === STATIC_FALLBACK_SLUG) {
      return {
        title: "Catalog Preview - DressField",
        description:
          "Static preview route generated because product API was unavailable during build.",
      };
    }

    return {};
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const effectivePrice = product.effectivePrice ?? product.basePrice;
  const description =
    product.shortDescription ??
    `${product.name} - GEL ${effectivePrice.toFixed(2)} - DressField`;

  return {
    title: `${product.name} - DressField`,
    description,
    openGraph: {
      title: `${product.name} - DressField`,
      description,
      siteName: "DressField",
      locale: "ka_GE",
      type: "website",
      images: primaryImage
        ? [{ url: primaryImage.imageUrl, alt: primaryImage.altText ?? product.name }]
        : [],
    },
    other: {
      "product:price:amount": String(effectivePrice),
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

  if (!product) {
    if (slug === STATIC_FALLBACK_SLUG) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Catalog Preview</h1>
          <p className="mt-4 text-muted-foreground">
            Product detail pages will be generated from live product slugs when the API is
            available during build.
          </p>
        </main>
      );
    }

    notFound();
  }

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
            image: product.images.map((image) => image.imageUrl),
            offers: {
              "@type": "Offer",
              price: product.effectivePrice ?? product.basePrice,
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
