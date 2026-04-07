/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dressfield.ge";

const publicPaths = [
  "/",
  "/about",
  "/products",
  "/custom-order",
  "/cart",
  "/checkout",
  "/orders",
];

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  output: "export",
  outDir: "./out",
  additionalPaths: async () =>
    publicPaths.map((path) => ({
      loc: path,
      changefreq: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1.0 : 0.8,
      lastmod: new Date().toISOString(),
    })),
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/auth"] },
    ],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
  exclude: ["/admin/*", "/auth/*"],
};
