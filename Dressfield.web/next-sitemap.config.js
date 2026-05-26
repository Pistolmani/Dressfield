/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dressfield.ge";

// Pages to exclude from the sitemap (user-specific, private, or error pages)
const EXCLUDED = new Set([
  "/admin",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/cart",
  "/checkout",
  "/orders",
  "/orders/detail",
  "/order-confirmation",
  "/order-failed",
  "/profile",
  "/product",
  "/products/catalog-preview",
  "/templates",
  "/404",
  "/_not-found",
  "/_global-error",
  "/apple-icon.png",
  "/icon.png",
  "/manifest.webmanifest",
]);

// Recursively find all index.html files in outDir and convert to URL paths
function discoverPaths(outDir) {
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name));
      } else if (entry.name === "index.html") {
        const rel = path.relative(outDir, dir);
        const urlPath = rel === "." ? "/" : "/" + rel.replace(/\\/g, "/");
        results.push(urlPath);
      }
    }
  }

  walk(outDir);
  return results;
}

function getPriority(urlPath) {
  if (urlPath === "/") return 1.0;
  if (urlPath === "/products") return 0.9;
  if (urlPath.startsWith("/products/")) return 0.8;
  if (urlPath === "/custom-order") return 0.7;
  if (urlPath === "/about") return 0.5;
  return 0.5;
}

function getChangefreq(urlPath) {
  if (urlPath === "/" || urlPath === "/products") return "daily";
  if (urlPath.startsWith("/products/")) return "weekly";
  return "monthly";
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  trailingSlash: true,
  output: "export",
  outDir: "./out",

  // Don't auto-discover (unreliable in v4 static export) — we do it manually below
  exclude: ["*"],

  additionalPaths: async () => {
    const outDir = path.resolve(__dirname, "out");
    if (!fs.existsSync(outDir)) {
      throw new Error(`Static export directory not found: ${outDir}. Run next build first.`);
    }

    const allPaths = discoverPaths(outDir);
    if (allPaths.length === 0) {
      throw new Error(`No static pages discovered in ${outDir}. Refusing to generate an empty sitemap.`);
    }

    return allPaths
      .filter((p) => {
        // Exclude private/error pages and anything under /admin or /auth
        if (EXCLUDED.has(p)) return false;
        if (p.startsWith("/admin")) return false;
        if (p.startsWith("/auth")) return false;
        if (p.startsWith("/templates")) return false;
        return true;
      })
      .map((p) => ({
        loc: p,
        changefreq: getChangefreq(p),
        priority: getPriority(p),
        lastmod: new Date().toISOString(),
      }));
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: "*",
        disallow: [
          "/admin",
          "/auth",
          "/cart",
          "/checkout",
          "/orders",
          "/order-confirmation",
          "/order-failed",
          "/profile",
          "/product",
          "/templates",
        ],
      },
    ],
    transformRobotsTxt: async (_config, robotsTxt) =>
      robotsTxt
        .replace(/\n# Host\nHost: [^\n]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n"),
  },
};
