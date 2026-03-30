/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://dressfield.ge",
  generateRobotsTxt: true,
  output: "export",
  outDir: "./out",
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/auth"] },
    ],
  },
  exclude: ["/admin/*", "/auth/*"],
};
